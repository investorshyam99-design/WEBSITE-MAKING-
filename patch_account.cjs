const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// Replace the entire if (user?.email === "investorshyam99@gmail.com") block
const oldBlockStart = `      if (user?.email === "investorshyam99@gmail.com") {`;
const oldBlockEnd = `      } else if (user) {`;
const startIdx = file.indexOf(oldBlockStart);
const endIdx = file.indexOf(oldBlockEnd);

if (startIdx !== -1 && endIdx !== -1) {
    file = file.slice(0, startIdx) + `      if (user) {` + file.slice(endIdx + 17);
}

// Ensure the filter block applies universally (remove the `if (user?.email !== "investorshyam99@gmail.com") {` around it)
file = file.replace(/if \(user\?\.email \!\=\= "investorshyam99@gmail\.com"\) \{\n\s*fetchedOrders = fetchedOrders\.filter/, `// Always filter out drafts and internal statuses
        fetchedOrders = fetchedOrders.filter`);

// Find where that block ends and remove the closing brace.
// Instead of complex regex, let's just do a string replacement for the exact lines.

fs.writeFileSync('src/pages/AccountPage.tsx', file);
