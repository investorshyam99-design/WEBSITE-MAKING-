const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

code = code.replace(
  '<li><button onClick={() => setIsPoliciesOpen(true)} className="hover:text-white transition-colors">About Us</button></li>',
  '<li><Link to="/pages/about-us" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">About Us</Link></li>'
);

code = code.replace(
  '<li><button onClick={() => setIsPoliciesOpen(true)} className="hover:text-white transition-colors">Shipping Policy</button></li>',
  '<li><Link to="/pages/shipping-policy" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">Shipping Policy</Link></li>'
);

code = code.replace(
  '<li><button onClick={() => setIsPoliciesOpen(true)} className="hover:text-white transition-colors">Exchange Policy</button></li>',
  '<li><Link to="/pages/exchange-return-policy" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">Exchange Policy</Link></li>\n                <li><Link to="/pages/privacy-policy" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">Privacy Policy</Link></li>\n                <li><Link to="/pages/terms-conditions" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">Terms & Conditions</Link></li>'
);

fs.writeFileSync('src/components/Footer.tsx', code);
