const fs = require('fs');
let file = fs.readFileSync('src/context/ShopContext.tsx', 'utf8');

const regexType = /deliveryPincode: string;\n\s+setDeliveryPincode: \(pincode: string\) => void;/;
const replacementType = `deliveryPincode: string;
  setDeliveryPincode: (pincode: string) => void;
  deliveryLocation: { city?: string; district?: string; state?: string } | null;
  setDeliveryLocation: (loc: { city?: string; district?: string; state?: string } | null) => void;`;
file = file.replace(regexType, replacementType);

const regexState = /const \[deliveryPincode, setDeliveryPincode\] = useState\(""\);/;
const replacementState = `const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState<{ city?: string; district?: string; state?: string } | null>(null);`;
file = file.replace(regexState, replacementState);

const regexProvider = /deliveryPincode,\n\s+setDeliveryPincode,/;
const replacementProvider = `deliveryPincode,
        setDeliveryPincode,
        deliveryLocation,
        setDeliveryLocation,`;
file = file.replace(regexProvider, replacementProvider);

fs.writeFileSync('src/context/ShopContext.tsx', file);
