const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const targetTotal = `<div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Total
            </p>
            <p className="font-semibold text-[#1B1B1B]">
              ₹{(order.price || 0).toLocaleString("en-IN")}
            </p>
          </div>`;

const replaceTotal = `<div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Total
            </p>
            <p className="font-semibold text-[#1B1B1B]">
              ₹{(order.price || 0).toLocaleString("en-IN")}
            </p>
          </div>
          {order.customization && (
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                Customization
              </p>
              <p className="font-semibold text-[#1B1B1B] text-sm">
                {order.customization} {order.customizationStatus ? \`(\${order.customizationStatus})\` : ""}
              </p>
            </div>
          )}`;

const targetStatus = `<div className="text-left md:text-right">
          <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1">
            Status
          </p>
          <span className={\`text-xs font-black uppercase tracking-widest px-3 py-1 rounded \${order.status?.toLowerCase().includes('pending') ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}\`}>
            {order.status || "Pending"}
          </span>
        </div>`;

const replaceStatus = `<div className="text-left md:text-right">
          <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1">
            Status
          </p>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className={\`text-xs font-black uppercase tracking-widest px-3 py-1 rounded \${order.status?.toLowerCase().includes('pending') ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}\`}>
              {order.status || "Pending"}
            </span>
            {((order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") || String(order.status).toLowerCase() === "fampay") && order.paymentMode !== "full") && (
               <div className="mt-1 text-right">
                 <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">To Collect (COD)</p>
                 <p className="font-black text-rose-600 text-sm">₹{(order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))).toLocaleString("en-IN")}</p>
               </div>
            )}
          </div>
        </div>`;

file = file.replace(targetTotal, replaceTotal);
file = file.replace(targetStatus, replaceStatus);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
