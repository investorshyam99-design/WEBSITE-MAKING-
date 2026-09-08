const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /if \(currentMode === "full"\) \{\s*itemAdvance = item\.price \+ itemFastDelivery \+ itemCodExtra;\s*itemRemainingCod = 0;\s*\} else \{\s*itemAdvance = itemCodExtra;\s*itemRemainingCod = item\.price \+ itemFastDelivery;\s*\}/;

const replaceStr = `if (currentMode === "full") {
            itemAdvance = item.price + itemFastDelivery + itemCodExtra;
            itemRemainingCod = 0;
          } else {
             itemAdvance = itemCodExtra + itemFastDelivery;
             itemRemainingCod = item.price;
          }`;

code = code.replace(regex, replaceStr);
fs.writeFileSync(path, code);
console.log("Success");
