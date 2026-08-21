const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add import
if (!content.includes('getDocsFromCache')) {
    content = content.replace('getDocs,', 'getDocs, getDocsFromCache,');
}

// Replace getDocs call
content = content.replace(
    'const snapshot = await getDocs(q);',
    `let snapshot;
        try {
            snapshot = await getDocs(q);
        } catch (fetchErr: any) {
            if (fetchErr.message?.includes("Quota")) {
                console.warn("Quota exceeded, falling back to offline cache...");
                snapshot = await getDocsFromCache(q);
            } else {
                throw fetchErr;
            }
        }`
);

// Remove the quota alert from the catch block to avoid double reporting if cache works or doesn't work.
content = content.replace(
  /catch \(e: any\) {[\s\S]*?finally {/m,
  `catch (e: any) {
        console.warn("Failed to fetch tab orders", e);
        if (e.message?.includes("Quota")) {
           // We might still fail if cache is empty
           console.log("Could not even load from cache due to quota/offline.");
        }
    } finally {`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
