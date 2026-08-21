const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Replace the fetch logic to include sessionStorage caching
content = content.replace(
  /const fetchDashboardData = async \(\) => {[\s\S]*?fetchDashboardData\(\);/m,
  `const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cachedData = sessionStorage.getItem('adminDashboardStats');
        const cacheTime = sessionStorage.getItem('adminDashboardStatsTime');
        const isCacheValid = cachedData && cacheTime && (Date.now() - Number(cacheTime) < 1000 * 60 * 5); // 5 minute cache
        
        if (isCacheValid) {
            const data = JSON.parse(cachedData);
            if (isMounted) {
                setUsersCount(data.usersCount);
                setVisitorsCount(data.visitorsCount);
                setAvgTimeSpent(data.avgTimeSpent);
                setVisitors(data.visitors);
                setUsers(data.users);
                setLoading(false);
            }
            return;
        }

        // 1. Fetch counts
        const usersCountSnap = await getCountFromServer(collection(db, "users"));
        const visitorsCountSnap = await getCountFromServer(collection(db, "visitors"));
        
        let fetchedUsersCount = usersCountSnap.data().count;
        let fetchedVisitorsCount = visitorsCountSnap.data().count;
        
        if (isMounted) {
            setUsersCount(fetchedUsersCount);
            setVisitorsCount(fetchedVisitorsCount);
        }
        
        // 2. Fetch aggregate average time spent
        let fetchedAvgTime = 0;
        try {
            const avgSnap = await getAggregateFromServer(collection(db, "visitors"), {
                avgTime: average("timeSpent")
            });
            fetchedAvgTime = avgSnap.data().avgTime || 0;
            if (isMounted) setAvgTimeSpent(fetchedAvgTime);
        } catch (e) {
            console.warn("Average aggregation failed, falling back to 0");
        }
        
        // 3. Fetch top 50 visitors
        const vq = query(collection(db, "visitors"), orderBy("lastVisit", "desc"), limit(50));
        const vSnap = await getDocs(vq);
        const visitorsData = vSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (isMounted) setVisitors(visitorsData);
        
        // 4. Fetch top 50 users
        const uq = query(collection(db, "users"), orderBy("lastLogin", "desc"), limit(50));
        const uSnap = await getDocs(uq);
        const usersData = uSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (isMounted) setUsers(usersData);
        
        // Save to cache
        sessionStorage.setItem('adminDashboardStats', JSON.stringify({
            usersCount: fetchedUsersCount,
            visitorsCount: fetchedVisitorsCount,
            avgTimeSpent: fetchedAvgTime,
            visitors: visitorsData,
            users: usersData
        }));
        sessionStorage.setItem('adminDashboardStatsTime', Date.now().toString());
        
      } catch (err: any) {
        console.warn("Error fetching dashboard data:", err);
        if (isMounted) {
           if (err.message?.includes("Quota")) {
               setError("Firestore daily quota limit reached. The dashboard data will be available again after Midnight PT.");
           } else {
               setError("Failed to fetch some dashboard data. " + err.message);
           }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchDashboardData();`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
