const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(/\{advanceAmount\}/g, '{advanceToCollect}');
code = code.replace(/advanceAmount\.toFixed/g, 'advanceToCollect.toFixed');
code = code.replace(/paymentMode === "full" \? total : advanceAmount/g, 'advanceToCollect');

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
console.log("Patched final variables in UI");
