const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Update TABS
code = code.replace(
  /const TABS = \[[\s\S]*?\];/,
  `const TABS = [
  { id: "new", label: "New Orders" },
  { id: "drafts", label: "Draft Orders" },
  { id: "placed", label: "Order Placed" },
  { id: "delivered", label: "Delivered" },
  { id: "rto", label: "RTO" },
  { id: "cancelled", label: "Cancelled" },
  { id: "profits", label: "📊 My Profits" },
  { id: "chats", label: "🤖 AI Chats" },
];`
);

// 2. Update setCounts state
code = code.replace(
  /const \[counts, setCounts\] = useState\(\{ new: 0, drafts: 0, abandoned: 0, placed: 0, delivered: 0 \}\);/,
  `const [counts, setCounts] = useState({ new: 0, drafts: 0, placed: 0, delivered: 0, rto: 0, cancelled: 0 });`
);

// 3. Update fetchTabCounts
code = code.replace(
  /const fetchTabCounts = async \(\) => \{[\s\S]*?setCounts\(\{[\s\S]*?\}\);\s*\} catch \(e\) \{[\s\S]*?\}\s*\};/,
  `const fetchTabCounts = async () => {
    try {
        const cNew = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["Fully Paid", "Advance Paid", "Fampay", "Received"])));
        const cDrafts1 = await getCountFromServer(collection(db, "draft_orders"));
        const cDrafts2 = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["pending advance payment", "pending full payment", "pending_cart", "draft"])));
        const cPlaced = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "Order Placed")));
        const cDelivered = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "Delivered")));
        const cRto = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "RTO")));
        const cCancelled = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["cancelled", "Cancelled"])));
        
        setCounts({
            new: cNew.data().count,
            drafts: cDrafts1.data().count + cDrafts2.data().count,
            placed: cPlaced.data().count,
            delivered: cDelivered.data().count,
            rto: cRto.data().count,
            cancelled: cCancelled.data().count
        });
    } catch (e) {
        console.warn("Failed to fetch order counts", e);
    }
  };`
);

// 4. Replace ABANDONED CARTS block with nothing and update ALL OTHER TABS logic
const refreshLogicReplacement = `
        // DRAFT ORDERS (Both old draft_orders and new pending orders)
        if (activeTab === "drafts") {
            let oldDrafts: any[] = [];
            try {
                const qOld = query(collection(db, "draft_orders"), orderBy("createdAt", "desc"), limit(100));
                let snapOld;
                try { snapOld = await getDocs(qOld); } catch(e: any) { snapOld = await getDocsFromCache(qOld); }
                oldDrafts = snapOld.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch(e) { console.warn("Failed to fetch old drafts", e); }
            
            let newDrafts: any[] = [];
            try {
                const qNew = query(collection(db, "orders"), where("status", "in", ["pending advance payment", "pending full payment", "pending_cart", "draft"]), orderBy("createdAt", "desc"), limit(200));
                let snapNew;
                try { snapNew = await getDocs(qNew); } catch(e: any) { snapNew = await getDocsFromCache(qNew); }
                newDrafts = snapNew.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch(e) { console.warn("Failed to fetch new drafts", e); }

            fetchedOrders = [...oldDrafts, ...newDrafts].map(data => {
                 let productName = data.productName || "Order";
                 if (!data.productName && data.cartItems) productName = data.cartItems.map((i: any) => i.name).join(", ");
                 return { ...data, status: "pending draft", productName } as Order;
            });
            fetchedOrders.sort((a, b) => {
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });
        }
        // ALL OTHER TABS
        else {
            let conditions: any[] = [];
            if (activeTab === "new") conditions.push(where("status", "in", ["Fully Paid", "Advance Paid", "Fampay", "Received"]));
            else if (activeTab === "placed") conditions.push(where("status", "==", "Order Placed"));
            else if (activeTab === "delivered") conditions.push(where("status", "==", "Delivered"));
            else if (activeTab === "rto") conditions.push(where("status", "==", "RTO"));
            else if (activeTab === "cancelled") conditions.push(where("status", "in", ["cancelled", "Cancelled"]));
            
            conditions.push(orderBy("createdAt", "desc"));
            conditions.push(limit(300));
            
            const q = query.apply(null, [collection(db, "orders"), ...conditions] as any);
            let snapshot;
            try {
                snapshot = await getDocs(q);
            } catch (fetchErr: any) {
                if (fetchErr.message?.includes("Quota")) {
                    try { snapshot = await getDocsFromCache(q); } 
                    catch (cacheErr) {
                        const allDocs = await getDocsFromCache(collection(db, "orders"));
                        let validDocs = allDocs.docs;
                        if (activeTab === "new") validDocs = validDocs.filter((d: any) => ["Fully Paid", "Advance Paid", "Fampay", "Received"].includes(d.data().status));
                        else if (activeTab === "placed") validDocs = validDocs.filter((d: any) => d.data().status === "Order Placed");
                        else if (activeTab === "delivered") validDocs = validDocs.filter((d: any) => d.data().status === "Delivered");
                        else if (activeTab === "rto") validDocs = validDocs.filter((d: any) => d.data().status === "RTO");
                        else if (activeTab === "cancelled") validDocs = validDocs.filter((d: any) => d.data().status === "cancelled" || d.data().status === "Cancelled");
                        validDocs.sort((a: any, b: any) => {
                           const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
                           const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
                           return bTime - aTime;
                        });
                        snapshot = { docs: validDocs } as any;
                    }
                } else throw fetchErr;
            }

            fetchedOrders = snapshot.docs.map((doc: any) => {
                 const data = doc.data() as any;
                 return { id: doc.id, ...data, productName: data.productName || "Order" } as Order;
            });
        }
`;

code = code.replace(
  /\/\/ ABANDONED CARTS[\s\S]*?fetchedOrders = snapshot\.docs\.map\(doc => \{[\s\S]*?\}\s*\};/m,
  refreshLogicReplacement.trim()
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code, 'utf8');
