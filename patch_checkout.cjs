const fs = require('fs');
let file = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const oldCode = `          const itemFinalPrice = item.price;
          const itemAdvance = 50;
          const itemRemainingCod = currentMode === "full" ? 0 : itemFinalPrice;`;

const newCode = `          const itemFinalPrice = item.price;
          const itemAdvance = currentMode === "full" ? 0 : 50;
          const itemRemainingCod = currentMode === "full" ? 0 : itemFinalPrice;`;

file = file.replace(oldCode, newCode);

const oldDocRef = `            codCharges: 0,
            advancePaid: itemAdvance,
            remainingCodAmount: itemRemainingCod,`;

const newDocRef = `            codCharges: 0,
            advancePaid: itemAdvance,
            amountPaid: currentMode === "full" ? itemFinalPrice : itemAdvance,
            codAmount: itemRemainingCod,
            remainingCodAmount: itemRemainingCod,`;

file = file.replace(oldDocRef, newDocRef);

fs.writeFileSync('src/pages/CheckoutPage.tsx', file);
