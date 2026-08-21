const fs = require('fs');
let content = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

// Replace the fetch logic to include sessionStorage caching
content = content.replace(
  /const fetchOrdersForProfits = async \(\) => {[\s\S]*?fetchOrdersForProfits\(\);/m,
  `const fetchOrdersForProfits = async () => {
      try {
        // Check cache first
        const cachedData = sessionStorage.getItem('adminProfitsOrders');
        const cacheTime = sessionStorage.getItem('adminProfitsOrdersTime');
        const isCacheValid = cachedData && cacheTime && (Date.now() - Number(cacheTime) < 1000 * 60 * 5); // 5 min cache
        
        if (isCacheValid) {
            setOrders(JSON.parse(cachedData));
            return;
        }

        const q = query(collection(db, 'orders'), where('status', 'in', ['Fully Paid', 'Advance Paid', 'Fampay', 'Received', 'Order Placed', 'Delivered']), orderBy('createdAt', 'desc'), limit(500));
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        setOrders(fetchedOrders);
        
        sessionStorage.setItem('adminProfitsOrders', JSON.stringify(fetchedOrders));
        sessionStorage.setItem('adminProfitsOrdersTime', Date.now().toString());
        
      } catch(e: any) { 
          console.warn(e); 
      }
    };
    fetchOrdersForProfits();`
);

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', content);
