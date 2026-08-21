const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const validationRegex = /\/\/ Validate required fields\s+const required = \['fullName', 'phone', 'address', 'pincode', 'paymentMode', 'deliveryType'\];\s+for \(const field of required\) \{\s+if \(order\[field\] === undefined \|\| order\[field\] === null \|\| order\[field\] === ""\) \{\s+return res\.status\(400\)\.json\(\{ success: false, error: \`Order Data Error: Missing required field: \$\{field\}\` \}\);\s+\}\s+\}/;

const newValidation = `
        const rawDeliveryType = String(order.deliveryType || "").toUpperCase();
        const resolvedDeliveryType = rawDeliveryType === "FAST" ? "FAST" : "NORMAL";

        // Validate required fields
        const required = ['fullName', 'phone', 'address', 'pincode', 'paymentMode'];
        for (const field of required) {
          if (order[field] === undefined || order[field] === null || order[field] === "") {
             return res.status(400).json({ success: false, error: \`Order Data Error: Missing required field: \${field}\` });
          }
        }
`;

content = content.replace(validationRegex, newValidation.trim());

content = content.replace(
  'shipping_mode: order.deliveryType === "FAST" ? "Express" : "Surface"',
  'shipping_mode: resolvedDeliveryType === "FAST" ? "Express" : "Surface"'
);

fs.writeFileSync('server.ts', content);
