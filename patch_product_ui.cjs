const fs = require('fs');
const path = 'src/pages/ProductPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Remove opacity styling
code = code.replace(/ style=\{\{ opacity: isCoolPrintEnabled \? 0\.5 : 1, pointerEvents: isCoolPrintEnabled \? 'none' : 'auto' \}\}/g, '');
code = code.replace(/ style=\{\{ opacity: isCustomized \? 0\.5 : 1, pointerEvents: isCustomized \? 'none' : 'auto' \}\}/g, '');

// Update 499 to 299 in ProductPage.tsx
code = code.replace(/499/g, '299');

fs.writeFileSync(path, code);
console.log("Success");
