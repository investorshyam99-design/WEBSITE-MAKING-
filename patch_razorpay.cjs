const fs = require('fs');

// Patch CartModal to send deliveryMethod
let cart = fs.readFileSync('src/components/CartModal.tsx', 'utf8');
cart = cart.replace('          paymentMode, // Send \'full\' or \'partial\'', '          paymentMode, // Send \'full\' or \'partial\'\n          deliveryMethod,');
fs.writeFileSync('src/components/CartModal.tsx', cart);

// Patch create-razorpay-order.ts to use deliveryMethod
let code = fs.readFileSync('api/create-razorpay-order.ts', 'utf8');

const search = `    const { items, paymentMode } = req.body;`;
const replace = `    const { items, paymentMode, deliveryMethod } = req.body;`;

const calcSearch = `    if (paymentMode === 'partial') {
      amount = 50 * items.reduce((sum: any, item: any) => sum + item.quantity, 0); // 50 advance per item
    } else {
      amount = itemsTotal; // free delivery
    }`;

const calcReplace = `    const totalQuantity = items.reduce((sum: any, item: any) => sum + item.quantity, 0);
    const fastDeliveryFee = deliveryMethod === "FAST" ? 50 * totalQuantity : 0;
    
    if (paymentMode === 'partial') {
      amount = 50 * totalQuantity + fastDeliveryFee; // 50 advance per item + fast delivery
    } else {
      amount = itemsTotal + fastDeliveryFee;
    }`;

code = code.replace(search, replace).replace(calcSearch, calcReplace);
fs.writeFileSync('api/create-razorpay-order.ts', code);
console.log('patched razorpay calculation');
