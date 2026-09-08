const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Replace state variables
code = code.replace(
  /const \[houseNo, setHouseNo\] = useState\(""\);\s*const \[areaStreet, setAreaStreet\] = useState\(""\);\s*const \[city, setCity\] = useState\(""\);\s*const \[state, setState\] = useState\(""\);/g,
  'const [address, setAddress] = useState("");'
);

// 2. Replace useEffect for location
code = code.replace(
  /useEffect\(\(\) => \{\s*if \(deliveryLocation\) \{\s*if \(deliveryLocation\.city\) setCity\([^)]*\);\s*if \(deliveryLocation\.state\) setState\([^)]*\);\s*\}\s*\}, \[deliveryLocation\]\);/g,
  ''
);

// 3. Replace validation
code = code.replace(
  /if \(!fullName \|\| !phone \|\| !deliveryPincode \|\| !houseNo\) \{/g,
  'if (!fullName || !phone || !deliveryPincode || !address) {'
);

// 4. Replace address string assembly
code = code.replace(
  /const combinedAddress = \[houseNo, areaStreet, city, state, `Pincode: \$\{deliveryPincode\}`\].filter\(Boolean\)\.join\(", "\);/g,
  'const combinedAddress = [address, deliveryLocation?.city || "", deliveryLocation?.state || "", `Pincode: ${deliveryPincode}`].filter(Boolean).join(", ");'
);

// 5. Fix houseNo in save details fallback
code = code.replace(
  /houseNo,/g,
  'address,'
);

// 6. Rewrite the Delivery Details UI block
const uiRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<div className="mb-4">[\s\S]*?<DeliveryChecker customizationEnabled={hasCustomization} \/>[\s\S]*?<\/div>[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<input[\s\S]*?placeholder="Address \(House No, Area, Street\)"[\s\S]*?<\/div>[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<\/div>/;

const newUI = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\\D/g, ""))}
                    className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Address (House No, Area, Street)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div className="mb-4">
                <DeliveryChecker customizationEnabled={hasCustomization} />
              </div>`;

if (code.match(uiRegex)) {
   code = code.replace(uiRegex, newUI);
} else {
   console.log("Could not find UI block to replace");
}

fs.writeFileSync(path, code);
console.log("Success");
