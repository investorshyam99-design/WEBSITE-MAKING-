const fs = require('fs');
let code = fs.readFileSync('src/pages/CollectionPage.tsx', 'utf8');

code = code.replace(
  `          )}
          )}
        </div>`,
  `          )}
        </div>`
);

fs.writeFileSync('src/pages/CollectionPage.tsx', code);
