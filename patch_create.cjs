const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const findRequired = `        const required = ['fullName', 'phone', 'address', 'pincode', 'paymentMode'];
        for (const field of required) {
          if (order[field] === undefined || order[field] === null || order[field] === "") {
             return res.status(400).json({ success: false, error: \`Order Data Error: Missing required field: \${field}\` });
          }
        }`;

const replaceRequired = `        const required = ['fullName', 'phone', 'address', 'pincode', 'paymentMode'];
        for (const field of required) {
          if (order[field] === undefined || order[field] === null || order[field] === "") {
             return res.status(400).json({ success: false, error: \`Order Data Error: Missing required field: \${field}\` });
          }
        }`;

content = content.replace(findRequired, replaceRequired);

const findDeliveryType = `        const rawType = order.deliveryType || "NORMAL";
        const effectiveDeliveryType = String(rawType).toUpperCase() === "FAST" ? "FAST" : "NORMAL";`;
const replaceDeliveryType = `        const rawType = order.deliveryType || "NORMAL";
        const effectiveDeliveryType = String(rawType).toUpperCase() === "FAST" ? "FAST" : "NORMAL";`;
        
// Let's actually remove the strict required check in server.ts since it's already in the code, wait, I need to check where deliveryType is being enforced
