const fs = require('fs');

// 1. Update server.ts
let serverContent = fs.readFileSync('server.ts', 'utf8');

serverContent = serverContent.replace(
  /const itemsTotal = items\.reduce\(\(sum: any, item: any\) => sum \+ \(item\.price \* item\.quantity\), 0\);[\s\S]*?let amount = 0;\s*if \(paymentMode === 'partial'\) \{\s*amount = isFastDelivery \? 100 : 50;\s*\} else \{\s*amount = itemsTotal \+ fastDeliveryFee;\s*\}/m,
  `const itemsTotal = items.reduce((sum: any, item: any) => sum + (item.price * item.quantity), 0);
      const totalQuantity = items.reduce((sum: any, item: any) => sum + (item.quantity || 1), 0);
      const isFastDelivery = deliveryMethod === "FAST";
      const fastDeliveryFee = isFastDelivery ? 50 : 0;
      
      let amount = 0;
      if (paymentMode === 'partial') {
        amount = (50 * totalQuantity) + fastDeliveryFee;
      } else {
        amount = itemsTotal + fastDeliveryFee;
      }`
);

fs.writeFileSync('server.ts', serverContent, 'utf8');

// 2. Update CheckoutPage.tsx
let checkoutContent = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

checkoutContent = checkoutContent.replace(
  /let advanceToCollect = 0;\s*let codAmount = 0;\s*if \(paymentMode === "partial"\) \{\s*if \(isFastDelivery\) \{\s*advanceToCollect = 100;\s*\} else \{\s*advanceToCollect = 50;\s*\}\s*codAmount = productSubtotal;\s*\} else \{\s*advanceToCollect = totalOrderValue;\s*codAmount = 0;\s*\}/m,
  `let advanceToCollect = 0;
  let codAmount = 0;
  const totalQuantity = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (paymentMode === "partial") {
    advanceToCollect = (50 * totalQuantity) + fastDeliveryCharge;
    codAmount = productSubtotal;
  } else {
    advanceToCollect = totalOrderValue;
    codAmount = 0;
  }`
);

checkoutContent = checkoutContent.replace(
  /let currentAdvanceToCollect = 0;\s*let currentCodAmount = 0;\s*if \(currentMode === "partial"\) \{\s*if \(currentIsFastDelivery\) \{\s*currentAdvanceToCollect = 100;\s*\} else \{\s*currentAdvanceToCollect = 50;\s*\}\s*currentCodAmount = productSubtotal;\s*\} else \{\s*currentAdvanceToCollect = currentTotalOrderValue;\s*currentCodAmount = 0;\s*\}/m,
  `let currentAdvanceToCollect = 0;
    let currentCodAmount = 0;
    const totalQty = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (currentMode === "partial") {
      currentAdvanceToCollect = (50 * totalQty) + currentFastDeliveryCharge;
      currentCodAmount = productSubtotal;
    } else {
      currentAdvanceToCollect = currentTotalOrderValue;
      currentCodAmount = 0;
    }`
);

// We also need to fix the advance split in the for loop!
// "if (isFirstItem) { itemAdvance = currentAdvanceToCollect; }"
// That assigns the entire advance to the first item. That's fine for total calculation. But let's leave it as is.

fs.writeFileSync('src/pages/CheckoutPage.tsx', checkoutContent, 'utf8');
console.log("Updated COD amounts!");
