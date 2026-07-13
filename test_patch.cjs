const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const sizeTarget = `                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                        Select Size
                      </h3>
                    </div>`;
console.log(code.includes(sizeTarget));

const shopTarget = `<div className="space-y-8 mb-10 border-t border-gray-100 pt-8">
              {/* Size Selection */}
              {product.variants &&`;
console.log(code.includes(shopTarget));
