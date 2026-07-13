const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const injection = `
  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME10') {
      const discount = subtotal * 0.1;
      setDiscountAmount(discount);
      setCouponMessage({ type: 'success', text: 'Coupon applied successfully!' });
    } else {
      setDiscountAmount(0);
      setCouponMessage({ type: 'error', text: 'Invalid coupon code' });
    }
  };

  const getDominantCategory = () => {
    if (cart.length === 0) return "football";
    const categories = cart.map(item => {
      const p = products.find(prod => prod.id === item.id);
      return p ? p.category : "football";
    });
    
    const counts = categories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const dominantCategory = getDominantCategory();
  const recommendedProducts = products
    .filter(p => p.category === dominantCategory && !cart.some(c => c.id === p.id))
    .slice(0, 4);

  let recommendationHeading = "⭐ Customers who bought this also loved these designs";
  if (dominantCategory === "football") {
    recommendationHeading = "🔥 Trending in the Football Collection";
  } else if (dominantCategory === "formula1") {
    recommendationHeading = "🏁 More from the Formula 1 Collection";
  } else if (dominantCategory === "anime") {
    recommendationHeading = "🎨 More from the Anime Collection";
  } else if (dominantCategory === "word-drip") {
    recommendationHeading = "🖋 More from the WordDrip Collection";
  }
`;

// Insert after `const total = ...`
const target = 'const total = Math.max(0, subtotal - discountAmount);';
if (code.includes(target)) {
  code = code.replace(target, target + injection);
  fs.writeFileSync('src/components/CartModal.tsx', code);
  console.log("Success");
} else {
  console.log("Target not found");
}
