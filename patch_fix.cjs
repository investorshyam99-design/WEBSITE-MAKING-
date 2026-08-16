const fs = require('fs');
let file = fs.readFileSync('src/components/ProductInfoAccordion.tsx', 'utf8');

const regex = /  const isPlayer = product\?\.category === 'player-version';\n  const isMaster = product\?\.category === 'master-version';\n  const isFan = product\?\.category === 'fan-set';\n  const isJersey = isPlayer \|\| isMaster \|\| isFan;\n\n\n  const category = product\?\.category \|\| 'tees';\n  const isJersey = \['player-version', 'master-version', 'fan-set'\]\.includes\(category\);\n  const isPlayer = category === 'player-version';\n  const isMaster = category === 'master-version';\n  const isFan = category === 'fan-set';/;

file = file.replace(regex, `  const category = product?.category || 'tees';\n  const isJersey = ['player-version', 'master-version', 'fan-set'].includes(category);\n  const isPlayer = category === 'player-version';\n  const isMaster = category === 'master-version';\n  const isFan = category === 'fan-set';`);

fs.writeFileSync('src/components/ProductInfoAccordion.tsx', file);
