import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function TrendingSalesIndicator({ productId }: { productId: string }) {
  const [salesData, setSalesData] = useState<{ sold: number; hours: number } | null>(null);

  useEffect(() => {
    // Generate deterministic but pseudo-random values based on productId
    const idNum = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const baseSold = (idNum % 75) + 25; // 25 to 99
    const baseHours = (idNum % 24) + 12; 
    setSalesData({ sold: baseSold, hours: baseHours });
  }, [productId]);

  if (!salesData) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1 py-1 select-none">
      <div className="text-sm md:text-base">🔥</div>
      <div className="text-xs md:text-sm font-medium text-gray-700">
        <span className="font-bold text-[#1B1B1B]">{salesData.sold} sold</span> in the last {salesData.hours} hours
      </div>
    </div>
  );
}
