const fs = require('fs');
let code = fs.readFileSync('src/components/ProductInfoAccordion.tsx', 'utf8');

code = code.replace(/if \(category === 'shorts'\) return \["Machine wash cold", "Wash inside out where applicable", "Use mild detergent", "Do not bleach", "Avoid high heat", "Do not iron directly over prints\/details", "Air dry when possible"\];/,
`if (category === 'shorts') return ["Machine wash cold", "Wash inside out where applicable", "Use mild detergent", "Do not bleach", "Avoid high heat", "Do not iron directly over prints/details", "Air dry when possible"];
      if (category === 'glasses') return ["Wipe gently with a microfiber cloth", "Avoid using harsh chemicals or glass cleaners", "Store in a protective case when not in use", "Keep away from excessive heat"];`);

fs.writeFileSync('src/components/ProductInfoAccordion.tsx', code, 'utf8');
