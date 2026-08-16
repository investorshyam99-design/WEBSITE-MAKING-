const fs = require('fs');
let file = fs.readFileSync('src/data/products.ts', 'utf8');

file = file.replace(
    /else if \(tags\.includes\('track pant'\) \|\| tags\.includes\('track pants'\) \|\| tags\.includes\('jogger'\)\) \{/,
    "else if (tags.includes('track pant') || tags.includes('track pants') || tags.includes('trackpants') || tags.includes('jogger')) {"
);

file = file.replace(
    /else if \(titleLower\.includes\('track pant'\) \|\| titleLower\.includes\('jogger'\)\) category = 'track-pants';/,
    "else if (titleLower.includes('track pant') || titleLower.includes('trackpants') || titleLower.includes('jogger')) category = 'track-pants';"
);

fs.writeFileSync('src/data/products.ts', file);
