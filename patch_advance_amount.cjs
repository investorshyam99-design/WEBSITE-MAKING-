const fs = require('fs');

let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const search = `  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = itemsCount * 50;`;
const replace = `  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = (itemsCount * 50) + expressDeliveryCharge;`;

code = code.replace(search, replace);

// Fix payment success message for COD
const msgSearch = `\nRemaining COD Amount: ₹\${total - advanceAmount}\n`;
const msgReplace = `\nRemaining COD Amount: ₹\${total - advanceAmount + expressDeliveryCharge}\n`;
// Wait, if total already includes expressDeliveryCharge:
// total = subtotal + expressDeliveryCharge
// advanceAmount = (itemsCount * 50) + expressDeliveryCharge
// Remaining COD = total - advanceAmount
// = subtotal + expressDeliveryCharge - (itemsCount * 50 + expressDeliveryCharge)
// = subtotal - (itemsCount * 50)
// This is exactly the remaining COD! So total - advanceAmount is correct.

fs.writeFileSync('src/components/CartModal.tsx', code);
console.log('patched advance amount');
