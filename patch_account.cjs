const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

if (!file.includes("getOrderCalculations")) {
    file = file.replace(/import \{ Header \} from "\.\.\/components\/Header";/, 'import { Header } from "../components/Header";\nimport { getOrderCalculations } from "../lib/utils";');
}

file = file.replace(/const effectiveQuantity = [^\n]*;/g, (match) => {
    return match + `\n  const calc = getOrderCalculations(order);`;
});

file = file.replace(/₹\{\(order\.finalTotalAmount[^}]*\}\s*<\/p>/g,
    '₹{calc.finalTotalAmount.toLocaleString("en-IN")}\n            </p>'
);

file = file.replace(/₹\{\([\s\S]*?order\.codAmount !== undefined \? order\.codAmount :[\s\S]*? \)\.toLocaleString\("en-IN"\)\}/g,
    '₹{calc.codAmount.toLocaleString("en-IN")}'
);


fs.writeFileSync('src/pages/AccountPage.tsx', file);
