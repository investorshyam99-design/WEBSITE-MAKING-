const fs = require('fs');
const path = 'src/context/ShopContext.tsx';
let code = fs.readFileSync(path, 'utf8');

// removeFromCart definition and interface
code = code.replace(
  /removeFromCart: \(productId: string, selectedSize\?: string, selectedColor\?: string, customization\?: \{ name: string; number: string \}\) => void;/g,
  'removeFromCart: (productId: string, selectedSize?: string, selectedColor?: string, customization?: { name: string; number: string }, coolPrint?: { selected: boolean; name: string; price: number }) => void;'
);
code = code.replace(
  /const removeFromCart = \(productId: string, selectedSize\?: string, selectedColor\?: string, customization\?: \{ name: string; number: string \}\) => \{/g,
  'const removeFromCart = (productId: string, selectedSize?: string, selectedColor?: string, customization?: { name: string; number: string }, coolPrint?: { selected: boolean; name: string; price: number }) => {'
);
code = code.replace(
  /!\(item\.id === productId && item\.selectedSize === selectedSize && item\.selectedColor === selectedColor && isCustomSame\(item\.customization, customization\)\)/g,
  '!(item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor && isCustomSame(item.customization, customization) && isCoolPrintSame(item.coolPrint, coolPrint))'
);

// updateQuantity definition and interface
code = code.replace(
  /updateQuantity: \(productId: string, selectedSize: string \| undefined, selectedColor: string \| undefined, quantity: number, customization\?: \{ name: string; number: string \}\) => void;/g,
  'updateQuantity: (productId: string, selectedSize: string | undefined, selectedColor: string | undefined, quantity: number, customization?: { name: string; number: string }, coolPrint?: { selected: boolean; name: string; price: number }) => void;'
);
code = code.replace(
  /const updateQuantity = \(productId: string, selectedSize: string \| undefined, selectedColor: string \| undefined, quantity: number, customization\?: \{ name: string; number: string \}\) => \{/g,
  'const updateQuantity = (productId: string, selectedSize: string | undefined, selectedColor: string | undefined, quantity: number, customization?: { name: string; number: string }, coolPrint?: { selected: boolean; name: string; price: number }) => {'
);
code = code.replace(
  /removeFromCart\(productId, selectedSize, selectedColor, customization\);/g,
  'removeFromCart(productId, selectedSize, selectedColor, customization, coolPrint);'
);
code = code.replace(
  /item\.id === productId && item\.selectedSize === selectedSize && item\.selectedColor === selectedColor && isCustomSame\(item\.customization, customization\)\n\s*\? \{ \.\.\.item, quantity \}/g,
  'item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor && isCustomSame(item.customization, customization) && isCoolPrintSame(item.coolPrint, coolPrint)\n            ? { ...item, quantity }'
);

fs.writeFileSync(path, code);
console.log("Success");
