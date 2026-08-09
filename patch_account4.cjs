const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

file = file.replace(/\(doc\) \=\> \(\{ id\: doc\.id\, \.\.\.doc\.data\(\) \}\)/g, '(doc) => ({ id: doc.id, ...(doc.data() as any) })');

fs.writeFileSync('src/pages/AccountPage.tsx', file);
