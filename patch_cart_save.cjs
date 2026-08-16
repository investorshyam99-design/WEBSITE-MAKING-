const fs = require('fs');
let file = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

if (!file.includes('calculateDeliveryEstimate')) {
  file = file.replace(/import \{ addDoc, collection, serverTimestamp, getDocs, limit, query, orderBy, doc, updateDoc \} from "firebase\/firestore";/,
  `import { addDoc, collection, serverTimestamp, getDocs, limit, query, orderBy, doc, updateDoc } from "firebase/firestore";\nimport { calculateDeliveryEstimate } from "../lib/delivery";`);
}

const regexLoop = /for \(const item of cart\) \{\s*for \(let i = 0; i < item\.quantity; i\+\+\) \{\s*const itemFinalPrice = item\.price;\s*const itemCodExtra = 0;\s*const itemAdvance = paymentMode === "partial" \? 50 : itemFinalPrice;\s*const itemRemainingCod = paymentMode === "partial" \? itemFinalPrice : 0;/;
const replacementLoop = `let isFirstItem = true;
      for (const item of cart) {
        for (let i = 0; i < item.quantity; i++) {
          const assignedExpress = isFirstItem ? expressDeliveryCharge : 0;
          isFirstItem = false;
          
          const itemFinalPrice = item.price + assignedExpress;
          const itemCodExtra = 0;
          const itemAdvance = paymentMode === "partial" ? 50 : itemFinalPrice;
          const itemRemainingCod = paymentMode === "partial" ? (itemFinalPrice - 50) : 0;
          
          const estimate = calculateDeliveryEstimate({
            pincode,
            deliveryMethod,
            customization: !!item.customization
          });`;
file = file.replace(regexLoop, replacementLoop);

const regexSave = /paymentMode,\s*createdAt: serverTimestamp\(\),/;
const replacementSave = `paymentMode,
            expressDeliveryCharge: assignedExpress,
            deliveryMethod,
            deliveryPincode: pincode,
            expectedDeliveryStart: estimate.estimatedStartDate.toISOString(),
            expectedDeliveryEnd: estimate.estimatedEndDate.toISOString(),
            customizationProcessingDays: estimate.processingDays,
            createdAt: serverTimestamp(),`;
file = file.replace(regexSave, replacementSave);

const regexAlert = /if \(paymentMode === "full"\) \{\s*alert\([\s\S]*?\} else \{\s*alert\(\s*`Payment Successful!\\n✅ ₹\$\{advanceAmount\} Advance Paid Successfully\\nOrder #\$\{nextOrderNumber\} Confirmed\\nRemaining COD Amount: ₹\$\{total\}\\nPay remaining amount during delivery.`,\s*\);\s*\}/;
const replacementAlert = `if (paymentMode === "full") {
                alert(
                  \`Payment Successful!\\n✅ ₹\${total} Paid Successfully\\nThank you for your order #\${nextOrderNumber}.\`,
                );
              } else {
                alert(
                  \`Payment Successful!\\n✅ ₹\${advanceAmount} Advance Paid Successfully\\nOrder #\${nextOrderNumber} Confirmed\\nRemaining COD Amount: ₹\${total - advanceAmount}\\nPay remaining amount during delivery.\`,
                );
              }`;
file = file.replace(regexAlert, replacementAlert);

fs.writeFileSync('src/components/CartModal.tsx', file);
