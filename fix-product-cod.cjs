const fs = require('fs');
let content = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

content = content.replace(
  '₹49 Advance Payment Required',
  '₹50 Advance Payment Required per jersey'
);

content = content.replace(
  '₹50 COD handling charge applies',
  '₹50 COD handling charge applies per jersey'
);

fs.writeFileSync('src/pages/ProductPage.tsx', content);
