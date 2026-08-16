const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const search = 'const productDesc = `${order.productName} - Size ${order.size} - Customization: ${order.customization || order.customizationStatus === "YES" ? "YES" : "NO"}`;';
const replace = 'const productDesc = `${order.productName} - Size ${order.size} - Customization: ${order.customization ? order.customization : "None"}`;';

code = code.replace(search, replace);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('patched productDesc');
