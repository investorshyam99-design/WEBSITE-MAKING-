const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Find the block rendering the totals
const targetRegex = /<div className="flex justify-between text-sm text-gray-600">[\s\S]*?<span>COD Advance<\/span>[\s\S]*?<span>Rs\. \{advanceToCollect\.toFixed\(2\)\}<\/span>[\s\S]*?<\/div>/;

const replaceStr = `<div className="flex justify-between text-sm text-gray-600">
                  <span>COD Advance</span>
                  <span>Rs. {codAdvance.toFixed(2)}</span>
                </div>`;

code = code.replace(targetRegex, replaceStr);
fs.writeFileSync(path, code);
console.log("Success");
