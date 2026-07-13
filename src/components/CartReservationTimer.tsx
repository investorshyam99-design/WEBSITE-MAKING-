const safeGetItem = (key: string) => { try { return window.safeGetItem(key); } catch (e) { return null; } };
const safeSetItem = (key: string, value: string) => { try { window.safeSetItem(key, value); } catch (e) {} };
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

export function CartReservationTimer() {
  const TIMER_KEY = "ju_checkout_timer_end";
  const TIMER_DURATION = 10 * 60; // 10 minutes in seconds

  const [remaining, setRemaining] = useState<number>(TIMER_DURATION);

  const initTimer = () => {
    const endTime = Date.now() + TIMER_DURATION * 1000;
    safeSetItem(TIMER_KEY, endTime.toString());
    setRemaining(TIMER_DURATION);
  };

  useEffect(() => {
    let endTimeStr = safeGetItem(TIMER_KEY);
    let endTime: number;

    if (!endTimeStr) {
      endTime = Date.now() + TIMER_DURATION * 1000;
      safeSetItem(TIMER_KEY, endTime.toString());
    } else {
      endTime = parseInt(endTimeStr, 10);
      // If already expired in storage, reset it
      if (endTime <= Date.now()) {
        endTime = Date.now() + TIMER_DURATION * 1000;
        safeSetItem(TIMER_KEY, endTime.toString());
      }
    }

    const updateTimer = () => {
      const now = Date.now();
      const left = Math.max(0, Math.floor((endTime - now) / 1000));
      
      if (left <= 0) {
        // Trigger alert popup
        clearInterval(interval);
        setTimeout(() => {
          alert("Cart Reserved Expired — prices may change");
          // Reset timer back to 10:00 to keep them in funnel
          initTimer();
        }, 100);
      } else {
        setRemaining(left);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [remaining === 0]); // Re-run when reset occurs

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const displayTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="sticky top-0 z-20 px-4 md:px-6 py-3 bg-[#FFF5F5] border-b border-red-100">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between text-[#e83e44]"
      >
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-medium text-red-700 leading-relaxed">
            ⚡ This item is in high demand. We've reserved your cart for the next <span className="font-bold">{displayTime}</span> minutes to help secure your order.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
