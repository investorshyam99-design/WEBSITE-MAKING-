const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /COD: ₹\s*\{\(\s*\(\(order\.price \|\| 0\) \+\s*50 \* effectiveQuantity -\s*50 \* effectiveQuantity\s*\)\.toLocaleString\("en-IN"\)\}/;
if(file.match(regex)) {
   file = file.replace(regex, `COD: ₹
                  {(
                    order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))
                  ).toLocaleString("en-IN")}`);
   fs.writeFileSync('src/components/AdminDashboard.tsx', file);
   console.log("Collapsed COD replaced");
} else {
   console.log("Regex not matched");
}
