const fs = require('fs');
let file = fs.readFileSync('src/components/SEO.tsx', 'utf8');

file = file.replace(/schemas\?: any\[\];/, 'schemas?: any[];\n  isHome?: boolean;\n  keywords?: string;');
file = file.replace(/export function SEO\(\{ title, description, schema, schemas, image, type, product, canonicalUrl \}: SEOProps\) \{/, 'export function SEO({ title, description, schema, schemas, image, type, product, canonicalUrl, isHome, keywords }: SEOProps) {');

file = file.replace(/if \(description\) \{/, `if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }
    
    if (description) {`);
    
file = file.replace(/\[title, description, schema, schemas, image, type, product, canonicalUrl\]/, '[title, description, schema, schemas, image, type, product, canonicalUrl, isHome, keywords]');

fs.writeFileSync('src/components/SEO.tsx', file);
