const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const regex = /<p className="text-xs uppercase font-bold text-gray-500 tracking-wider">\n\s*Customization\n\s*<\/p>\n\s*<p className="font-semibold text-\[#1B1B1B\] text-sm">\n\s*₹199\n\s*<\/p>/;

const replacement = `<p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                Customization Amount
              </p>
              <p className="font-semibold text-[#1B1B1B] text-sm">
                ₹199
              </p>`;

file = file.replace(regex, replacement);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
