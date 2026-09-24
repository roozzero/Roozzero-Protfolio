import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import { Mail, Send, Instagram, Github, Linkedin, Check, Sparkles } from "lucide-react";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Scroll Progress and Parallax setup
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 85, damping: 22, restDelta: 0.001 });
  const scrollBarWidth = useTransform(smoothProgress, [0.1, 0.9], ["0%", "100%"]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
      // Auto-reset message after 4 seconds
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

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
    <section
      ref={sectionRef}
      id="contact-me"
      className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 md:py-20 relative text-white border-t border-white/[0.04] scroll-mt-24 overflow-hidden"
    >
      {/* Dynamic ambient backdrops matching the dark premium theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none blur-[160px] bg-gradient-to-tr from-emerald-500/[0.03] via-teal-500/[0.02] to-transparent rounded-full z-0" />
      
      {/* Unified Section Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-8 md:mb-10 relative z-10 w-full">
        {/* Badge Column (Left) */}
        <div className="lg:col-span-3 flex items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm">
            <Sparkles size={11} className="text-emerald-400 animate-pulse" />
            <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-white/80 uppercase">
              CONTACT ME
            </span>
          </div>
        </div>

        {/* Title & Subtitle Column (Right) */}
        <div className="lg:col-span-9 space-y-4">
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
            Let's talk.
          </h2>
          <p className="font-sans text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
            Want to start a project, learn React, or just chat? Feel free to connect or subscribe below.
          </p>
        </div>
      </div>

      {/* Dynamic Scroll Progress Line - Unified to Emerald Glow */}
      <div className="relative w-full h-[2px] bg-white/[0.06] rounded-full mb-10 overflow-hidden z-10">
        <motion.div
          style={{ width: scrollBarWidth }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.8)]"
        />
      </div>

      {/* Contact Content wrapped in our specified container */}
      <div className="w-full p-4 sm:p-6 md:p-8 relative z-10 max-w-2xl mx-auto">
        <div className="relative z-10 text-center space-y-6">

        {/* Subscription Input Form Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-xl mx-auto w-full"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="subscription-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex border border-white/10 bg-[#060608]/90 focus-within:border-emerald-500/50 transition-all overflow-hidden w-full rounded-none"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-transparent px-4 sm:px-6 py-4 text-xs sm:text-sm text-white/95 placeholder-white/30 focus:outline-none font-sans font-normal"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#18181b] hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:bg-emerald-400 px-6 sm:px-8 py-4 text-[10px] sm:text-xs font-sans font-bold tracking-[0.18em] text-white/80 transition-all border-l border-white/10 uppercase cursor-pointer"
                >
                  SUBSCRIBE
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="subscription-success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3 border border-emerald-500/30 bg-emerald-500/[0.04] p-4 text-emerald-400 font-sans text-sm font-semibold rounded-none"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-emerald-400" />
                </div>
                <span>Welcome to the Inner Circle. Thank you!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Elegant Social Media Buttons Row - Green border & text on hover, NO background */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4 pt-2"
        >
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl border border-white/10 bg-transparent text-white/60 hover:text-[#10b981] hover:border-[#10b981] hover:bg-transparent transition-colors duration-300 font-sans text-xs font-semibold tracking-wider cursor-pointer"
                >
                  <IconComponent size={14} className="shrink-0 transition-colors duration-300 text-white/60 group-hover:text-[#10b981]" />
                  <span className="transition-colors duration-300 text-white/60 group-hover:text-[#10b981]">{social.name}</span>
                </motion.a>
              );
            })}
          </div>
        </motion.div>

      </div>
      </div>
    </section>
  );
}
