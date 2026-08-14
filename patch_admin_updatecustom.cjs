const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexOld = /const adjustedAmount = calc\.originalAmount - deductionAmount;\s*const finalTotalAmount = adjustedAmount \+ calc\.amountPaid;\s*const codAmount = adjustedAmount;\s*const updateData: any = \{\s*customizationStatus: status,\s*deductionAmount,\s*priceAdjustment: deductionAmount,\s*adjustedAmount,\s*finalTotalAmount,\s*codAmount,\s*amountPaid: calc\.amountPaid,\s*\};/;

const replacement = `const adjustedAmount = calc.originalAmount - deductionAmount;
      
      let finalTotalAmount = 0;
      let codAmount = 0;
      let amountPaid = calc.amountPaid;
      
      if (calc.paymentMode === "full") {
          finalTotalAmount = adjustedAmount;
          codAmount = 0;
          amountPaid = adjustedAmount;
      } else {
          finalTotalAmount = adjustedAmount + calc.amountPaid;
          codAmount = adjustedAmount;
      }
      
      const updateData: any = {
        customizationStatus: status,
        deductionAmount,
        priceAdjustment: deductionAmount,
        adjustedAmount,
        finalTotalAmount,
        codAmount,
        amountPaid,
      };`;

file = file.replace(regexOld, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', file);
