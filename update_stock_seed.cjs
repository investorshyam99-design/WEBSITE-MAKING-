const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const targetStr = `  const variantInventory = useMemo(() => {
    if (!product) return 3;
    const sizePart = selectedSize || 'M';
    const seed = \`\${product.name}-\${sizePart}\`;`;

const replacementStr = `  const variantInventory = useMemo(() => {
    if (!product) return 3;
    const sizePart = selectedSize || 'M';
    const colorPart = selectedColor || '';
    const seed = \`\${product.name}-\${sizePart}-\${colorPart}\`;`;

code = code.replace(targetStr, replacementStr);

const depTarget = `  }, [product, selectedSize]);`;
const depReplacement = `  }, [product, selectedSize, selectedColor]);`;
code = code.replace(depTarget, depReplacement);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
