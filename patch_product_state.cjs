const fs = require('fs');
const path = 'src/pages/ProductPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// For custom toggle Yes
code = code.replace(
  /onChange=\{\(\) => setIsCustomized\(true\)\}/g,
  'onChange={() => { setIsCustomized(true); setIsCoolPrintEnabled(false); setSelectedCoolPrint(null); }}'
);

// For typing in custom name
code = code.replace(
  /setIsCustomized\(true\);/g,
  'setIsCustomized(true); setIsCoolPrintEnabled(false); setSelectedCoolPrint(null);'
);

fs.writeFileSync(path, code);
console.log("Success");
