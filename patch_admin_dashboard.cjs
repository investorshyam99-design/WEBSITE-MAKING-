const fs = require('fs');
const path = 'src/pages/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// Display coolPrint in Admin Dashboard
code = code.replace(
  /\{order\.customization && \(\s*<p className="text-xs text-gray-500 uppercase mt-1">Name\/No: \{order\.customization\}<\/p>\s*\)\}/g,
  `{order.customization && (
                          <p className="text-xs text-gray-500 uppercase mt-1">Name/No: {order.customization}</p>
                        )}
                        {order.coolPrint?.selected && (
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                            <p className="text-xs text-gray-700 font-bold uppercase">COOL PRINT: {order.coolPrint.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">COOL PRINT CHARGE: ₹{order.coolPrint.price}</p>
                          </div>
                        )}`
);

fs.writeFileSync(path, code);
console.log("Success");
