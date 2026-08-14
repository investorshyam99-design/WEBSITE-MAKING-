const fs = require('fs');
let file = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

if (!file.includes("getOrderCalculations")) {
    file = file.replace(/import \{ Link \} from 'react-router-dom';/, "import { Link } from 'react-router-dom';\nimport { getOrderCalculations } from '../lib/utils';");
}

file = file.replace(
/const basePriceRaw = o\.price \?\? o\.finalTotal \?\? getOrderPrice\(o\);\s*const basePrice = o\.finalTotalAmount[^;]+;\s*let revenue = basePrice;\s*if \(o\.paymentMode === 'partial'[\s\S]*?\} else if \(o\.paymentMode === 'full'\) \{\s*revenue = basePrice;\s*\}/,
`const calc = getOrderCalculations(o);
      const revenue = calc.finalTotalAmount;`
);

file = file.replace(
/const basePriceRaw = order\.price \?\? order\.finalTotal \?\? getOrderPrice\(order\);\s*const basePrice = order\.finalTotalAmount[^;]+;\s*let rev = basePrice;\s*if \(order\.paymentMode === 'partial'[\s\S]*?\} else if \(order\.paymentMode === 'full'\) \{\s*rev = basePrice;\s*\}/,
`const calc = getOrderCalculations(order);
          const rev = calc.finalTotalAmount;`
);

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', file);
