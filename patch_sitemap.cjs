const fs = require('fs');

let sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');

const sampleProducts = [
  "argentina-home-jersey-2026-player-version",
  "portugal-away-jersey-2026-fan-version",
  "real-madrid-home-jersey-2025-26-player-version",
  "manchester-united-home-jersey-2025-26-fan-set",
  "barcelona-away-jersey-2025-26-master-version"
];

let productUrls = '';
sampleProducts.forEach(slug => {
  productUrls += `
  <url>
    <loc>https://jerseyunicorn.com/products/${slug}</loc>
    <lastmod>2026-08-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
});

sitemap = sitemap.replace('</urlset>', productUrls + '\n</urlset>');
fs.writeFileSync('public/sitemap.xml', sitemap);

