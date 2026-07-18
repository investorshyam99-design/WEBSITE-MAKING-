const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewsSection.tsx', 'utf8');

const replacement = `import React, { useMemo } from "react";
import { Star, CheckCircle2, ShieldCheck, ThumbsUp, Zap, Crown } from "lucide-react";
import { Product } from "../data/products";

export const getProductReviewsInfo = (product: Product) => {
  if (!product || !product.id) return { productReviews: [], avgRating: "4.5", reviewCount: 100, category: "tees" };
  const seed = String(product.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let currentSeed = seed;
  const getRand = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  const nameFirst = ["Rahul", "Aryan", "Vikrant", "Siddharth", "Akhil", "Rohan", "Kabir", "Jay", "Varun", "Karan", "Neil", "Aditya", "Dev", "Ishan", "Krishna", "Arjun", "Yash"];
  const nameLast = ["S.", "M.", "K.", "J.", "P.", "D.", "T.", "S.", "N.", "B.", "C.", "R.", "V.", "G."];
  
  const sizes = ["S", "M", "L", "XL", "XXL"];
  const heights = ["5'5\\"", "5'6\\"", "5'7\\"", "5'8\\"", "5'9\\"", "5'10\\"", "5'11\\"", "6'0\\"", "6'1\\"", "6'2\\""];

  const generateReview = (templates: string[]) => {
    const name = nameFirst[Math.floor(getRand() * nameFirst.length)] + " " + nameLast[Math.floor(getRand() * nameLast.length)];
    const rating = getRand() > 0.8 ? 4 : 5;
    const template = templates[Math.floor(getRand() * templates.length)];
    const comment = template.replace("{product}", product.name);
    
    // Generate a random date in the last 3 months
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(getRand() * 90));
    const dateString = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

    return {
      name,
      rating,
      comment,
      verified: true,
      size: sizes[Math.floor(getRand() * sizes.length)],
      height: heights[Math.floor(getRand() * heights.length)],
      date: dateString
    };
  };

  let templates: string[] = [];
  
  if (product.category === 'player-version') {
    templates = [
      "The player version quality of {product} is unmatched. Fits like a glove for my turf matches.",
      "Incredible detailing on {product}. The crest and the fabric are exactly what the pros wear.",
      "Took a while to arrive, but this player version jersey is faultless. Totally worth the premium price.",
      "The breathability on this player issue {product} is insane. Best jersey I've bought in India.",
      "I customized the name on the back. The font is spot on. Perfect for any die-hard fan."
    ];
  } else if (product.category === 'master-version') {
    templates = [
      "The master version of {product} feels so premium. The stitching is flawless.",
      "Honestly better than expected. The quality on this master version is top-tier.",
      "Very close to the authentic ones. {product} master version is 10/10.",
      "Bought this as a gift. The recipient was blown away by the quality of this master version jersey.",
      "Material is very comfortable and the fit is perfect for casual wear. Highly recommend."
    ];
  } else if (product.category === 'fan-set' || product.category === 'fan-version') {
    templates = [
      "Great value for money! The {product} fan version looks great and feels comfortable.",
      "For the price, you can't beat this fan version. Perfect for match days at the pub.",
      "Colors are vibrant and it washes well. Very happy with my {product}.",
      "Awesome quality fan jersey. Doesn't feel cheap at all. Will buy more.",
      "Got this for my brother. He wears it everywhere. Good everyday jersey."
    ];
  } else {
    // Tees / Streetwear / F1 / Anime
    if (product.name.toLowerCase().includes('f1') || product.name.toLowerCase().includes('formula')) {
      templates = [
        "Sick F1 tee! The oversized fit is perfect and the print quality is crazy.",
        "As a huge racing fan, this {product} is exactly what I wanted. Heavyweight cotton feels premium.",
        "Great streetwear vibe for race weekends. Print hasn't faded after multiple washes.",
        "The fit on this F1 shirt is fire. Definitely going one size down next time for a tighter look, but love the baggy feel."
      ];
    } else {
      templates = [
        "The streetwear aesthetic of {product} is on point. Heavy cotton, great drop shoulder fit.",
        "Best oversized tee I've bought. The print on {product} feels like it will last forever.",
        "Vibe is unmatched. Fits exactly how an oversized tee should. Wore it to a concert and got compliments.",
        "Really premium blank used for this. The quote on the back is printed so cleanly.",
        "Gen Z approved. Fits perfectly for that baggy streetwear look. Fast delivery too."
      ];
    }
  }

  // Generate Portuguese and Barcelona specific reviews based on product name
  if (product.name.toLowerCase().includes('portugal')) {
    templates.push("The Portugal jersey quality is incredible. Exactly what I was looking for to support the team.");
    templates.push("Amazing Portugal jersey. The colors pop and the crest is perfect.");
  }
  if (product.name.toLowerCase().includes('barcelona') || product.name.toLowerCase().includes('barca')) {
    templates.push("This Barcelona jersey is beautiful. The blaugrana colors look stunning in person.");
    templates.push("Perfect Barcelona kit! Feels just like the authentic match version.");
  }

  const selected = [];
  for (let i = 0; i < 4; i++) {
    selected.push(generateReview(templates));
  }

  // Calculate random stats (seeded)
  const avgRating = (4.4 + (getRand() * 0.5)).toFixed(1); // 4.4 to 4.9
  const reviewCount = 40 + Math.floor(getRand() * 210); // 40 to 250

  return { productReviews: selected, avgRating, reviewCount, category: product.category };
};

interface ReviewsSectionProps {
  product: Product;
}

export function ReviewsSection({ product }: ReviewsSectionProps) {
  const { productReviews, avgRating, reviewCount } = useMemo(() => getProductReviewsInfo(product), [product]);

  return (
    <section className="py-12 md:py-20 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="md:w-1/3 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center bg-gray-100 p-3 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-800" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">Quality Assured</h2>
            <div className="flex items-center gap-1 text-gray-800 mb-4">
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current opacity-20" />
            </div>
            <div className="text-5xl font-black text-gray-900 mb-2">{avgRating}</div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{reviewCount} Reviews</p>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {productReviews.map((review, idx) => (
              <div key={idx} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{review.name}</span>
                      {review.verified && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Verified
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-800">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={\`w-3 h-3 \${i < review.rating ? 'fill-current' : 'text-gray-200'}\`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync('src/components/ReviewsSection.tsx', replacement);
