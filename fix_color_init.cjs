const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const targetStr = `  const initialColor = searchParams.get("color") || "";
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);`;

const replacementStr = `  const initialColor = searchParams.get("color") || "";
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);

  useEffect(() => {
    if (!selectedColor && product?.variants) {
      const firstColor = product.variants.find(v => v.color)?.color;
      if (firstColor) {
        setSelectedColor(firstColor);
      }
    }
  }, [product, selectedColor]);`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/pages/ProductPage.tsx', code);
