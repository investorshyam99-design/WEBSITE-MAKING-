const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Fix the COD Advance button
const regexCOD = /<span className="text-base md:text-xl font-bold text-gray-900 leading-tight mb-1">Pay ₹\{advanceToCollect\.toFixed\(0\)\}<\/span>/;
const replaceCOD = `<span className="text-base md:text-xl font-bold text-gray-900 leading-tight mb-1">Pay ₹{paymentMode === "partial" ? codAdvance.toFixed(0) : advanceToCollect.toFixed(0)}</span>`;

code = code.replace(regexCOD, replaceCOD);
fs.writeFileSync(path, code);
console.log("Success");
