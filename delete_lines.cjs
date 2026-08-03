const fs = require('fs');
let lines = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8').split('\n');

// 1. the extra div I added at 680
// 2. the extra div I added around 764
let targetDivLine = -1;
let closingDivLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('border-t border-gray-100 pt-8') && lines[i+1] && lines[i+1].includes('Size Selection')) {
    targetDivLine = i;
    break;
  }
}

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '</div>' && lines[i+2] && lines[i+2].includes('Customization Section')) {
    closingDivLine = i;
    break;
  }
}

console.log(targetDivLine, closingDivLine);

if (targetDivLine !== -1 && closingDivLine !== -1) {
  lines.splice(closingDivLine, 1);
  lines.splice(targetDivLine, 1);
}

fs.writeFileSync('src/pages/ProductPage.tsx', lines.join('\n'));
