const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const search = `         awbNumber: awb,
         delhiveryShipmentId: awb,
         shippingProvider: "Delhivery",
         shippingStatus: "Manifested",
         courierName: "Delhivery",
         trackingId: awb,
         shipmentCreatedAt: new Date().toISOString()`;

const replace = `         awbNumber: awb,
         delhiveryShipmentId: awb,
         shippingProvider: "Delhivery",
         shippingStatus: "Manifested",
         courierName: "Delhivery",
         trackingId: awb,
         trackingUrl: \`https://www.delhivery.com/track/package/\${awb}\`,
         shipmentCreatedAt: new Date().toISOString()`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('patched tracking url');
