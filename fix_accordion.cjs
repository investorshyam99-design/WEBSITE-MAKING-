const fs = require('fs');
let code = fs.readFileSync('src/components/ProductInfoAccordion.tsx', 'utf8');

code = code.replace(/if \(category === 'shorts'\) return \["240 GSM fabric", "Oversized\/relaxed fit", "Comfortable everyday construction", "Modern streetwear silhouette", "Designed for casual styling", "Premium print\/detail finish where applicable"\];/,
`if (category === 'shorts') return ["240 GSM fabric", "Oversized/relaxed fit", "Comfortable everyday construction", "Modern streetwear silhouette", "Designed for casual styling", "Premium print/detail finish where applicable"];
    if (category === 'glasses') return ["Premium UV protection", "Durable aesthetic frames", "Comfortable for daily wear", "Modern streetwear styling", "High-quality lens construction", "Scratch-resistant coating"];`);

code = code.replace(/if \(category === 'shorts'\) return "Relaxed streetwear shorts designed around a comfortable oversized silhouette. The 240 GSM construction provides a substantial feel while keeping the shorts practical for everyday wear.";/,
`if (category === 'shorts') return "Relaxed streetwear shorts designed around a comfortable oversized silhouette. The 240 GSM construction provides a substantial feel while keeping the shorts practical for everyday wear.";
    if (category === 'glasses') return "Designed with a clean, contemporary aesthetic, these glasses offer premium UV protection without compromising on style. The durable frames and high-quality lenses provide a perfect balance of everyday utility and modern streetwear appeal.";`);

code = code.replace(/if \(category === 'shorts'\) return \{ label: "Oversized \/ Relaxed Fit:", text: "The shorts are designed with a relaxed oversized silhouette.", recommendation: "Choose your usual size for the intended fit. If you prefer a looser fit, consider sizing up." \};/,
`if (category === 'shorts') return { label: "Oversized / Relaxed Fit:", text: "The shorts are designed with a relaxed oversized silhouette.", recommendation: "Choose your usual size for the intended fit. If you prefer a looser fit, consider sizing up." };
     if (category === 'glasses') return { label: "Standard Fit:", text: "Designed to universally fit most face shapes comfortably.", recommendation: "One size fits all." };`);

code = code.replace(/if \(!isJersey\) return \[/g, 
`if (category === 'glasses') return [
          "Wipe gently with a microfiber cloth",
          "Avoid using harsh chemicals or glass cleaners",
          "Store in a protective case when not in use",
          "Keep away from excessive heat"
      ];
      if (!isJersey) return [`);

fs.writeFileSync('src/components/ProductInfoAccordion.tsx', code, 'utf8');
