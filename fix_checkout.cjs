const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
  '<span>Subtotal ({itemsCount} items)</span>',
  '<span>Subtotal ({jerseyCart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>'
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
console.log("Patched itemsCount error");
