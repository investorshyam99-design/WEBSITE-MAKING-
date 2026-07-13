const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const startTag = '<div className="bg-white border-t border-gray-100 px-4 md:px-6 py-6 space-y-6">';
const endTag = '</>\\n              )}';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf('</>', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
}

// Remove the payment check for total 
code = code.replace(/paymentMode === "full" \? total\.toFixed\(2\) : \(total \+ codExtra\)\.toFixed\(2\)/g, 'total.toFixed(2)');
code = code.replace(/\{isSubmitting\n.*: \`CHECKOUT\`\}/g, 'CHECKOUT');

// Just make checkout button redirect to checkout
code = code.replace(/if \(\n.*fullName &&\n.*phone.length === 10 &&[\s\S]*?setIsLoginOpen\(true\);\n.*\}\}/g, 'setIsCartOpen(false); navigate("/checkout"); }');
code = code.replace(/onClick={handleCheckout}\n.*disabled={isSubmitting}/g, 'onClick={() => { setIsCartOpen(false); navigate("/checkout"); }}');


fs.writeFileSync('src/components/CartModal.tsx', code);
