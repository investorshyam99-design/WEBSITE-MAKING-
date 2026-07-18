const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  "import { Helmet } from \"react-helmet-async\";",
  ""
);

const regex = /<Helmet>[\s\S]*?<\/Helmet>/;
code = code.replace(regex, `<SEO \n        title="Jersey Unicorn | Gen Z Streetwear & Oversized Back-Print Tees"\n        description="Buy premium oversized back-print quote t-shirts in India. Bold banter tees for football, F1, anime, music artists, and wordplay. Elevate your street style."\n        keywords="football fan tees india, f1 tees india, anime tshirts india, artist graphic tees india, quote tshirts india, oversized back print tees india, gen z streetwear india"\n      />`);

fs.writeFileSync('src/pages/Home.tsx', code);
