const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const regex = /              <p className="text-sm leading-relaxed mb-6">\s+Gen Z oversized back-print quote t-shirts and statement streetwear for Indian youth\. Wear the banter\.\s+<\/p>\s+<\/svg>\s+<\/a>\s+<\/div>\s+<\/div>/;

code = code.replace(regex, `              <p className="text-sm leading-relaxed mb-6">\n                Gen Z oversized back-print quote t-shirts and statement streetwear for Indian youth. Wear the banter.\n              </p>\n            </div>`);

const regex2 = /              <\/ul>\s+<\/div>\s+<\/div>\s+<\/div>/;
code = code.replace(regex2, `              </ul>\n            </div>\n          </div>`);

fs.writeFileSync('src/components/Footer.tsx', code);
