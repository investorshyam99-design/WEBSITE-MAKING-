const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexPriceRight = /<p className="font-black text-\[#1B1B1B\] text-sm">\n\s*₹\{\(order\.price \|\| 0\)\.toLocaleString\("en-IN"\)\}\n\s*<\/p>/;
const replacePriceRight = `<p className="font-black text-[#1B1B1B] text-sm">
                  ₹{(order.finalTotalAmount ?? order.price ?? 0).toLocaleString("en-IN")}
                </p>`;
file = file.replace(regexPriceRight, replacePriceRight);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
