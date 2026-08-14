const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const regexOld = /<div>\s*<p className="text-xs uppercase font-bold text-gray-500 tracking-wider">\s*Paid\s*<\/p>\s*<p className="font-semibold text-green-600 text-sm">\s*₹\{calc\.amountPaid\.toLocaleString\("en-IN"\)\}\s*<\/p>\s*\{order\.paymentMode !== "full" && \(\s*<div className="mt-1">\s*<p className="text-\[10px\] uppercase font-bold text-gray-500 tracking-wider">COD Remaining<\/p>\s*<p className="font-black text-rose-600 text-sm">\s*₹\{calc\.codAmount\.toLocaleString\("en-IN"\)\}\s*<\/p>\s*<\/div>\s*\)\}\s*<\/div>/;

const replacement = `{calc.paymentMode === "full" ? (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Payment
            </p>
            <p className="font-semibold text-green-600 text-sm">
              FULLY PAID
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Paid
            </p>
            <p className="font-semibold text-green-600 text-sm">
              ₹{calc.amountPaid.toLocaleString("en-IN")}
            </p>
            <div className="mt-1">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">COD Remaining</p>
              <p className="font-black text-rose-600 text-sm">
                ₹{calc.codAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}`;

file = file.replace(regexOld, replacement);
fs.writeFileSync('src/pages/AccountPage.tsx', file);
