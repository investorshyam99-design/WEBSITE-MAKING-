const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

// Replace pricing logic
const oldPricingLogic = `  const subtotal = jerseyCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + expressDeliveryCharge;
  
  const itemsCount = jerseyCart.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = (itemsCount * 50) + expressDeliveryCharge;`;

const newPricingLogic = `  const productSubtotal = jerseyCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  
  const isFastDelivery = deliveryMethod === "FAST";
  const fastDeliveryCharge = isFastDelivery ? 50 : 0;
  const codHandlingCharge = paymentMode === "partial" ? 50 : 0;
  
  const totalOrderValue = productSubtotal + codHandlingCharge + fastDeliveryCharge;

  let advanceToCollect = 0;
  let codAmount = 0;

  if (paymentMode === "partial") {
    if (isFastDelivery) {
      advanceToCollect = 100;
    } else {
      advanceToCollect = 50;
    }
    codAmount = productSubtotal;
  } else {
    advanceToCollect = totalOrderValue;
    codAmount = 0;
  }`;

code = code.replace(oldPricingLogic, newPricingLogic);
fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
console.log("Patched pricing logic block.");
