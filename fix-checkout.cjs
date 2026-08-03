const fs = require('fs');
let content = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

content = content.replace(
  'const advanceAmount = 49;',
  'const advanceAmount = itemsCount * 50;'
);

content = content.replace(
  'const codExtra = 50;',
  'const codExtra = itemsCount * 50;'
);

content = content.replace(
  '₹49 Advance Payment Required',
  '₹{advanceAmount} Advance Payment Required'
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', content);
