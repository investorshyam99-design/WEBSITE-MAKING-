const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

file = file.replace(/const handleImageClick = \(order: Order\) => \{/, 
`const calc = getOrderCalculations(order);\n\n                const handleImageClick = (order: Order) => {`);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
