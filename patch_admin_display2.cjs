const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexPaidAndCod = /<p className="text-gray-400 font-bold uppercase tracking-wider mb-0\.5">\n\s*Paid\n\s*<\/p>\n\s*<p className="font-black text-green-600 text-sm">\n\s*₹\n\s*\{\(order\.advancePaid !== undefined \n\s*\? order\.advancePaid \n\s*: \(order\.paymentMode === "full" \? \(order\.price \|\| 0\) : \(order\.paymentMode === "partial" \|\| String\(order\.status\)\.toLowerCase\(\)\.includes\("advance"\) \? 50 \* effectiveQuantity : 0\)\)\n\s*\)\.toLocaleString\("en-IN"\)\}\n\s*<\/p>/;

const replacePaidAndCod = `<p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  Paid
                </p>
                <p className="font-black text-green-600 text-sm">
                  ₹
                  {(order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined 
                     ? order.advancePaid 
                     : (order.paymentMode === "full" ? (order.price || 0) : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0)))
                  ).toLocaleString("en-IN")}
                </p>`;

file = file.replace(regexPaidAndCod, replacePaidAndCod);

const regexCod = /\{\(\n\s*order\.remainingCodAmount !== undefined \? order\.remainingCodAmount : Math\.max\(0, \(order\.price \|\| 0\) - \(order\.advancePaid \|\| \(order\.paymentMode === "partial" \? 50 \* effectiveQuantity : 0\)\)\)\n\s*\)\.toLocaleString\("en-IN"\)\}/;
const replaceCod = `{(
                      order.codAmount !== undefined ? order.codAmount : (order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))))
                    ).toLocaleString("en-IN")}`;

file = file.replace(regexCod, replaceCod);

// Also need to update the collapsed COD view
const regexCollapsedCod = /\{\(\n\s*order\.remainingCodAmount !== undefined \? order\.remainingCodAmount : Math\.max\(0, \(order\.price \|\| 0\) - \(order\.advancePaid \|\| \(order\.paymentMode === "partial" \? 50 \* effectiveQuantity : 0\)\)\)\n\s*\)\.toLocaleString\("en-IN"\)\}/;
file = file.replace(regexCollapsedCod, replaceCod);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
