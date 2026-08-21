const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const startStr = '  const refreshOrders = async (reset = false, goBack = false) => {';
const endStr = '    } catch (e: any) {';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex === -1 || endIndex === -1) {
   console.log("Could not find bounds");
   process.exit(1);
}

const replacement = `
  const refreshOrders = async (reset = false, goBack = false) => {
    setIsLoadingOrders(true);
    if (reset) fetchTabCounts();
    try {
        let fetchedOrders: Order[] = [];

        // ABANDONED CARTS
        if (activeTab === "abandoned") {
            const q = query(collection(db, "abandoned_carts"), limit(200));
            let snapshot;
            try { snapshot = await getDocs(q); }
            catch (e: any) { 
                if (e.message?.includes("Quota")) snapshot = await getDocsFromCache(q); 
                else throw e;
            }
            
            fetchedOrders = snapshot.docs.map(doc => {
                 const data = doc.data() as any;
                 let productName = data.productName || "Order";
                 if (!data.productName && data.items) productName = data.items.map((i: any) => i.name).join(", ");
                 else if (!data.productName && data.cartItems) productName = data.cartItems.map((i: any) => i.name).join(", ");
                 return { id: doc.id, ...data, status: "abandoned", productName } as Order;
            });
            fetchedOrders.sort((a, b) => {
                const aTime = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
                const bTime = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
                return bTime - aTime;
            });
        } 
        // DRAFT ORDERS (Both old draft_orders and new pending orders)
        else if (activeTab === "drafts") {
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
            else if (activeTab === "cancelled") conditions.push(where("status", "==", "cancelled"));
            
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
                        if (activeTab === "new") validDocs = validDocs.filter(d => ["Fully Paid", "Advance Paid", "Fampay", "Received"].includes(d.data().status));
                        else if (activeTab === "placed") validDocs = validDocs.filter(d => d.data().status === "Order Placed");
                        else if (activeTab === "delivered") validDocs = validDocs.filter(d => d.data().status === "Delivered");
                        else if (activeTab === "cancelled") validDocs = validDocs.filter(d => d.data().status === "cancelled");
                        validDocs.sort((a, b) => {
                           const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
                           const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
                           return bTime - aTime;
                        });
                        snapshot = { docs: validDocs } as any;
                    }
                } else throw fetchErr;
            }

            fetchedOrders = snapshot.docs.map(doc => {
                 const data = doc.data() as any;
                 return { id: doc.id, ...data, productName: data.productName || "Order" } as Order;
            });
        }

        setCurrentOrders(fetchedOrders);
        setHasNextPage(false);
        if (reset) {
            setLastDocs([]);
        }
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
