const fs = require('fs');
let code = fs.readFileSync('src/pages/CollectionPage.tsx', 'utf8');

code = code.replace(
  "import { products, getProductsByCategory } from '../data/products';",
  "import { useProducts, getProductsByCategory } from '../data/products';"
);

if (!code.includes('useProducts()')) {
  code = code.replace(
    "export function CollectionPage() {",
    "export function CollectionPage() {\n  const { products, loading, error } = useProducts();"
  );
}

const beforeStr = `{/* Products Grid */}
          {collectionProducts.length > 0 ? (`;

const afterStr = `{/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : collectionProducts.length > 0 ? (`;

code = code.replace(beforeStr, afterStr);

// add closing brace for the ternary at the end
code = code.replace(
  `          )}
        </div>`,
  `          )}
          )}
        </div>`
);

fs.writeFileSync('src/pages/CollectionPage.tsx', code);
