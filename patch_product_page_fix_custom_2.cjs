const fs = require('fs');
const path = 'src/pages/ProductPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/setIsCustomizedomizationModalOpen/g, 'setIsCustomizationModalOpen');
code = code.replace(/setIsCustomizedomized/g, 'setIsCustomized');

fs.writeFileSync(path, code);
console.log("Success");
