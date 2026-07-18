const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

if (!code.includes('react-helmet-async')) {
  code = code.replace(
    'import React from "react";',
    'import React from "react";\nimport { Helmet } from "react-helmet-async";'
  );
  
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Jersey Unicorn",
    "url": "https://jerseyunicorn.com/"
  });

  const helmetString = `    <>
      <Helmet>
        <title>Jersey Unicorn | Premium Football Jerseys & Streetwear India</title>
        <meta name="description" content="Shop the best player version and fan version football jerseys, F1 merchandise, and oversized streetwear t-shirts in India." />
        <link rel="canonical" href="https://jerseyunicorn.com/" />
        <script type="application/ld+json">
          {\`${schema}\`}
        </script>
      </Helmet>`;
      
  code = code.replace('  return (\n    <>', '  return (\n' + helmetString);
  fs.writeFileSync('src/pages/Home.tsx', code);
}
