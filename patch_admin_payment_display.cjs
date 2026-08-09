const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /<div className="grid grid-cols-2 gap-4 text-xs">[\s\S]*?<div className="col-span-2">[\s\S]*?<p className="text-gray-400 font-bold uppercase tracking-wider mb-1">\n\s*Items\n\s*<\/p>/;

const replacement = `<div className="grid grid-cols-2 gap-4 text-xs">
            <div className="col-span-2 flex justify-between items-center bg-blue-50/50 p-2 rounded border border-blue-100">
              <div>
                <p className="text-blue-800 font-bold uppercase tracking-wider text-[10px] mb-0.5">TOTAL ORDER VALUE</p>
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
            </div>
            
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">CUSTOMIZATION</p>
              <p className="font-semibold text-gray-800 uppercase text-[10px]">
                 {order.customizationStatus === "NO" ? "NO" : "YES"}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">CUSTOMIZATION AMOUNT</p>
              <p className="font-black text-gray-800 text-sm">₹{order.customizationStatus === "NO" ? "0" : "199"}</p>
            </div>
            
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">PAID</p>
              <p className="font-black text-green-600 text-sm">
                ₹
                {(order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined 
                    ? order.advancePaid 
                    : (order.paymentMode === "full" ? (order.price || 0) : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0)))
                ).toLocaleString("en-IN")}
              </p>
            </div>

            {order.paymentMode !== "full" && (
              <div className="text-right">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">TO COLLECT (COD)</p>
                <p className="font-black text-red-600 text-sm">
                  ₹
                  {(
                    order.codAmount !== undefined ? order.codAmount : (order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))))
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            )}

            <div className="col-span-2">
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                Items
              </p>`;

file = file.replace(regex, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
