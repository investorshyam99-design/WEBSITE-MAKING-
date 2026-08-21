const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const replacement = `
  const fetchTabCounts = async () => {
    try {
        const cNew = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["Fully Paid", "Advance Paid", "Fampay", "Received"])));
        const cDrafts1 = await getCountFromServer(collection(db, "draft_orders"));
        const cDrafts2 = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["pending advance payment", "pending full payment", "pending_cart", "draft"])));
        const cAban = await getCountFromServer(collection(db, "abandoned_carts"));
        const cPlaced = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "Order Placed")));
        const cDelivered = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "Delivered")));
        
        setCounts({
            new: cNew.data().count,
            drafts: cDrafts1.data().count + cDrafts2.data().count,
            abandoned: cAban.data().count,
            placed: cPlaced.data().count,
            delivered: cDelivered.data().count
        });
    } catch (e) {
        console.warn("Failed to fetch order counts", e);
    }
  };
`;

content = content.replace(/const fetchTabCounts = async \(\) => \{[\s\S]*?\}\s*catch \(e\) \{\s*console\.warn\("Failed to fetch order counts", e\);\s*\}\s*\};\n/m, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
