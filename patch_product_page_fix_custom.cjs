const fs = require('fs');
const path = 'src/pages/ProductPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Fix the "setIsCust" that I introduced by mistake
code = code.replace(/setIsCust/g, 'setIsCustomized');
code = code.replace(/isCust \? 0\.5 : 1/g, 'isCustomized ? 0.5 : 1');
code = code.replace(/isCust \? 'none' : 'auto'/g, 'isCustomized ? \'none\' : \'auto\'');
code = code.replace(/isCust && \(/g, 'isCustomized && (');

// Customization Section Mutual Exclusion 1
code = code.replace(
  /onChange=\{\(\) => setIsCustomized\(true\)\}/g,
  'onChange={() => { setIsCustomized(true); setIsCoolPrintEnabled(false); setSelectedCoolPrint(null); }}'
);
// Customization Section Mutual Exclusion text input 1
code = code.replace(
  /setIsCustomized\(true\);/g,
  'setIsCustomized(true); setIsCoolPrintEnabled(false); setSelectedCoolPrint(null);'
);

// We need to pass `isCustomized` instead of `isCust` in `handleAction`. Let's verify `isCust` isn't used anywhere else:
code = code.replace(/isCust \? \{/g, 'isCustomized ? {');

fs.writeFileSync(path, code);
console.log("Success");
