const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Fix collapsed COD calculation
file = file.replace(/COD: ₹\s*\{\(\s*\(\(order\.price \|\| 0\) \+\s*50 \* effectiveQuantity -\s*50 \* effectiveQuantity\s*\)\.toLocaleString\("en-IN"\)\}/, 
`COD: ₹
                  {(
                    order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.advancePaid || (order.paymentMode === "partial" ? 50 : 0)))
                  ).toLocaleString("en-IN")}`);

// Fix paid calculation inside expanded view
file = file.replace(/Paid\s*<\/p>\s*<p className="font-black text-green-600 text-sm">\s*₹\s*\{\(order\.paymentMode === "full"\s*\? order\.price \|\| 0\s*: order\.paymentMode === "partial" \|\|\s*String\(order\.status\)\.toLowerCase\(\)\.includes\("advance"\)\s*\? 50 \* effectiveQuantity\s*: 0\s*\)\.toLocaleString\("en-IN"\)\}\s*<\/p>/,
`Paid
                </p>
                <p className="font-black text-green-600 text-sm">
                  ₹
                  {(order.advancePaid !== undefined 
                     ? order.advancePaid 
                     : (order.paymentMode === "full" ? (order.price || 0) : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0))
                  ).toLocaleString("en-IN")}
                </p>`);

// Fix COD calculation inside expanded view
file = file.replace(/order\.remainingCodAmount !== undefined \? order\.remainingCodAmount : Math\.max\(0, \(\(order\.price \|\| 0\) \* effectiveQuantity\) - \(order\.advancePaid \|\| \(order\.paymentMode === "partial" \? 50 : 0\)\)\)/,
`order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))`);

// We also need to fix TOTAL AMOUNT layout. The Edit button is currently next to the price in the collapsed view. We should also add it clearly to the expanded view.
// Currently expanded view doesn't even show the Total Amount prominently. Let's add it.
const expandedItemsBlock = `<div className="col-span-2">\n              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">\n                Items\n              </p>`;

const totalAmountBlock = `<div className="col-span-2 flex justify-between items-center bg-blue-50/50 p-2 rounded border border-blue-100">
              <div>
                <p className="text-blue-800 font-bold uppercase tracking-wider text-[10px] mb-0.5">Final Total Amount</p>
                <p className="font-black text-blue-900 text-sm">₹{(order.price || 0).toLocaleString("en-IN")}</p>
              </div>
              <button
                  title="Edit Final Total"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdatePrice(order.price || 0);
                  }}
                  className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                >
                  Edit Total
                </button>
            </div>\n\n            `;

file = file.replace(expandedItemsBlock, totalAmountBlock + expandedItemsBlock);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
