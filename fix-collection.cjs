const fs = require('fs');
let code = fs.readFileSync('src/pages/CollectionPage.tsx', 'utf8');

code = code.replace(
  "import { Helmet } from 'react-helmet-async';",
  "import { SEO } from '../components/SEO';"
);

code = code.replace(
  /<Helmet>([\s\S]*?)<\/Helmet>/,
  `<SEO 
        title={\`\${collectionData.title} | Jersey Unicorn\`}
        description={collectionData.desc}
      />`
);

fs.writeFileSync('src/pages/CollectionPage.tsx', code);
