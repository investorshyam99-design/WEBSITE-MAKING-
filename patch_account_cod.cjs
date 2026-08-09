const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const regexCod = /\{\(\n\s*order\.codAmount !== undefined \? order\.codAmount : \(order\.remainingCodAmount !== undefined \? order\.remainingCodAmount : Math\.max\(0, \(order\.price \|\| 0\) - \(order\.amountPaid !== undefined \? order\.amountPaid : \(order\.advancePaid \|\| \(order\.paymentMode === "partial" \? 50 \* effectiveQuantity : 0\)\)\)\)\)\n\s*\)\.toLocaleString\("en-IN"\)\}/g;
const replaceCod = `{(
                   order.codAmount !== undefined ? order.codAmount : (order.adjustedAmount !== undefined ? order.adjustedAmount : (order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0))))))
                 ).toLocaleString("en-IN")}`;

file = file.replace(regexCod, replaceCod);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
