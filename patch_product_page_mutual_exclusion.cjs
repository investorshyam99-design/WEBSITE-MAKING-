const fs = require('fs');
const path = 'src/pages/ProductPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add new teams to getProductTeam
code = code.replace(
  /const getProductTeam = \(\) => \{[\s\S]*?return null;\n  \};/g,
  `const getProductTeam = () => {
    if (!product) return null;
    const allTags = product.tags || [];
    const nameLower = product.name.toLowerCase();
    if (allTags.includes('fc barcelona') || allTags.includes('barcelona') || nameLower.includes('barcelona')) return 'FC_BARCELONA';
    if (allTags.includes('real madrid') || nameLower.includes('real madrid')) return 'REAL_MADRID';
    if (allTags.includes('portugal') || nameLower.includes('portugal')) return 'PORTUGAL';
    if (allTags.includes('argentina') || nameLower.includes('argentina')) return 'ARGENTINA';
    return null;
  };`
);

// 2. Add isCoolPrintEnabled state
code = code.replace(
  /const \[selectedCoolPrint, setSelectedCoolPrint\] = useState/g,
  'const [isCoolPrintEnabled, setIsCoolPrintEnabled] = useState(false);\n  const [selectedCoolPrint, setSelectedCoolPrint] = useState'
);

// 3. Update Customization UI to disable YES if isCoolPrintEnabled is true, and on Customization YES, set isCoolPrintEnabled false
code = code.replace(
  /<button\s*onClick=\{\(\) => setIsCust\(true\)\}/g,
  '<button\n                      onClick={() => { setIsCust(true); setIsCoolPrintEnabled(false); setSelectedCoolPrint(null); }}'
);
code = code.replace(
  /<button\s*onClick=\{\(\) => setIsCust\(false\)\}/g,
  '<button\n                      onClick={() => setIsCust(false)}'
);

// 4. Update the actual Cool Prints UI to include a YES/NO toggle, new prints, mutual exclusion, and 499 price
const coolPrintUI = `
            {/* Cool Prints Section */}
            {productTeam && (
              <div className="mb-6 p-4 md:p-5 bg-gray-50 border border-gray-200 rounded-xl opacity-100 transition-opacity" style={{ opacity: isCust ? 0.5 : 1, pointerEvents: isCust ? 'none' : 'auto' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm md:text-base font-black text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                      🔥 Cool Prints
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Would you like a Cool Print?</p>
                  </div>
                  <span className="text-[10px] md:text-xs font-bold bg-[#1E2A44] text-white px-2.5 py-1 rounded-full whitespace-nowrap">+₹499</span>
                </div>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => { setIsCoolPrintEnabled(true); setIsCust(false); setCustomName(""); setCustomNumber(""); }}
                    className={\`flex-1 py-2.5 rounded-lg border-2 text-sm font-bold transition-all \${isCoolPrintEnabled ? 'border-[#1E2A44] bg-[#1E2A44] text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}\`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => { setIsCoolPrintEnabled(false); setSelectedCoolPrint(null); }}
                    className={\`flex-1 py-2.5 rounded-lg border-2 text-sm font-bold transition-all \${!isCoolPrintEnabled ? 'border-[#1E2A44] bg-white text-[#1E2A44]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}\`}
                  >
                    NO
                  </button>
                </div>

                {isCoolPrintEnabled && (
                  <div className="flex flex-col gap-3">
                    {productTeam === 'FC_BARCELONA' && (
                      <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl transition-all hover:bg-gray-100 bg-white">
                        <input
                          type="checkbox"
                          checked={selectedCoolPrint?.name === "THANK GOD I AM NOT MADRIDISTA"}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCoolPrint({ selected: true, name: "THANK GOD I AM NOT MADRIDISTA", price: 499 });
                            } else {
                              setSelectedCoolPrint(null);
                            }
                          }}
                          className="accent-[#1E2A44] w-5 h-5 flex-shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold uppercase tracking-wide">THANK GOD I AM NOT MADRIDISTA</span>
                        </div>
                      </label>
                    )}
                    {productTeam === 'REAL_MADRID' && (
                      <>
                        <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl transition-all hover:bg-gray-100 bg-white">
                          <input
                            type="checkbox"
                            checked={selectedCoolPrint?.name === "THANK GOD I AM NOT BARCELONISTA"}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCoolPrint({ selected: true, name: "THANK GOD I AM NOT BARCELONISTA", price: 499 });
                              } else {
                                setSelectedCoolPrint(null);
                              }
                            }}
                            className="accent-[#1E2A44] w-5 h-5 flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold uppercase tracking-wide">THANK GOD I AM NOT BARCELONISTA</span>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl transition-all hover:bg-gray-100 bg-white">
                          <input
                            type="checkbox"
                            checked={selectedCoolPrint?.name === "12 YEARS NO UCL, THANK GOD I AM NOT A BARCA FAN"}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCoolPrint({ selected: true, name: "12 YEARS NO UCL, THANK GOD I AM NOT A BARCA FAN", price: 499 });
                              } else {
                                setSelectedCoolPrint(null);
                              }
                            }}
                            className="accent-[#1E2A44] w-5 h-5 flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold uppercase tracking-wide">12 YEARS NO UCL, THANK GOD I AM NOT A BARCA FAN</span>
                          </div>
                        </label>
                      </>
                    )}
                    {productTeam === 'PORTUGAL' && (
                      <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl transition-all hover:bg-gray-100 bg-white">
                        <input
                          type="checkbox"
                          checked={selectedCoolPrint?.name === "SHE WAS MY WORLD CUP, BUT I WAS RONALDO"}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCoolPrint({ selected: true, name: "SHE WAS MY WORLD CUP, BUT I WAS RONALDO", price: 499 });
                            } else {
                              setSelectedCoolPrint(null);
                            }
                          }}
                          className="accent-[#1E2A44] w-5 h-5 flex-shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold uppercase tracking-wide">SHE WAS MY WORLD CUP, BUT I WAS RONALDO</span>
                        </div>
                      </label>
                    )}
                    {productTeam === 'ARGENTINA' && (
                      <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl transition-all hover:bg-gray-100 bg-white">
                        <input
                          type="checkbox"
                          checked={selectedCoolPrint?.name === "THE GOAT DEBATE ALREADY ENDED IN QATAR 2022"}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCoolPrint({ selected: true, name: "THE GOAT DEBATE ALREADY ENDED IN QATAR 2022", price: 499 });
                            } else {
                              setSelectedCoolPrint(null);
                            }
                          }}
                          className="accent-[#1E2A44] w-5 h-5 flex-shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold uppercase tracking-wide">THE GOAT DEBATE ALREADY ENDED IN QATAR 2022</span>
                        </div>
                      </label>
                    )}
                  </div>
                )}
                {isCust && (
                  <p className="text-xs text-red-500 mt-3 font-semibold">
                    * Cool Prints cannot be selected when Customization is active.
                  </p>
                )}
              </div>
            )}
`;

code = code.replace(
  /\{\/\* Cool Prints Section \*\/\}[\s\S]*?\{productTeam === 'REAL_MADRID' && \([\s\S]*?<\/div>\s*<\/div>\s*\)\}/g,
  () => coolPrintUI
);

// Need to do this for the Customization section too: disable Customization if Cool Print is active.
// In the Customization section, we can add pointer-events-none and opacity to the Customization section itself.
// Let's replace the whole Customization Section to add this wrapper logic.
code = code.replace(
  /<div className="mt-6 mb-6 p-4 md:p-5 bg-gray-50 border border-gray-200 rounded-xl">/g,
  '<div className="mt-6 mb-6 p-4 md:p-5 bg-gray-50 border border-gray-200 rounded-xl opacity-100 transition-opacity" style={{ opacity: isCoolPrintEnabled ? 0.5 : 1, pointerEvents: isCoolPrintEnabled ? \'none\' : \'auto\' }}>'
);
code = code.replace(
  /<div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">/g,
  '<div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl opacity-100 transition-opacity" style={{ opacity: isCoolPrintEnabled ? 0.5 : 1, pointerEvents: isCoolPrintEnabled ? \'none\' : \'auto\' }}>'
);
code = code.replace(
  /\{!\(product && \['player-version', 'master-version', 'fan-set'\]\.includes\(product\.category\)\) && \(\s*<div className="mt-6"\/>\s*\)\}/g,
  `{!(['player-version', 'master-version', 'fan-set'].includes(product?.category || '')) && (
                <div className="mt-6"/>
              )}`
);
code = code.replace(
  /\{isCoolPrintEnabled && \(\s*<p className="text-xs text-red-500 mt-3 font-semibold">\s*\* Customization cannot be selected when Cool Prints are active\.\s*<\/p>\s*\)\}/g,
  ''
);
code = code.replace(
  /<div className="flex gap-3 mb-4">/g,
  `<div className="flex gap-3 mb-4">`
);

fs.writeFileSync(path, code);
console.log("Success");
