import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const faqData = [
  {
    question: "Is Cash on Delivery (COD) Available?",
    answer:
      "Yes, Cash on Delivery is available across most locations in India.\n\nA small confirmation amount is required for COD orders to reduce fake orders and ensure faster processing.",
  },
  {
    question: "Why Is ₹150 Advance Required For COD Orders?",
    answer:
      "The ₹150 confirmation amount helps us reduce fake COD orders and process genuine orders faster.\n\nThe remaining amount is payable at delivery.",
  },
  {
    question: "How Long Does Delivery Take?",
    answer:
      "Orders are usually delivered within 3–10 days depending on your location.\n\nOnce your order is shipped, we will share the tracking details.",
  },
  {
    question: "Can I Customize My Jersey With Name & Number?",
    answer:
      "Yes! You can personalize your jersey with your favorite player name and number directly from the product page.",
  },
  {
    question: "What Is The Quality Of The Jerseys?",
    answer:
      "We offer multiple jersey qualities depending on the version selected.\n\nPlayer Version, Fan Version, and Master Version jerseys are made in Thailand with premium-quality fabric and finishing.",
  },
  {
    question: "What Is The Difference Between Fan Version And Player Version?",
    answer:
      "Fan Version:\nRegular comfortable fit with embroidered logos.\n\nPlayer Version:\nSlim athletic fit with heat-pressed logos, similar to what players wear on the pitch.\n\nMaster Version:\nPremium upgraded version with enhanced detailing and finishing.",
  },
  {
    question: "How Do I Choose The Right Size?",
    answer:
      "You can check our Size Guide available on every product page.\n\nIf you prefer a relaxed fit, we recommend sizing up.",
  },
  {
    question: "What Is Your Exchange Policy?",
    answer:
      "We offer exchange only if:\n- the wrong product is delivered\n- or the product is defective.\n\nTo claim an exchange:\n- please shoot a proper uncut and unedited video while opening the package\n- report the issue on WhatsApp within 24 hours of delivery.",
  },
  {
    question: "Which Payment Methods Do You Accept?",
    answer:
      "We accept:\n- UPI\n- Debit/Credit Cards\n- Net Banking\n- Wallets\n- Partial COD",
  },
  {
    question: "How Can I Contact Jersey Unicorn?",
    answer:
      "You can contact us anytime through:\n- WhatsApp\n- Instagram\n- Email support\n\nWe usually respond quickly during working hours.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-[#1E2A44] uppercase tracking-tight mb-4">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-base text-gray-500 font-medium">
            Everything you need to know before ordering from Jersey Unicorn.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-xl transition-all duration-300 ${
                  isOpen
                    ? "border-[#1E2A44] bg-[#1E2A44]/[0.02] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between p-5 text-left focus:outline-none focus-visible:ring focus-visible:ring-opacity-50 focus-visible:ring-[#1E2A44]"
                >
                  <span
                    className={`text-base sm:text-lg font-semibold pr-8 ${
                      isOpen ? "text-[#1E2A44]" : "text-[#1B1B1B]"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`flex-shrink-0 ml-4 rounded-full p-1 transition-all duration-300 ${
                      isOpen ? "bg-[#1E2A44] text-white rotate-180" : "bg-gray-100 text-gray-400 rotate-0"
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 text-gray-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base border-t border-gray-100 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
