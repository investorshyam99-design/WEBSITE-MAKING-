const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `      let amount = 0;
      if (finalAmount !== undefined) {
        amount = Number(finalAmount);
      } else {
        // Fallback calculation just in case
        let itemsTotal = items.reduce(
          (sum: any, item: any) => sum + item.price * item.quantity,
          0,
        );

        if (paymentMode === "partial") {
          const baseAdvance =
            50 * items.reduce((sum: any, item: any) => sum + item.quantity, 0);
          amount = baseAdvance;
        } else {
          amount = itemsTotal;
        }
      }`;

const replace = `      // Trust only backend calculation
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

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
console.log('patched server.ts razorpay calculation');
