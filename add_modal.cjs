const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

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
            <div className="flex-1 overflow-hidden relative touch-none bg-gray-50 flex items-center justify-center">
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
                    src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=2000&auto=format&fit=crop" 
                    alt="Size Guide placeholder" 
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
  '{isVariantModalOpen && (',
  modalJSX + '\n      {isVariantModalOpen && ('
);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
console.log("Added Size Guide modal");
