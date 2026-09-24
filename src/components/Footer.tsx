import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Instagram, Github, Linkedin, Sparkles, ArrowRight } from "lucide-react";
import { loadCmsConfig } from "../constants/defaultCms";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const [footerConfig, setFooterConfig] = useState(() => loadCmsConfig().footer);

  useEffect(() => {
    const handleUpdate = () => {
      setFooterConfig(loadCmsConfig().footer);
    };
    window.addEventListener("cms_config_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cms_config_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Word slider state: alternates between configured words
  const words = footerConfig.animatedWords && footerConfig.animatedWords.length > 0
    ? footerConfig.animatedWords
    : ["BUILD", "CREATE"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(wordInterval);
  }, [words.length]);

  const socialLinks = [
    {
      name: "Telegram",
      icon: Send,
      url: "https://t.me/roozzero",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/roozzero",
    },
    {
      name: "GitHub",
      icon: Github,
      url: "https://github.com/roozzero",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com/in/roozzero",
    },
  ];

  return (
    <footer className="w-full bg-[#030304] border-t border-white/[0.03] pt-10 pb-6 px-6 sm:px-8 lg:px-12 relative overflow-hidden text-white">
      {/* Subtle ambient lighting element in the footer background */}
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[150px] pointer-events-none blur-[120px] bg-gradient-to-tr from-emerald-500/[0.02] to-teal-500/[0.01] rounded-full z-0" />
      <div className="absolute top-0 left-1/4 w-[350px] h-[150px] pointer-events-none blur-[120px] bg-gradient-to-tr from-emerald-600/[0.01] to-emerald-400/[0.02] rounded-full z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Main Content Layout Grid */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12 pb-8">
          
          {/* LEFT COLUMN: Animated text, Subtitle */}
          <div className="flex-1 space-y-5 text-left w-full md:max-w-[65%]">
            
            {/* BRAND AREA */}
            <div className="space-y-3">
              {/* Smooth Vertical Word Slider: Show "LET'S BUILD" / "LET'S CREATE" */}
              <div className="flex items-center gap-2.5 font-sans text-2xl sm:text-3xl font-black text-white tracking-widest uppercase">
                <span>LET'S</span>
                <div className="relative h-[36px] overflow-hidden inline-flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="text-[#10b981] inline-block font-black"
                    >
                      {words[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Smaller Subtitle */}
              <p className="font-sans text-xs sm:text-sm font-normal text-white/40 tracking-wider">
                {footerConfig.tagline || "incredible work together."}
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: Social Media and CTA */}
          <div className="flex flex-col items-start md:items-end space-y-5 text-left md:text-right w-full md:w-auto shrink-0">
            
            {/* Social Media Row */}
            <div className="space-y-2.5 w-full md:w-auto">
              <p className="text-[10px] tracking-widest text-white/40 uppercase font-bold font-mono block">
                Connect on Socials
              </p>
              
              {/* Social Media Buttons aligned in a single row on desktop, wrapping gracefully */}
              <div className="flex flex-wrap md:justify-end gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-transparent text-white/50 hover:text-[#10b981] hover:border-[#10b981] hover:bg-transparent transition-colors duration-300 font-sans text-xs font-semibold tracking-wider cursor-pointer"
                    >
                      <Icon size={13} className="shrink-0 transition-colors duration-300 text-white/50 group-hover:text-[#10b981]" />
                      <span className="transition-colors duration-300 text-white/50 group-hover:text-[#10b981]">{social.name}</span>
                    </motion.a>
                  );
                })}
              </div>
            </div>



          </div>

        </div>

        {/* Divider matching premium visual language */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

        {/* Copyright notice and Dynamic year */}
        <div className="flex flex-row items-center justify-between gap-2 text-center text-[9px] xs:text-[10px] sm:text-[11px] font-sans tracking-wider text-white/30 font-light w-full whitespace-nowrap">
          <p className="whitespace-nowrap">© {currentYear} {footerConfig.brandName || "ROOZZERO"}. {footerConfig.copyright || "All Rights Reserved."}</p>
          <p className="flex items-center gap-1 whitespace-nowrap">
            Designed & Developed with <span className="text-emerald-500">❤️</span>.
          </p>
        </div>

      </div>
    </footer>
  );
}
