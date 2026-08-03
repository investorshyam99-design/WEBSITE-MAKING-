const fs = require('fs');
const content = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const customizationStart = content.indexOf('{/* Customization Section */}');
const customizationEnd = content.indexOf('{/* Size Selection */}');
const sizeSelectionStart = content.indexOf('{/* Size Selection */}');
const sizeSelectionEnd = content.indexOf('{/* Low Stock Badge (Task 2B) */}');

const beforeCustomization = content.slice(0, customizationStart);
const customizationSection = content.slice(customizationStart, sizeSelectionStart);
const sizeSelectionSection = content.slice(sizeSelectionStart, sizeSelectionEnd);
const afterSizeSelection = content.slice(sizeSelectionEnd);

// Replace grid-cols-4 with grid-cols-3 and remove secure payment
let newContent = beforeCustomization + '\n            <div className="space-y-8 mb-10 border-t border-gray-100 pt-8">\n              ' + sizeSelectionSection + '\n            </div>\n\n            ' + customizationSection.replace('<div className="space-y-8 mb-10 border-t border-gray-100 pt-8">\n              ', '') + afterSizeSelection;

newContent = newContent.replace('<div className="grid grid-cols-4 gap-2 mt-8 pt-6 border-t border-gray-100 pb-2">', '<div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-100 pb-2">');
newContent = newContent.replace(`                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <Lock className="w-6 h-6 text-gray-700 stroke-[1.5]" />
                  <span className="text-xs font-bold text-gray-700 tracking-wide">Secure payment</span>
                </div>
`, '');

fs.writeFileSync('src/pages/ProductPage.tsx', newContent);
