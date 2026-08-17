const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

const search = `      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: jerseyCart,
          fullName,
          address: combinedAddress,
          phone,
          paymentMode: currentMode,
          finalAmount: finalAmountToPay,
        }),
      });`;

const replace = `      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: jerseyCart,
          fullName,
          address: combinedAddress,
          phone,
          paymentMode: currentMode,
          deliveryMethod,
          finalAmount: finalAmountToPay,
        }),
      });`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
    console.log('patched checkout page');
} else {
    console.log('could not find search string in checkout page');
}
