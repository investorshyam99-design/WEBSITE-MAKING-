const fs = require('fs');
let lines = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8').split('\n');
let mainStart = lines.findIndex(l => l.includes('<main '));
let mainEnd = lines.findIndex(l => l.includes('</main>'));

let openDivs = 0;
for (let i = mainStart; i < mainEnd; i++) {
  openDivs += (lines[i].match(/<div(\s|>)/g) || []).length;
  openDivs -= (lines[i].match(/<\/div>/g) || []).length;
}

console.log('Balance before main close:', openDivs);

// We need openDivs to be 0 exactly before `</main>`
if (openDivs > 0) {
  // add missing closing divs
  let padding = '        ';
  for (let i = 0; i < openDivs; i++) {
    lines.splice(mainEnd, 0, padding + '</div>');
  }
} else if (openDivs < 0) {
  // remove extra closing divs before mainEnd
  let removed = 0;
  for (let i = mainEnd - 1; i >= mainStart && removed < Math.abs(openDivs); i--) {
    if (lines[i].includes('</div>')) {
      lines.splice(i, 1);
      removed++;
    }
  }
}

fs.writeFileSync('src/pages/ProductPage.tsx', lines.join('\n'));
