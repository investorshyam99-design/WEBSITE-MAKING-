const fs = require('fs');
let content = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

content = content.replace(
  'if (user.email === "investorshyam99@gmail.com") {',
  'if (user?.email === "investorshyam99@gmail.com") {'
);

fs.writeFileSync('src/pages/AccountPage.tsx', content);
