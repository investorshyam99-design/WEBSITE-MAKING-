const fs = require('fs');
let file = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

const regexRev = /const basePrice = getOrderPrice\(order\);\n\s*let rev = 0;\n\s*if \(order\.paymentMode === 'full'\) \{\n\s*rev = basePrice;\n\s*\} else \{\n\s*const advance = 50 \* eq;\n\s*const codAmount = basePrice \+ \(50 \* eq\) - advance;\n\s*rev = advance \+ codAmount;\n\s*\}/;

const replaceRev = `const basePrice = order.finalTotalAmount ?? order.price ?? order.finalTotal ?? getOrderPrice(order);
          let rev = basePrice;
          
          if (order.paymentMode === 'partial' || String(order.status).toLowerCase().includes('advance') || String(order.status).toLowerCase() === 'fampay') {
             const advance = order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : 50 * eq);
             const codAmount = order.codAmount !== undefined ? order.codAmount : (order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, basePrice - advance));
             rev = advance + codAmount;
          } else if (order.paymentMode === 'full') {
             rev = basePrice;
          }`;

file = file.replace(regexRev, replaceRev);

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', file);
