const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

file = file.replace(/s\.includes\("completed"\) \|\|/, 's.includes("completed") ||\n          s.includes("cancelled") ||');

const oldStatusBadge = /<span className=\{\`text-xs font-black uppercase tracking-widest px-3 py-1 rounded \$\{order\.status\?\.toLowerCase\(\)\.includes\('pending'\) \? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'\}\`\}>\n\s*\{order\.status \|\| "Pending"\}\n\s*<\/span>/g;

const newStatusBadge = `<span className={\`text-xs font-black uppercase tracking-widest px-3 py-1 rounded \${
              order.status?.toLowerCase().includes('cancelled') 
                ? 'bg-red-100 text-red-800' 
                : order.status?.toLowerCase().includes('pending') 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-green-100 text-green-800'
            }\`}>
              {order.status || "Pending"}
            </span>`;

file = file.replace(oldStatusBadge, newStatusBadge);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
