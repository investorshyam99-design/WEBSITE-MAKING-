const fs = require('fs');
const path = 'src/context/ShopContext.tsx';
let code = fs.readFileSync(path, 'utf8');

// Update CartItem type
code = code.replace(
  /customization\?: \{ name: string; number: string \};/g,
  'customization?: { name: string; number: string };\n  coolPrint?: { selected: boolean; name: string; price: number };'
);

// Update addToCart definition
code = code.replace(
  /const addToCart = \(product: Product, selectedSize\?: string, selectedColor\?: string, customization\?: \{ name: string; number: string \}\) => \{/g,
  'const addToCart = (product: Product, selectedSize?: string, selectedColor?: string, customization?: { name: string; number: string }, coolPrint?: { selected: boolean; name: string; price: number }) => {'
);

// Update isCustomSame and isCoolPrintSame
code = code.replace(
  /const isCustomSame = \[\^;\]+;\n/g,
  ''
);

code = code.replace(
  /const isCustomSame = \(itemCustom.*?;\n.*?\};\n/gs,
  `const isCustomSame = (itemCustom: { name: string; number: string } | undefined, targetCustom: { name: string; number: string } | undefined) => {
        if (!itemCustom && !targetCustom) return true;
        if (!itemCustom || !targetCustom) return false;
        return itemCustom.name === targetCustom.name && itemCustom.number === targetCustom.number;
      };
      const isCoolPrintSame = (itemPrint: { name: string; price: number } | undefined, targetPrint: { name: string; price: number } | undefined) => {
        if (!itemPrint && !targetPrint) return true;
        if (!itemPrint || !targetPrint) return false;
        return itemPrint.name === targetPrint.name;
      };\n`
);

// Update existingItem lookup
code = code.replace(
  /item\.id === product\.id && item\.selectedSize === selectedSize && item\.selectedColor === selectedColor && isCustomSame\(item\.customization, customization\)/g,
  'item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor && isCustomSame(item.customization, customization) && isCoolPrintSame(item.coolPrint, coolPrint)'
);

// Update new item addition
code = code.replace(
  /return \[\.\.\.prev, \{ \.\.\.product, image: itemImage, quantity: 1, selectedSize, selectedColor, customization, price: product\.price \+ \(customization \? 199 : 0\) \}\];/g,
  'return [...prev, { ...product, image: itemImage, quantity: 1, selectedSize, selectedColor, customization, coolPrint, price: product.price + (customization ? 199 : 0) }];'
);

// Add to context type interface
code = code.replace(
  /addToCart: \(product: Product, selectedSize\?: string, selectedColor\?: string, customization\?: \{ name: string; number: string \}\) => void;/g,
  'addToCart: (product: Product, selectedSize?: string, selectedColor?: string, customization?: { name: string; number: string }, coolPrint?: { selected: boolean; name: string; price: number }) => void;'
);

fs.writeFileSync(path, code);
console.log("Success");
