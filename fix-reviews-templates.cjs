const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewsSection.tsx', 'utf8');

code = code.replace(
  `  if (product.category === 'player-version') {
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
  } else {`,
  `  if (product.category === 'player-version') {
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
  } else {`
);

code = code.replace(
  `    if (product.name.toLowerCase().includes('f1') || product.name.toLowerCase().includes('formula')) {
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
    }`,
  `    templates = [
      "The 240 GSM fabric on this {product} tee is incredible. True oversized fit.",
      "Best oversized tee I've bought. The print quality on {product} is just insane.",
      "Vibe is unmatched. Fits exactly how an oversized tee should. The 240 GSM fabric feels so premium.",
      "Really premium 240 GSM blank used for this. The print quality is top tier.",
      "Gen Z approved. Perfect oversized fit and the print quality is completely flawless."
    ];`
);

fs.writeFileSync('src/components/ReviewsSection.tsx', code);
