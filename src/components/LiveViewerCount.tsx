import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function LiveViewerCount() {
  const [viewers, setViewers] = useState<number>(0);

  useEffect(() => {
    // Initial random number between 50 and 99
    const initialViewers = Math.floor(Math.random() * (99 - 50 + 1)) + 50;
    setViewers(initialViewers);

    const interval = setInterval(() => {
      setViewers((prev) => {
        // Change by -2 to +2
        const changeOptions = [-2, -1, 0, 1, 2];
        const change = changeOptions[Math.floor(Math.random() * changeOptions.length)];
        let next = prev + change;
        
        // Keep within 50 to 99 bounds
        if (next < 50) next = 50 + Math.floor(Math.random() * 3);
        if (next > 99) next = 99 - Math.floor(Math.random() * 3);
        
        return next;
      });
    }, 4000); // Shifts every 4 seconds

    return () => clearInterval(interval);
  }, []);

  if (viewers === 0) return null;

  return (
    <div id="live-viewer-count" className="flex items-center gap-2 mt-2 py-1 select-none">
      <motion.div 
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
        className="flex items-center justify-center text-2xl mr-1 origin-center"
      >
        👀
      </motion.div>
      <div className="text-xs md:text-sm font-medium text-[#1B1B1B] flex items-center gap-1">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={viewers}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            className="inline-block font-black text-[#e83e44]"
          >
            {viewers}
          </motion.span>
        </AnimatePresence>
        <span className="text-gray-500 font-medium">people viewing this shirt right now</span>
      </div>
    </div>
  );
}
