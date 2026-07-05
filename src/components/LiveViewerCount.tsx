import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function LiveViewerCount() {
  const [viewers, setViewers] = useState<number>(0);

  useEffect(() => {
    // Initial random number between 3 and 18
    const initialViewers = Math.floor(Math.random() * (18 - 3 + 1)) + 3;
    setViewers(initialViewers);

    const interval = setInterval(() => {
      setViewers((prev) => {
        // Change by -2 to +2
        let change = Math.floor(Math.random() * 5) - 2;
        let next = prev + change;
        
        // Keep within 3 to 18 bounds
        if (next < 3) next = 3 + Math.floor(Math.random() * 2);
        if (next > 18) next = 18 - Math.floor(Math.random() * 2);
        
        return next;
      });
    }, 6000 + Math.random() * 4000); // Update every 6-10 seconds

    return () => clearInterval(interval);
  }, []);

  if (viewers === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-2 py-1">
      <div className="flex items-center justify-center relative w-5 h-5">
        <Eye className="w-4 h-4 text-[#1B1B1B] absolute z-10" />
        <div className="absolute inset-0 bg-gray-200 rounded-full animate-ping opacity-50 scale-75" />
      </div>
      <div className="text-sm font-medium text-[#1B1B1B] flex items-center gap-1">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={viewers}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="inline-block font-bold"
          >
            {viewers}
          </motion.span>
        </AnimatePresence>
        <span className="text-gray-500">people viewing now</span>
      </div>
    </div>
  );
}
