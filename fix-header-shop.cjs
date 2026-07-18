const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  /<button\s+onClick=\{\(\) => \{\s+if \(window\.location\.pathname \!\=\= "\/"\) navigate\("\/"\);\s+setTimeout\(\s+\(\) =>\s+document\s+\.getElementById\("categories"\)\s+\?\.scrollIntoView\(\{ behavior: "smooth" \}\),\s+100,\s+\);\s+\}\}\s+className="hover:text-\[\#1E2A44\] transition-colors cursor-pointer"\s+>\s+Shop\s+<\/button>/g,
  ''
);

fs.writeFileSync('src/components/Header.tsx', code);
