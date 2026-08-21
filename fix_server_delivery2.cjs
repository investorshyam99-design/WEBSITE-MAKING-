const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace the effectiveDeliveryType logic
const replacement = `
        const rawType = order.deliveryType || "NORMAL";
        const effectiveDeliveryType = String(rawType).toUpperCase() === "FAST" ? "FAST" : "NORMAL";
`;

content = content.replace(/const effectiveDeliveryType = order\.deliveryType \|\| "NORMAL";/g, replacement);

fs.writeFileSync('server.ts', content);
