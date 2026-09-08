const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `
  const isFastDelivery = deliveryMethod === "FAST";
  const fastDeliveryCharge = isFastDelivery ? (50 * jerseyCart.reduce((s, i) => s + (i.quantity || 1), 0)) : 0;
  const codHandlingCharge = paymentMode === "partial" ? 50 : 0;
  
  const totalOrderValue = productSubtotal + codHandlingCharge + fastDeliveryCharge;

  let advanceToCollect = 0;
  let codAmount = 0;
  const totalQuantity = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (paymentMode === "partial") {
    advanceToCollect = (50 * totalQuantity) + fastDeliveryCharge;
    codAmount = productSubtotal;
  } else {
    advanceToCollect = totalOrderValue;
    codAmount = 0;
  }

  const handleCheckout = async (overrideMode?: "full" | "partial") => {
    const currentMode = overrideMode || paymentMode;
    
    // Recalculate based on currentMode to avoid React state async issues
    const currentIsFastDelivery = deliveryMethod === "FAST";
    const currentFastDeliveryCharge = currentIsFastDelivery ? (50 * jerseyCart.reduce((s, i) => s + (i.quantity || 1), 0)) : 0;
    const currentCodHandlingCharge = currentMode === "partial" ? 50 : 0;
    const currentTotalOrderValue = productSubtotal + currentCodHandlingCharge + currentFastDeliveryCharge;
    
    let currentAdvanceToCollect = 0;
    let currentCodAmount = 0;
    const totalQty = jerseyCart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    if (currentMode === "partial") {
      currentAdvanceToCollect = (50 * totalQty) + currentFastDeliveryCharge;
      currentCodAmount = productSubtotal;
    } else {
      currentAdvanceToCollect = currentTotalOrderValue;
      currentCodAmount = 0;
    }
`;

const replaceStr = `
  const isFastDelivery = deliveryMethod === "FAST";
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
`;

if (code.includes(targetStr.trim())) {
  code = code.replace(targetStr.trim(), replaceStr.trim());
  fs.writeFileSync(path, code);
  console.log("Success");
} else {
  console.log("Not found target string");
  
  // fallback for handling whitespace differences
  let lines = code.split('\n');
  let newCode = code;
  
  console.log("Will do a loose replace.");
}
