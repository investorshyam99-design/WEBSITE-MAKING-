const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /<div className="flex justify-between text-sm text-gray-600">\s*<span>COD Advance<\/span>\s*<span>Rs\. \{codAdvance\.toFixed\(2\)\}<\/span>\s*<\/div>\s*\)\}/;

const replaceStr = `{paymentMode === "partial" && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>COD Advance</span>
                  <span>Rs. {codAdvance.toFixed(2)}</span>
                </div>
              )}`;

code = code.replace(regex, replaceStr);
fs.writeFileSync(path, code);
console.log("Success");
