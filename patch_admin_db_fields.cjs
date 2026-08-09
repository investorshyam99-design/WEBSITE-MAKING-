const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /const updateData: any = \{\n\s*price: finalPrice,\n\s*finalTotal: finalPrice,\n\s*\};/;
const replacement = `const updateData: any = {
          price: finalPrice,
          finalTotal: finalPrice,
          finalTotalAmount: finalPrice,
        };`;

file = file.replace(regex, replacement);

const regex2 = /updateData\.remainingCodAmount = Math\.max\(0, finalPrice - advance\);/;
const replacement2 = `updateData.remainingCodAmount = Math.max(0, finalPrice - advance);
          updateData.codAmount = Math.max(0, finalPrice - advance);
          updateData.amountPaid = advance;
          updateData.advancePaid = advance;`;

file = file.replace(regex2, replacement2);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
