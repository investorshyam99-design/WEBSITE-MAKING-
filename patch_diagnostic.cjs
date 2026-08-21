const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `
              codAmount: isCod ? (order.codAmount || 0) : 0,
              product: productDesc,
              quantity: order.quantity || 1,
              weight: 500,
              shipping_mode: (String(order.deliveryType || "NORMAL").toUpperCase() === "FAST") ? "Express" : "Surface",
              endpointUsed: "https://track.delhivery.com/api/cmu/create.json"
`;

content = content.replace(/codAmount: isCod \? \(order\.codAmount \|\| 0\) : 0,\s*product: productDesc,\s*quantity: order\.quantity \|\| 1,\s*weight: 500,\s*endpointUsed: "https:\/\/track\.delhivery\.com\/api\/cmu\/create\.json"/g, replacement);
fs.writeFileSync('server.ts', content);
