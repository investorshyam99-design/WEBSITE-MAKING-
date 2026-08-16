const fs = require('fs');
let file = fs.readFileSync('src/components/DeliveryChecker.tsx', 'utf8');

file = file.replace(/const \{ deliveryMethod, setDeliveryMethod, deliveryPincode, setDeliveryPincode \} = useShop\(\);/, `const { deliveryMethod, setDeliveryMethod, deliveryPincode, setDeliveryPincode, setDeliveryLocation } = useShop();`);

file = file.replace(/if \(result\.city && result\.state\) \{\n\s*setLocationInfo\(\{ city: result\.city, state: result\.state \}\);\n\s*\}/, `if (result.city && result.state) {
          const loc = { city: result.city, district: result.district, state: result.state };
          setLocationInfo(loc);
          setDeliveryLocation(loc);
        }`);
        
fs.writeFileSync('src/components/DeliveryChecker.tsx', file);
