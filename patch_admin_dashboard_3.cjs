const fs = require('fs');
const path = 'src/components/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

const customizationBlock = `
            {order.customization && (
              <div className="col-span-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Customization
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-gray-800">
                    {order.customization}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Status:</span>
                    <select 
                      className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 border border-gray-200 outline-none cursor-pointer"
                      value={order.customizationStatus || "YES"}
                      onChange={(e) => onUpdateCustomizationStatus(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
`;

code = code.replace(
  /<div className="col-span-2">\s*<p className="text-gray-400 font-bold uppercase tracking-wider mb-1">\s*Customization\s*<\/p>\s*<div className="flex flex-col gap-1">\s*<p className="font-semibold text-gray-800">\s*\{order\.customization \|\| "None"\}\s*<\/p>\s*\{order\.customization && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>/g,
  customizationBlock
);

fs.writeFileSync(path, code);
console.log("Success");
