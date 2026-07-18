const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import { CollectionPage } from "./pages/CollectionPage";',
  'import { CollectionPage } from "./pages/CollectionPage";\nimport { GenericPage } from "./pages/GenericPage";'
);

code = code.replace(
  '<Route path="/collections/:id" element={<CollectionPage />} />',
  '<Route path="/collections/:id" element={<CollectionPage />} />\n            <Route path="/pages/:id" element={<GenericPage />} />'
);

fs.writeFileSync('src/App.tsx', code);
