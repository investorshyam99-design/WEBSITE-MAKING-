const fs = require('fs');

const files = ['src/components/CartModal.tsx', 'src/pages/CheckoutPage.tsx'];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/expectedDeliveryStart: estimate.estimatedStartDate.toISOString\(\),/g, 'expectedDeliveryStart: estimate.estimatedStartDate ? estimate.estimatedStartDate.toISOString() : "",');
    code = code.replace(/expectedDeliveryEnd: estimate.estimatedEndDate.toISOString\(\),/g, 'expectedDeliveryEnd: estimate.estimatedEndDate ? estimate.estimatedEndDate.toISOString() : "",');
    fs.writeFileSync(file, code);
  }
}
console.log('patched expected delivery dates');
