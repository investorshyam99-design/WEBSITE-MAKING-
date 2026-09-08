const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /const isFastDelivery = deliveryMethod === "FAST";[\s\S]*?if \(!fullName/g;

const replaceStr = `const jerseyQuantity = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  const isFastDelivery = deliveryMethod === "FAST";
  const fastShippingCharge = isFastDelivery ? (50 * jerseyQuantity) : 0;
  const codCharge = paymentMode === "partial" ? (50 * jerseyQuantity) : 0;
  
  const totalOrderValue = productSubtotal + codCharge + fastShippingCharge;

  const advanceToCollect = paymentMode === "partial" ? codCharge : totalOrderValue;
  const codAmount = paymentMode === "partial" ? totalOrderValue - codCharge : 0;
  const codAdvance = codCharge; // for UI backward compatibility

  const handleCheckout = async (overrideMode?: "full" | "partial") => {
    const currentMode = overrideMode || paymentMode;
    
    // Recalculate based on currentMode to avoid React state async issues
    const currentJerseyQty = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const currentIsFastDelivery = deliveryMethod === "FAST";
    const currentFastShippingCharge = currentIsFastDelivery ? (50 * currentJerseyQty) : 0;
    const currentCodCharge = currentMode === "partial" ? (50 * currentJerseyQty) : 0;
    
    const currentTotalOrderValue = productSubtotal + currentCodCharge + currentFastShippingCharge;
    
    const currentAdvanceToCollect = currentMode === "partial" ? currentCodCharge : currentTotalOrderValue;
    const currentCodAmount = currentMode === "partial" ? currentTotalOrderValue - currentCodCharge : 0;

    if (!fullName`;

code = code.replace(regex, replaceStr);
fs.writeFileSync(path, code);
console.log("Success");
