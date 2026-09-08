const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /<div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-\[10px\] font-bold uppercase rounded">\s*Free Delivery\s*<\/div>/g;

const replaceStr = `<div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">
                    {fastShippingCharge > 0 ? "+₹50 Fast Delivery" : "Free Delivery"}
                  </div>`;

code = code.replace(regex, replaceStr);
fs.writeFileSync(path, code);
console.log("Success");
