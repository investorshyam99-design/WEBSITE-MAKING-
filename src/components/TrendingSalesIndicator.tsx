import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function TrendingSalesIndicator({ productId }: { productId: string }) {
  const [salesData, setSalesData] = useState<{ sold: number; hours: number } | null>(null);

  useEffect(() => {
    // Generate deterministic but pseudo-random values based on productId
    const idNum = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const baseSold = (idNum % 25) + 5; // 5 to 29
    const baseHours = (idNum % 36) + 12; // 12 to 47

    setSalesData({ sold: baseSold, hours: baseHours });

    // Slightly adjust the sold count dynamically over time to simulate live updates
    const interval = setInterval(() => {
      setSalesData(prev => {
        if (!prev) return prev;
        // Only increase occasionally, say 30% chance every 10 seconds
        if (Math.random() > 0.7) {
          return { ...prev, sold: prev.sold + 1 };
        }
        return prev;
      });
    }, 10000 + Math.random() * 10000); // 10 to 20 seconds

    return () => clearInterval(interval);
  }, [productId]);

  if (!salesData) return null;

  return (
    <div className="flex items-center gap-2 mt-4 mb-4 py-2 px-3 bg-[#FDF8F5] border border-[#F5E6DF] rounded-lg">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex-shrink-0"
      >
        🔥
      </motion.div>
      <div className="text-sm font-medium text-[#1B1B1B]">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={salesData.sold}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
            className="inline-block font-bold text-[#D9381E]"
          >
            {salesData.sold}
          </motion.span>
        </AnimatePresence>
        <span className="text-[#1B1B1B]/80 ml-1">
          products sold in last {salesData.hours} hours
        </span>
      </div>
    </div>
  );
}
