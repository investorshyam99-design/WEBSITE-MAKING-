const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /\{order\.customizationStatus === "NO" && \(\n\s*<span className="text-\[10px\] text-rose-500 font-bold ml-1 px-1\.5 py-0\.5 bg-rose-50 rounded">Deducted: ₹\{order\.customizationDeduction \|\| 0\}<\/span>\n\s*\)\}/;

file = file.replace(regex, '');

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
