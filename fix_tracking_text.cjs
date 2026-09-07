const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Replace the tracking text block globally
code = code.replace(/<p className="text-xs font-bold text-green-700 uppercase mb-1">Shipment Created<\/p>\s*<p className="text-\[11px\] text-green-600 mb-2 font-mono">AWB: \{order.awbNumber \|\| order.delhiveryShipmentId \|\| order.trackingId\}<\/p>/g,
  '<p className="text-xs font-bold text-green-700 uppercase mb-1">Shipment Created</p>\n                    <p className="text-[11px] text-green-600 mb-2 font-mono">TRACKING NUMBER: {order.awbNumber || order.delhiveryShipmentId || order.trackingId}</p>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code, 'utf8');
