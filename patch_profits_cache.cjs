const fs = require('fs');
let content = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

if (!content.includes('getDocsFromCache')) {
    content = content.replace('getDocs }', 'getDocs, getDocsFromCache }');
}

content = content.replace(
    'const snapshot = await getDocs(q);',
    `let snapshot;
        try {
            snapshot = await getDocs(q);
        } catch (fetchErr: any) {
            if (fetchErr.message?.includes("Quota")) {
                snapshot = await getDocsFromCache(q);
            } else {
                throw fetchErr;
            }
        }`
);

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', content);
