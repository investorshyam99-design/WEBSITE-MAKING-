const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

// Replace first block
const search1 = `                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Player Name (Optional)"
                    maxLength={12}
                    value={customName}`;

const replace1 = `                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="customization_toggle_main" 
                      checked={isCustomized} 
                      onChange={() => setIsCustomized(true)} 
                      className="accent-[#1E2A44] w-4 h-4"
                    />
                    <span className="text-sm font-bold uppercase">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="customization_toggle_main" 
                      checked={!isCustomized} 
                      onChange={() => {
                        setIsCustomized(false);
                        setCustomName("");
                        setCustomNumber("");
                      }} 
                      className="accent-[#1E2A44] w-4 h-4"
                    />
                    <span className="text-sm font-bold uppercase">No, Thanks</span>
                  </label>
                </div>

                {isCustomized && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Player Name (Optional)"
                      maxLength={12}
                      value={customName}`;

if (code.includes(search1)) {
    code = code.replace(search1, replace1);
    console.log("Replaced first block.");
}

const search2 = `                  />
                  <input
                    type="text"
                    placeholder="Player Number (Optional)"
                    maxLength={2}
                    value={customNumber}
                    onChange={(e) => {
                      setCustomNumber(e.target.value.replace(/\\D/g, ''));
                      setIsCustomized(true);
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#1E2A44] transition-all bg-white"
                  />
                </div>
              </div>
            )}`;

const replace2 = `                  />
                    <input
                      type="text"
                      placeholder="Player Number (Optional)"
                      maxLength={2}
                      value={customNumber}
                      onChange={(e) => {
                        setCustomNumber(e.target.value.replace(/\\D/g, ''));
                        setIsCustomized(true);
                      }}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#1E2A44] transition-all bg-white"
                    />
                  </div>
                )}
              </div>
            )}`;

if (code.includes(search2)) {
    code = code.replace(search2, replace2);
    console.log("Replaced second block.");
}


// Replace third block (mobile modal)
const search3 = `                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Player Name (Optional)"
                        maxLength={12}
                        value={customName}`;

const replace3 = `                    <div className="flex gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="customization_toggle_modal" 
                          checked={isCustomized} 
                          onChange={() => setIsCustomized(true)} 
                          className="accent-[#1E2A44] w-3.5 h-3.5"
                        />
                        <span className="text-xs font-bold uppercase">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="customization_toggle_modal" 
                          checked={!isCustomized} 
                          onChange={() => {
                            setIsCustomized(false);
                            setCustomName("");
                            setCustomNumber("");
                          }} 
                          className="accent-[#1E2A44] w-3.5 h-3.5"
                        />
                        <span className="text-xs font-bold uppercase">No</span>
                      </label>
                    </div>

                    {isCustomized && (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Player Name (Optional)"
                          maxLength={12}
                          value={customName}`;

if (code.includes(search3)) {
    code = code.replace(search3, replace3);
    console.log("Replaced third block.");
}

const search4 = `                      />
                      <input
                        type="text"
                        placeholder="Player Number (Optional)"
                        maxLength={2}
                        value={customNumber}
                        onChange={(e) => {
                          setCustomNumber(e.target.value.replace(/\\D/g, ''));
                          setIsCustomized(true);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#1E2A44] bg-white"
                      />
                    </div>
                  </div>
                )}`;

const replace4 = `                      />
                        <input
                          type="text"
                          placeholder="Player Number (Optional)"
                          maxLength={2}
                          value={customNumber}
                          onChange={(e) => {
                            setCustomNumber(e.target.value.replace(/\\D/g, ''));
                            setIsCustomized(true);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#1E2A44] bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}`;

if (code.includes(search4)) {
    code = code.replace(search4, replace4);
    console.log("Replaced fourth block.");
}

fs.writeFileSync('src/pages/ProductPage.tsx', code);
