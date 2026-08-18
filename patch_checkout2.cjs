const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(/const finalAmountToPay = currentMode === "full" \? total : advanceAmount;/g, 'const finalAmountToPay = currentMode === "full" ? advanceToCollect : advanceToCollect;');
code = code.replace(/const paidAmount = currentMode === "full" \? total : advanceAmount;/g, 'const paidAmount = advanceToCollect;');
code = code.replace(/alert\(\`Payment Successful!\\n✅ ₹\$\{total\} Paid Successfully\\nThank you for your order #\$\{nextOrderNumber\}\.\`\);/g, 'alert(`Payment Successful!\\n✅ ₹${advanceToCollect} Paid Successfully\\nThank you for your order #${nextOrderNumber}.`);');
code = code.replace(/alert\(\`Payment Successful!\\n✅ ₹\$\{advanceAmount\} Advance Paid Successfully\\nOrder #\$\{nextOrderNumber\} Confirmed\\nRemaining COD Amount: ₹\$\{total\}\\nPay remaining amount during delivery\.\`\);/g, 'alert(`Payment Successful!\\n✅ ₹${advanceToCollect} Advance Paid Successfully\\nOrder #${nextOrderNumber} Confirmed\\nRemaining COD Amount: ₹${codAmount}\\nPay remaining amount during delivery.`);');

// Also update the UI rendering for pricing summary
const uiSearch = `{expressDeliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-bold">
                  <span>Fast Delivery</span>
                  <span>Rs. {expressDeliveryCharge.toFixed(2)}</span>
                </div>
              )}`;

const uiReplace = `{fastDeliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-bold">
                  <span>Fast Delivery</span>
                  <span>₹{fastDeliveryCharge.toFixed(2)}</span>
                </div>
              )}
              
              {codHandlingCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-500 font-bold">
                  <span>COD Handling Charge</span>
                  <span>₹{codHandlingCharge.toFixed(2)}</span>
                </div>
              )}`;

code = code.replace(uiSearch, uiReplace);
// Note: We might need to handle total, advanceAmount, subtotal in the UI.

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
console.log("Patched other checkout values.");
