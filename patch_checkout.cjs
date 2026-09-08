const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /const isFastDelivery = deliveryMethod === "FAST";[\s\S]*?if \(!fullName/g;

const replaceStr = `const isFastDelivery = deliveryMethod === "FAST";
  const fastDeliveryCharge = isFastDelivery ? (50 * jerseyCart.reduce((s, i) => s + (i.quantity || 1), 0)) : 0;
  
  const totalOrderValue = productSubtotal + fastDeliveryCharge;

  let advanceToCollect = 0;
  let codAmount = 0;
  let codAdvance = 0;
  const totalQuantity = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (paymentMode === "partial") {
    codAdvance = 50 * totalQuantity;
    advanceToCollect = codAdvance + fastDeliveryCharge;
    codAmount = totalOrderValue - advanceToCollect;
  } else {
    advanceToCollect = totalOrderValue;
    codAmount = 0;
  }

  const handleCheckout = async (overrideMode?: "full" | "partial") => {
    const currentMode = overrideMode || paymentMode;
    
    // Recalculate based on currentMode to avoid React state async issues
    const currentIsFastDelivery = deliveryMethod === "FAST";
    const currentFastDeliveryCharge = currentIsFastDelivery ? (50 * jerseyCart.reduce((s, i) => s + (i.quantity || 1), 0)) : 0;
    const currentTotalOrderValue = productSubtotal + currentFastDeliveryCharge;
    
    let currentAdvanceToCollect = 0;
    let currentCodAmount = 0;
    const totalQty = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    if (currentMode === "partial") {
      const currentCodAdvance = 50 * totalQty;
      currentAdvanceToCollect = currentCodAdvance + currentFastDeliveryCharge;
      currentCodAmount = currentTotalOrderValue - currentAdvanceToCollect;
    } else {
      currentAdvanceToCollect = currentTotalOrderValue;
      currentCodAmount = 0;
    }

    if (!fullName`;

code = code.replace(regex, replaceStr);
fs.writeFileSync(path, code);
console.log("Success");
