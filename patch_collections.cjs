const fs = require('fs');

let file = fs.readFileSync('src/pages/CollectionPage.tsx', 'utf8');

// Update dynamic title
file = file.replace(/title: \`Buy \$\{formattedName\} Football Jerseys Online India \| Jersey Unicorn\`,/, 'title: `${formattedName} Football Jerseys India – Jersey Unicorn`,');

fs.writeFileSync('src/pages/CollectionPage.tsx', file);

// Also need to check if there are hardcoded SEO titles in a constants file.
