const fs = require('fs');
let code = fs.readFileSync('src/components/ProductInfoAccordion.tsx', 'utf8');

code = code.replace(/\} else if \(category === 'shorts'\) \{[\s\S]*?\];\s*\}/m,
`} else if (category === 'shorts') {
        apparelFaqs = [
            { q: "What GSM are the shorts?", a: "The shorts are 240 GSM." },
            { q: "What is the fit?", a: "They have an oversized/relaxed fit." },
            { q: "Can I return or exchange the shorts?", a: "No. Shorts are non-returnable and non-exchangeable." }
        ];
    } else if (category === 'glasses') {
        apparelFaqs = [
            { q: "Do these provide UV protection?", a: "Yes, our glasses are designed to offer premium UV protection alongside their stylish aesthetic." },
            { q: "What is the return policy?", a: "We offer a flexible exchange policy if you encounter any manufacturing defects." },
            { q: "How should I clean them?", a: "We recommend wiping gently with a clean microfiber cloth. Avoid using harsh chemicals." }
        ];
    }`);

fs.writeFileSync('src/components/ProductInfoAccordion.tsx', code, 'utf8');
