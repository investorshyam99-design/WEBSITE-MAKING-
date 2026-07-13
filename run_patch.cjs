const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

// 1. Imports
code = code.replace(
  'import { useParams, Link, useNavigate } from "react-router-dom";',
  'import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";\nimport { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";'
);

// 2. hooks
code = code.replace(
  '  const { addToCart, setIsCartOpen, isCartOpen } = useShop();',
  `  const { addToCart, setIsCartOpen, isCartOpen } = useShop();\n  const [searchParams, setSearchParams] = useSearchParams();\n  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);`
);

// 3. state target
code = code.replace(
  '  const [selectedColor, setSelectedColor] = useState<string>("");',
  `  const initialColor = searchParams.get("color") || "";\n  const [selectedColor, setSelectedColor] = useState<string>(initialColor);\n\n  useEffect(() => {\n    if (selectedColor) {\n      setSearchParams({ color: selectedColor }, { replace: true });\n    } else {\n      setSearchParams({}, { replace: true });\n    }\n  }, [selectedColor, setSearchParams]);\n\n  useEffect(() => {\n    if (product && selectedColor) {\n      const colorVariant = product.variants?.find(v => v.color === selectedColor && v.image);\n      if (colorVariant && colorVariant.image) {\n        setActiveImage(colorVariant.image);\n      }\n    }\n  }, [selectedColor, product]);`
);

// 4. availableColors
code = code.replace(
  '  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);',
  `  const availableColors = useMemo(() => {\n    if (!product?.variants) return [];\n    const colorsMap = new Map<string, string | undefined>();\n    product.variants.forEach(v => {\n      if (v.color && !colorsMap.has(v.color)) {\n        colorsMap.set(v.color, v.image);\n      }\n    });\n    return Array.from(colorsMap.entries()).map(([color, image]) => ({ color, image }));\n  }, [product]);\n\n  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);`
);

// 5. Size Guide Button and Modal
const sizeTarget = `                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                        Select Size
                      </h3>
                    </div>`;
                    
const sizeReplacement = sizeTarget + `
                    <button 
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-[#1B1B1B] py-3.5 rounded-xl mb-6 font-black tracking-widest text-sm transition-colors border border-gray-200 uppercase active:scale-[0.99]"
                    >
                      <span className="text-lg">📏</span> View Size Guide
                    </button>`;

code = code.replace(sizeTarget, sizeReplacement);

// 6. Shop by Colour
const shopTarget = `<div className="space-y-8 mb-10 border-t border-gray-100 pt-8">
              {/* Size Selection */}
              {product.variants &&`;

const shopReplacement = `            {/* Shop by Colour */}
            {availableColors.length > 0 && (
              <div className="mb-8 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2 mb-4">
                  🎨 Shop by Colour
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
                        "w-14 h-14 rounded-full overflow-hidden border-2 p-0.5",
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
                        "text-[10px] font-black uppercase tracking-widest text-center max-w-[64px] truncate",
                        selectedColor === c.color ? "text-[#1B1B1B]" : "text-gray-500"
                      )}>
                        {c.color}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            ` + shopTarget;

code = code.replace(shopTarget, shopReplacement);

// 7. Render Modal at the end of the file
const modalJSX = `
      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <button 
            onClick={() => setIsSizeGuideOpen(false)} 
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-black uppercase tracking-widest text-sm text-[#1B1B1B]">Size Guide</h3>
            </div>
            <div className="flex-1 overflow-hidden relative touch-none">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
                wheel={{ wheelDisabled: false }}
                pinch={{ disabled: false }}
              >
                <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img 
                    src="https://i.imgur.com/t4wt92I.png" 
                    alt="Size Guide" 
                    className="w-full h-auto object-contain cursor-move" 
                    style={{ maxHeight: 'calc(90vh - 60px)' }}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '      {isVariantModalOpen && (',
  modalJSX + '\n      {isVariantModalOpen && ('
);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
console.log("Patched successfully");
