import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="back-to-top-btn"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 backdrop-blur-md text-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.8)] outline-none transition-colors duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/[0.08] hover:text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-black sm:bottom-8 sm:right-8"
          aria-label="Back to Top"
        >
          <ArrowUp size={18} className="stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
