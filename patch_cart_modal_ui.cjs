const fs = require('fs');
const path = 'src/components/CartModal.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /\{item\.customization && \(\s*<div className="text-\[10px\] text-gray-500 mt-1 uppercase">\s*Name: \{item\.customization\.name\}\s*\{item\.customization\.number && ` \| No: \$\{item\.customization\.number\}`\}\s*<\/div>\s*\)\}/g,
  `{item.customization && (
                            <div className="text-[10px] text-gray-500 mt-1 uppercase">
                              Name: {item.customization.name}
                              {item.customization.number && \` | No: \${item.customization.number}\`}
                            </div>
                          )}
                          {item.coolPrint?.selected && (
                            <div className="text-[10px] text-gray-500 mt-1 uppercase">
                              Cool Print: {item.coolPrint.name} (+₹{item.coolPrint.price})
                            </div>
                          )}`
);

fs.writeFileSync(path, code);
console.log("Success");
