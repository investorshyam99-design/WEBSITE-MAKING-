const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const search = `  const handleCheckout = async (overrideMode?: "full" | "partial") => {
    const currentMode = overrideMode || paymentMode;

    if (!fullName || !phone || !deliveryPincode || !houseNo) {`;

const replace = `  const handleCheckout = async (overrideMode?: "full" | "partial") => {
    const currentMode = overrideMode || paymentMode;
    
    // Recalculate based on currentMode to avoid React state async issues
    const currentIsFastDelivery = deliveryMethod === "FAST";
    const currentFastDeliveryCharge = currentIsFastDelivery ? 50 : 0;
    const currentCodHandlingCharge = currentMode === "partial" ? 50 : 0;
    const currentTotalOrderValue = productSubtotal + currentCodHandlingCharge + currentFastDeliveryCharge;
    
    let currentAdvanceToCollect = 0;
    let currentCodAmount = 0;
    
    if (currentMode === "partial") {
      if (currentIsFastDelivery) {
        currentAdvanceToCollect = 100;
      } else {
        currentAdvanceToCollect = 50;
      }
      currentCodAmount = productSubtotal;
    } else {
      currentAdvanceToCollect = currentTotalOrderValue;
      currentCodAmount = 0;
    }

    if (!fullName || !phone || !deliveryPincode || !houseNo) {`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
    console.log("Patched start of handleCheckout");
} else {
    console.log("Not found handleCheckout start");
}
