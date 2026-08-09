const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexTotalDisplay = /<p className="text-blue-800 font-bold uppercase tracking-wider text-\[10px\] mb-0\.5">TOTAL ORDER VALUE<\/p>\n\s*<p className="font-black text-blue-900 text-sm">₹\{\(order\.price \|\| 0\)\.toLocaleString\("en-IN"\)\}<\/p>/;
const replaceTotalDisplay = `<p className="text-blue-800 font-bold uppercase tracking-wider text-[10px] mb-0.5">TOTAL ORDER VALUE</p>
                <p className="font-black text-blue-900 text-sm">₹{(order.finalTotalAmount ?? order.price ?? 0).toLocaleString("en-IN")}</p>`;
file = file.replace(regexTotalDisplay, replaceTotalDisplay);

const regexEditCall = /onUpdatePrice\(order\.price \|\| 0\);/;
const replaceEditCall = `onUpdatePrice(order.adjustedAmount ?? order.codAmount ?? order.remainingCodAmount ?? Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))));`;
file = file.replace(regexEditCall, replaceEditCall);

const regexAmountPaid = /\{\(order\.amountPaid !== undefined \? order\.amountPaid : \(order\.advancePaid !== undefined \n\s*\? order\.advancePaid \n\s*: \(\(order\.paymentMode === "full" \? \(order\.price \|\| 0\) : \(\(order\.paymentMode === "partial" \|\| String\(order\.status\)\.toLowerCase\(\)\.includes\("advance"\)\) \? 50 \* effectiveQuantity : 0\)\)\)\)\)\n\s*\)\.toLocaleString\("en-IN"\)\}/g;
const replaceAmountPaid = `{(order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "full" ? (order.price || 0) : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0)))).toLocaleString("en-IN")}`;
file = file.replace(regexAmountPaid, replaceAmountPaid);

const regexCod = /\{\(\n\s*order\.codAmount !== undefined \? order\.codAmount : \(order\.remainingCodAmount !== undefined \? order\.remainingCodAmount : Math\.max\(0, \(order\.price \|\| 0\) - \(order\.amountPaid !== undefined \? order\.amountPaid : \(order\.advancePaid \|\| \(order\.paymentMode === "partial" \? 50 \* effectiveQuantity : 0\)\)\)\)\)\n\s*\)\.toLocaleString\("en-IN"\)\}/g;
const replaceCod = `{(
                      order.codAmount !== undefined ? order.codAmount : (order.adjustedAmount !== undefined ? order.adjustedAmount : (order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0))))))
                    ).toLocaleString("en-IN")}`;
file = file.replace(regexCod, replaceCod);

// Also need to add Price Deduction display
const regexDeduction = /<div className="text-right">\n\s*<p className="text-gray-400 font-bold uppercase tracking-wider mb-0\.5">CUSTOMIZATION AMOUNT<\/p>\n\s*<p className="font-black text-gray-800 text-sm">₹\{order\.customizationStatus === "NO" \? "0" : "199"\}<\/p>\n\s*<\/div>/;
const replaceDeduction = `<div className="text-right">
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">PRICE DEDUCTION</p>
              <p className="font-black text-gray-800 text-sm">₹{order.deductionAmount || order.priceAdjustment || (order.customizationStatus === "NO" ? "199" : "0")}</p>
            </div>`;
file = file.replace(regexDeduction, replaceDeduction);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
