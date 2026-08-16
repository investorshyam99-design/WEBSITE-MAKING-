const fs = require('fs');
let file = fs.readFileSync('src/components/ReviewsSection.tsx', 'utf8');

const regex = /  } else \{\s*\/\/ Tees \/ Streetwear \/ F1 \/ Anime\s*templates = \[\s*[^\]]+\];\s*\}/;

const newImplementation = `  } else if (product.category === 'hoodies') {
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
  }`;

file = file.replace(regex, newImplementation);

fs.writeFileSync('src/components/ReviewsSection.tsx', file);
