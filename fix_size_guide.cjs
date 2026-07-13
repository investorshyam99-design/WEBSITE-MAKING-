const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

code = code.replace(
    'src="https://i.imgur.com/t4wt92I.png"',
    'src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=2000&auto=format&fit=crop"'
);
fs.writeFileSync('src/pages/ProductPage.tsx', code);
