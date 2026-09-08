const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /pincode: deliveryPincode,\s*address,\s*\}\);/g,
  'pincode: deliveryPincode,\n          });'
);

fs.writeFileSync(path, code);
console.log("Success");
