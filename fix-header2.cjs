const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(/            <button\s+onClick=\{\(\) => \{\s+if \(window\.location\.pathname \!\=\= "\/"\) navigate\("\/"\);\s+setTimeout\(\s+<\/a>\s+<\/nav>/, `          </nav>`);

fs.writeFileSync('src/components/Header.tsx', code);
