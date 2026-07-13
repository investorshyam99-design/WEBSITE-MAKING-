const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const target = '            {/* Size Selection */}';
const replacement = `            <div className="space-y-8 mb-10 border-t border-gray-100 pt-8">
              {/* Size Selection */}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
