const fs = require('fs');
let code = fs.readFileSync('src/pages/CollectionPage.tsx', 'utf8');

code = code.replace(
  "import { products, getProductsByCategory } from '../data/products';",
  "import { useProducts, getProductsByCategory } from '../data/products';"
);

code = code.replace(
  "export function CollectionPage() {",
  "export function CollectionPage() {\n  const { products, loading, error } = useProducts();"
);

// We should also handle loading state in rendering
code = code.replace(
  "{/* Products Grid */}",
  "{/* Products Grid */}\n          {loading ? (\n            <div className=\"flex justify-center py-20\">\n              <div className=\"w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin\"></div>\n            </div>\n          ) : "
);

code = code.replace(
  "          )}",
  "          )}\n          }"
);

// Ah wait, it's safer to use regex to replace the exact block.
