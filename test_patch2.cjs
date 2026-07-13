const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const hooksTarget = `  const { addToCart, setIsCartOpen, isCartOpen } = useShop();`;
console.log(code.includes(hooksTarget));

const stateTarget = `  const [selectedColor, setSelectedColor] = useState<string>("");`;
console.log(code.includes(stateTarget));

const isVariantModalOpenTarget = `  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);`;
console.log(code.includes(isVariantModalOpenTarget));
