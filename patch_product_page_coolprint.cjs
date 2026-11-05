const fs = require('fs');
const path = 'src/pages/ProductPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add selectedCoolPrint state
code = code.replace(
  /const \[customNumber, setCustomNumber\] = useState\(""\);/g,
  'const [customNumber, setCustomNumber] = useState("");\n  const [selectedCoolPrint, setSelectedCoolPrint] = useState<{ selected: boolean; name: string; price: number } | null>(null);'
);

// Add getProductTeam logic inside component
code = code.replace(
  /const handleAction = \(action: "add" \| "buy"\) => \{/g,
  `const getProductTeam = () => {
    if (!product) return null;
    const allTags = product.tags || [];
    const nameLower = product.name.toLowerCase();
    if (allTags.includes('fc barcelona') || allTags.includes('barcelona') || nameLower.includes('barcelona')) return 'FC_BARCELONA';
    if (allTags.includes('real madrid') || nameLower.includes('real madrid')) return 'REAL_MADRID';
    return null;
  };

  const productTeam = getProductTeam();

  const handleAction = (action: "add" | "buy") => {`
);

// Update proceedToCart to pass coolPrint
code = code.replace(
  /isCust \? \{ name: customName, number: customNumber \} : undefined,/g,
  'isCust ? { name: customName, number: customNumber } : undefined,\n      selectedCoolPrint?.selected ? selectedCoolPrint : undefined'
);

// Add Cool Print UI below Customization Section
const coolPrintUI = `

            {/* Cool Prints Section */}
            {productTeam && (
              <div className="mb-6 p-4 md:p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm md:text-base font-black text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                    🔥 Cool Prints
                  </h3>
                  <span className="text-[10px] md:text-xs font-bold bg-[#1E2A44] text-white px-2.5 py-1 rounded-full whitespace-nowrap">+₹500</span>
                </div>
                <div className="flex flex-col gap-3">
                  {productTeam === 'FC_BARCELONA' && (
                    <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl transition-all hover:bg-gray-100 bg-white">
                      <input
                        type="checkbox"
                        checked={selectedCoolPrint?.name === "THANK GOD I AM NOT MADRIDISTA"}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCoolPrint({ selected: true, name: "THANK GOD I AM NOT MADRIDISTA", price: 500 });
                          } else {
                            setSelectedCoolPrint(null);
                          }
                        }}
                        className="accent-[#1E2A44] w-5 h-5 flex-shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold uppercase tracking-wide">THANK GOD I AM NOT MADRIDISTA</span>
                        <span className="text-xs text-gray-500 font-medium">+₹500</span>
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
                              setSelectedCoolPrint({ selected: true, name: "THANK GOD I AM NOT BARCELONISTA", price: 500 });
                            } else {
                              setSelectedCoolPrint(null);
                            }
                          }}
                          className="accent-[#1E2A44] w-5 h-5 flex-shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold uppercase tracking-wide">THANK GOD I AM NOT BARCELONISTA</span>
                          <span className="text-xs text-gray-500 font-medium">+₹500</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl transition-all hover:bg-gray-100 bg-white">
                        <input
                          type="checkbox"
                          checked={selectedCoolPrint?.name === "12 YEARS NO UCL, THANK GOD I AM NOT A BARCA FAN"}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCoolPrint({ selected: true, name: "12 YEARS NO UCL, THANK GOD I AM NOT A BARCA FAN", price: 500 });
                            } else {
                              setSelectedCoolPrint(null);
                            }
                          }}
                          className="accent-[#1E2A44] w-5 h-5 flex-shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold uppercase tracking-wide">12 YEARS NO UCL, THANK GOD I AM NOT A BARCA FAN</span>
                          <span className="text-xs text-gray-500 font-medium">+₹500</span>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}
`;

code = code.replace(
  /\{product && \['player-version', 'master-version', 'fan-set'\]\.includes\(product\.category\) && \(\s*<div className="mt-6 mb-6 p-4 md:p-5 bg-gray-50 border border-gray-200 rounded-xl">[\s\S]*?<\/div>\s*\)\}/g,
  (match) => match + coolPrintUI
);

// We need to do the same for the variant modal customization section
code = code.replace(
  /\{\['player-version', 'master-version', 'fan-set'\]\.includes\(product\.category\) && \(\s*<div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">[\s\S]*?<\/div>\s*\)\}/g,
  (match) => match + coolPrintUI
);

fs.writeFileSync(path, code);
console.log("Success");
