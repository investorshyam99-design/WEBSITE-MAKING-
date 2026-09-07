import React, { useState } from "react";
import { ChevronDown, Check, Ruler, Info, Droplets, HelpCircle, BookOpen } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

function AccordionItem({ title, icon: Icon, children, defaultOpen = false }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left transition-colors hover:text-[#1E2A44]"
      >
        <div className="flex items-center gap-3 text-[#1B1B1B]">
          <Icon className="w-5 h-5 text-[#1E2A44]" />
          <span className="font-bold uppercase tracking-wider text-sm">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform duration-300",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-5 pt-1 text-sm text-gray-600 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductInfoAccordion({ product }: { product: any }) {
  const category = product?.category || 'tees';
  const isJersey = ['player-version', 'master-version', 'fan-set'].includes(category);
  const isPlayer = category === 'player-version';
  const isMaster = category === 'master-version';
  const isFan = category === 'fan-set';

  const getHighlights = () => {
    if (isPlayer) return ["Heat Pressed Logos", "Athletic Slim Fit", "Breathable Mesh", "Authentic Match Detail"];
    if (isMaster) return ["Premium Embroidery", "Comfortable Fit", "Durable Fabric", "Top-tier Replica"];
    if (isFan) return ["Embroidered Logos", "Relaxed Fit", "Everyday Comfort", "Value for Supporters"];
    if (category === 'tees') return ["240 GSM premium fabric", "Oversized boxy fit", "Structured heavyweight feel", "Designed for a modern streetwear silhouette", "Comfortable for everyday wear", "Premium print/detail finish"];
    if (category === 'hoodies') return ["350 GSM heavyweight fabric", "Oversized fit", "Premium heavyweight feel", "Comfortable for everyday streetwear", "Designed for a relaxed modern silhouette", "Premium print/detail finish"];
    if (category === 'sweatshirts') return ["350 GSM heavyweight fabric", "Oversized fit", "Premium structured feel", "Comfortable everyday layering", "Modern streetwear silhouette", "Premium print/detail finish"];
    if (category === 'track-pants') return ["360 GSM fabric", "60% cotton / 40% polyester", "Baggy fit", "Relaxed streetwear silhouette", "Comfortable everyday construction", "Designed for casual and streetwear styling"];
    if (category === 'shorts') return ["240 GSM fabric", "Oversized/relaxed fit", "Comfortable everyday construction", "Modern streetwear silhouette", "Designed for casual styling", "Premium print/detail finish where applicable"];
    if (category === 'glasses') return ["Premium UV protection", "Durable aesthetic frames", "Comfortable for daily wear", "Modern streetwear styling", "High-quality lens construction", "Scratch-resistant coating"];
    
    // Fallback
    return ["100% Premium Material", "Streetwear Inspired"];
  };

  const getAboutText = () => {
    if (isPlayer) return "The Player Version is exactly what the pros wear on the pitch. Engineered with advanced breathable fabrics and heat-pressed logos to keep it ultra-lightweight. Perfect for serious matches and dedicated collectors who want the authentic match-day feel.";
    if (isMaster) return "The Master Version offers the perfect balance of premium quality and comfort. Featuring meticulously embroidered logos and durable stitching, it's designed for fans who want top-tier quality that lasts, offering the best value for your collection.";
    if (isFan) return "The Fan Version is crafted for everyday wear. Made with softer, more relaxed fabrics and durable embroidery, it offers a comfortable fit whether you're cheering from the stands or hanging out with friends. Affordable premium quality for true supporters.";
    if (category === 'tees') return "Designed around a clean, contemporary streetwear aesthetic. The oversized boxy silhouette gives the tee a relaxed structure while the 240 GSM fabric provides a substantial premium feel.";
    if (category === 'hoodies') return "A heavyweight streetwear hoodie designed around an oversized silhouette. The 350 GSM construction provides a substantial, premium feel while maintaining everyday comfort.";
    if (category === 'sweatshirts') return "A heavyweight oversized sweatshirt designed for a clean and relaxed streetwear look. The 350 GSM fabric gives it a substantial premium feel while keeping it suitable for everyday styling.";
    if (category === 'track-pants') return "Designed for a relaxed, contemporary streetwear look. The baggy silhouette provides freedom of movement while the 60% cotton / 40% polyester blend balances comfort, durability and everyday practicality.";
    if (category === 'shorts') return "Relaxed streetwear shorts designed around a comfortable oversized silhouette. The 240 GSM construction provides a substantial feel while keeping the shorts practical for everyday wear.";
    if (category === 'glasses') return "Designed with a clean, contemporary aesthetic, these glasses offer premium UV protection without compromising on style. The durable frames and high-quality lenses provide a perfect balance of everyday utility and modern streetwear appeal.";
    
    // Fallback
    return "This premium piece is inspired by the vibrant culture of streetwear and modern pop phenomena. Designed for those who want to make a statement without saying a word, it features bold typography and a meticulously crafted heavy-weight structure that drops perfectly over the shoulders.";
  };
  
  const getSizeFit = () => {
     if (isPlayer) return { label: "Slim Match Fit:", text: "Designed to fit tight to the body like professional athletes.", recommendation: "We recommend sizing up if you prefer a looser fit." };
     if (isMaster || isFan) return { label: "Comfort Fit:", text: "Designed for a relaxed, comfortable feel.", recommendation: "True to size." };
     if (category === 'tees') return { label: "Oversized Boxy Fit:", text: "The tee is intentionally designed with a relaxed, boxy silhouette.", recommendation: "Recommend choosing your usual size for the intended oversized look. If you prefer a more relaxed/loose appearance, consider sizing up." };
     if (category === 'hoodies') return { label: "Oversized Fit:", text: "The hoodie is intentionally designed with a relaxed oversized silhouette.", recommendation: "Choose your usual size for the intended oversized look. If you want an even looser fit, consider sizing up." };
     if (category === 'sweatshirts') return { label: "Oversized Fit:", text: "The sweatshirt is designed with a relaxed oversized silhouette.", recommendation: "Choose your usual size for the intended oversized appearance. For a looser fit, consider sizing up." };
     if (category === 'track-pants') return { label: "Baggy Fit:", text: "The track pants are intentionally designed with a loose, baggy silhouette.", recommendation: "Choose your usual size for the intended baggy fit. If you prefer an even more relaxed fit, consider sizing up." };
     if (category === 'shorts') return { label: "Oversized / Relaxed Fit:", text: "The shorts are designed with a relaxed oversized silhouette.", recommendation: "Choose your usual size for the intended fit. If you prefer a looser fit, consider sizing up." };
     if (category === 'glasses') return { label: "Standard Fit:", text: "Designed to universally fit most face shapes comfortably.", recommendation: "One size fits all." };
     
     // Fallback
     return { label: "Oversized Fit:", text: "This item is designed to have a dropped shoulder and a roomy, relaxed silhouette.", recommendation: "If you prefer a regular fit, choose one size smaller." };
  };
  
  const getWashCare = () => {
      if (isJersey) return [
          "Wash inside out",
          "Cold machine wash",
          "Do not bleach",
          "Do not iron directly on print or logos",
          "Dry in shade"
      ];
      if (category === 'tees') return ["Machine wash cold or wash gently", "Wash inside out", "Use mild detergent", "Do not bleach", "Do not iron directly over the print", "Avoid high-heat drying", "Air dry when possible"];
      if (category === 'hoodies') return ["Machine wash cold", "Wash inside out", "Use mild detergent", "Do not bleach", "Do not iron directly over prints", "Avoid high heat", "Air dry when possible"];
      if (category === 'sweatshirts') return ["Machine wash cold", "Wash inside out", "Use mild detergent", "Do not bleach", "Do not iron directly over prints", "Avoid high heat", "Air dry when possible"];
      if (category === 'track-pants') return ["Machine wash cold", "Wash with similar colours", "Use mild detergent", "Do not bleach", "Avoid high heat", "Do not iron directly over prints/details", "Air dry when possible"];
      if (category === 'shorts') return ["Machine wash cold", "Wash inside out where applicable", "Use mild detergent", "Do not bleach", "Avoid high heat", "Do not iron directly over prints/details", "Air dry when possible"];
      if (category === 'glasses') return ["Wipe gently with a microfiber cloth", "Avoid using harsh chemicals or glass cleaners", "Store in a protective case when not in use", "Keep away from excessive heat"];
      
      return ["Wash inside out", "Cold machine wash", "Do not bleach", "Do not iron directly on print", "Dry in shade"];
  };

  const getFAQs = () => {
    if (isJersey) {
      return [
        { q: "What is the difference between Player, Master and Fan Version?", a: "Player versions are match-fit with heat-pressed logos. Master versions offer premium embroidery and durable fabric. Fan versions are relaxed fit for everyday wear." },
        { q: "Can I customize my jersey?", a: "Yes! You can add any player name and number for an additional ₹199." },
        { q: "How long does delivery take?", a: "Orders are dispatched quickly and typically arrive in 5-10 business days across India." },
        { q: "Can I exchange or return my order?", a: (
  <div className="space-y-2">
    <p>Yes, we offer size exchanges if the selected size does not fit.</p>
    <p>Exchange Conditions:</p>
    <ul className="space-y-1 list-none">
      <li>• Size exchange requests must be made within <strong>24 hours</strong> of delivery.</li>
      <li>• A complete <strong>uncut unboxing video</strong> is mandatory for every exchange request.</li>
      <li>• The product must be unused, unwashed, and returned with all original tags and packaging.</li>
      <li>• <strong>Customized jerseys (Name & Number printed) are NOT eligible for exchange or return.</strong></li>
      <li>• If we ship the <strong>wrong product, wrong size, damaged, or defective product</strong>, we will provide an exchange after verification.</li>
      <li>• Claims without an uncut unboxing video will not be accepted.</li>
      <li>• For size exchanges, the customer is responsible for the applicable shipping charges.</li>
    </ul>
  </div>) },
        { q: "How should I wash the jersey?", a: "Hand wash cold or gentle machine wash inside out. Do not iron on prints or logos." },
        { q: "Is customization refundable?", a: "No, personalized items with custom names/numbers cannot be refunded or exchanged." },
        { q: "What material is used?", a: "We use premium moisture-wicking polyester blends imported from Thailand." },
        { q: "Are logos heat pressed or embroidered?", a: "Player versions use ultra-light heat-pressed logos. Master and Fan versions feature high-quality embroidery." }
      ];
    }
    
    // Apparel FAQs
    let apparelFaqs = [];
    if (category === 'tees') {
        apparelFaqs = [
            { q: "What GSM is the tee?", a: "The tee is 240 GSM." },
            { q: "What is the fit?", a: "It has an oversized boxy fit." },
            { q: "Can I return or exchange the tee?", a: "No. Tees are non-returnable and non-exchangeable." },
            { q: "Is the tee suitable for everyday wear?", a: "Yes. It is designed for comfortable everyday streetwear use." }
        ];
    } else if (category === 'hoodies') {
        apparelFaqs = [
            { q: "What GSM is the hoodie?", a: "The hoodie is 350 GSM." },
            { q: "What is the fit?", a: "It has an oversized fit." },
            { q: "Can I return or exchange the hoodie?", a: "No. Hoodies are non-returnable and non-exchangeable." }
        ];
    } else if (category === 'sweatshirts') {
        apparelFaqs = [
            { q: "What GSM is the sweatshirt?", a: "The sweatshirt is 350 GSM." },
            { q: "What is the fit?", a: "It has an oversized fit." },
            { q: "Can I return or exchange the sweatshirt?", a: "No. Sweatshirts are non-returnable and non-exchangeable." }
        ];
    } else if (category === 'track-pants') {
        apparelFaqs = [
            { q: "What GSM are the track pants?", a: "The track pants are 360 GSM." },
            { q: "What is the fabric composition?", a: "60% cotton and 40% polyester." },
            { q: "What is the fit?", a: "They have a baggy fit." },
            { q: "Can I return or exchange the track pants?", a: "No. Track pants are non-returnable and non-exchangeable." }
        ];
    } else if (category === 'shorts') {
        apparelFaqs = [
            { q: "What GSM are the shorts?", a: "The shorts are 240 GSM." },
            { q: "What is the fit?", a: "They have an oversized/relaxed fit." },
            { q: "Can I return or exchange the shorts?", a: "No. Shorts are non-returnable and non-exchangeable." }
        ];
    } else if (category === 'glasses') {
        apparelFaqs = [
            { q: "Do these provide UV protection?", a: "Yes, our glasses are designed to offer premium UV protection alongside their stylish aesthetic." },
            { q: "What is the return policy?", a: "We offer a flexible exchange policy if you encounter any manufacturing defects." },
            { q: "How should I clean them?", a: "We recommend wiping gently with a clean microfiber cloth. Avoid using harsh chemicals." }
        ];
    } else {
        // Generic fallback for any other apparel
        apparelFaqs = [
            { q: "Is it oversized?", a: "Yes, all our items feature a premium oversized drop-shoulder fit." },
            { q: "What GSM is used?", a: "We use premium heavy-weight cotton." },
            { q: "Does the print fade?", a: "No, we use high-quality, durable printing techniques that withstand multiple washes." },
            { q: "How should I wash it?", a: "Cold machine wash inside out. Do not bleach. Do not iron directly on the print." },
            { q: "How long is delivery?", a: "Orders are dispatched within 24-48 hours and typically arrive in 4-7 business days." },
            { q: "Can I exchange or return my order?", a: "These products are non-returnable and non-exchangeable." }
        ];
    }
    
    return apparelFaqs;
  };

  const sizeFit = getSizeFit();
  const washCare = getWashCare();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16 bg-white">
      <div className="max-w-3xl mx-auto">
        <AccordionItem title="Product Highlights" icon={Check} defaultOpen={true}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {getHighlights().map((highlight, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#F5EFE6]/30 p-3 rounded-lg border border-[#EDE3D8]/50">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span className="font-bold text-[#1B1B1B]">{highlight}</span>
              </div>
            ))}
          </div>
        </AccordionItem>
        
        <AccordionItem title="About this design" icon={BookOpen}>
          <p>{getAboutText()}</p>
        </AccordionItem>
        
        <AccordionItem title="Size & Fit Guide" icon={Ruler}>
          <p className="mb-4 font-medium text-[#1B1B1B]">
            <span className="font-bold text-[#1E2A44]">{sizeFit.label}</span> {sizeFit.text}
          </p>
          <div className="bg-[#F5EFE6]/50 p-4 rounded-xl border border-[#EDE3D8] text-center">
            <span className="font-black uppercase tracking-wider text-sm text-[#1B1B1B]">
              {sizeFit.recommendation}
            </span>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Wash Care" icon={Droplets}>
          <ul className="space-y-3 font-medium">
            {washCare.map((instruction, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E2A44]" />
                {instruction}
              </li>
            ))}
          </ul>
        </AccordionItem>
        
        <AccordionItem title="Frequently Asked Questions" icon={HelpCircle}>
          <div className="space-y-4">
            {getFAQs().map((faq, i) => (
              <div key={i}>
                <h4 className="font-bold text-[#1B1B1B] text-sm mb-1">{faq.q}</h4>
                <div className="text-sm text-gray-600">{faq.a}</div>
              </div>
            ))}
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}
