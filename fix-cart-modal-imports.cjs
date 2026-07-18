const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

if (!code.includes('getProductReviewsInfo')) {
  code = code.replace(
    'import { CartReservationTimer } from "./CartReservationTimer";',
    'import { CartReservationTimer } from "./CartReservationTimer";\nimport { getProductReviewsInfo } from "./ReviewsSection";'
  );
}

fs.writeFileSync('src/components/CartModal.tsx', code);
