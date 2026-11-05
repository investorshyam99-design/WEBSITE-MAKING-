const fs = require('fs');
const path = 'src/components/CartModal.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /removeFromCart\(\s*item\.id,\s*item\.selectedSize,\s*item\.selectedColor,\s*item\.customization,?\s*\)/g,
  'removeFromCart(item.id, item.selectedSize, item.selectedColor, item.customization, item.coolPrint)'
);

code = code.replace(
  /updateQuantity\(\s*item\.id,\s*item\.selectedSize,\s*item\.selectedColor,\s*item\.quantity - 1,\s*item\.customization,?\s*\)/g,
  'updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1, item.customization, item.coolPrint)'
);

code = code.replace(
  /updateQuantity\(\s*item\.id,\s*item\.selectedSize,\s*item\.selectedColor,\s*item\.quantity \+ 1,\s*item\.customization,?\s*\)/g,
  'updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1, item.customization, item.coolPrint)'
);

fs.writeFileSync(path, code);
console.log("Success");
