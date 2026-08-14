const fs = require('fs');
let file = fs.readFileSync('src/lib/utils.ts', 'utf8');

file = file.replace(
/const isCustomized = \(order\.customization \|\| order\.customizationStatus === "YES"\);\s*let isFullyPaid = order\.paymentMode === "full" \|\| String\(order\.status\)\.toLowerCase\(\)\.includes\("full"\) \|\| order\.paymentMethod === "PREPAID" \|\| order\.paymentStatus === "FULLY_PAID" \|\| isCustomized;/,
`let isFullyPaid = order.paymentMode === "full" || String(order.status).toLowerCase().includes("full") || order.paymentMethod === "PREPAID" || order.paymentStatus === "FULLY_PAID";`
);

fs.writeFileSync('src/lib/utils.ts', file);
