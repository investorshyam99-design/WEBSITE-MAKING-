const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const replacement = `          </div>
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Order Total
            </p>
            <p className="font-semibold text-[#1B1B1B]">
              ₹{calc.finalTotalAmount.toLocaleString("en-IN")}
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
                Customization Amount
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
              ₹{calc.amountPaid.toLocaleString("en-IN")}
            </p>
            {order.paymentMode !== "full" && (
               <div className="mt-1">
                 <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">COD Remaining</p>
                 <p className="font-black text-rose-600 text-sm">
                   ₹{calc.codAmount.toLocaleString("en-IN")}
                 </p>
               </div>
            )}
          </div>
        </div>
      </div>`;

// We'll just replace the lines 433 to 470 exactly!
const lines = file.split('\n');
const before = lines.slice(0, 432).join('\n');
const after = lines.slice(470).join('\n');
fs.writeFileSync('src/pages/AccountPage.tsx', before + '\n' + replacement + '\n' + after);
