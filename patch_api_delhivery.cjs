const fs = require('fs');
let content = fs.readFileSync('api/delhivery.ts', 'utf8');

const target1 = `        const required = ['fullName', 'phone', 'address', 'pincode', 'paymentMode', 'deliveryType'];`;
const replace1 = `        const required = ['fullName', 'phone', 'address', 'pincode', 'paymentMode'];`;

content = content.replace(target1, replace1);

const target2 = `        // WAREHOUSE VALIDATION`;
const replace2 = `        const rawType = String(order.deliveryType || "").toLowerCase();
        const effectiveDeliveryType = (rawType === "fast" || rawType === "express") ? "Express" : "Surface";

        // WAREHOUSE VALIDATION`;

content = content.replace(target2, replace2);

const target3 = `shipping_mode: order.deliveryType === "FAST" ? "Express" : "Surface"`;
const replace3 = `shipping_mode: effectiveDeliveryType`;

content = content.replace(target3, replace3);

fs.writeFileSync('api/delhivery.ts', content);
