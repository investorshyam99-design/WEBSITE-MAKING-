const fs = require('fs');
const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Store coolPrint in Firestore
code = code.replace(
  /customization: item\.customization \? \`\$\{item\.customization\.name\} \(\$\{item\.customization\.number\}\)\` : null,/g,
  'customization: item.customization ? `${item.customization.name} (${item.customization.number})` : null,\n            coolPrint: item.coolPrint || null,'
);

// Update removeFromCart call
code = code.replace(
  /removeFromCart\(item\.id, item\.selectedSize, item\.selectedColor, item\.customization\);/g,
  'removeFromCart(item.id, item.selectedSize, item.selectedColor, item.customization, item.coolPrint);'
);

fs.writeFileSync(path, code);
console.log("Success");
