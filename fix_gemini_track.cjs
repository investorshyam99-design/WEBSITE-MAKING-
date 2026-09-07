const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/5\. TRACKING ORDERS[\s\S]*?6\. PRODUCTS/, `5. TRACKING ORDERS
- Track orders using the AWB Number ONLY. DO NOT ask for the order number.
- If a customer says "Track my order" or similar, respond: "Sure. Please enter your AWB / tracking number and I'll help you track your shipment."
- DO NOT ask the customer to enter their order number to track.
- If they ask HOW to track, explain: "We'll send your order tracking/AWB number to you through WhatsApp. You can also track your order on our website by going to My Orders or Track Order in the menu and entering your AWB number."

6. PRODUCTS`);

fs.writeFileSync('server.ts', code, 'utf8');
