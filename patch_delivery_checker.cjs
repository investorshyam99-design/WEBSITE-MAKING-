const fs = require('fs');
let code = fs.readFileSync('src/components/DeliveryChecker.tsx', 'utf8');

// Update onChange to also update the context if valid, or just let CheckoutPage use pincodeInput.
// Actually, let's just make the DeliveryChecker run handleCheck automatically when it reaches 6 digits.
// We can add a useEffect for it.

code = code.replace(
  /const handleCheck = async \(\) => {/g,
  `useEffect(() => {
    if (pincodeInput && pincodeInput.length === 6 && pincodeInput !== deliveryPincode) {
       // Just update context silently so checkout doesn't fail, user can still click check for ETA
       setDeliveryPincode(pincodeInput);
    }
  }, [pincodeInput]);

  const handleCheck = async () => {`
);

fs.writeFileSync('src/components/DeliveryChecker.tsx', code, 'utf8');
console.log("Updated DeliveryChecker.tsx");
