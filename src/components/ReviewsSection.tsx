import React, { useMemo } from "react";
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
  const heights = ["5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\""];

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
      "The player version quality of {product} is unmatched. The match fit is absolutely perfect.",
      "Incredible detailing on {product}. The heat-pressed logos look amazing and feel super premium.",
      "Took a while to arrive, but this player version jersey is faultless. The premium fabric is totally worth it.",
      "The breathability and match fit on this {product} is insane. Best player version I've bought.",
      "Beautiful heat-pressed logos and premium fabric. It's exactly what the pros wear on the pitch."
    ];
  } else if (product.category === 'master-version') {
    templates = [
      "The master version of {product} feels so premium. The embroidery is flawless.",
      "Honestly better than expected. Supreme comfort and great value for money.",
      "Very close to the authentic ones. The embroidery on this {product} master version is 10/10.",
      "Incredible value! The comfort level is amazing, I wear it almost every weekend.",
      "Material is very comfortable and the fit is perfect for casual wear. High quality embroidery too."
    ];
  } else if (product.category === 'fan-set' || product.category === 'fan-version') {
    templates = [
      "Great value for money! The {product} fan version is perfect for daily wear.",
      "For the price, you can't beat this fan version's affordability and comfort.",
      "Awesome affordability. Colors are vibrant and it washes well for daily wear.",
      "Best fan jersey for the price. Very comfortable for everyday use and daily wear.",
      "Got this for my brother. He loves the affordability and wears it for daily wear everywhere."
    ];
  } else if (product.category === 'hoodies') {
    templates = [
      "The 350 GSM weight on this {product} hoodie feels so premium. True oversized fit.",
      "Best hoodie I've bought. The oversized fit and comfort are just insane.",
      "Vibe is unmatched. Fits exactly how an oversized hoodie should. The 350 GSM fabric feels so heavy and warm.",
      "Really premium 350 GSM material used for this. The oversized structure is top tier.",
      "Perfect streetwear silhouette. The premium heavyweight feel makes it my daily go-to."
    ];
  } else if (product.category === 'sweatshirts') {
    templates = [
      "The 350 GSM weight on this {product} sweatshirt is incredible. Perfect for streetwear layering.",
      "Best oversized sweatshirt I've bought. The comfort and structured fit are just insane.",
      "Vibe is unmatched. Fits exactly how an oversized sweatshirt should. The 350 GSM fabric feels so premium.",
      "Really premium 350 GSM material used for this. The everyday styling is top tier.",
      "Perfect oversized fit and the heavyweight feel is completely flawless for layering."
    ];
  } else if (product.category === 'track-pants') {
    templates = [
      "The 360 GSM fabric on these {product} track pants is incredible. True baggy fit.",
      "Best track pants I've bought. The streetwear styling and comfort are just insane.",
      "Vibe is unmatched. Fits exactly how baggy track pants should. The 60% cotton blend feels so premium.",
      "Really premium 360 GSM material used for this. The relaxed fit is top tier.",
      "Gen Z approved streetwear styling. Perfect baggy fit and the construction is completely flawless."
    ];
  } else if (product.category === 'shorts') {
    templates = [
      "The 240 GSM fabric on these {product} shorts is incredible. True oversized relaxed fit.",
      "Best casual shorts I've bought. The comfort and everyday styling are just insane.",
      "Vibe is unmatched. Fits exactly how streetwear shorts should. The 240 GSM fabric feels so premium.",
      "Really premium 240 GSM material used for this. The relaxed fit is top tier.",
      "Perfect oversized fit and the construction is completely flawless for everyday wear."
    ];
  } else {
    // Tees / Streetwear / F1 / Anime / Fallback
    templates = [
      "The 240 GSM fabric on this {product} tee is incredible. True oversized boxy fit.",
      "Best streetwear tee I've bought. The print quality on {product} is just insane.",
      "Vibe is unmatched. Fits exactly how an oversized tee should. The 240 GSM fabric feels so premium.",
      "Really premium 240 GSM blank used for this. The streetwear appearance is top tier.",
      "Gen Z approved. Perfect oversized boxy fit and the comfort is completely flawless."
    ];
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
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
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
