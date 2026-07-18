const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewsSection.tsx', 'utf8');

code = code.replace(/const seed = product\.id\.split/g, `if (!product || !product.id) return { productReviews: [], avgRating: "4.5", reviewCount: 100, category: "tees" };
  const seed = String(product.id).split`);

fs.writeFileSync('src/components/ReviewsSection.tsx', code);
