import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

export function CartReservationTimer() {
  const TIMER_KEY = "ju_cart_timer_end";
  const TIMER_DURATION = 10 * 60; // 10 minutes in seconds

  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let endTimeStr = sessionStorage.getItem(TIMER_KEY);
    let endTime: number;

    if (!endTimeStr) {
      endTime = Date.now() + TIMER_DURATION * 1000;
      sessionStorage.setItem(TIMER_KEY, endTime.toString());
    } else {
      endTime = parseInt(endTimeStr, 10);
    }

    const updateTimer = () => {
      const now = Date.now();
      const left = Math.max(0, Math.floor((endTime - now) / 1000));
      setRemaining(left);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (remaining === null) return null;

  const isExpired = remaining <= 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const displayTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="sticky top-0 z-20 px-4 md:px-6 pt-4 pb-2 bg-gray-50/95 backdrop-blur-sm shadow-sm">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border transition-colors duration-500 ease-in-out ${
          isExpired
            ? "bg-[#F5F5F5] border-[#E0E0E0]"
            : "bg-[#F3EFE9] border-[#E5DAC3]"
        }`}
      >
        <div className="flex items-start gap-3">
          {!isExpired && (
            <div className="w-2 h-2 mt-2 rounded-full bg-black/60 animate-pulse flex-shrink-0" />
          )}
          <div className="flex-1">
            {isExpired ? (
              <p className="text-sm font-medium text-[#1B1B1B]">
                Cart reservation expired. Items may no longer be available.
              </p>
            ) : (
              <p className="text-sm text-[#1B1B1B] leading-relaxed">
                Please, hurry! Someone has placed an order on one of the items you have in the cart. We'll keep it for you for{" "}
                <span className="block mt-1 font-black text-xl tracking-tight">
                  {displayTime} <span className="text-base font-medium">minutes</span>
                </span>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
