const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

// Replace usage inside the loop
const loopSearch = `          const itemFastDelivery = isFirstItem ? fastDeliveryCharge : 0;
          const itemCodExtra = isFirstItem ? codHandlingCharge : 0;
          
          let itemAdvance = 0;
          let itemRemainingCod = 0;
          
          if (currentMode === "full") {
            itemAdvance = item.price + itemFastDelivery + itemCodExtra;
            itemRemainingCod = 0;
          } else {
             if (isFirstItem) {
                itemAdvance = advanceToCollect; 
             } else {
                itemAdvance = 0;
             }
             itemRemainingCod = item.price;
          }`;

const loopReplace = `          const itemFastDelivery = isFirstItem ? currentFastDeliveryCharge : 0;
          const itemCodExtra = isFirstItem ? currentCodHandlingCharge : 0;
          
          let itemAdvance = 0;
          let itemRemainingCod = 0;
          
          if (currentMode === "full") {
            itemAdvance = item.price + itemFastDelivery + itemCodExtra;
            itemRemainingCod = 0;
          } else {
             if (isFirstItem) {
                itemAdvance = currentAdvanceToCollect; 
             } else {
                itemAdvance = 0;
             }
             itemRemainingCod = item.price;
          }`;

if (code.includes(loopSearch)) {
    code = code.replace(loopSearch, loopReplace);
}

// Replace finalAmountToPay
code = code.replace(/const finalAmountToPay = currentMode === "full" \? advanceToCollect : advanceToCollect;/g, 'const finalAmountToPay = currentAdvanceToCollect;');
code = code.replace(/const paidAmount = advanceToCollect;/g, 'const paidAmount = currentAdvanceToCollect;');

// Replace alerts
code = code.replace(/₹\$\{advanceToCollect\}/g, '₹${currentAdvanceToCollect}');
code = code.replace(/₹\$\{codAmount\}/g, '₹${currentCodAmount}');

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
console.log("Patched variables inside handleCheckout");
