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
  const isPlayer = product?.category === 'player-version';
  const isMaster = product?.category === 'master-version';
  const isFan = product?.category === 'fan-set';
  const isJersey = isPlayer || isMaster || isFan;

  const getHighlights = () => {
    if (isPlayer) return ["Premium Thailand Quality", "Heat Press Logos", "Heat Press Sponsor", "Match Fit", "Breathable Fabric", "Slim Athletic Fit", "Perfect for matches and collectors."];
    if (isMaster) return ["Premium Thailand Quality", "Embroidery + Premium Finish", "Comfort Fit", "Durable Stitching", "Premium Fabric", "Best Value"];
    if (isFan) return ["Comfort Fit", "Embroidery Logos", "Daily Wear", "Soft Fabric", "Affordable Premium Quality", "Perfect for everyday football fans."];
    return ["240 GSM Premium Cotton", "Oversized Fit", "Drop Shoulder", "High Quality Print", "Bio-Washed Fabric", "Unisex", "Streetwear Inspired"];
  };

  const getAboutText = () => {
    if (isPlayer) return "The Player Version is exactly what the pros wear on the pitch. Engineered with advanced breathable fabrics and heat-pressed logos to keep it ultra-lightweight. Perfect for serious matches and dedicated collectors who want the authentic match-day feel.";
    if (isMaster) return "The Master Version offers the perfect balance of premium quality and comfort. Featuring meticulously embroidered logos and durable stitching, it's designed for fans who want top-tier quality that lasts, offering the best value for your collection.";
    if (isFan) return "The Fan Version is crafted for everyday wear. Made with softer, more relaxed fabrics and durable embroidery, it offers a comfortable fit whether you're cheering from the stands or hanging out with friends. Affordable premium quality for true supporters.";
    return "This premium piece is inspired by the vibrant culture of streetwear and modern pop phenomena. Designed for those who want to make a statement without saying a word, it features bold typography and a meticulously crafted heavy-weight structure that drops perfectly over the shoulders.";
  };

  const getFAQs = () => {
    if (isJersey) {
      return [
        { q: "What is the difference between Player, Master and Fan Version?", a: "Player versions are match-fit with heat-pressed logos. Master versions offer premium embroidery and durable fabric. Fan versions are relaxed fit for everyday wear." },
        { q: "Can I customize my jersey?", a: "Yes! You can add any player name and number for an additional ₹199." },
        { q: "How long does delivery take?", a: "Orders are dispatched quickly and typically arrive in 5-10 business days across India." },
        { q: "Can I exchange my order?", a: "We offer exchange ONLY if the mistake is from our side (wrong product, wrong size sent by us, damaged product, or manufacturing defect).\n\nTo be eligible:\n• The issue must be reported within 24 hours of delivery.\n• A complete, uncut unboxing video is mandatory.\n• The product must be unused with all original tags and packaging.\n• Claims without an uncut unboxing video will not be accepted." },
        { q: "How should I wash the jersey?", a: "Hand wash cold or gentle machine wash inside out. Do not iron on prints or logos." },
        { q: "Is customization refundable?", a: "No, personalized items with custom names/numbers cannot be refunded or exchanged." },
        { q: "What material is used?", a: "We use premium moisture-wicking polyester blends imported from Thailand." },
        { q: "Are logos heat pressed or embroidered?", a: "Player versions use ultra-light heat-pressed logos. Master and Fan versions feature high-quality embroidery." }
      ];
    }
    return [
      { q: "Is it oversized?", a: "Yes, all our t-shirts feature a premium oversized drop-shoulder fit." },
      { q: "What GSM is used?", a: "We use premium 240 GSM heavy-weight cotton." },
      { q: "Does the print fade?", a: "No, we use high-quality, durable printing techniques that withstand multiple washes." },
      { q: "How should I wash it?", a: "Cold machine wash inside out. Do not bleach. Do not iron directly on the print." },
      { q: "How long is delivery?", a: "Orders are dispatched within 24-48 hours and typically arrive in 4-7 business days." },
      { q: "Can I exchange my order?", a: "We offer exchange ONLY if the mistake is from our side (wrong product, wrong size sent by us, damaged product, or manufacturing defect).\n\nTo be eligible:\n• The issue must be reported within 24 hours of delivery.\n• A complete, uncut unboxing video is mandatory.\n• The product must be unused with all original tags and packaging.\n• Claims without an uncut unboxing video will not be accepted." }
    ];
  };

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
            <span className="font-bold text-[#1E2A44]">{isJersey ? (isPlayer ? "Slim Match Fit:" : "Comfort Fit:") : "Oversized Fit:"}</span> {isJersey ? (isPlayer ? "Designed to fit tight to the body like professional athletes." : "Designed for a relaxed, comfortable feel.") : "This t-shirt is designed to have a dropped shoulder and a roomy, relaxed silhouette."}
          </p>
          <div className="bg-[#F5EFE6]/50 p-4 rounded-xl border border-[#EDE3D8] text-center">
            <span className="font-black uppercase tracking-wider text-sm text-[#1B1B1B]">
              {isJersey ? (isPlayer ? "We recommend sizing up if you prefer a looser fit." : "True to size.") : "If you prefer a regular fit, choose one size smaller."}
            </span>
          </div>
        </AccordionItem>
        
        <AccordionItem title="Wash Care" icon={Droplets}>
          <ul className="space-y-3 font-medium">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E2A44]" />
              Wash inside out
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E2A44]" />
              Cold machine wash
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E2A44]" />
              Do not bleach
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E2A44]" />
              {isJersey ? "Do not iron directly on print or logos" : "Do not iron directly on print"}
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E2A44]" />
              Dry in shade
            </li>
          </ul>
        </AccordionItem>
        
        <AccordionItem title="Frequently Asked Questions" icon={HelpCircle}>
          <div className="space-y-4">
            {getFAQs().map((faq, i) => (
              <div key={i}>
                <h4 className="font-bold text-[#1B1B1B] text-sm mb-1">{faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}
