const fs = require('fs');
let content = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

content = content.replace(
    /let snapshot;\s*try {[\s\S]*?snapshot = await getDocsFromCache\(q\);\s*}\s*else {\s*throw fetchErr;\s*}\s*}/m,
    `let snapshot;
        try {
            snapshot = await getDocs(q);
        } catch (fetchErr: any) {
            if (fetchErr.message?.includes("Quota")) {
                try {
                    snapshot = await getDocsFromCache(q);
                } catch (cacheErr) {
                    const allDocs = await getDocsFromCache(collection(db, "orders"));
                    const validDocs = allDocs.docs.filter(d => 
                        ['Fully Paid', 'Advance Paid', 'Fampay', 'Received', 'Order Placed', 'Delivered'].includes(d.data().status)
                    );
                    validDocs.sort((a, b) => {
                        const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
                        const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
                        return bTime - aTime;
                    });
                    snapshot = { docs: validDocs } as any;
                }
            } else {
                throw fetchErr;
            }
        }`
);

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', content);
