const fs = require('fs');
const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Update hasCustomization logic to include coolPrint
code = code.replace(
  /const hasCustomization = jerseyCart\.some\(item => \{[\s\S]*?return false;\n  \}\);/g,
  `const hasCustomization = jerseyCart.some(item => {
    if (item.coolPrint?.selected) return true;
    if (!item.customization) return false;
    if (typeof item.customization === 'object') {
      return Boolean(item.customization.name?.trim()) || Boolean(item.customization.number?.trim());
    }
    if (typeof item.customization === 'string') {
      return (item.customization as string).trim().length > 0;
    }
    return false;
  });`
);

code = code.replace(
  /Customized jerseys are made exclusively for you\. Therefore, Name & Number customized jerseys are available only on Prepaid orders\./g,
  'Customized jerseys (including Name & Number and Cool Prints) are made exclusively for you. Therefore, they are available only on Prepaid orders.'
);

fs.writeFileSync(path, code);
console.log("Success");
