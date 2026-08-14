const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexOld = /<div className="flex justify-between items-center">\s*<p className="text-gray-400 font-bold uppercase tracking-wider mb-0\.5">\s*PAID \/ ADVANCE\s*<\/p>\s*<p className="font-black text-green-600 text-sm">\s*₹\{calc\.amountPaid\.toLocaleString\("en-IN"\)\}\s*<\/p>\s*<\/div>\s*\{order\.paymentMode !== "full" && \(\s*<div className="flex justify-between items-center">\s*<p className="text-gray-400 font-bold uppercase tracking-wider mb-0\.5">\s*TO COLLECT \(COD\)\s*<\/p>\s*<p className="font-black text-red-600 text-sm">\s*₹\{calc\.codAmount\.toLocaleString\("en-IN"\)\}\s*<\/p>\s*<\/div>\s*\)\}/;

const replacement = `{calc.paymentMode === "full" ? (
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    PAYMENT
                  </p>
                  <p className="font-black text-green-600 text-sm">
                    FULLY PAID (₹{calc.amountPaid.toLocaleString("en-IN")})
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                      PAID / ADVANCE
                    </p>
                    <p className="font-black text-green-600 text-sm">
                      ₹{calc.amountPaid.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                      TO COLLECT (COD)
                    </p>
                    <p className="font-black text-red-600 text-sm">
                      ₹{calc.codAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </>
              )}`;

file = file.replace(regexOld, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', file);
