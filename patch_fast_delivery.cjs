const fs = require('fs');

// 1. Update server.ts
let serverContent = fs.readFileSync('server.ts', 'utf8');

serverContent = serverContent.replace(
  /const fastDeliveryFee = isFastDelivery \? 50 : 0;/g,
  `const fastDeliveryFee = isFastDelivery ? (50 * totalQuantity) : 0;`
);

fs.writeFileSync('server.ts', serverContent, 'utf8');

// 2. Update CheckoutPage.tsx
let checkoutContent = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

checkoutContent = checkoutContent.replace(
  /const fastDeliveryCharge = isFastDelivery \? 50 : 0;/g,
  `const fastDeliveryCharge = isFastDelivery ? (50 * jerseyCart.reduce((s, i) => s + (i.quantity || 1), 0)) : 0;`
);

checkoutContent = checkoutContent.replace(
  /const currentFastDeliveryCharge = currentIsFastDelivery \? 50 : 0;/g,
  `const currentFastDeliveryCharge = currentIsFastDelivery ? (50 * jerseyCart.reduce((s, i) => s + (i.quantity || 1), 0)) : 0;`
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', checkoutContent, 'utf8');
console.log("Updated Fast Delivery amounts!");
