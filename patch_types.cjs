const fs = require('fs');

const props = `  amountPaid?: number;
  originalAmount?: number;
  deductionAmount?: number;
  finalTotalAmount?: number;
  adjustedAmount?: number;
  codAmount?: number;
  priceAdjustment?: number;`;

function patchFile(filename) {
    let file = fs.readFileSync(filename, 'utf8');
    const regex = /interface Order \{[\s\S]*?\n\}/;
    file = file.replace(regex, (match) => {
        return match.replace(/\}$/, props + '\n}');
    });
    fs.writeFileSync(filename, file);
}

patchFile('src/components/AdminDashboard.tsx');
patchFile('src/pages/AccountPage.tsx');

