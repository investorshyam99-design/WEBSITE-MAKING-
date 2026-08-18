const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const searchSection = `        {calc.paymentMode === "full" ? (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Payment
            </p>
            <p className="font-semibold text-green-600 text-sm">
              FULLY PAID
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Paid
            </p>
            <p className="font-semibold text-green-600 text-sm">
              ₹{calc.amountPaid.toLocaleString("en-IN")}
            </p>
            <div className="mt-1">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">COD Remaining</p>
              <p className="font-black text-rose-600 text-sm">
                ₹{calc.codAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}`;

const replaceSection = `        {order.productSubtotal !== undefined && (
          <>
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Product Subtotal</p>
              <p className="font-semibold text-[#1B1B1B] text-sm">₹{order.productSubtotal.toLocaleString("en-IN")}</p>
            </div>
            {order.fastDeliveryCharge > 0 && (
              <div>
                <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Fast Delivery</p>
                <p className="font-semibold text-green-600 text-sm">₹{order.fastDeliveryCharge.toLocaleString("en-IN")}</p>
              </div>
            )}
            {order.codHandlingCharge > 0 && (
              <div>
                <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">COD Charge</p>
                <p className="font-semibold text-gray-800 text-sm">₹{order.codHandlingCharge.toLocaleString("en-IN")}</p>
              </div>
            )}
          </>
        )}
        
        {calc.paymentMode === "full" ? (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Payment
            </p>
            <p className="font-semibold text-green-600 text-sm">
              FULLY PAID
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Paid
            </p>
            <p className="font-semibold text-green-600 text-sm">
              ₹{calc.amountPaid.toLocaleString("en-IN")}
            </p>
            <div className="mt-1">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">COD Remaining</p>
              <p className="font-black text-rose-600 text-sm">
                ₹{calc.codAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}`;

if (code.includes(searchSection)) {
    code = code.replace(searchSection, replaceSection);
    fs.writeFileSync('src/pages/AccountPage.tsx', code);
    console.log("Patched Account UI");
} else {
    console.log("Not found Account UI");
}
