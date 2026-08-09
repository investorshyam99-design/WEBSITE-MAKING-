const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const regex = /<div className="flex gap-6">[\s\S]*?<div className="text-left md:text-right">/;

const replacement = `<div className="flex gap-4 md:gap-6 flex-wrap">
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Order Date
            </p>
            <p className="font-semibold text-[#1B1B1B]">{orderDate}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Order #
            </p>
            <p className="font-semibold text-[#1B1B1B]">{order.orderNumber ? \`#\${order.orderNumber}\` : \`#\${order.id}\`}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Order Total
            </p>
            <p className="font-semibold text-[#1B1B1B]">
              ₹{(order.price || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Customization
            </p>
            <p className="font-semibold text-[#1B1B1B] text-sm">
              {order.customizationStatus === "YES" ? "YES" : "NO"}
            </p>
          </div>
          {order.customizationStatus === "YES" && (
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                Customization
              </p>
              <p className="font-semibold text-[#1B1B1B] text-sm">
                ₹199
              </p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Paid
            </p>
            <p className="font-semibold text-green-600 text-sm">
              ₹{(order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : ((order.paymentMode === "full" ? (order.price || 0) : ((order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance")) ? 50 * effectiveQuantity : 0))))) || 0}
            </p>
          </div>
        </div>
        <div className="text-left md:text-right">`;

file = file.replace(regex, replacement);

const regexCod = /\{\(\(order\.paymentMode === "partial" \|\| String\(order\.status\)\.toLowerCase\(\)\.includes\("advance"\) \|\| String\(order\.status\)\.toLowerCase\(\) === "fampay"\) && order\.paymentMode !== "full"\) && \(\n\s*<div className="mt-1 text-right">\n\s*<p className="text-\[10px\] uppercase font-bold text-gray-500 tracking-wider">To Collect \(COD\)<\/p>\n\s*<p className="font-black text-rose-600 text-sm">₹\{\(order\.remainingCodAmount !== undefined \? order\.remainingCodAmount : Math\.max\(0, \(order\.price \|\| 0\) - \(order\.advancePaid !== undefined \? order\.advancePaid : \(\(order\.paymentMode === "partial" \|\| String\(order\.status\)\.toLowerCase\(\)\.includes\("advance"\)\) \? 50 \* effectiveQuantity : 0\)\)\)\)\.toLocaleString\("en-IN"\)\}<\/p>\n\s*<\/div>\n\s*\)\}/;

const replacementCod = `{order.paymentMode !== "full" && (
               <div className="mt-1 text-right">
                 <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">COD Remaining</p>
                 <p className="font-black text-rose-600 text-sm">₹{(
                   order.codAmount !== undefined ? order.codAmount : (order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))))
                 ).toLocaleString("en-IN")}</p>
               </div>
            )}`;

file = file.replace(regexCod, replacementCod);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
