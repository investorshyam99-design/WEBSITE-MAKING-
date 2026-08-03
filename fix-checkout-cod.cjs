const fs = require('fs');
let content = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

content = content.replace(
  '(₹50 COD handling charge applies)',
  '(₹{codExtra} COD handling charge applies)'
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', content);
