const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /<div className="col-span-2 flex justify-between items-center bg-gray-50 px-3 py-2 rounded border border-gray-100">[\s\S]*?<div className="col-span-2">/;

const replace = `<div className="col-span-2 flex flex-col gap-2 bg-gray-50 p-3 rounded border border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  TOTAL ORDER VALUE
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-black text-gray-800 text-sm">
                    ₹{(order.finalTotalAmount ?? order.price ?? 0).toLocaleString("en-IN")}
                  </p>
                  <button
                    title="Edit Total"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePrice(order.adjustedAmount ?? order.codAmount ?? order.remainingCodAmount ?? Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))));
                    }}
                    className="text-gray-400 hover:text-[#1E2A44] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  PAID / ADVANCE
                </p>
                <p className="font-black text-green-600 text-sm">
                  ₹{(order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "full" ? (order.price || 0) : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0)))).toLocaleString("en-IN")}
                </p>
              </div>
              
              {order.paymentMode !== "full" && (
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    TO COLLECT (COD)
                  </p>
                  <p className="font-black text-red-600 text-sm">
                    ₹{(order.codAmount !== undefined ? order.codAmount : (order.adjustedAmount !== undefined ? order.adjustedAmount : (order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0))))))).toLocaleString("en-IN")}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  PRICE DEDUCTION
                </p>
                <p className="font-black text-gray-800 text-sm">
                  ₹{order.deductionAmount || order.priceAdjustment || (order.customizationStatus === "NO" ? "199" : "0")}
                </p>
              </div>
            </div>
            
            <div className="col-span-2">`;

file = file.replace(regex, replace);

// Remove the standalone Final Total Amount blue box
const regexBlueBox = /<div className="col-span-2 flex justify-between items-center bg-blue-50\/50 p-2 rounded border border-blue-100">[\s\S]*?<\/div>/;
file = file.replace(regexBlueBox, '');

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
