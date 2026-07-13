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
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16 bg-white">
      <div className="max-w-3xl mx-auto">
        <AccordionItem title="Product Highlights" icon={Check} defaultOpen={true}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "240 GSM Premium Cotton",
              "Oversized Streetwear Fit",
              "Soft & Breathable Fabric",
              "Durable High Quality Print",
              "Unisex Design"
            ].map((highlight, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#F5EFE6]/30 p-3 rounded-lg border border-[#EDE3D8]/50">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span className="font-bold text-[#1B1B1B]">{highlight}</span>
              </div>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem title="About this design" icon={BookOpen}>
          <p>
            This premium piece is inspired by the vibrant culture of streetwear and modern pop phenomena. 
            Designed for those who want to make a statement without saying a word, it features bold typography 
            and a meticulously crafted heavy-weight structure that drops perfectly over the shoulders. 
            Elevate your everyday uniform with this luxury essential.
          </p>
        </AccordionItem>

        <AccordionItem title="Size & Fit Guide" icon={Ruler}>
          <p className="mb-4 font-medium text-[#1B1B1B]">
            <span className="font-bold text-[#1E2A44]">Oversized Fit:</span> This t-shirt is designed to have a dropped shoulder and a roomy, relaxed silhouette.
          </p>
          <div className="bg-[#F5EFE6]/50 p-4 rounded-xl border border-[#EDE3D8] text-center">
            <span className="font-black uppercase tracking-wider text-sm text-[#1B1B1B]">If you prefer a regular fit, choose one size smaller.</span>
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
              Do not iron directly on print
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E2A44]" />
              Dry in shade
            </li>
          </ul>
        </AccordionItem>

        <AccordionItem title="Frequently Asked Questions" icon={HelpCircle}>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-[#1B1B1B] text-sm mb-1">Is it oversized?</h4>
              <p>Yes, all our t-shirts feature a premium oversized drop-shoulder fit.</p>
            </div>
            <div>
              <h4 className="font-bold text-[#1B1B1B] text-sm mb-1">Is it unisex?</h4>
              <p>Absolutely. Our silhouettes are designed to look great on everyone.</p>
            </div>
            <div>
              <h4 className="font-bold text-[#1B1B1B] text-sm mb-1">Does the print fade?</h4>
              <p>No, we use high-quality, durable printing techniques that withstand multiple washes if cared for correctly.</p>
            </div>
            <div>
              <h4 className="font-bold text-[#1B1B1B] text-sm mb-1">How long does delivery take?</h4>
              <p>Orders are dispatched within 24-48 hours and typically arrive in 4-7 business days.</p>
            </div>
            <div>
              <h4 className="font-bold text-[#1B1B1B] text-sm mb-1">What fabric is used?</h4>
              <p>We use premium 240 GSM heavy-weight cotton for a luxurious feel and perfect drape.</p>
            </div>
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}
