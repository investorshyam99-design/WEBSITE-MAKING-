const fs = require('fs');

let checkoutContent = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

checkoutContent = checkoutContent.replace(
  /placeholder="City"[\s\S]*?onChange=\{\(e\) => setCity\(e\.target\.value\)\}[\s\S]*?className="[\s\S]*?"\s*\/>\s*<\/div>/m,
  `placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Area / Street"
                  value={areaStreet}
                  onChange={(e) => setAreaStreet(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>`
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', checkoutContent, 'utf8');
console.log("Updated CheckoutPage inputs!");
