const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  /<button\s+onClick=\{\(\) => \{\s+if \(window\.location\.pathname \!\=\= "\/"\) navigate\("\/"\);\s+setTimeout\(\s+\(\) =>\s+document\s+\.getElementById\("categories"\)\s+\?\.scrollIntoView\(\{ behavior: "smooth" \}\),\s+100,\s+\);\s+\}\}\s+className="hover:text-\[\#1E2A44\] transition-colors cursor-pointer"\s+>\s+Categories\s+<\/button>/g,
  '<Link to="/collections/all" className="hover:text-[#1E2A44] transition-colors cursor-pointer">Shop</Link>\n            <Link to="/collections/player-version" className="hover:text-[#1E2A44] transition-colors cursor-pointer">Player Version</Link>\n            <Link to="/collections/t-shirts" className="hover:text-[#1E2A44] transition-colors cursor-pointer">T-Shirts</Link>'
);

fs.writeFileSync('src/components/Header.tsx', code);
