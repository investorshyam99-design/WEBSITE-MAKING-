const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const regexOrderTotal = /<p className="text-xs uppercase font-bold text-gray-500 tracking-wider">\n\s*Order Total\n\s*<\/p>\n\s*<p className="font-semibold text-\[#1B1B1B\]">\n\s*₹\{\(order\.price \|\| 0\)\.toLocaleString\("en-IN"\)\}\n\s*<\/p>/;
const replaceOrderTotal = `<p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Order Total
            </p>
            <p className="font-semibold text-[#1B1B1B]">
              ₹{(order.finalTotalAmount ?? order.price ?? 0).toLocaleString("en-IN")}
            </p>`;
file = file.replace(regexOrderTotal, replaceOrderTotal);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
