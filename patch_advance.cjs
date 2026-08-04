const fs = require('fs');

const replaceInFile = (file, search, replace) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
};

// CartModal.tsx
let cartModal = fs.readFileSync('src/components/CartModal.tsx', 'utf8');
cartModal = cartModal.replace(/150 \* item\.quantity/g, '50 * item.quantity');
fs.writeFileSync('src/components/CartModal.tsx', cartModal);

// CheckoutPage.tsx
let checkoutPage = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');
checkoutPage = checkoutPage.replace(/150 \* item\.quantity/g, '50 * item.quantity');
fs.writeFileSync('src/pages/CheckoutPage.tsx', checkoutPage);

// AdminDashboard.tsx
let adminDashboard = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
adminDashboard = adminDashboard.replace(/₹150 confirmation payment/g, '₹50 confirmation payment');
adminDashboard = adminDashboard.replace(/150 \* effectiveQuantity/g, '50 * effectiveQuantity');
fs.writeFileSync('src/components/AdminDashboard.tsx', adminDashboard);

// AdminProfitsDashboard.tsx
let adminProfits = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');
adminProfits = adminProfits.replace(/150 \* effectiveQty/g, '50 * effectiveQty');
adminProfits = adminProfits.replace(/150 \* eq/g, '50 * eq');
fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', adminProfits);

// server.ts
let serverTs = fs.readFileSync('server.ts', 'utf8');
serverTs = serverTs.replace(/150 \* items/g, '50 * items');
fs.writeFileSync('server.ts', serverTs);

