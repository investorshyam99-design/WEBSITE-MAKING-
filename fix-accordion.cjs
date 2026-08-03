const fs = require('fs');
let content = fs.readFileSync('src/components/ProductInfoAccordion.tsx', 'utf8');

content = content.replace(
  '<p>{faq.a}</p>',
  '<div className="text-sm text-gray-600">{faq.a}</div>'
);

fs.writeFileSync('src/components/ProductInfoAccordion.tsx', content);
