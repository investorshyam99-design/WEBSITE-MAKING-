const fs = require('fs');
const path = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

const coolPrintCode = `
            {order.coolPrint?.selected && (
              <div className="col-span-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Cool Print
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-gray-800 text-xs">
                    {order.coolPrint.name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold">
                    CHARGE: ₹{order.coolPrint.price}
                  </p>
                </div>
              </div>
            )}
`;

code = code.replace(
  /\{order\.customization && \(\s*<div className="flex items-center gap-2 mt-1">[\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>/g,
  (match) => match + coolPrintCode
);

fs.writeFileSync(path, code);
console.log("Success");
