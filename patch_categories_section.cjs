const fs = require('fs');
let file = fs.readFileSync('src/components/CategoriesSection.tsx', 'utf8');

const oldPlaceholder = `<p className="text-xs md:text-sm font-bold text-gray-500 px-1 flex items-center gap-1.5">
                    🔥 Dropping Soon — follow us to be the first to know
                  </p>`;
const newPlaceholder = `<p className="text-xs md:text-sm font-bold text-gray-500 px-1 flex items-center gap-1.5">
                    🔥 {section.title} Dropping Soon — follow us to be the first to know
                  </p>`;

file = file.replace(oldPlaceholder, newPlaceholder);
fs.writeFileSync('src/components/CategoriesSection.tsx', file);
