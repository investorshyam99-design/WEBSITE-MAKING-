const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
code = code.replace(/alert\(\`This order already has a shipment!\\nAWB: \$\{order\.delhiveryShipmentId \|\| order\.awbNumber \|\| order\.trackingId\}\\nTracking URL: \$\{order\.trackingUrl \|\| 'N\/A'\}\`\);/, "alert(`Shipment already created\\nAWB: ${order.delhiveryShipmentId || order.awbNumber || order.trackingId}`);");
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('patched admin awb alert');
