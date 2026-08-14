export interface EnhancedProductSEO {
  seoTitle: string;
  metaDescription: string;
  htmlDescription: string;
  bulletPoints: string[];
  mainImageAlt: string;
  galleryAltTexts: string[];
}

export function generateProductSEO(product: {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  galleryImages?: string[];
  description?: string;
}): EnhancedProductSEO {
  const name = product.name || "Football Jersey";
  const nameLower = name.toLowerCase();

  // Detect Version
  let versionLabel = "Fan Version";
  if (product.category === "player-version" || nameLower.includes("player version")) {
    versionLabel = "Player Version";
  } else if (product.category === "master-version" || nameLower.includes("retro") || nameLower.includes("master")) {
    versionLabel = "Retro Master Version";
  } else if (product.category === "fan-set" || nameLower.includes("set") || nameLower.includes("fan")) {
    versionLabel = "Fan Set";
  }

  // Detect Team
  let team = "Football";
  if (nameLower.includes("argentina")) team = "Argentina";
  else if (nameLower.includes("portugal")) team = "Portugal";
  else if (nameLower.includes("real madrid")) team = "Real Madrid";
  else if (nameLower.includes("manchester city") || nameLower.includes("man city")) team = "Manchester City";
  else if (nameLower.includes("manchester united") || nameLower.includes("man united") || nameLower.includes("man utd")) team = "Manchester United";
  else if (nameLower.includes("barcelona") || nameLower.includes("barca")) team = "Barcelona";
  else if (nameLower.includes("liverpool")) team = "Liverpool";
  else if (nameLower.includes("italy")) team = "Italy";
  else if (nameLower.includes("japan")) team = "Japan";
  else if (nameLower.includes("mexico")) team = "Mexico";
  else if (nameLower.includes("uruguay")) team = "Uruguay";
  else if (nameLower.includes("france")) team = "France";

  // Detect Kit Type / Season
  let kitType = "Home";
  if (nameLower.includes("away")) kitType = "Away";
  else if (nameLower.includes("third")) kitType = "Third";
  else if (nameLower.includes("anniversary") || nameLower.includes("special")) kitType = "Special Edition";
  else if (nameLower.includes("retro") || nameLower.includes("1998") || nameLower.includes("2007") || nameLower.includes("2008")) kitType = "Retro";

  let season = "2026";
  if (nameLower.includes("1998")) season = "1998";
  else if (nameLower.includes("2007") || nameLower.includes("2008")) season = "2007-08";
  else if (nameLower.includes("2024") || nameLower.includes("2025")) season = "2025-26";

  // 1. SEO Title: Max 60 chars
  // Formula: [Team] [Home/Away/Third] Jersey [Season] ([Version]) | Jersey Unicorn
  let rawTitle = `${team} ${kitType} Jersey ${season} | ${versionLabel} | ₹${product.price} – Jersey Unicorn`;
  if (rawTitle.length > 70) {
    rawTitle = `${name} | ₹${product.price} – Jersey Unicorn`;
  }
  if (rawTitle.length > 60) {
    rawTitle = `${name} (${versionLabel}) | Jersey Unicorn`;
  }
  if (rawTitle.length > 60) {
    rawTitle = `${name} | Jersey Unicorn`;
  }
  const seoTitle = rawTitle;

  // 2. Meta Description: 150-160 chars, includes "India", trust signal, CTA
  const rawMetaDesc = `Buy authentic ${name} in India at Jersey Unicorn. Engineered with premium breathable performance fabric & authentic fit. Fast delivery & COD available. Order today!`;
  const metaDescription = rawMetaDesc.length > 160 ? rawMetaDesc.substring(0, 157) + "..." : rawMetaDesc;

  // 3. Full HTML Product Description (150-250 words) in Gen Z streetwear-hype voice
  const isPlayer = versionLabel === "Player Version";
  const isRetro = versionLabel === "Retro Master Version";
  const isFanSet = versionLabel === "Fan Set";

  const fitDesc = isPlayer
    ? "engineered with an ultra-sleek, athletic matchday fit that molds to your physique and maximizes airflow with laser-cut ventilation micro-holes."
    : isRetro
    ? "tailored with heavy-grade vintage weave cotton-poly blend, period-accurate collar structure, and authentic felt crest embroidery."
    : "cut in a comfortable, everyday regular streetwear fit designed for maximum mobility, match viewings, and casual urban layering.";

  const htmlDescription = `
<div className="space-y-4 text-gray-300 font-sans leading-relaxed text-sm md:text-base">
  <p className="font-medium">
    Step up your matchday drip with the official <strong className="text-white font-bold">${name}</strong>. Built for die-hard football purists and streetwear enthusiasts in India, this kit combines iconic football heritage with bold modern aesthetics.
  </p>
  <p>
    Crafted from high-grade moisture-wicking dry-fit yarn, this jersey is ${fitDesc} Whether you're pulling up to stadium screenings, dominating your local weekend turf matches, or styling an effortless oversized streetwear look, this piece delivers ultimate comfort and unmatched visual heat.
  </p>
  <p className="font-semibold text-white">
    Don't sleep on this drop. Upgrade your football collection with India's premier kit outlet—Jersey Unicorn.
  </p>
</div>
  `.trim();

  // 4. Bullet Points (3-5 items)
  const bulletPoints = [
    `Fabric: Premium 100% Recycled Polyester Dry-Fit Yarn`,
    `Fit Type: ${isPlayer ? "Athletic Slim Fit (Player Issue Spec)" : isRetro ? "Vintage Tailored Fit" : "Standard Comfort Regular Fit"}`,
    `Sizing Range: Small (S) to Double Extra Large (XXL)`,
    `Care Instructions: Cold Machine Wash Inside-Out, Do Not Bleach or Iron Directly on Transfers`,
    `Quality Guarantee: Thai Quality Standard with ${isPlayer ? "Heat-Pressed Rubberized Badge & Heat-Sealed Hem" : "Precision High-Density Embroidered Crest"}`
  ];

  // 5. Image Alt Text Pattern: [Team] [Home/Away/Third] Jersey [Season] – Jersey Unicorn
  const mainImageAlt = `${team} ${kitType} Jersey ${season} – Jersey Unicorn`;
  
  const galleryAltTexts = (product.galleryImages || []).map((_, index) => {
    return `${team} ${kitType} Jersey ${season} Angle ${index + 1} – Jersey Unicorn`;
  });

  return {
    seoTitle,
    metaDescription,
    htmlDescription,
    bulletPoints,
    mainImageAlt,
    galleryAltTexts
  };
}
