const fs = require('fs');
let file = fs.readFileSync('src/components/DeliveryChecker.tsx', 'utf8');

// Imports
file = file.replace(/import \{ MapPin, Truck, CheckCircle2, Zap \} from 'lucide-react';/, `import { MapPin, Truck, CheckCircle2, Zap, AlertCircle } from 'lucide-react';\nimport { checkPincodeServiceability } from '../services/pincode';`);

// States
const regexStates = /const \[isChecking, setIsChecking\] = useState\(false\);/;
const replacementStates = `const [isChecking, setIsChecking] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<{city?: string, state?: string} | null>(null);`;
file = file.replace(regexStates, replacementStates);

// HandleCheck
const regexHandleCheck = /const handleCheck = \(\) => \{\n\s*if \(\!\/\^\[1-9\]\[0-9\]\{5\}\$\/\.test\(pincodeInput\)\) \{\n\s*alert\("Please enter a valid 6-digit Indian Pincode\."\);\n\s*return;\n\s*\}\n\s*setIsChecking\(true\);\n\s*\/\/ Simulate API call\n\s*setTimeout\(\(\) => \{\n\s*setIsChecking\(false\);\n\s*setIsServiceable\(true\);\n\s*setDeliveryPincode\(pincodeInput\);\n\s*\}, 600\);\n\s*\};/;
const replacementHandleCheck = `const handleCheck = async () => {
    if (!/^[1-9][0-9]{5}$/.test(pincodeInput)) {
      alert("Please enter a valid 6-digit Indian Pincode.");
      return;
    }
    
    setIsChecking(true);
    setPincodeMessage(null);
    setLocationInfo(null);
    setIsServiceable(null);
    
    try {
      const result = await checkPincodeServiceability(pincodeInput);
      setIsServiceable(result.isServiceable);
      
      if (result.isServiceable) {
        setDeliveryPincode(pincodeInput);
        if (result.city && result.state) {
          setLocationInfo({ city: result.city, state: result.state });
        }
      } else {
        setPincodeMessage(result.message || "Delivery is not available in this area.");
      }
    } catch (error) {
      setPincodeMessage("Error checking serviceability. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };`;
file = file.replace(regexHandleCheck, replacementHandleCheck);

// JSX Error Message
const regexError = /\{isServiceable && deliveryPincode && \(/;
const replacementError = `{isServiceable === false && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm font-bold tracking-wide">{pincodeMessage}</span>
        </div>
      )}

      {isServiceable && deliveryPincode && (`;
file = file.replace(regexError, replacementError);

// JSX location info
const regexSuccess = /<span className="text-xs font-bold tracking-wide">Delivery available to \{deliveryPincode\}<\/span>/;
const replacementSuccess = `<span className="text-xs font-bold tracking-wide">Delivery available to {deliveryPincode} {locationInfo && \`(\${locationInfo.city}, \${locationInfo.state})\`}</span>`;
file = file.replace(regexSuccess, replacementSuccess);


fs.writeFileSync('src/components/DeliveryChecker.tsx', file);
