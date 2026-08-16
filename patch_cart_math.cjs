const fs = require('fs');

let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const search = `          const itemFinalPrice = item.price + assignedExpress;
          const itemCodExtra = paymentMode === "full" ? 0 : 50;
          const itemAdvance = paymentMode === "full" ? itemFinalPrice : 50;
          const itemRemainingCod = paymentMode === "full" ? 0 : itemFinalPrice;`;

const replace = `          const itemFinalPrice = item.price + assignedExpress;
          const itemCodExtra = paymentMode === "full" ? 0 : 50;
          const itemAdvance = paymentMode === "full" ? itemFinalPrice : 50 + assignedExpress;
          const itemRemainingCod = paymentMode === "full" ? 0 : item.price;`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/CartModal.tsx', code);
console.log('patched cart math');
