const fs = require('fs');
let code = fs.readFileSync('src/components/ProductInfoAccordion.tsx', 'utf8');

code = code.replace(/if \(category === 'shorts'\) \{[\s\S]*?\}\s*return \[/m,
`if (category === 'shorts') {
      return [
        { q: "Are these suitable for everyday wear?", a: "Yes! The relaxed fit and 240 GSM construction make them perfect for daily casual and streetwear styling." },
        { q: "What is the return policy?", a: "We offer a flexible exchange policy for any sizing issues." }
      ];
    }
    if (category === 'glasses') {
      return [
        { q: "Do these provide UV protection?", a: "Yes, our glasses are designed to offer premium UV protection alongside their stylish aesthetic." },
        { q: "What is the return policy?", a: "We offer a flexible exchange policy if you encounter any manufacturing defects." },
        { q: "How should I clean them?", a: "We recommend wiping gently with a clean microfiber cloth. Avoid using harsh chemicals." }
      ];
    }
    
    return [`);

fs.writeFileSync('src/components/ProductInfoAccordion.tsx', code, 'utf8');
