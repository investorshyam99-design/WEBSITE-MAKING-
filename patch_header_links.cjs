const fs = require('fs');
let file = fs.readFileSync('src/components/Header.tsx', 'utf8');

file = file.replace(/<Link to="\/collection\/t-shirts"/g, '<Link to="/collection/tees"');
file = file.replace(/>T-Shirts<\/Link>/g, '>Tees</Link>');

fs.writeFileSync('src/components/Header.tsx', file);
