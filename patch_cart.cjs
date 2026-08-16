const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const search = `      let isFirstItem = true;
      for (const item of cart) {
        for (let i = 0; i < item.quantity; i++) {
          const assignedExpress = isFirstItem ? expressDeliveryCharge : 0;
          isFirstItem = false;`;

const replace = `      for (const item of cart) {
        for (let i = 0; i < item.quantity; i++) {
          const assignedExpress = deliveryMethod === "FAST" ? 50 : 0;`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/CartModal.tsx', code);
console.log('patched cart assignedExpress');
