const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /for \(let i = 0; i < item\.quantity; i\+\+\) \{[\s\S]*?isFirstItem = false;/g;

const replaceStr = `for (let i = 0; i < item.quantity; i++) {
          const itemFastDelivery = currentIsFastDelivery ? 50 : 0;
          const itemCodExtra = currentMode === "partial" ? 50 : 0;
          
          let itemAdvance = 0;
          let itemRemainingCod = 0;
          
          if (currentMode === "full") {
            itemAdvance = item.price + itemFastDelivery + itemCodExtra;
            itemRemainingCod = 0;
          } else {
             itemAdvance = itemCodExtra;
             itemRemainingCod = item.price + itemFastDelivery;
          }
          
          const itemTotalOrderValue = item.price + itemFastDelivery + itemCodExtra;
          const itemAmountPaid = itemAdvance;
          const itemFinalPrice = item.price;
          
          isFirstItem = false;`;

code = code.replace(regex, replaceStr);
fs.writeFileSync(path, code);
console.log("Success");
