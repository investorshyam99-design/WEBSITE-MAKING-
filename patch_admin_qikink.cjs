const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Remove the Qikink button in 'new' tab
file = file.replace(/<button\s*disabled=\{isFulfilling\}\s*onClick=\{handleQikinkFulfillment\}[\s\S]*?⚡ Fulfill with Qikink"\}\s*<\/button>/g, '');

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
