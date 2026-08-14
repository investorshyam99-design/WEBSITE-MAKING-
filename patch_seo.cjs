const fs = require('fs');

let file = fs.readFileSync('src/components/SEO.tsx', 'utf8');

file = file.replace(/schema\?: any;/, 'schema?: any;\n  schemas?: any[];');
file = file.replace(/const \{ title, description, schema, image, type, product, canonicalUrl \} = props;/g, '');

file = file.replace(/export function SEO\(\{ title, description, schema, image, type, product, canonicalUrl \}: SEOProps\) \{/, 'export function SEO({ title, description, schema, schemas, image, type, product, canonicalUrl }: SEOProps) {');

file = file.replace(/let finalSchema = schema;/, `let finalSchema = schema;
    if (schemas && schemas.length > 0) {
      finalSchema = {
        "@context": "https://schema.org",
        "@graph": schemas.map(s => {
           // If a schema already has @context, we can keep it or remove it since it's at the root graph level, but usually it's fine.
           return s;
        })
      };
    }`);
    
file = file.replace(/\[title, description, schema, image, type, product, canonicalUrl\]/, '[title, description, schema, schemas, image, type, product, canonicalUrl]');

fs.writeFileSync('src/components/SEO.tsx', file);
