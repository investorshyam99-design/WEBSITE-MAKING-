const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// PREPAID Card
code = code.replace(
  /Pay ₹\{totalOrderValue\.toFixed\(2\)\} securely now\./g,
  'Pay ₹{prepaidTotalValue.toFixed(2)} securely now.'
);

// COD Card
code = code.replace(
  /₹\{advanceToCollect\} Advance Payment Required/g,
  '₹{codAdvanceRequired} Advance Payment Required'
);

// Sticky COD
code = code.replace(
  /Pay ₹\{codAdvance\.toFixed\(0\)\}/g,
  'Pay ₹{codAdvanceRequired.toFixed(0)}'
);

// Sticky PREPAID
code = code.replace(
  /Pay ₹\{totalOrderValue\.toFixed\(0\)\}/g,
  'Pay ₹{prepaidTotalValue.toFixed(0)}'
);

// We had codAdvance in the order summary, let's fix it if it's there
code = code.replace(
  /<span>Rs\. \{codAdvance\.toFixed\(2\)\}<\/span>/g,
  '<span>Rs. {codCharge.toFixed(2)}</span>'
);

fs.writeFileSync(path, code);
console.log("Success");
