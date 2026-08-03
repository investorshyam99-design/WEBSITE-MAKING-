const fs = require('fs');
let content = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

content = content.replace(
  'const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);\n  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);',
  'const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);'
);

fs.writeFileSync('src/components/CartModal.tsx', content);
