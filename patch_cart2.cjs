const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

code = code.replace(/\{paymentMode === "full"[\s\S]*?\?\s*total\.toFixed\(2\)[\s\S]*?:\s*\(total \+ codExtra\)\.toFixed\(2\)\}/g, '{total.toFixed(2)}');

code = code.replace(/onClick=\{\(\) => \{\n\s*setIsCartOpen\(false\); navigate\("\/checkout"\); \}/g, 'onClick={() => { setIsCartOpen(false); navigate("/checkout"); }}');

code = code.replace(/\{isSubmitting \? "Processing\.\.\." : \`CHECKOUT\`\}/g, 'CHECKOUT');

fs.writeFileSync('src/components/CartModal.tsx', code);
