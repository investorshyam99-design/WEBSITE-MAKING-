const fs = require('fs');
const content = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

// I will just use a regex to see tag balance
let divCount = 0;
let mainCount = 0;
let lines = content.split('\n');
let mainStart = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<main ')) mainStart = i;
  if (mainStart !== -1 && i >= mainStart) {
     let openDivs = (lines[i].match(/<div(\s|>)/g) || []).length;
     let closeDivs = (lines[i].match(/<\/div>/g) || []).length;
     divCount += openDivs - closeDivs;
     if (lines[i].includes('</main>')) {
        console.log(`At main close (line ${i+1}), divCount is:`, divCount);
     }
  }
}
