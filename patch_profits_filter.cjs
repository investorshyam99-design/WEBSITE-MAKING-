const fs = require('fs');
let file = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

const regex = /let baseOrders = validOrders;/;
const replacement = `let baseOrders = validOrders.filter(o => o.status?.toLowerCase() !== "cancelled");`;
file = file.replace(regex, replacement);

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', file);
