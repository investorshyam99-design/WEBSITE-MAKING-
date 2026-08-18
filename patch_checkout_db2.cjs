const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const search = `          const assignedExpress = isFirstItem ? expressDeliveryCharge : 0;
          isFirstItem = false;

          const itemFinalPrice = item.price + assignedExpress;
          const itemCodExtra = currentMode === "full" ? 0 : 50;
          const itemAdvance = currentMode === "full" ? itemFinalPrice : 50;
          const itemRemainingCod = currentMode === "full" ? 0 : itemFinalPrice;`;

const replace = `          const itemFastDelivery = isFirstItem ? fastDeliveryCharge : 0;
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
          }
          
          const itemTotalOrderValue = item.price + itemFastDelivery + itemCodExtra;
          const itemAmountPaid = itemAdvance;
          const itemFinalPrice = item.price;
          
          isFirstItem = false;`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
    console.log("Patched loop logic!");
} else {
    console.log("Search string not found!");
}
