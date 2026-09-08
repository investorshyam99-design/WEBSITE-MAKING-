const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /const jerseyQuantity = jerseyCart\.reduce\(\(sum, item\) => sum \+ \(item\.quantity \|\| 1\), 0\);[\s\S]*?const currentCodAmount = currentMode === "partial" \? currentTotalOrderValue - currentCodCharge : 0;/;

const replaceStr = `const jerseyQuantity = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  const isFastDelivery = deliveryMethod === "FAST";
  
  // Base constants
  const baseCodCharge = 50 * jerseyQuantity;
  const fastShippingCharge = isFastDelivery ? (50 * jerseyQuantity) : 0;
  
  // What-if scenarios for UI cards
  const prepaidTotalValue = productSubtotal + fastShippingCharge;
  const codTotalValue = productSubtotal + baseCodCharge + fastShippingCharge;
  const codAdvanceRequired = baseCodCharge + fastShippingCharge;
  const codRemainingOnDelivery = productSubtotal;
  
  // Active selected state (used for Summary, Pay button, and Razorpay)
  const isCodSelected = paymentMode === "partial";
  const totalOrderValue = isCodSelected ? codTotalValue : prepaidTotalValue;
  const advanceToCollect = isCodSelected ? codAdvanceRequired : prepaidTotalValue;
  const codAmount = isCodSelected ? codRemainingOnDelivery : 0;
  const codCharge = isCodSelected ? baseCodCharge : 0; // The actual applied fee

  const handleCheckout = async (overrideMode?: "full" | "partial") => {
    const currentMode = overrideMode || paymentMode;
    const currentIsFastDelivery = deliveryMethod === "FAST";
    
    // Recalculate based on currentMode to avoid React state async issues
    const currentJerseyQty = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const currentBaseCodCharge = 50 * currentJerseyQty;
    const currentFastShippingCharge = currentIsFastDelivery ? (50 * currentJerseyQty) : 0;
    
    const currentIsCod = currentMode === "partial";
    const currentCodCharge = currentIsCod ? currentBaseCodCharge : 0;
    
    const currentTotalOrderValue = currentIsCod 
      ? productSubtotal + currentBaseCodCharge + currentFastShippingCharge 
      : productSubtotal + currentFastShippingCharge;
      
    const currentAdvanceToCollect = currentIsCod 
      ? currentBaseCodCharge + currentFastShippingCharge 
      : currentTotalOrderValue;
      
    const currentCodAmount = currentIsCod ? productSubtotal : 0;`;

code = code.replace(regex, replaceStr);
fs.writeFileSync(path, code);
console.log("Success");
