const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /Pay ₹\{paymentMode === "partial" \? codAdvance\.toFixed\(0\) : advanceToCollect\.toFixed\(0\)\}/g,
  'Pay ₹{codAdvance.toFixed(0)}'
);

fs.writeFileSync(path, code);
console.log("Success");
