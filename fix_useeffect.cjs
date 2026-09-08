const fs = require('fs');
const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /useEffect\(\(\) => \{\s*if \(deliveryLocation\) \{\s*setCity\(deliveryLocation\.city \|\| ""\);\s*setState\(deliveryLocation\.state \|\| ""\);\s*\}\s*\}, \[deliveryLocation\]\);/;

code = code.replace(regex, '');
fs.writeFileSync(path, code);
console.log("Success");
