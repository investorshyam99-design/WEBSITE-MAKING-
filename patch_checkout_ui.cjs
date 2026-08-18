const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(/Pay Rs\. \{total\.toFixed\(2\)\} securely now\./g, 'Pay ₹{totalOrderValue.toFixed(2)} securely now.');
code = code.replace(/Pay Rs\. \{total\.toFixed\(0\)\}/g, 'Pay ₹{totalOrderValue.toFixed(0)}');
code = code.replace(/Rs\. \{subtotal\.toFixed\(2\)\}/g, '₹{productSubtotal.toFixed(2)}');
code = code.replace(/Rs\. \{\(paymentMode === "full" \? total : total \+ advanceAmount\)\.toFixed\(2\)\}/g, '₹{totalOrderValue.toFixed(2)}');
code = code.replace(/Rs\. \{\(paymentMode === "full" \? total : advanceAmount\)\.toFixed\(2\)\}/g, '₹{advanceToCollect.toFixed(2)}');
code = code.replace(/Rs\. \{total\.toFixed\(2\)\}/g, '₹{codAmount.toFixed(2)}');
code = code.replace(/PAY RS\. \{\(paymentMode === "full" \? total : advanceAmount\)\.toFixed\(2\)\} SECURELY/g, 'PAY ₹{advanceToCollect.toFixed(2)} SECURELY');
code = code.replace(/const itemsCount = jerseyCart\.reduce\(\(sum, item\) => sum \+ item\.quantity, 0\);/g, 'const itemsCount = jerseyCart.reduce((sum, item) => sum + item.quantity, 0);');

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
console.log("Patched UI.");
