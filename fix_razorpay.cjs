const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `      // Trust only backend calculation
      const { deliveryMethod } = req.body;
      const itemsTotal = items.reduce((sum: any, item: any) => sum + (item.price * item.quantity), 0);
      const totalQuantity = items.reduce((sum: any, item: any) => sum + item.quantity, 0);
      const fastDeliveryFee = deliveryMethod === "FAST" ? 50 * totalQuantity : 0;
      
      let amount = 0;
      if (paymentMode === 'partial') {
        amount = 50 * totalQuantity + fastDeliveryFee;
      } else {
        amount = itemsTotal + fastDeliveryFee;
      }`;

const replace = `      // Trust only backend calculation
      const { deliveryMethod } = req.body;
      const itemsTotal = items.reduce((sum: any, item: any) => sum + (item.price * item.quantity), 0);
      const isFastDelivery = deliveryMethod === "FAST";
      const fastDeliveryFee = isFastDelivery ? 50 : 0;
      
      let amount = 0;
      if (paymentMode === 'partial') {
        amount = isFastDelivery ? 100 : 50;
      } else {
        amount = itemsTotal + fastDeliveryFee;
      }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('server.ts', code);
    console.log("Patched Razorpay order amount logic");
} else {
    console.log("Failed to find Razorpay order logic string");
}
