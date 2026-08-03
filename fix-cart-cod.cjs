const fs = require('fs');
let content = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

content = content.replace(
  'const advanceAmount = 49;',
  'const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);\n  const advanceAmount = itemsCount * 50;'
);

content = content.replace(
  'const codExtra = 50;',
  'const codExtra = itemsCount * 50;'
);

content = content.replace(
  '₹49 Advance Payment Required',
  '₹{advanceAmount} Advance Payment Required'
);

content = content.replace(
  '₹50 COD handling charge applies',
  '₹{codExtra} COD handling charge applies'
);

fs.writeFileSync('src/components/CartModal.tsx', content);
