const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

file = file.replace(/  customization\?: string;/, `  customization?: string;
  customizationStatus?: string;
  advancePaid?: number;
  remainingCodAmount?: number;
  finalTotal?: number;`);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
