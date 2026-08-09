const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const startStr = `        {user?.email === "investorshyam99@gmail.com" ? (`;
const endStr = `        ) : (`;

const startIndex = file.indexOf(startStr);
const endIndex = file.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    // Remove the ternary operator and just keep the customer view
    file = file.substring(0, startIndex) + file.substring(endIndex + endStr.length);
    // There is a closing brace at the very end of this ternary block that needs to be removed.
    // Let's find it. It should be right before `</main>`
    file = file.replace(/        \)\}\n      <\/main>/, '      </main>');
}

fs.writeFileSync('src/pages/AccountPage.tsx', file);
