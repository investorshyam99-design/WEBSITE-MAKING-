const fs = require('fs');
let code = fs.readFileSync('src/context/ShopContext.tsx', 'utf8');

code = code.replace(
  /console\.error\("Error signing in with Google:", error\);\n\s*if \(error\.code === 'auth\/unauthorized-domain'\) {/,
  `if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed the popup, do nothing
        return;
      }
      console.error("Error signing in with Google:", error);
      if (error.code === 'auth/unauthorized-domain') {`
);

code = code.replace(
  /\s*} else if \(error\.code === 'auth\/popup-closed-by-user' \|\| error\.code === 'auth\/cancelled-popup-request'\) {\n\s*\/\/ User closed the popup, do nothing/,
  ''
);

fs.writeFileSync('src/context/ShopContext.tsx', code);
