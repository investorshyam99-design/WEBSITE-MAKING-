const fs = require('fs');
let file = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

// Filter validOrders so they don't count cancelled if possible, or just filter it in stats
const statsFilter = `    filteredOrders.forEach(o => {
      if (!o.address || o.status?.toLowerCase().includes("draft") || o.status?.toLowerCase().includes("pending") || o.status?.toLowerCase() === "cancelled") {
         return; // We only calculate for completed operations (payment received/delivered)
      }`;

file = file.replace(/filteredOrders\.forEach\(o => \{\n      if \(\!o\.address \|\| o\.status\?\.toLowerCase\(\)\.includes\("draft"\) \|\| o\.status\?\.toLowerCase\(\)\.includes\("pending"\)\) \{\n         return; \/\/ We only calculate for completed operations \(payment received\/delivered\)\n      \}/, statsFilter);

// Also need to fix revenue calculation in Profits
file = file.replace(/const basePrice = getOrderPrice\(o\);/g, 'const basePrice = o.price || o.finalTotal || getOrderPrice(o);');
file = file.replace(/const codAmount = basePrice \+ \(50 \* effectiveQty\) - advanceReceived;/g, 'const codAmount = o.remainingCodAmount !== undefined ? o.remainingCodAmount : Math.max(0, basePrice - advanceReceived);');

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', file);
