const fs = require('fs');
let file = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

const regex2 = /totalOrders: filteredOrders\.length,\n      averageProfit: filteredOrders\.length > 0 \? \(netProfit \+ manualRevenue - manualCost\) \/ filteredOrders\.length : 0,/;
const rep2 = `totalOrders: filteredOrders.filter(o => !o.status?.toLowerCase().includes("draft") && !o.status?.toLowerCase().includes("pending") && o.status?.toLowerCase() !== "cancelled").length,
      averageProfit: filteredOrders.filter(o => !o.status?.toLowerCase().includes("draft") && !o.status?.toLowerCase().includes("pending") && o.status?.toLowerCase() !== "cancelled").length > 0 ? (netProfit + manualRevenue - manualCost) / filteredOrders.filter(o => !o.status?.toLowerCase().includes("draft") && !o.status?.toLowerCase().includes("pending") && o.status?.toLowerCase() !== "cancelled").length : 0,`;

file = file.replace(regex2, rep2);

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', file);
