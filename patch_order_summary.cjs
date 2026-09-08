const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /\{\/\* Order Summary \*\/\}\s*<div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">[\s\S]*?\{paymentMode === "partial" && \(\s*<div className="flex justify-between text-xs font-bold text-red-600 pt-2 border-t border-gray-200">\s*<span>To pay on delivery<\/span>\s*<span>₹\{codAmount\.toFixed\(2\)\}<\/span>\s*<\/div>\s*\)\}\s*<\/div>/;

const replaceStr = `{/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Product Subtotal</span>
                <span>₹{productSubtotal.toFixed(2)}</span>
              </div>
              
              {fastShippingCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Fast Delivery</span>
                  <span>+ ₹{fastShippingCharge.toFixed(2)}</span>
                </div>
              )}
              
              {paymentMode === "partial" && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>COD Charge</span>
                  <span>+ ₹{codCharge.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total Order Value</span>
                <span className="text-sm">₹{totalOrderValue.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                <span>Amount to Pay Now</span>
                <span className="text-xl">₹{advanceToCollect.toFixed(2)}</span>
              </div>
              
              {paymentMode === "partial" && (
                <div className="flex justify-between text-xs font-bold text-red-600 pt-2 border-t border-gray-200">
                  <span>To pay on delivery</span>
                  <span>₹{codAmount.toFixed(2)}</span>
                </div>
              )}
            </div>`;

code = code.replace(regex, replaceStr);
fs.writeFileSync(path, code);
console.log("Success");
