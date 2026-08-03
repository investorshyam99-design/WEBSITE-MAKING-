const fs = require('fs');
let content = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');
content = content.replace(
  'return dateB.getTime() - dateA.getTime();',
  'return dateA.getTime() - dateB.getTime();'
);
fs.writeFileSync('src/pages/AccountPage.tsx', content);

let contentAdmin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
contentAdmin = contentAdmin.replace(
  'return timeB - timeA;',
  'return timeA - timeB;'
);
fs.writeFileSync('src/pages/AdminDashboard.tsx', contentAdmin);

