const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

file = file.replace(/const \[showTrackingForm, setShowTrackingForm\] = useState\(false\);/, 
`const [showTrackingForm, setShowTrackingForm] = useState(false);\n  const calc = getOrderCalculations(order);`);

file = file.replace(/onUpdatePrice\(order\.adjustedAmount[^)]*\);/g, 'onUpdatePrice(calc.adjustedAmount);');

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
