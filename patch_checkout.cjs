const fs = require('fs');
let content = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const target1 = `          const estimate = calculateDeliveryEstimate({
            pincode: deliveryPincode,
            deliveryMethod,
            customization: !!item.customization,
            tat: deliveryTat || undefined
          });

          const docRef = await addDoc(collection(db, "orders"), {`;

const replace1 = `          const estimate = calculateDeliveryEstimate({
            pincode: deliveryPincode,
            deliveryMethod,
            customization: !!item.customization,
            tat: deliveryTat || undefined
          });

          const resolvedDeliveryType = deliveryMethod === "FAST" ? "Express" : "Surface";
          if (!deliveryMethod) {
            console.warn("Order creation: deliveryMethod is missing! Defaulting deliveryType to Surface.");
          }

          const docRef = await addDoc(collection(db, "orders"), {`;

content = content.replace(target1, replace1);

const target2 = `            productSubtotal: item.price,
            deliveryType: deliveryMethod,
            fastDeliveryCharge: itemFastDelivery,`;

const replace2 = `            productSubtotal: item.price,
            deliveryType: resolvedDeliveryType,
            fastDeliveryCharge: itemFastDelivery,`;

content = content.replace(target2, replace2);

fs.writeFileSync('src/pages/CheckoutPage.tsx', content);
