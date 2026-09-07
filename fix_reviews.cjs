const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewsSection.tsx', 'utf8');

code = code.replace(/\} else if \(product.category === 'shorts'\) \{/g,
`} else if (product.category === 'glasses') {
    templates = [
      "The build quality on these {product} is incredible. True premium feel.",
      "Best sunglasses I've bought. The UV protection and styling are just insane.",
      "Vibe is unmatched. Fits exactly how stylish glasses should. The frames feel so premium.",
      "Really premium materials used for this. The aesthetic appearance is top tier.",
      "Gen Z approved. Perfect style and the comfort is completely flawless for everyday wear."
    ];
  } else if (product.category === 'shorts') {`);

fs.writeFileSync('src/components/ReviewsSection.tsx', code, 'utf8');
