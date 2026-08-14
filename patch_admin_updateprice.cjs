const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexOld = /const adjustedAmount = Number\(newPrice\);\s*const deductionAmount = calc\.originalAmount - adjustedAmount;\s*const finalTotalAmount = adjustedAmount \+ calc\.amountPaid;\s*const codAmount = adjustedAmount;\s*const updateData: any = \{\s*adjustedAmount,\s*deductionAmount,\s*priceAdjustment: deductionAmount,\s*finalTotalAmount,\s*codAmount,\s*amountPaid: calc\.amountPaid,\s*\};/;

const replacement = `const adjustedAmount = Number(newPrice);
        const deductionAmount = calc.originalAmount - adjustedAmount;
        
        let finalTotalAmount = 0;
        let codAmount = 0;
        let amountPaid = calc.amountPaid;
        
        if (calc.paymentMode === "full") {
            finalTotalAmount = adjustedAmount;
            codAmount = 0;
            amountPaid = adjustedAmount; // They prepaid, so they effectively pay the new adjusted amount
        } else {
            finalTotalAmount = adjustedAmount + calc.amountPaid;
            codAmount = adjustedAmount;
        }

        const updateData: any = {
          adjustedAmount,
          deductionAmount,
          priceAdjustment: deductionAmount,
          finalTotalAmount,
          codAmount,
          amountPaid,
        };`;

file = file.replace(regexOld, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', file);
