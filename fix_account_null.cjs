const fs = require('fs');
let content = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

content = content.replace(
  'const product = products.find(p => p.name === order.productName || p.id === (order as any).productId);',
  'const product = products.find(p => p?.name === order?.productName || p?.id === (order as any)?.productId);'
);

content = content.replace(
  '{item.quantity}x {item.name} (Size: {item.size})',
  '{item?.quantity}x {item?.name} (Size: {item?.size})'
);

content = content.replace(
  'order.productName?.toLowerCase().includes(',
  '(order?.productName || "").toLowerCase().includes('
);

fs.writeFileSync('src/pages/AccountPage.tsx', content);
