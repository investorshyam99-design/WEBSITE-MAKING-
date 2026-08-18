const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const searchGrid = `<div className="col-span-2 flex flex-col gap-2 bg-gray-50 p-3 rounded border border-gray-100">`;
const replaceGrid = `<div className="col-span-2 flex flex-col gap-2 bg-gray-50 p-3 rounded border border-gray-100">

              {/* Breakdown Fields */}
              {order.productSubtotal !== undefined && (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Product Subtotal</p>
                    <p className="font-semibold text-gray-800 text-sm">₹{order.productSubtotal.toLocaleString("en-IN")}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Delivery Type</p>
                    <p className="font-semibold text-gray-800 text-sm">{order.deliveryType || "NORMAL"}</p>
                  </div>

                  {order.fastDeliveryCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Fast Delivery Charge</p>
                      <p className="font-semibold text-gray-800 text-sm">₹{order.fastDeliveryCharge.toLocaleString("en-IN")}</p>
                    </div>
                  )}

                  {order.codHandlingCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">COD Handling Charge</p>
                      <p className="font-semibold text-gray-800 text-sm">₹{order.codHandlingCharge.toLocaleString("en-IN")}</p>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 my-1"></div>
                </>
              )}
`;

if(code.includes(searchGrid)) {
  code = code.replace(searchGrid, replaceGrid);
  fs.writeFileSync('src/components/AdminDashboard.tsx', code);
  console.log("Patched Admin UI");
} else {
  console.log("Not found Admin UI grid");
}
