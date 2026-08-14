const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

file = file.replace(/const calc = getOrderCalculations\(order\);\n\n                const handleImageClick = \(order: Order\) => \{/, 
`const handleImageClick = (order: Order) => {`);

file = file.replace(/function OrderCard\(\{ order, user, handleImageClick \}: \{ order: Order; user: any; handleImageClick: \(order: Order\) => void \}\) \{/, 
`function OrderCard({ order, user, handleImageClick }: { order: Order; user: any; handleImageClick: (order: Order) => void }) {\n  const calc = getOrderCalculations(order);`);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
