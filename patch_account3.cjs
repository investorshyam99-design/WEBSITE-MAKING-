const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

file = file.replace(/\}\);\n      \}\n      \/\/ Sort ascending/, '});\n      // Sort ascending');

fs.writeFileSync('src/pages/AccountPage.tsx', file);
