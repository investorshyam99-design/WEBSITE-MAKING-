const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/fastDeliveryCharge/g, 'fastShippingCharge');

// Fix the final PAY RS submit button logic because we simplified advanceToCollect to be EXACTLY the amount to pay
const submitRegex = /\{isSubmitting \? "PROCESSING\.\.\." : `PAY RS\. \$\{\(paymentMode === "partial" \? codAdvance \+ fastShippingCharge : totalOrderValue\)\.toFixed\(2\)\} SECURELY`\}/g;
code = code.replace(submitRegex, '{isSubmitting ? "PROCESSING..." : `PAY RS. ${advanceToCollect.toFixed(2)} SECURELY`}');

fs.writeFileSync(path, code);
console.log("Success");
