const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const regex = /<span className="text-yellow-400 text-xs">★<\/span>\s*<span className="text-xs font-bold text-gray-700">\s*4.8\s*<\/span>\s*<span className="text-\[10px\] text-gray-400">\s*\(\{Math.floor\(Math.random\(\) \* 200 \+ 50\)\} reviews\)\s*<\/span>/;
const replacement = `<span className="text-yellow-400 text-xs">★</span>
                            <span className="text-xs font-bold text-gray-700">
                              {getProductReviewsInfo(product).avgRating}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              ({getProductReviewsInfo(product).reviewCount} reviews)
                            </span>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/CartModal.tsx', code);
