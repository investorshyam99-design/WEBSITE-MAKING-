const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const search = `      const createdOrderIds = [];
      let isFirstItem = true;
      for (const item of jerseyCart) {
        for (let i = 0; i < item.quantity; i++) {
          const assignedExpress = isFirstItem ? expressDeliveryCharge : 0;
          isFirstItem = false;
          const itemFinalPrice = item.price + assignedExpress;
          const itemCodExtra = currentMode === "full" ? 0 : 50;
          const itemAdvance = currentMode === "full" ? itemFinalPrice : 50;
          const itemRemainingCod = currentMode === "full" ? 0 : itemFinalPrice;`;

const replace = `      const createdOrderIds = [];
      let isFirstItem = true;
      for (const item of jerseyCart) {
        for (let i = 0; i < item.quantity; i++) {
          const itemFastDelivery = isFirstItem ? fastDeliveryCharge : 0;
          const itemCodExtra = isFirstItem ? codHandlingCharge : 0;
          
          let itemAdvance = 0;
          let itemRemainingCod = 0;
          
          if (currentMode === "full") {
            itemAdvance = item.price + itemFastDelivery + itemCodExtra;
            itemRemainingCod = 0;
          } else {
             // For COD, advance is just the charges, wait, if it's the first item:
             if (isFirstItem) {
                itemAdvance = advanceToCollect; // all advance paid on first item
             } else {
                itemAdvance = 0;
             }
             itemRemainingCod = item.price;
          }
          
          const itemTotalOrderValue = item.price + itemFastDelivery + itemCodExtra;
          const itemAmountPaid = itemAdvance;
          
          isFirstItem = false;`;

code = code.replace(search, replace);

const docSearch = `            price: itemFinalPrice,
            originalPrice: item.price,
            codCharges: itemCodExtra,
            advancePaid: itemAdvance,
            amountPaid: currentMode === "full" ? itemFinalPrice : itemAdvance,
            codAmount: itemRemainingCod,
            remainingCodAmount: itemRemainingCod,
            finalTotal: itemFinalPrice + itemCodExtra,
            status: currentMode === "full" ? "pending full payment" : "pending advance payment",
            paymentMode: currentMode,
            expressDeliveryCharge: assignedExpress,`;

const docReplace = `            productSubtotal: item.price,
            deliveryType: deliveryMethod,
            fastDeliveryCharge: itemFastDelivery,
            codHandlingCharge: itemCodExtra,
            totalOrderValue: itemTotalOrderValue,
            amountPaid: itemAmountPaid,
            codAmount: itemRemainingCod,
            
            // Legacy / compatibility fields
            price: item.price,
            originalPrice: item.price,
            codCharges: itemCodExtra,
            advancePaid: itemAdvance,
            remainingCodAmount: itemRemainingCod,
            finalTotal: itemTotalOrderValue,
            status: currentMode === "full" ? "pending full payment" : "pending advance payment",
            paymentMode: currentMode,
            expressDeliveryCharge: itemFastDelivery,`;

code = code.replace(docSearch, docReplace);

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
console.log("Patched DB save logic");
