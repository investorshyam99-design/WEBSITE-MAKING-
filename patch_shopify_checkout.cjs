const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

code = code.replace(
  /navigate\("\/checkout"\);/g,
  'window.location.href = "/checkout";'
);

fs.writeFileSync('src/components/CartModal.tsx', code);
