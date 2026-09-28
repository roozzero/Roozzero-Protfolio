import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { loadCmsConfig } from "../constants/defaultCms";
import {
  Sparkles,
  Award,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Layers,
  Code2,
  Cpu,
  Zap,
  Activity,
  Radar,
  Crosshair,
  Lock,
  Server,
  Workflow,
  Radio,
  Eye
} from "lucide-react";

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "frontend" | "backend" | "security">("all");

  const [skillsConfig, setSkillsConfig] = useState(() => loadCmsConfig().skills);

  useEffect(() => {
    const handleUpdate = () => {
      setSkillsConfig(loadCmsConfig().skills);
    };
    window.addEventListener("cms_config_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cms_config_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter matching flags
  const showReact = activeFilter === "all" || activeFilter === "frontend";
  const showNext = activeFilter === "all" || activeFilter === "frontend" || activeFilter === "backend";
  const showLeftCol = showReact || showNext;

  const showNode = activeFilter === "all" || activeFilter === "backend";
  const showOwasp = activeFilter === "all" || activeFilter === "security";
  const showJs = activeFilter === "all" || activeFilter === "frontend" || activeFilter === "backend";
  const showTailwind = activeFilter === "all" || activeFilter === "frontend";
  const showTs = activeFilter === "all" || activeFilter === "frontend" || activeFilter === "backend";
  const showThreatHunting = activeFilter === "all" || activeFilter === "security";

  // Track scroll position through the section for rich parallax and progress motion
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Smooth spring physics for scroll values
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, restDelta: 0.001 });

  // Parallax shifts and scroll-linked continuous rotations
  const yLeft = useTransform(smoothProgress, [0, 0.5, 1], [40, 0, -35]);
  const yRight = useTransform(smoothProgress, [0, 0.5, 1], [70, 0, -50]);
  const scaleCenter = useTransform(smoothProgress, [0, 0.4, 0.8, 1], [0.97, 1, 1, 0.97]);
  const glowOpacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.2, 0.85, 0.85, 0.2]);
  const progressBarWidth = useTransform(smoothProgress, [0.12, 0.88], ["0%", "100%"]);

  // Dynamic rotations linked directly to user scrolling
  const scrollRotateAtom = useTransform(smoothProgress, [0, 1], [0, 360]);
  const scrollRotateRadar = useTransform(smoothProgress, [0, 1], [0, 540]);
  const scrollRotateHex = useTransform(smoothProgress, [0, 1], [0, -360]);
  const scrollLaserY = useTransform(smoothProgress, [0.1, 0.9], ["-20%", "120%"]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 md:py-24 relative text-white scroll-mt-24 overflow-hidden border-t border-white/[0.04]"
    >
      {/* Background Animated Ambient Lights reacting to scroll - Unified to Emerald Theme */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute top-1/4 right-1/4 w-[550px] h-[350px] pointer-events-none blur-[150px] bg-gradient-to-tl from-emerald-500/[0.08] via-emerald-600/[0.04] to-transparent rounded-full z-0"
      />
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute bottom-1/4 left-10 w-[450px] h-[450px] pointer-events-none blur-[150px] bg-gradient-to-br from-emerald-400/[0.06] via-teal-600/[0.03] to-transparent rounded-full z-0"
      />

      {/* Header Block with Motion Graphics Pill & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-10 md:mb-14 relative z-10 w-full">
        {/* Badge Column (Left) */}
        <div className="lg:col-span-3 flex flex-col items-start gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="inline-flex"
            >
              <Sparkles size={11} className="text-emerald-400" />
            </motion.span>
            <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-white/90 uppercase">
              {skillsConfig.badge || "MY SKILLS & STACK"}
            </span>
          </motion.div>

          {/* Scroll progress telemetry badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.015] text-[10px] font-mono text-white/40">
            <Radio size={11} className="text-emerald-400 animate-pulse" />
            <span>Interactive Motion Engine</span>
          </div>
        </div>

        {/* Title, Subtitle & Interactive Filter Tabs (Right) */}
        <div className="lg:col-span-9 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              {skillsConfig.title || "Skills & Engineering Stack"}
            </h2>
            <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl">
              {skillsConfig.description || "Technologies, tools, and security skills I use to design, develop, and secure modern digital experiences."}
            </p>
          </motion.div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md self-start md:self-auto shrink-0">
            {[
              { id: "all", label: "All Stack", count: 8 },
              { id: "frontend", label: "Frontend", count: 5 },
              { id: "backend", label: "Backend", count: 4 },
              { id: "security", label: "Security", count: 2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold tracking-wider uppercase transition-all duration-300 ${
                  activeFilter === tab.id
                    ? "bg-white text-black shadow-lg shadow-white/10"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeFilter === tab.id
                      ? "bg-black/10 text-black font-bold"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Scroll Progress Line - Unified to Emerald Glow */}
      <div className="relative w-full h-[2px] bg-white/[0.06] rounded-full mb-8 overflow-hidden z-10">
        <motion.div
          style={{ width: progressBarWidth }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.8)]"
        />
      </div>

      {/* Main Bento Container */}
      <motion.div
        style={{ scale: scaleCenter }}
        className="w-full p-5 sm:p-7 md:p-9 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-stretch">

          {/* =========================================================================
              LEFT COLUMN: High-Fidelity Interactive Hero Motion Graphic Cards
             ========================================================================= */}
          {showLeftCol && (
            <motion.div style={{ y: yLeft }} className="lg:col-span-5 flex flex-col gap-6">

              {/* 1. REACT: Quantum Orbital Atom Motion Graphic (Emerald Theme + Scroll Linked) */}
              {showReact && (
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6, borderColor: "rgba(16,185,129,0.35)" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-[250px] sm:h-[265px] w-full rounded-2xl border border-white/[0.08] bg-gradient-to-br from-emerald-950/25 via-white/[0.02] to-transparent flex flex-col justify-between p-6 sm:p-7 shadow-xl group overflow-hidden transition-all duration-500"
                >
                  {/* Radial Emerald Glow on Hover */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Orbital Motion Graphic Canvas */}
                  <div className="absolute top-4 right-4 w-32 h-32 sm:w-36 sm:h-36 pointer-events-none flex items-center justify-center">
                    {/* Outer Rotating SVG Atom Orbitals (Reacts both continuously and to scroll) */}
                    <motion.div
                      style={{ rotate: scrollRotateAtom }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        viewBox="-20 -20 40 40"
                        className="w-full h-full filter drop-shadow-[0_0_14px_rgba(16,185,129,0.4)]"
                      >
                        {/* Orbit Ring 1 */}
                        <motion.ellipse
                          rx="15"
                          ry="6"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="0.8"
                          strokeDasharray="4 2"
                          className="opacity-70"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {/* Orbit Ring 2 */}
                        <motion.ellipse
                          rx="15"
                          ry="6"
                          transform="rotate(60)"
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="0.8"
                          className="opacity-80"
                        />
                        {/* Orbit Ring 3 */}
                        <motion.ellipse
                          rx="15"
                          ry="6"
                          transform="rotate(120)"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="0.8"
                          strokeDasharray="6 3"
                          className="opacity-70"
                        />
                      </motion.svg>
                    </motion.div>

                    {/* Traveling Emerald Electron 1 */}
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                      className="absolute w-28 h-28 flex items-start justify-center pointer-events-none"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_10px_#10b981]" />
                    </motion.div>

                    {/* Traveling Emerald Electron 2 (Reverse angle) */}
                    <motion.div
                      animate={{
                        rotate: [360, 0],
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      className="absolute w-24 h-24 flex items-end justify-center pointer-events-none"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 shadow-[0_0_8px_#34d399]" />
                    </motion.div>

                    {/* Pulsing Glowing Nucleus Core */}
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_20px_#10b981]"
                    />
                  </div>

                  {/* Top Tag & Status */}
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 font-mono text-[9px] font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Frontend Core
                    </span>
                    <span className="font-mono text-[10px] text-white/40">React · JavaScript · Frontend</span>
                  </div>

                  {/* Bottom Information & Interactive Telemetry */}
                  <div className="relative z-10 mt-auto">
                    <h4 className="font-sans text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                      React Architecture
                    </h4>
                    <p className="font-sans text-xs text-white/50 mt-1 max-w-[80%] line-clamp-2">
                      Atomic component patterns, optimized re-render bounds, custom hook state machines, and fluid micro-states.
                    </p>

                    {/* Telemetry Metric Bar */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Mastery</span>
                        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                          <motion.div
                            key={`react-bar-${activeFilter}`}
                            initial={{ width: 0 }}
                            animate={{ width: "96%" }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">96% EXPERT</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. NEXT.JS: Laser-Scanned SSR & Edge Matrix Motion Graphic */}
              {showNext && (
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6, borderColor: "rgba(16,185,129,0.35)" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                  className="relative h-[250px] sm:h-[265px] w-full rounded-2xl border border-white/[0.08] bg-gradient-to-br from-emerald-950/20 via-white/[0.02] to-transparent flex flex-col justify-between p-6 sm:p-7 shadow-xl group overflow-hidden transition-all duration-500"
                >
                  {/* Laser Grid Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity" />

                  {/* Next.js Motion Graphic Canvas (Animated Laser Scanner + Edge Nodes) */}
                  <div className="absolute top-4 right-4 w-32 h-32 pointer-events-none flex flex-col items-center justify-center">
                    {/* The Stylized Next Logo Container */}
                    <div className="relative w-16 h-16 rounded-2xl bg-black/60 border border-emerald-500/20 flex items-center justify-center overflow-hidden shadow-2xl">
                      {/* Moving Laser Scan Line (Coupled with continuous and scroll shifts) */}
                      <motion.div
                        animate={{ y: ["-100%", "200%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-85 shadow-[0_0_10px_#10b981]"
                      />

                      <svg width="34" height="34" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask_next_emerald" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                          <circle cx="90" cy="90" r="90" fill="black" />
                        </mask>
                        <g mask="url(#mask_next_emerald)">
                          <circle cx="90" cy="90" r="90" fill="black" />
                          <path d="M149.508 157.52L69.142 54H54V126H68.303V74.4552L138.318 162.776C142.33 161.218 146.082 159.452 149.508 157.52Z" fill="url(#paint0_next_emerald)" />
                          <path d="M115 54H129V126H115V54Z" fill="url(#paint1_next_emerald)" />
                        </g>
                        <defs>
                          <linearGradient id="paint0_next_emerald" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#34d399" />
                            <stop offset="1" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="paint1_next_emerald" x1="121" y1="54" x2="121" y2="126" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#34d399" />
                            <stop offset="1" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Micro Edge Server Node Pulses */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.9, 0.3] }}
                          transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
                          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Top Tag & Status */}
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                      <Server size={10} />
                      Full-Stack SSR
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Next.js · React · Web
                    </span>
                  </div>

                  {/* Bottom Information & Interactive Telemetry */}
                  <div className="relative z-10 mt-auto">
                    <h4 className="font-sans text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                      Next.js
                    </h4>
                    <p className="font-sans text-xs text-white/50 mt-1 max-w-[80%] line-clamp-2">
                      Developing modern web applications with Next.js, routing, optimized rendering, and scalable architectures.
                    </p>

                    {/* Telemetry Metric Bar */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Mastery</span>
                        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                          <motion.div
                            key={`next-bar-${activeFilter}`}
                            initial={{ width: 0 }}
                            animate={{ width: "94%" }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">94% ADVANCED</span>
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

          {/* =========================================================================
              RIGHT COLUMN: Interactive Motion Graphic Competency Tiles (All Emerald)
             ========================================================================= */}
          <motion.div
            style={{ y: yRight }}
            className={`${showLeftCol ? "lg:col-span-7" : "lg:col-span-12"} grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6`}
          >

            {/* 3. Node.js (Asynchronous Event Loop Motion Graphic) */}
            {showNode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.35)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-[160px] rounded-2xl border border-emerald-500/[0.12] bg-gradient-to-b from-emerald-500/[0.04] to-transparent p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all duration-300"
              >
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-center relative overflow-hidden">
                    {/* Rotating Event Loop Hexagon reacting to scroll */}
                    <motion.div style={{ rotate: scrollRotateHex }}>
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        width="22"
                        height="22"
                        viewBox="0 0 256 256"
                        fill="none"
                      >
                        <path d="M128 0L24 60v120l104 60 104-60V60L128 0zm78 163.5l-78 45-78-45V85.5l78-45 78 45v78z" fill="#10b981" />
                      </motion.svg>
                    </motion.div>
                    {/* Blinking Async Pulse */}
                    <motion.span
                      animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="absolute inset-0 border border-emerald-400/40 rounded-xl"
                    />
                  </div>

                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                    libuv · Event Loop
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h5 className="font-sans text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Node.js</h5>
                    <span className="font-mono text-[10px] text-white/50">92%</span>
                  </div>
                  <p className="font-sans text-[11px] text-white/40 mt-0.5 line-clamp-1">Scalable async runtimes, microservices &amp; streams</p>

                  <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                    <motion.div
                      key={`node-bar-${activeFilter}`}
                      initial={{ width: 0 }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. OWASP (Radar Sweep & Threat Defense Motion Graphic - Emerald Theme) */}
            {showOwasp && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.35)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                className="h-[160px] rounded-2xl border border-emerald-500/[0.12] bg-gradient-to-b from-emerald-500/[0.04] to-transparent p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all duration-300"
              >
                {/* Radar Sweep Effect inside Card reacting to scroll & continuous loop */}
                <div className="absolute top-2 right-2 w-20 h-20 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity">
                  <motion.div
                    style={{ rotate: scrollRotateRadar }}
                    className="w-full h-full"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full rounded-full border border-emerald-500/20 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.3)_360deg)]"
                    />
                  </motion.div>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ShieldCheck size={20} className="text-emerald-400" />
                    </motion.div>
                  </div>

                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock size={9} />
                    <span>Zero-Day Defended</span>
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h5 className="font-sans text-base font-bold text-white group-hover:text-emerald-300 transition-colors">OWASP Top 10</h5>
                    <span className="font-mono text-[10px] text-white/50">98%</span>
                  </div>
                  <p className="font-sans text-[11px] text-white/40 mt-0.5 line-clamp-1">XSS, CSRF, SQLi sanitization &amp; defense</p>

                  <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                    <motion.div
                      key={`owasp-bar-${activeFilter}`}
                      initial={{ width: 0 }}
                      animate={{ width: "98%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. JavaScript (Dynamic Syntax Engine & Floating Particles - Emerald Theme) */}
            {showJs && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.35)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="h-[160px] rounded-2xl border border-emerald-500/[0.12] bg-gradient-to-b from-emerald-500/[0.04] to-transparent p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all duration-300"
              >
                {/* Floating Syntax Particles in Emerald */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 group-hover:opacity-60 transition-opacity">
                  <motion.span
                    animate={{ y: [25, -25], opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute right-4 font-mono text-[9px] text-emerald-300"
                  >
                    =&gt; async
                  </motion.span>
                  <motion.span
                    animate={{ y: [35, -15], opacity: [0, 1, 0] }}
                    transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute right-12 font-mono text-[9px] text-emerald-400"
                  >
                    Promise.all()
                  </motion.span>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-center">
                    <span className="font-sans font-black text-emerald-400 text-sm leading-none">JS</span>
                  </div>

                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                    ESNext · V8 Engine
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h5 className="font-sans text-base font-bold text-white group-hover:text-emerald-300 transition-colors">JavaScript</h5>
                    <span className="font-mono text-[10px] text-white/50">97%</span>
                  </div>
                  <p className="font-sans text-[11px] text-white/40 mt-0.5 line-clamp-1">Prototypes, closures, concurrency &amp; Web APIs</p>

                  <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                    <motion.div
                      key={`js-bar-${activeFilter}`}
                      initial={{ width: 0 }}
                      animate={{ width: "97%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. Tailwind CSS (Morphing Wave & Breakpoint Motion Graphic - Emerald Theme) */}
            {showTailwind && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.35)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                className="h-[160px] rounded-2xl border border-emerald-500/[0.12] bg-gradient-to-b from-emerald-500/[0.04] to-transparent p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all duration-300"
              >
                {/* Morphing SVG Wave Path in Emerald */}
                <div className="absolute -right-4 -bottom-2 w-28 h-16 pointer-events-none opacity-30 group-hover:opacity-70 transition-opacity">
                  <motion.svg
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    viewBox="0 0 100 40"
                    className="w-full h-full text-emerald-400 fill-current"
                  >
                    <path d="M0 20 Q 25 5, 50 20 T 100 20 V 40 H 0 Z" />
                  </motion.svg>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-center">
                    <motion.svg
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path d="M12 6.095c-1.334 0-2.333.667-3 2 1.333-2 2.667-2.333 4-1 .762.762 1.543 1.543 2.5 2.5 1.556 1.555 3.321 2.333 5.3 2.333 1.333 0 2.333-.667 3-2-1.333 2-2.667 2.333-4 1-.762-.762-1.543-1.543-2.5-2.5-1.556-1.556-3.321-2.333-5.3-2.333zm-6 6c-1.334 0-2.333.667-3 2 1.333-2 2.667-2.333 4-1 .762.762 1.543 1.543 2.5 2.5 1.556 1.555 3.321 2.333 5.3 2.333 1.333 0 2.333-.667 3-2-1.333 2-2.667 2.333-4 1-.762-.762-1.543-1.543-2.5-2.5-1.556-1.556-3.321-2.333-5.3-2.333z" fill="#10b981" />
                    </motion.svg>
                  </div>

                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                    Zero Runtime · JIT
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h5 className="font-sans text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Tailwind CSS</h5>
                    <span className="font-mono text-[10px] text-white/50">99%</span>
                  </div>
                  <p className="font-sans text-[11px] text-white/40 mt-0.5 line-clamp-1">Fluid typography, tokens, animations &amp; dark mode</p>

                  <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                    <motion.div
                      key={`tailwind-bar-${activeFilter}`}
                      initial={{ width: 0 }}
                      animate={{ width: "99%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. TypeScript (Static Type Matrix Motion Graphic - Emerald Theme) */}
            {showTs && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.35)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="h-[160px] rounded-2xl border border-emerald-500/[0.12] bg-gradient-to-b from-emerald-500/[0.04] to-transparent p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all duration-300"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-center">
                    <span className="font-sans font-black text-emerald-400 text-sm leading-none">TS</span>
                  </div>

                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Code2 size={10} />
                    <span>Strict Type System</span>
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h5 className="font-sans text-base font-bold text-white group-hover:text-emerald-300 transition-colors">TypeScript</h5>
                    <span className="font-mono text-[10px] text-white/50">95%</span>
                  </div>
                  <p className="font-sans text-[11px] text-white/40 mt-0.5 line-clamp-1">Generics, discriminated unions &amp; AST validation</p>

                  <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                    <motion.div
                      key={`ts-bar-${activeFilter}`}
                      initial={{ width: 0 }}
                      animate={{ width: "95%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. Threat Hunting / SecOps (Tactical Crosshair & Telemetry Motion Graphic - Emerald Theme) */}
            {showThreatHunting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.35)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                className="h-[160px] rounded-2xl border border-emerald-500/[0.12] bg-gradient-to-b from-emerald-500/[0.04] to-transparent p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group transition-all duration-300"
              >
                {/* Rotating Tactical Crosshair reacting to scroll */}
                <div className="absolute top-2 right-2 w-16 h-16 pointer-events-none opacity-25 group-hover:opacity-80 transition-opacity">
                  <motion.div
                    style={{ rotate: scrollRotateHex }}
                    className="w-full h-full flex items-center justify-center text-emerald-400"
                  >
                    <Crosshair size={36} strokeWidth={1} />
                  </motion.div>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <Radar size={20} className="text-emerald-400" />
                    </motion.div>
                  </div>

                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Activity size={9} className="text-emerald-400 animate-pulse" />
                    <span>Threat Intelligence</span>
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h5 className="font-sans text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Threat Hunting</h5>
                    <span className="font-mono text-[10px] text-white/50">93%</span>
                  </div>
                  <p className="font-sans text-[11px] text-white/40 mt-0.5 line-clamp-1">Proactive threat detection &amp; attack vector triage</p>

                  <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                    <motion.div
                      key={`threathunting-bar-${activeFilter}`}
                      initial={{ width: 0 }}
                      animate={{ width: "93%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
