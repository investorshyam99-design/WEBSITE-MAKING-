const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `COD: ₹
                  {(
                    (order.price || 0) +
                    50 * effectiveQuantity -
                    50 * effectiveQuantity
                  ).toLocaleString("en-IN")}`;

const replacement = `COD: ₹
                  {(
                    order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))
                  ).toLocaleString("en-IN")}`;

if(file.includes(target)) {
   file = file.replace(target, replacement);
   fs.writeFileSync('src/components/AdminDashboard.tsx', file);
   console.log("Collapsed COD replaced");
} else {
   console.log("Target not found");
}
