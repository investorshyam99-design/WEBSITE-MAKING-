const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const target = `<TrendingSalesIndicator productId={product.id} />`;

const replacement = `            {/* Shop by Variant */}
            {availableColors.length > 0 && (
              <div className="mb-6 lg:mb-8 pt-6 lg:pt-0 border-t border-gray-100 lg:border-t-0">
                <h3 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest mb-4">
                  Shop by variant : <span className="text-gray-500">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-4">
                  {availableColors.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setSelectedColor(c.color)}
                      className={cn(
                        "flex flex-col items-center gap-2 transition-all group",
                        selectedColor === c.color ? "opacity-100 scale-105" : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-full overflow-hidden border-2 p-0.5",
                        selectedColor === c.color ? "border-[#1B1B1B]" : "border-transparent"
                      )}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                           {c.image ? (
                             <img src={c.image} alt={c.color} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-gray-200" />
                           )}
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest text-center max-w-[72px] truncate",
                        selectedColor === c.color ? "text-[#1B1B1B]" : "text-gray-500"
                      )}>
                        {c.color}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <TrendingSalesIndicator productId={product.id} />`;

if (code.includes('Shop by variant :')) {
    console.log("Already added");
} else {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/ProductPage.tsx', code);
    console.log("Added Shop by Variant");
}
