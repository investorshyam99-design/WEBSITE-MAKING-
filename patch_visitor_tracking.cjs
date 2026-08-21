const fs = require('fs');
let content = fs.readFileSync('src/context/ShopContext.tsx', 'utf8');

const oldTrackingRegex = /const interval = setInterval\(\(\) => \{\s+let cumulativeTime = parseInt\(safeGetItem\('cumulative_time_spent'\) \|\| '0', 10\);\s+cumulativeTime \+= 10; \/\/ add 10 seconds tracking\s+safeSetItem\('cumulative_time_spent', cumulativeTime\.toString\(\)\);\s+trackVisitor\(\); \/\/ update firestore\s+\}, 10000\);\s+return \(\) => clearInterval\(interval\);/g;

const newTracking = `
    const timeInterval = setInterval(() => {
       let cumulativeTime = parseInt(safeGetItem('cumulative_time_spent') || '0', 10);
       cumulativeTime += 10; // Local counter updates every 10s
       safeSetItem('cumulative_time_spent', cumulativeTime.toString());
    }, 10000);

    const dbInterval = setInterval(() => {
       trackVisitor(); // Update firestore only every 60s to save massive write costs
    }, 60000);

    const handleBeforeUnload = () => {
       trackVisitor(); // Final write when they leave
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        clearInterval(timeInterval);
        clearInterval(dbInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
`;

content = content.replace(oldTrackingRegex, newTracking.trim());
fs.writeFileSync('src/context/ShopContext.tsx', content);
