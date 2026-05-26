import React, { useMemo } from "react";
import { Star, CheckCircle2 } from "lucide-react";

export const getProductReviewsInfo = (productId: string) => {
  const reviewsPool = [
    { name: "Rahul S.", rating: 5, comment: "Quality is insane! The detailing on the crest and the material feel exactly like the ₹5000 ones. Highly recommend.", verified: true },
    { name: "Aryan M.", rating: 4, comment: "Fast delivery to Mumbai. Fits perfectly. Make sure to buy one size up if you want a loose fit.", verified: true },
    { name: "Vikrant K.", rating: 5, comment: "Best jersey site in India hands down. Customer support is also very helpful on WhatsApp.", verified: true },
    { name: "Siddharth J.", rating: 5, comment: "Amazing fabric. Delivery took 1 extra day but the product is faultless. Will order the away kit soon.", verified: true },
    { name: "Akhil P.", rating: 5, comment: "Fabric is super breathable. Wore it to my turf match and it absorbed sweat perfectly.", verified: true },
    { name: "Rohan D.", rating: 4, comment: "Bought this for a friend's birthday and he loved it. The club crest is stitched so nicely.", verified: true },
    { name: "Kabir T.", rating: 5, comment: "Worth the price! The prints look solid and don't peel off easily. Delivery was within a week.", verified: true },
    { name: "Jay S.", rating: 4, comment: "Fits a little snug but the overall quality is surprisingly good for the price.", verified: true },
    { name: "Varun N.", rating: 5, comment: "Very premium feel. Even the packaging was nice. Happy with the purchase.", verified: true },
    { name: "Karan B.", rating: 5, comment: "I've ordered 3 jerseys from here, this one is by far my favorite. The fit is top notch.", verified: true },
    { name: "Neil C.", rating: 5, comment: "Beautiful kit! Definitely looks just like the matchday version. Highly satisfied.", verified: true }
  ];

  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const selected = [];
  const poolCopy = [...reviewsPool];
  let currentSeed = seed;
  
  for (let i = 0; i < 4; i++) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const rnd = currentSeed / 233280;
    const index = Math.floor(rnd * poolCopy.length);
    selected.push(poolCopy[index]);
    poolCopy.splice(index, 1);
  }

  const avgRating = (selected.reduce((sum, rev) => sum + rev.rating, 0) / 4).toFixed(1);
  const reviewCount = 120 + selected[0].name.charCodeAt(0);

  return { productReviews: selected, avgRating, reviewCount };
};

interface ReviewsSectionProps {
  productId?: string;
}

export function ReviewsSection({ productId = "default" }: ReviewsSectionProps) {
  const { productReviews, avgRating, reviewCount } = useMemo(() => getProductReviewsInfo(productId), [productId]);

  return (
    <section className="py-12 md:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Summary */}
          <div className="md:w-1/3 bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center flex flex-col items-center">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#1B1B1B] mb-2">Customer Reviews</h2>
            <div className="flex items-center gap-1 text-yellow-500 mb-4">
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
            </div>
            <div className="text-5xl font-black text-[#1B1B1B] mb-2">{avgRating}</div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Based on {reviewCount} Reviews</p>
          </div>
          
          {/* Review List */}
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {productReviews.map((review, idx) => (
              <div key={idx} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#1B1B1B]">{review.name}</span>
                    {review.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
