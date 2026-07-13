const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');
code = code.replace(
  /<div className="flex items-center gap-2 mb-3">([\s\S]*?)<\/div>/g,
  (match, p1) => {
    if (match.includes('Rs. 1599.00') && match.includes('text-[#E83E44]')) {
      return `<div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-400 line-through font-medium">
                              Rs. 1599.00
                            </span>
                            <span className="text-sm font-bold text-[#E83E44]">
                              Rs. {product.price.toFixed(2)}
                            </span>
                          </div>`;
    }
    return match;
  }
);
fs.writeFileSync('src/components/CartModal.tsx', code);
