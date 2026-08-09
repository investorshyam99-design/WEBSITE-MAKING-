const fs = require('fs');
let file = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

const regexRevenue = /const basePrice = o\.price \|\| o\.finalTotal \|\| getOrderPrice\(o\);\n\s*let revenue = 0;\n\n\s*if \(o\.paymentMode === 'full'\) \{\n\s*revenue = basePrice;\n\s*\} else if \(o\.paymentMode === 'partial' \|\| String\(o\.status\)\.toLowerCase\(\)\.includes\('advance'\) \|\| String\(o\.status\)\.toLowerCase\(\) === 'fampay'\) \{\n\s*const advanceReceived = 50 \* effectiveQty;\n\s*const codAmount = o\.remainingCodAmount !== undefined \? o\.remainingCodAmount : Math\.max\(0, basePrice - advanceReceived\);\n\s*revenue = advanceReceived \+ codAmount;\n\s*\} else \{\n\s*revenue = basePrice;\n\s*\}/;

const replaceRevenue = `const basePrice = o.finalTotalAmount ?? o.price ?? o.finalTotal ?? getOrderPrice(o);
      let revenue = basePrice;

      if (o.paymentMode === 'partial' || String(o.status).toLowerCase().includes('advance') || String(o.status).toLowerCase() === 'fampay') {
        const advanceReceived = o.amountPaid !== undefined ? o.amountPaid : (o.advancePaid !== undefined ? o.advancePaid : 50 * effectiveQty);
        const codAmount = o.codAmount !== undefined ? o.codAmount : (o.remainingCodAmount !== undefined ? o.remainingCodAmount : Math.max(0, basePrice - advanceReceived));
        revenue = advanceReceived + codAmount;
      } else if (o.paymentMode === 'full') {
         revenue = basePrice;
      }`;

file = file.replace(regexRevenue, replaceRevenue);

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', file);
