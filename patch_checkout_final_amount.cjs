const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regexSubmit = /<button\s*disabled=\{isSubmitting\}\s*onClick=\{([^}]*)\}\s*className="w-full bg-\[#1B1B1B\][^>]*>[\s\S]*?<Lock className="w-4 h-4" \/>[\s\S]*?\{isSubmitting \? "PROCESSING\.\.\." : `PAY RS\. \$\{\(advanceToCollect\)\.toFixed\(2\)\} SECURELY`\}[\s\S]*?<\/button>/;

const replaceSubmit = `<button
              disabled={isSubmitting}
              onClick={() => handleCheckout()}
              className="w-full bg-[#1B1B1B] text-white h-14 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 hover:bg-[#2A2A2A] transition-all flex items-center justify-center gap-2 animate-checkout-wiggle"
            >
              <Lock className="w-4 h-4" />
              {isSubmitting ? "PROCESSING..." : \`PAY RS. \${(paymentMode === "partial" ? codAdvance + fastDeliveryCharge : totalOrderValue).toFixed(2)} SECURELY\`}
            </button>`;

code = code.replace(regexSubmit, replaceSubmit);
fs.writeFileSync(path, code);
console.log("Success");
