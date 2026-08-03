const fs = require('fs');
let content = fs.readFileSync('src/components/ProductInfoAccordion.tsx', 'utf8');

const newFaqContent = `Yes, we offer size exchanges if the selected size does not fit.

Exchange Conditions:

• Size exchange requests must be made within **24 hours** of delivery.
• A complete **uncut unboxing video** is mandatory for every exchange request.
• The product must be unused, unwashed, and returned with all original tags and packaging.
• **Customized jerseys (Name & Number printed) are NOT eligible for exchange or return.**
• If we ship the **wrong product, wrong size, damaged, or defective product**, we will provide an exchange after verification.
• Claims without an uncut unboxing video will not be accepted.
• For size exchanges, the customer is responsible for the applicable shipping charges.`;

// Let's replace the string directly. To handle bolding, we can use dangerouslySetInnerHTML or parse it. But since it's an array of objects we can change `a` to a ReactNode if we use JSX.

const jsxFaq = `(
  <div className="space-y-2">
    <p>Yes, we offer size exchanges if the selected size does not fit.</p>
    <p>Exchange Conditions:</p>
    <ul className="space-y-1 list-none">
      <li>• Size exchange requests must be made within <strong>24 hours</strong> of delivery.</li>
      <li>• A complete <strong>uncut unboxing video</strong> is mandatory for every exchange request.</li>
      <li>• The product must be unused, unwashed, and returned with all original tags and packaging.</li>
      <li>• <strong>Customized jerseys (Name & Number printed) are NOT eligible for exchange or return.</strong></li>
      <li>• If we ship the <strong>wrong product, wrong size, damaged, or defective product</strong>, we will provide an exchange after verification.</li>
      <li>• Claims without an uncut unboxing video will not be accepted.</li>
      <li>• For size exchanges, the customer is responsible for the applicable shipping charges.</li>
    </ul>
  </div>
)`;

// Let's replace the item in the array for isJersey
content = content.replace(
  '{ q: "Can I exchange my order?", a: "We offer exchange ONLY if the mistake is from our side (wrong product, wrong size sent by us, damaged product, or manufacturing defect).\\n\\nTo be eligible:\\n• The issue must be reported within 24 hours of delivery.\\n• A complete, uncut unboxing video is mandatory.\\n• The product must be unused with all original tags and packaging.\\n• Claims without an uncut unboxing video will not be accepted." },',
  `{ q: "Can I exchange or return my order?", a: ${jsxFaq} },`
);

// Do it for the second instance (tees)
content = content.replace(
  '{ q: "Can I exchange my order?", a: "We offer exchange ONLY if the mistake is from our side (wrong product, wrong size sent by us, damaged product, or manufacturing defect).\\n\\nTo be eligible:\\n• The issue must be reported within 24 hours of delivery.\\n• A complete, uncut unboxing video is mandatory.\\n• The product must be unused with all original tags and packaging.\\n• Claims without an uncut unboxing video will not be accepted." }',
  `{ q: "Can I exchange or return my order?", a: ${jsxFaq} }`
);

fs.writeFileSync('src/components/ProductInfoAccordion.tsx', content);
