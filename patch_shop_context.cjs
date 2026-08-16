const fs = require('fs');
let code = fs.readFileSync('src/context/ShopContext.tsx', 'utf8');

const search = `  const expressDeliveryCharge = deliveryMethod === "FAST" ? 50 : 0;`;
const replace = `  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const expressDeliveryCharge = deliveryMethod === "FAST" ? 50 * totalItems : 0;`;

code = code.replace(search, replace);
fs.writeFileSync('src/context/ShopContext.tsx', code);
console.log('patched shop context');
