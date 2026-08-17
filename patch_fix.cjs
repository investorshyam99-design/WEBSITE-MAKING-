const fs = require('fs');
let code = fs.readFileSync('src/services/pincode.ts', 'utf8');

code = code.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/services/pincode.ts', code);
console.log('fixed syntax errors');
