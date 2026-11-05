const fs = require('fs');
const path = 'src/pages/ProductPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Insert finalPrice calculation
const priceCalc = `
  const isCoolPrintEnabledRaw = isCoolPrintEnabled;
  const isCustomizedRaw = isCustomized;
  const finalPrice = product.price + (isCustomizedRaw ? 199 : 0) + (isCoolPrintEnabledRaw ? 299 : 0);
`;

code = code.replace(/const \[isZoomed, setIsZoomed\] = useState\(false\);/, 'const [isZoomed, setIsZoomed] = useState(false);\n' + priceCalc);

// Add the price breakdown block below delivery text
const breakdownBlock = `
                </div>
                {(isCustomized || isCoolPrintEnabled) && (
                  <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 max-w-xs">
                    <div className="flex justify-between mb-1">
                      <span>Base Price</span>
                      <span className="font-bold">₹{product.price}</span>
                    </div>
                    {isCustomized && (
                      <div className="flex justify-between mb-1 text-green-700">
                        <span>Customization</span>
                        <span className="font-bold">+₹199</span>
                      </div>
                    )}
                    {isCoolPrintEnabled && (
                      <div className="flex justify-between mb-1 text-blue-700">
                        <span>Cool Print</span>
                        <span className="font-bold">+₹299</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-1 mt-1 font-black text-gray-900">
                      <span>Total</span>
                      <span>₹{finalPrice}</span>
                    </div>
                  </div>
                )}
`;

// Replace desktop price
code = code.replace(
  /<span className="text-3xl md:text-4xl font-black text-\[#1E2A44\]">\s*₹\{product\.price\.toLocaleString\("en-IN"\)\}\s*<\/span>/,
  '<span className="text-3xl md:text-4xl font-black text-[#1E2A44]">\n                  ₹{finalPrice.toLocaleString("en-IN")}\n                </span>'
);

code = code.replace(
  /<span className="text-xl md:text-2xl font-bold text-gray-400 line-through mb-1">\s*₹\{\(product\.price \+ 600\)\.toLocaleString\("en-IN"\)\}\s*<\/span>/,
  '<span className="text-xl md:text-2xl font-bold text-gray-400 line-through mb-1">\n                  ₹{(finalPrice + 600).toLocaleString("en-IN")}\n                </span>'
);

// Replace mobile price
code = code.replace(
  /<span className="text-3xl font-black text-\[#1E2A44\]">\s*₹\{product\.price\.toLocaleString\("en-IN"\)\}\s*<\/span>/,
  '<span className="text-3xl font-black text-[#1E2A44]">\n                    ₹{finalPrice.toLocaleString("en-IN")}\n                  </span>'
);

code = code.replace(
  /<span className="text-xl font-bold text-gray-400 line-through mb-0.5">\s*₹\{\(product\.price \+ 600\)\.toLocaleString\("en-IN"\)\}\s*<\/span>/,
  '<span className="text-xl font-bold text-gray-400 line-through mb-0.5">\n                    ₹{(finalPrice + 600).toLocaleString("en-IN")}\n                  </span>'
);

// Insert breakdown for mobile
code = code.replace(
  /<div className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-2">\s*<Truck className="w-3\.5 h-3\.5" \/>\s*Estimated Delivery: 4-7 Days\s*<\/div>/,
  '<div className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-2">\n                  <Truck className="w-3.5 h-3.5" />\n                  Estimated Delivery: 4-7 Days\n' + breakdownBlock
);

// Insert breakdown for desktop
code = code.replace(
  /<div className="flex items-center gap-1.5 text-xs font-bold text-green-600">\s*<Truck className="w-3\.5 h-3\.5" \/>\s*Estimated Delivery: 4-7 Days\s*<\/div>/,
  '<div className="flex items-center gap-1.5 text-xs font-bold text-green-600">\n                <Truck className="w-3.5 h-3.5" />\n                Estimated Delivery: 4-7 Days\n' + breakdownBlock
);

// Update Add to Cart Sticky mobile button price
code = code.replace(
  /<span className="text-xl font-black">₹\{product\.price\}<\/span>/,
  '<span className="text-xl font-black">₹{finalPrice}</span>'
);

fs.writeFileSync(path, code);
console.log("Success");
