const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const shopStart = '{/* Shop by Colour */}';
const shopEnd = '            {/* Size Selection */}';

const startIndex = code.indexOf(shopStart);
const endIndex = code.indexOf(shopEnd);

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
    fs.writeFileSync('src/pages/ProductPage.tsx', code);
    console.log("Removed Shop by Colour section.");
} else {
    console.log("Could not find section.");
}
