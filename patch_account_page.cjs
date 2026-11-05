const fs = require('fs');
const path = 'src/pages/AccountPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace the customization block
const newBlock = `
          {order.customization && (
            <div className="col-span-1 md:col-span-2">
              <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                Customization
              </p>
              <p className="font-semibold text-[#1B1B1B] text-sm">
                Name/No: {order.customization}
              </p>
              <p className="text-xs text-gray-500">₹199</p>
            </div>
          )}
          {order.coolPrint?.selected && (
            <div className="col-span-1 md:col-span-2">
              <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                Cool Print
              </p>
              <p className="font-semibold text-[#1B1B1B] text-sm">
                {order.coolPrint.name}
              </p>
              <p className="text-xs text-gray-500">₹{order.coolPrint.price}</p>
            </div>
          )}
`;

code = code.replace(
  /<div>\s*<p className="text-xs uppercase font-bold text-gray-500 tracking-wider">\s*Customization\s*<\/p>\s*<p className="font-semibold text-\[#1B1B1B\] text-sm">\s*\{order\.customizationStatus === "YES" \? "YES" : "NO"\}\s*<\/p>\s*<\/div>\s*\{order\.customizationStatus === "YES" && \([\s\S]*?<\/div>\s*\)\}/g,
  newBlock
);

code = code.replace(
  /customization\?: string;/g,
  'customization?: string;\n  coolPrint?: { selected: boolean; name: string; price: number };'
);

fs.writeFileSync(path, code);
console.log("Success");
