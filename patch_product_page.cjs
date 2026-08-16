const fs = require('fs');
let file = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const oldText = `<span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">SHOP BY VARIANT :</span>`;
file = file.replace(oldText, '');

fs.writeFileSync('src/pages/ProductPage.tsx', file);
