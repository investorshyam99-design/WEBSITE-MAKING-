const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `        const rawType = order.deliveryType || "NORMAL";
        const effectiveDeliveryType = String(rawType).toUpperCase() === "FAST" ? "FAST" : "NORMAL";`;

const replace = `        const rawType = String(order.deliveryType || "").toLowerCase();
        const effectiveDeliveryType = (rawType === "fast" || rawType === "express") ? "Express" : "Surface";`;

content = content.replace(target, replace);

const target2 = `              shipping_mode: effectiveDeliveryType === "FAST" ? "Express" : "Surface"`;
const replace2 = `              shipping_mode: effectiveDeliveryType`;

content = content.replace(target2, replace2);

// Make sure we also update the diagnostic endpoint
const targetDiag = `              shipping_mode: (String(order.deliveryType || "NORMAL").toUpperCase() === "FAST") ? "Express" : "Surface",`;
const replaceDiag = `              shipping_mode: (String(order.deliveryType || "").toLowerCase() === "fast" || String(order.deliveryType || "").toLowerCase() === "express") ? "Express" : "Surface",`;

content = content.replace(targetDiag, replaceDiag);

fs.writeFileSync('server.ts', content);
