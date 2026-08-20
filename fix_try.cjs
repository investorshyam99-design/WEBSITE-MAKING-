const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/    try \{\s*try \{/, '    try {');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Fixed try block.");
