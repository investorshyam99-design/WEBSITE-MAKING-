const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const search = `  const itemsCount = jerseyCart.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = itemsCount * 50;`;

const replace = `  const itemsCount = jerseyCart.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = (itemsCount * 50) + expressDeliveryCharge;`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
    console.log('patched advanceAmount');
} else {
    console.log('could not find search string for advanceAmount');
}
