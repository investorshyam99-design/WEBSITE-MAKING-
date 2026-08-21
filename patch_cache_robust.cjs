const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Replace the getDocs block with a more robust cache fallback
content = content.replace(
    /let snapshot;\s*try {[\s\S]*?snapshot = await getDocsFromCache\(q\);\s*}\s*else {\s*throw fetchErr;\s*}\s*}/m,
    `let snapshot;
        try {
            snapshot = await getDocs(q);
        } catch (fetchErr: any) {
            if (fetchErr.message?.includes("Quota")) {
                console.warn("Quota exceeded, falling back to robust offline cache...");
                try {
                    snapshot = await getDocsFromCache(q);
                } catch (cacheErr) {
                    console.warn("Exact query not in cache, fetching collection from cache and filtering in memory...");
                    const allDocs = await getDocsFromCache(collection(db, colMap[activeTab] || "orders"));
                    
                    // Manual filter
                    let validDocs = allDocs.docs;
                    if (activeTab === "new") {
                        validDocs = validDocs.filter(d => ["Fully Paid", "Advance Paid", "Fampay", "Received"].includes(d.data().status));
                    } else if (activeTab === "placed") {
                        validDocs = validDocs.filter(d => d.data().status === "Order Placed");
                    } else if (activeTab === "delivered") {
                        validDocs = validDocs.filter(d => d.data().status === "Delivered");
                    } else if (activeTab === "cancelled") {
                        validDocs = validDocs.filter(d => d.data().status === "cancelled");
                    }
                    
                    // Manual sort (descending by createdAt)
                    if (activeTab !== "abandoned") {
                       validDocs.sort((a, b) => {
                           const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
                           const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
                           return bTime - aTime;
                       });
                    }
                    
                    // We mock a snapshot object for the rest of the code
                    snapshot = { docs: validDocs } as any;
                }
            } else {
                throw fetchErr;
            }
        }`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
