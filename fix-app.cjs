const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('react-helmet-async')) {
  code = code.replace(
    'import { HashRouter as Router, Routes, Route } from "react-router-dom";',
    'import { HashRouter as Router, Routes, Route } from "react-router-dom";\nimport { HelmetProvider } from "react-helmet-async";\nimport { CollectionPage } from "./pages/CollectionPage";'
  );
}

code = code.replace(
  '<ShopProvider>',
  '<HelmetProvider>\n      <ShopProvider>'
);

code = code.replace(
  '</ShopProvider>',
  '</ShopProvider>\n    </HelmetProvider>'
);

code = code.replace(
  '<Route path="/checkout" element={<CheckoutPage />} />',
  '<Route path="/checkout" element={<CheckoutPage />} />\n            <Route path="/collections/:id" element={<CollectionPage />} />'
);

fs.writeFileSync('src/App.tsx', code);
