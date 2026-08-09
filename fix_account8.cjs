const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

file = file.replace(/order\.remainingCodAmount !== undefined \? order\.remainingCodAmount : Math\.max\(0, \(order\.price \|\| 0\) - \(order\.advancePaid \|\| \(order\.paymentMode === "partial" \? 50 \* effectiveQuantity : 0\)\)\)/, 
`order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.advancePaid !== undefined ? order.advancePaid : ((order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance")) ? 50 * effectiveQuantity : 0)))`);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
