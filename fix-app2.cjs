const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import { HelmetProvider } from "react-helmet-async";\n',
  ''
);

code = code.replace(
  '<HelmetProvider>\n      <ShopProvider>',
  '<ShopProvider>'
);

code = code.replace(
  '</ShopProvider>\n    </HelmetProvider>',
  '</ShopProvider>'
);

fs.writeFileSync('src/App.tsx', code);
