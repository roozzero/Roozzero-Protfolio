import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  Star,
  MapPin,
  Calendar as CalendarIcon,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Compass as CompassIcon,
  Clapperboard,
  Film,
  Ticket,
  ShieldCheck,
  Terminal,
  Activity,
  Maximize2,
  Layers,
  Code2,
  ExternalLink,
  Cpu,
  Radio,
  CheckCircle2,
  Volume2
} from "lucide-react";

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Active Project Selection
  const [activeProject, setActiveProject] = useState<"cinema" | "security" | "cloud">("cinema");

  // Interactive Project states for Voo's Cinema
  const [activeScreen, setActiveScreen] = useState<number>(2); // Default to centerpiece (After Earth)
  const [selectedDate, setSelectedDate] = useState<number>(5); // Default calendar date selected (July 5)
  const [selectedShowtime, setSelectedShowtime] = useState<string>("13:00"); // Selected movie showtime
  const [selectedSeats, setSelectedSeats] = useState<string[]>(["C4", "C5"]); // Selected seat IDs
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);

  // Scroll Progress and Parallax setup
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 20, restDelta: 0.001 });

  // Parallax shifts and 3D tilts for phone deck and motion graphics
  const yParallaxLeft = useTransform(smoothProgress, [0, 0.5, 1], [40, 0, -35]);
  const yParallaxRight = useTransform(smoothProgress, [0, 0.5, 1], [70, 0, -50]);
  const rotateX3D = useTransform(smoothProgress, [0, 0.5, 1], [6, 0, -4]);
  const scaleCenter = useTransform(smoothProgress, [0, 0.35, 0.8, 1], [0.97, 1, 1, 0.97]);
  const ambientGlowOpacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.2, 0.75, 0.75, 0.2]);
  const scrollBarWidth = useTransform(smoothProgress, [0.1, 0.9], ["0%", "100%"]);
  const filmReelRotate = useTransform(smoothProgress, [0, 1], [0, 720]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 md:py-24 relative text-white scroll-mt-24 border-t border-white/[0.04] overflow-hidden"
    >
      {/* Dynamic Ambient Background Glows linked to scroll */}
      <motion.div
        style={{ opacity: ambientGlowOpacity }}
        className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[550px] h-[350px] pointer-events-none blur-[150px] bg-gradient-to-tr from-[#FF1A6B]/[0.08] via-purple-600/[0.04] to-transparent rounded-full z-0"
      />
      <motion.div
        style={{ opacity: ambientGlowOpacity }}
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[450px] h-[300px] pointer-events-none blur-[130px] bg-gradient-to-br from-cyan-500/[0.06] via-[#FF3366]/[0.04] to-transparent rounded-full z-0"
      />

      {/* Header Block with Motion Graphics Pill & Project Category Switcher */}
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
              <Sparkles size={11} className="text-[#FF1A6B]" />
            </motion.span>
            <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-white/90 uppercase">
              FEATURED WORKS &amp; LABS
            </span>
          </motion.div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.015] text-[10px] font-mono text-white/40">
            <Radio size={11} className="text-[#FF1A6B] animate-pulse" />
            <span>Interactive 3D Stage</span>
          </div>
        </div>

        {/* Title, Subtitle & Project Selection Tabs (Right) */}
        <div className="lg:col-span-9 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Main Works &amp; Systems
            </h2>
            <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl">
              High-impact digital productions, interactive simulation architectures, and production-ready applications.
            </p>
          </motion.div>

          {/* Project Switcher Navigation */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md self-start md:self-auto shrink-0">
            {[
              { id: "cinema", label: "Voo's Cinema", icon: Film, color: "text-[#FF1A6B]" },
              { id: "security", label: "Aegis Sentinel", icon: ShieldCheck, color: "text-red-400" },
              { id: "cloud", label: "Nexus Engine", icon: Terminal, color: "text-cyan-400" },
            ].map((p) => {
              const Icon = p.icon;
              const isCurrent = activeProject === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProject(p.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold tracking-wider uppercase transition-all duration-300 ${
                    isCurrent
                      ? "bg-white text-black shadow-lg shadow-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon size={12} className={isCurrent ? "text-black" : p.color} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Scroll Progress Line */}
      <div className="relative w-full h-[2px] bg-white/[0.06] rounded-full mb-8 overflow-hidden z-10">
        <motion.div
          style={{ width: scrollBarWidth }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF1A6B] via-purple-500 to-cyan-400 shadow-[0_0_14px_rgba(255,26,107,0.9)]"
        />
      </div>

      {/* Main Container */}
      <motion.div
        style={{ scale: scaleCenter }}
        className="w-full p-6 sm:p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl relative z-10"
      >
        {/* =========================================================================
            VIEW 1: VOO'S CINEMA INTERACTIVE PRODUCTION (Flagship Experience)
           ========================================================================= */}
        {activeProject === "cinema" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* LEFT COLUMN: Brand Story, Motion Graphics Reel, Audio Wave & Technical Metrics */}
            <motion.div
              style={{ y: yParallaxLeft }}
              className="lg:col-span-4 space-y-7 lg:sticky lg:top-28"
            >
              {/* Brand Logo & Rotating Film Reel Graphic */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 select-none">
                  <span className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">V</span>
                  {/* Rotating Cinema Film Sprocket 1 */}
                  <div className="relative w-6 h-6 rounded-full bg-[#FF1A6B] flex items-center justify-center shadow-lg shadow-[#FF1A6B]/30">
                    <motion.div
                      style={{ rotate: filmReelRotate }}
                      className="w-3.5 h-3.5 rounded-full border border-white/40 flex items-center justify-center"
                    >
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </motion.div>
                  </div>
                  {/* Rotating Cinema Film Sprocket 2 */}
                  <div className="relative w-6 h-6 rounded-full bg-[#FF1A6B] flex items-center justify-center shadow-lg shadow-[#FF1A6B]/30">
                    <motion.div
                      style={{ rotate: filmReelRotate }}
                      className="w-3.5 h-3.5 rounded-full border border-white/40 flex items-center justify-center"
                    >
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </motion.div>
                  </div>
                  <span className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">'s Cinema</span>
                </div>

                {/* Status indicator */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#FF1A6B]/20 bg-[#FF1A6B]/10 text-[#FF1A6B] font-mono text-[9px] font-bold uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF1A6B] animate-ping" />
                  Live Deck
                </span>
              </div>

              {/* Description & Overview */}
              <div className="space-y-3">
                <h3 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-white/95 leading-tight">
                  Next-Gen Cinematic Ticketing Experience
                </h3>
                <p className="font-sans text-sm text-white/60 leading-relaxed">
                  Engineered with real-time seat reservation synchronization, IMAX &amp; Cinetech theater acoustics visualization, dynamic showtime filters, and micro-animated ticket generation.
                </p>
              </div>

              {/* MOTION GRAPHIC: Audio Equalizer Waveform & Cinema Acoustics */}
              <div className="p-4 rounded-2xl border border-white/[0.07] bg-black/40 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-16 bg-gradient-to-l from-[#FF1A6B]/10 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Volume2 size={13} className="text-[#FF1A6B]" />
                    <span className="font-mono text-[10px] text-white/70 uppercase tracking-wider">Dolby Atmos Spatial Audio</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#FF1A6B]">48kHz · Lossless</span>
                </div>

                {/* Dynamic Equalizer Motion Spectrum */}
                <div className="flex items-end justify-between gap-1 h-10 px-1">
                  {[45, 80, 60, 95, 35, 70, 85, 40, 90, 65, 50, 100, 75, 45, 85, 60, 95, 55, 30].map((height, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [`${height * 0.3}%`, `${height}%`, `${height * 0.4}%`],
                      }}
                      transition={{
                        duration: 1.2 + (i % 5) * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.05,
                      }}
                      className="flex-1 rounded-full bg-gradient-to-t from-[#FF1A6B] via-purple-400 to-cyan-300 opacity-80 group-hover:opacity-100"
                    />
                  ))}
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="border-t border-dashed border-white/10 pt-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-2.5 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                    <p className="font-sans text-[9px] text-white/40 uppercase tracking-widest mb-1">Architecture</p>
                    <p className="font-sans text-xs font-bold text-white">React 19 + Vite</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                    <p className="font-sans text-[9px] text-white/40 uppercase tracking-widest mb-1">Motion Engine</p>
                    <p className="font-sans text-xs font-bold text-white">Framer Motion</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                    <p className="font-sans text-[9px] text-white/40 uppercase tracking-widest mb-1">Target Markets</p>
                    <p className="font-sans text-xs font-bold text-white">USA &amp; Global</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Ticket Dialog Trigger */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 font-sans text-[10px] font-bold tracking-[0.18em] uppercase transition-all duration-300 rounded-xl bg-[#FF1A6B] text-white shadow-lg shadow-[#FF1A6B]/25 hover:bg-[#ff337e] hover:shadow-[#FF1A6B]/40 cursor-pointer"
                >
                  <Ticket size={13} />
                  <span>Generate e-Ticket</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 font-mono">
                  <span>Seats:</span>
                  <span className="text-white font-bold">{selectedSeats.join(", ") || "None"}</span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: 3D Interactive Phone Mockup Stack with Parallax & Scroll Tilt */}
            <motion.div
              style={{ y: yParallaxRight, rotateX: rotateX3D }}
              className="lg:col-span-8 w-full flex flex-col items-center perspective-[1200px]"
            >
              {/* Screen Switcher Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl mb-4 self-center backdrop-blur-md">
                {[
                  { id: 1, label: "Date & Time", icon: CalendarIcon },
                  { id: 2, label: "In Cinema", icon: Film },
                  { id: 3, label: "Movie Details", icon: Clapperboard },
                  { id: 4, label: "Seat Selection", icon: Ticket },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeScreen === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveScreen(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-sans tracking-wider transition-all duration-300 uppercase ${
                        isActive
                          ? "bg-[#FF1A6B] text-white shadow-[0_4px_14px_rgba(255,26,107,0.4)] font-bold scale-[1.02]"
                          : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <Icon size={11} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* The 3D Mockup Arena */}
              <div className="relative w-full max-w-[660px] h-[530px] sm:h-[570px] flex items-center justify-center overflow-visible select-none mt-2">
                
                {/* SCREEN 1: Date & Time Picker */}
                <motion.div
                  animate={{
                    x: activeScreen === 1 ? 0 : activeScreen === 2 ? -155 : activeScreen === 3 ? -265 : -340,
                    y: activeScreen === 1 ? 0 : activeScreen === 2 ? 10 : activeScreen === 3 ? 20 : 30,
                    scale: activeScreen === 1 ? 1.03 : activeScreen === 2 ? 0.91 : activeScreen === 3 ? 0.84 : 0.78,
                    rotate: activeScreen === 1 ? 0 : activeScreen === 2 ? -4 : activeScreen === 3 ? -7 : -10,
                    opacity: activeScreen === 1 ? 1 : activeScreen === 2 ? 0.85 : activeScreen === 3 ? 0.5 : 0.2,
                    zIndex: activeScreen === 1 ? 30 : activeScreen === 2 ? 20 : activeScreen === 3 ? 10 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setActiveScreen(1)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.08] bg-[#09090C] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden group/phone"
                >
                  {/* Dynamic sheen on phone glass */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none opacity-0 group-hover/phone:opacity-100 transition-opacity duration-700" />

                  {/* Phone Notch/Island */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  {/* Screen Content Wrapper */}
                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    {/* Navigation Bar inside App */}
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#FF1A6B] flex items-center justify-center scale-90">
                          <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[1.5px] border-t-transparent border-b-[1.5px] border-b-transparent border-l-[2.5px] border-l-[#FF1A6B] ml-[0.3px]" />
                          </div>
                        </div>
                        <div className="flex items-center text-[9px] text-white/80 font-medium">
                          <MapPin size={8} className="text-[#FF1A6B] mr-0.5" />
                          <span className="truncate max-w-[85px]">San Francisco</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 w-3.5 items-end">
                        <span className="w-full h-[1px] bg-white/60" />
                        <span className="w-2/3 h-[1px] bg-white/60" />
                        <span className="w-full h-[1px] bg-white/60" />
                      </div>
                    </div>

                    {/* Title and Reset */}
                    <div className="flex justify-between items-center mb-2.5">
                      <h4 className="text-[11px] font-bold text-white tracking-wide uppercase">Date &amp; Time</h4>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedDate(5); }}
                        className="text-[9px] text-white/40 hover:text-white/80 cursor-pointer flex items-center gap-0.5"
                      >
                        Reset <X size={7} />
                      </button>
                    </div>

                    {/* Timeline Slider Mock */}
                    <div className="bg-white/[0.02] border border-white/[0.04] p-2 rounded-xl mb-3">
                      <div className="flex justify-between text-[8px] text-white/30 mb-1">
                        <span>9AM</span>
                        <span className="text-[#FF1A6B] font-medium">12:30 PM</span>
                        <span>11PM</span>
                      </div>
                      <div className="relative w-full h-1 bg-white/10 rounded-full my-1.5">
                        <div className="absolute left-0 right-[40%] h-full bg-[#FF1A6B]" />
                        <div className="absolute left-[60%] -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-md border border-[#FF1A6B] top-1/2 cursor-pointer" />
                      </div>
                    </div>

                    {/* Month Header */}
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-[10px] font-bold text-white/90">July 2026</span>
                      <div className="flex items-center gap-1">
                        <ChevronLeft size={10} className="text-white/40 cursor-pointer" />
                        <ChevronRight size={10} className="text-white/40 cursor-pointer" />
                      </div>
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[7px] text-white/30 font-bold mb-1">
                      <span>SUN</span>
                      <span>MON</span>
                      <span>TUE</span>
                      <span>WED</span>
                      <span>THU</span>
                      <span>FRI</span>
                      <span>SAT</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[8px] flex-1">
                      <span />
                      {Array.from({ length: 31 }).map((_, i) => {
                        const dayNum = i + 1;
                        const isSelected = selectedDate === dayNum;
                        return (
                          <button
                            key={dayNum}
                            onClick={(e) => { e.stopPropagation(); setSelectedDate(dayNum); }}
                            className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#FF1A6B] text-white font-bold shadow-[0_0_8px_rgba(255,26,107,0.5)] scale-110"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/[0.05]">
                      <button className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 cursor-pointer">
                        <X size={10} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveScreen(2); }}
                        className="flex-1 h-6 rounded-lg bg-[#FF1A6B] text-white text-[9px] font-bold tracking-wider uppercase flex items-center justify-center shadow-lg hover:shadow-[#FF1A6B]/20 cursor-pointer"
                      >
                        Filter results
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* SCREEN 2: "In Cinema" Main Centerpiece */}
                <motion.div
                  animate={{
                    x: activeScreen === 2 ? 0 : activeScreen === 1 ? 155 : activeScreen === 3 ? -155 : -255,
                    y: activeScreen === 2 ? 0 : activeScreen === 1 ? 10 : activeScreen === 3 ? 10 : 20,
                    scale: activeScreen === 2 ? 1.05 : activeScreen === 1 ? 0.91 : activeScreen === 3 ? 0.91 : 0.85,
                    rotate: activeScreen === 2 ? 0 : activeScreen === 1 ? 3.5 : activeScreen === 3 ? -3.5 : -6,
                    opacity: activeScreen === 2 ? 1 : activeScreen === 1 ? 0.85 : activeScreen === 3 ? 0.85 : 0.55,
                    zIndex: activeScreen === 2 ? 30 : activeScreen === 1 ? 20 : activeScreen === 3 ? 20 : 10,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setActiveScreen(2)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.12] bg-[#0A0A0E] p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.9)] cursor-pointer select-none overflow-hidden group/device"
                >
                  {/* Dynamic edge illumination */}
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.04] via-transparent to-[#FF1A6B]/[0.08] opacity-60 group-hover/device:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {/* Phone Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  {/* Screen Content */}
                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    {/* Navigation Bar */}
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#FF1A6B] flex items-center justify-center scale-90">
                          <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[1.5px] border-t-transparent border-b-[1.5px] border-b-transparent border-l-[2.5px] border-l-[#FF1A6B] ml-[0.3px]" />
                          </div>
                        </div>
                        <div className="flex items-center text-[9px] text-white/80 font-medium">
                          <MapPin size={8} className="text-[#FF1A6B] mr-0.5" />
                          <span className="truncate max-w-[85px]">San Francisco</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 w-3.5 items-end">
                        <span className="w-full h-[1px] bg-white/60" />
                        <span className="w-2/3 h-[1px] bg-white/60" />
                        <span className="w-full h-[1px] bg-white/60" />
                      </div>
                    </div>

                    {/* Heading Tabs */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <h4 className="text-[12px] font-black text-white tracking-wide">In cinema</h4>
                      <span className="text-[9px] font-medium text-white/40">Coming Soon</span>
                    </div>

                    {/* Movie Poster Card */}
                    <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/[0.07] bg-gradient-to-b from-[#090C16] to-[#020204] flex flex-col items-center justify-between p-3.5 shadow-inner">
                      {/* Space Nebula Background */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.22)_0%,transparent_65%)] pointer-events-none" />
                      <div className="absolute bottom-1/4 w-[130px] h-[130px] rounded-full bg-[#FF1A6B]/[0.05] blur-[25px] pointer-events-none" />

                      {/* Tagline */}
                      <div className="text-center mt-1.5 relative z-10">
                        <p className="text-[5.5px] text-white/40 uppercase tracking-[0.2em] font-sans">1000 YEARS AGO</p>
                        <p className="text-[5.5px] text-white/40 uppercase tracking-[0.2em] font-sans">WE LEFT FOR A REASON</p>
                      </div>

                      {/* Title Block */}
                      <div className="text-center my-3 relative z-10 w-full">
                        <p className="text-[5px] text-white/30 uppercase tracking-widest font-sans mb-0.5">JADEN SMITH  •  WILL SMITH</p>
                        <h3 className="text-[16px] font-black tracking-[0.22em] text-white uppercase font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.35)] leading-none my-1">
                          AFTER
                        </h3>
                        <h3 className="text-[16px] font-black tracking-[0.22em] text-white uppercase font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.35)] leading-none mb-1">
                          EARTH
                        </h3>
                        <p className="text-[5px] text-[#FF1A6B] uppercase tracking-widest font-bold">SUMMER CINEMA</p>
                      </div>

                      {/* Bottom Ticket Label */}
                      <div className="w-full bg-black/50 backdrop-blur-md border border-white/[0.06] p-1.5 rounded-xl flex justify-between items-center relative z-10">
                        <div className="text-left">
                          <p className="text-[8px] font-bold text-white leading-tight">After Earth</p>
                          <p className="text-[6.5px] text-white/40">Daily: 13:00, 17:30</p>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-[5.5px] font-bold tracking-wide text-white/80 bg-white/[0.08] px-1 py-0.5 rounded border border-white/[0.04]">IMAX</span>
                          <span className="text-[5.5px] font-bold tracking-wide text-[#FF1A6B] bg-[#FF1A6B]/10 border border-[#FF1A6B]/20 px-1 py-0.5 rounded">CINETECH</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Dock */}
                    <div className="flex justify-around items-center pt-2.5 mt-2 border-t border-white/[0.05] text-white/30 text-[10px]">
                      <CompassIcon size={12} className="text-[#FF1A6B] cursor-pointer" />
                      <CalendarIcon size={11} className="hover:text-white/80 cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveScreen(1); }} />
                      <User size={11} className="hover:text-white/80 cursor-pointer" />
                    </div>
                  </div>
                </motion.div>

                {/* SCREEN 3: Movie Details View */}
                <motion.div
                  animate={{
                    x: activeScreen === 3 ? 0 : activeScreen === 1 ? 255 : activeScreen === 2 ? 155 : -155,
                    y: activeScreen === 3 ? 0 : activeScreen === 1 ? 20 : activeScreen === 2 ? 10 : 10,
                    scale: activeScreen === 3 ? 1.03 : activeScreen === 1 ? 0.84 : activeScreen === 2 ? 0.91 : 0.91,
                    rotate: activeScreen === 3 ? 0 : activeScreen === 1 ? 7 : activeScreen === 2 ? 3.5 : -3.5,
                    opacity: activeScreen === 3 ? 1 : activeScreen === 1 ? 0.5 : activeScreen === 2 ? 0.85 : 0.85,
                    zIndex: activeScreen === 3 ? 30 : activeScreen === 1 ? 10 : activeScreen === 2 ? 20 : 20,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setActiveScreen(3)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.08] bg-[#09090C] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden"
                >
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative">
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#FF1A6B] flex items-center justify-center scale-90">
                          <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[1.5px] border-t-transparent border-b-[1.5px] border-b-transparent border-l-[2.5px] border-l-[#FF1A6B] ml-[0.3px]" />
                          </div>
                        </div>
                        <div className="flex items-center text-[9px] text-white/80 font-medium">
                          <MapPin size={8} className="text-[#FF1A6B] mr-0.5" />
                          <span className="truncate max-w-[85px]">San Francisco</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <h4 className="text-[11px] font-bold text-white tracking-wide truncate">After Earth: Special Edition</h4>
                      <p className="text-[7px] text-white/40 uppercase">Duration: 100 mins</p>
                    </div>

                    {/* Hero Trailer Scene */}
                    <div className="relative h-[95px] w-full rounded-xl overflow-hidden bg-gradient-to-tr from-[#14151B] via-[#2A1821] to-[#0A0B0E] border border-white/5 flex items-center justify-center mb-2 shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,26,107,0.18),transparent_70%)] pointer-events-none" />
                      <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                        <svg width="8" height="10" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-[1px]">
                          <path d="M1 1.5L8.5 6L1 10.5V1.5Z" fill="white" />
                        </svg>
                      </div>
                      <div className="absolute bottom-1.5 left-2 text-[6px] text-white/40 tracking-wider">OFFICIAL TRAILER</div>
                    </div>

                    {/* Movie Meta Statistics row */}
                    <div className="grid grid-cols-4 gap-1 text-center bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-lg mb-2 text-[7.5px]">
                      <div>
                        <p className="text-white/30">Country</p>
                        <p className="text-white font-bold">USA</p>
                      </div>
                      <div>
                        <p className="text-white/30">Format</p>
                        <p className="text-white font-bold">4K Laser</p>
                      </div>
                      <div>
                        <p className="text-white/30">Rating</p>
                        <p className="text-white font-bold">PG-13</p>
                      </div>
                      <div>
                        <p className="text-[#FF1A6B] font-bold flex items-center justify-center gap-0.5">
                          <Star size={6} fill="#FF1A6B" /> 8.4
                        </p>
                        <p className="text-white/30">IMDb</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[7.5px] text-white/50 leading-relaxed mb-2 line-clamp-2">
                      Crash-landing leaves teenager Kitai and his legendary father Cypher stranded on Earth, where predatory evolved creatures rule...
                    </p>

                    {/* Showtime Selection */}
                    <div className="space-y-1.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7px] text-white/40 uppercase w-7">Today:</span>
                        <div className="flex gap-1 flex-1">
                          {["9:30", "13:00", "17:30"].map((time) => {
                            const isSelected = selectedShowtime === time;
                            return (
                              <button
                                key={time}
                                onClick={(e) => { e.stopPropagation(); setSelectedShowtime(time); }}
                                className={`flex-1 text-[7px] py-0.5 rounded-md text-center border transition-all ${
                                  isSelected
                                    ? "bg-[#FF1A6B]/15 border-[#FF1A6B] text-[#FF1A6B] font-bold"
                                    : "border-white/5 bg-white/[0.02] text-white/60 hover:border-white/20"
                                }`}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/[0.05]">
                      <button className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center text-white/60 hover:bg-white/10">
                        <X size={10} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveScreen(4); }}
                        className="flex-1 h-6 rounded-lg bg-[#FF1A6B] text-white text-[9px] font-bold tracking-wider uppercase flex items-center justify-center shadow-lg hover:shadow-[#FF1A6B]/20 cursor-pointer"
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* SCREEN 4: Seating Selection (Interactive Arena) */}
                <motion.div
                  animate={{
                    x: activeScreen === 4 ? 0 : activeScreen === 1 ? 340 : activeScreen === 2 ? 265 : activeScreen === 3 ? 155 : 0,
                    y: activeScreen === 4 ? 0 : activeScreen === 1 ? 30 : activeScreen === 2 ? 20 : activeScreen === 3 ? 10 : 0,
                    scale: activeScreen === 4 ? 1.03 : activeScreen === 1 ? 0.78 : activeScreen === 2 ? 0.84 : activeScreen === 3 ? 0.91 : 0.91,
                    rotate: activeScreen === 4 ? 0 : activeScreen === 1 ? 10 : activeScreen === 2 ? 7 : activeScreen === 3 ? 3.5 : -3.5,
                    opacity: activeScreen === 4 ? 1 : activeScreen === 1 ? 0.2 : activeScreen === 2 ? 0.55 : activeScreen === 3 ? 0.85 : 0.85,
                    zIndex: activeScreen === 4 ? 30 : activeScreen === 1 ? 0 : activeScreen === 2 ? 10 : activeScreen === 3 ? 20 : 20,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setActiveScreen(4)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.08] bg-[#09090C] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden"
                >
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative">
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#FF1A6B] flex items-center justify-center scale-90">
                          <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[1.5px] border-t-transparent border-b-[1.5px] border-b-transparent border-l-[2.5px] border-l-[#FF1A6B] ml-[0.3px]" />
                          </div>
                        </div>
                        <div className="flex items-center text-[9px] text-white/80 font-medium">
                          <MapPin size={8} className="text-[#FF1A6B] mr-0.5" />
                          <span className="truncate max-w-[85px]">San Francisco</span>
                        </div>
                      </div>
                    </div>

                    {/* Curved Cinema Screen */}
                    <div className="flex flex-col items-center flex-1 py-1">
                      <div className="w-4/5 h-2.5 border-t-[1.5px] border-[#FF1A6B]/40 rounded-[50%] flex items-center justify-center relative mb-4">
                        <div className="absolute top-0 w-3/4 h-[4px] bg-gradient-to-b from-[#FF1A6B]/20 to-transparent blur-[1px]" />
                        <span className="text-[5px] text-[#FF1A6B]/60 uppercase tracking-widest font-black absolute top-1.5 scale-90">CINEMA SCREEN</span>
                      </div>

                      {/* Seating Grid */}
                      <div className="space-y-[3.5px] mb-3 w-full max-w-[190px]">
                        {["A", "B", "C", "D", "E"].map((rowLabel) => (
                          <div key={rowLabel} className="flex items-center justify-center gap-[3px]">
                            <span className="text-[6px] text-white/20 w-2 font-bold text-right mr-1">{rowLabel}</span>
                            {Array.from({ length: 8 }).map((_, colIndex) => {
                              const seatId = `${rowLabel}${colIndex + 1}`;
                              const isBooked = ["A3", "A4", "B2", "B6", "D4", "D5", "E1", "E8"].includes(seatId);
                              const isSelected = selectedSeats.includes(seatId);

                              const handleSeatClick = (e: React.MouseEvent) => {
                                e.stopPropagation();
                                if (isBooked) return;
                                if (isSelected) {
                                  setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
                                } else {
                                  setSelectedSeats((prev) => [...prev, seatId]);
                                }
                              };

                              return (
                                <button
                                  key={seatId}
                                  onClick={handleSeatClick}
                                  disabled={isBooked}
                                  className={`w-[15px] h-[13px] rounded-[3px] text-[4.5px] flex items-center justify-center transition-all ${
                                    isBooked
                                      ? "bg-white/[0.04] text-white/5 border border-white/5 cursor-not-allowed"
                                      : isSelected
                                      ? "bg-[#FF1A6B] border border-[#FF1A6B] text-white font-bold shadow-[0_0_6px_rgba(255,26,107,0.5)] scale-105"
                                      : "border border-white/15 bg-white/[0.02] text-white/40 hover:border-white/40 cursor-pointer"
                                  }`}
                                  title={seatId}
                                >
                                  {colIndex + 1}
                                </button>
                              );
                            })}
                            <span className="text-[6px] text-white/20 w-2 font-bold text-left ml-1">{rowLabel}</span>
                          </div>
                        ))}
                      </div>

                      {/* Legend */}
                      <div className="flex justify-center gap-3 text-[6.5px] text-white/40 mb-2 border-t border-b border-white/[0.03] py-1.5 w-full">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-[2px] border border-white/15 bg-white/[0.02]" />
                          <span>Open</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-[2px] bg-white/[0.04] border border-white/5" />
                          <span>Booked</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-[2px] bg-[#FF1A6B]" />
                          <span>Selected</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-[7.5px] font-medium text-white/70">
                          {selectedSeats.length > 0 ? (
                            <>
                              <span className="text-[#FF1A6B] font-bold">{selectedSeats.length}</span> tickets • <span className="text-white font-bold">${(selectedSeats.length * 14.5).toFixed(2)}</span>
                            </>
                          ) : (
                            "Select seats to continue"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/[0.05]">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedSeats([]); }}
                        className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowTicketModal(true); }}
                        disabled={selectedSeats.length === 0}
                        className={`flex-1 h-6 rounded-lg text-white text-[9px] font-bold tracking-wider uppercase flex items-center justify-center shadow-lg transition-all ${
                          selectedSeats.length === 0
                            ? "bg-white/[0.03] text-white/30 border border-white/5 cursor-not-allowed shadow-none"
                            : "bg-[#FF1A6B] hover:shadow-[#FF1A6B]/20 cursor-pointer"
                        }`}
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Mobile Screen Selector Dots */}
              <div className="flex gap-2.5 mt-8 lg:hidden">
                {[1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setActiveScreen(id)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeScreen === id ? "bg-[#FF1A6B] w-6" : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to screen mockup ${id}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: AEGIS SENTINEL - CYBERSECURITY & THREAT DEFENSE MOTION GRAPHICS
           ========================================================================= */}
        {activeProject === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-4">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <ShieldCheck size={24} />
                </span>
                <div>
                  <span className="font-mono text-[9px] text-red-400 tracking-widest uppercase">DEFENSE ARCHITECTURE</span>
                  <h3 className="font-sans text-3xl font-black text-white">Aegis Sentinel</h3>
                </div>
              </div>

              <p className="font-sans text-sm text-white/60 leading-relaxed">
                Automated vulnerability scanner and runtime intrusion prevention system. Inspects WebSocket packets, sanitizes incoming AST payloads, and protects enterprise APIs against OWASP Top 10 vectors in real-time.
              </p>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 block">LATENCY</span>
                  <span className="text-sm font-bold text-red-400">0.8 ms</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 block">DEFENSE RATE</span>
                  <span className="text-sm font-bold text-emerald-400">99.98%</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 block">ACTIVE NODES</span>
                  <span className="text-sm font-bold text-white">128 Global</span>
                </div>
              </div>
            </div>

            {/* Interactive Threat Radar & Packet Stream Motion Graphic */}
            <div className="lg:col-span-7 h-[380px] rounded-2xl border border-white/[0.08] bg-black/60 p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
              {/* Radar Scanner Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-red-500/15 pointer-events-none flex items-center justify-center">
                <div className="w-[200px] h-[200px] rounded-full border border-red-500/15 flex items-center justify-center">
                  <div className="w-[100px] h-[100px] rounded-full border border-red-500/20" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(239,68,68,0.25)_360deg)]"
                />
              </div>

              {/* Terminal Logs Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 relative z-10">
                <div className="flex items-center gap-2 font-mono text-xs text-white/70">
                  <Terminal size={14} className="text-red-400" />
                  <span>aegis-core/daemon/runtime.telemetry</span>
                </div>
                <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  LIVE INTERCEPT
                </span>
              </div>

              {/* Real-time Streaming Packet Logs */}
              <div className="space-y-2 font-mono text-[11px] relative z-10 py-4">
                <div className="text-white/40">[14:32:01.04] Initializing packet inspection handshake...</div>
                <div className="text-emerald-400/90 flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  <span>Payload hash verified SHA-256 (0x7f...a9c)</span>
                </div>
                <div className="text-red-400/90 flex items-center gap-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <ShieldCheck size={14} />
                  <span>BLOCKED: SQLi Vector injection detected on endpoint /api/auth/query</span>
                </div>
                <div className="text-white/40">[14:32:02.12] Zero-day signature matching against OWASP CVE-2026-X</div>
                <div className="text-cyan-400/90">[14:32:02.89] Rate limiter applied: IP [198.51.100.24] quarantined</div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] relative z-10 font-mono text-[10px] text-white/40">
                <span>Threat Level: ELEVATED (SEC-4)</span>
                <span className="text-red-400 font-bold animate-pulse">Scanning Active Ports...</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: NEXUS ENGINE - HIGH-PERFORMANCE REACTIVE RUNTIME
           ========================================================================= */}
        {activeProject === "cloud" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-4">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Code2 size={24} />
                </span>
                <div>
                  <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase">DISTRIBUTED CLOUD COMPILER</span>
                  <h3 className="font-sans text-3xl font-black text-white">Nexus Engine</h3>
                </div>
              </div>

              <p className="font-sans text-sm text-white/60 leading-relaxed">
                Zero-bundle runtime engine with serverless WASM execution. Provides ultra-low cold start times, instant Hot Module Reloading for distributed teams, and declarative tree-shaking algorithms.
              </p>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 block">COLD START</span>
                  <span className="text-sm font-bold text-cyan-400">12 ms</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 block">THROUGHPUT</span>
                  <span className="text-sm font-bold text-white">45k req/s</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 block">OPTIMIZATION</span>
                  <span className="text-sm font-bold text-emerald-400">-64% Size</span>
                </div>
              </div>
            </div>

            {/* Interactive Compiler Visualization */}
            <div className="lg:col-span-7 h-[380px] rounded-2xl border border-white/[0.08] bg-black/60 p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-white/70">
                  <Terminal size={14} className="text-cyan-400" />
                  <span>nexus-compiler --target=wasm-v8</span>
                </div>
                <span className="font-mono text-[9px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                  BUILD OPTIMIZED
                </span>
              </div>

              {/* Animated AST Graph Nodes */}
              <div className="relative flex-1 flex items-center justify-center my-4">
                <div className="grid grid-cols-3 gap-6 w-full max-w-[420px]">
                  {["Parsing AST", "Tree Shaking", "WASM Emit"].map((step, idx) => (
                    <motion.div
                      key={step}
                      animate={{
                        borderColor: ["rgba(6,182,212,0.2)", "rgba(6,182,212,0.8)", "rgba(6,182,212,0.2)"],
                        y: [0, -4, 0]
                      }}
                      transition={{ duration: 2, delay: idx * 0.4, repeat: Infinity, ease: "easeInOut" }}
                      className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-center flex flex-col items-center gap-2"
                    >
                      <Cpu size={20} className="text-cyan-400" />
                      <span className="font-mono text-[10px] text-white/90 font-bold">{step}</span>
                      <span className="font-mono text-[8px] text-cyan-300">PASS 100%</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] font-mono text-[10px] text-white/40">
                <span>Output Bundle: dist/bundle.wasm (14.2 KB)</span>
                <span className="text-cyan-400 font-bold">Deploy Ready</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* =========================================================================
          INTERACTIVE CINEMA TICKET MODAL / HOLOGRAPHIC PASS
         ========================================================================= */}
      {showTicketModal && (
        <div
          onClick={() => setShowTicketModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] rounded-3xl border border-white/15 bg-gradient-to-b from-[#121218] via-[#09090D] to-black p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient Ticket Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF1A6B]/20 blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#FF1A6B] flex items-center justify-center">
                  <Film size={11} className="text-white" />
                </div>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-white">Voo's Cinema Pass</span>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="border-t border-b border-dashed border-white/15 py-4 my-3 space-y-3">
              <div>
                <span className="font-mono text-[9px] text-[#FF1A6B] uppercase tracking-widest">FEATURE FILM</span>
                <h4 className="font-sans text-lg font-black text-white">After Earth (IMAX 3D)</h4>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                <div>
                  <span className="text-white/40 block">DATE</span>
                  <span className="text-white font-bold">July {selectedDate}, 2026</span>
                </div>
                <div>
                  <span className="text-white/40 block">TIME</span>
                  <span className="text-[#FF1A6B] font-bold">{selectedShowtime}</span>
                </div>
                <div>
                  <span className="text-white/40 block">HALL</span>
                  <span className="text-white font-bold">Hall 04</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex justify-between items-center font-mono">
                <div>
                  <span className="text-[9px] text-white/40 block">RESERVED SEATS</span>
                  <span className="text-sm font-bold text-white">{selectedSeats.join(", ") || "No Seat Selected"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/40 block">TOTAL PAID</span>
                  <span className="text-sm font-bold text-[#FF1A6B]">${(selectedSeats.length * 14.5).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Barcode & Hologram scanner */}
            <div className="pt-2 text-center">
              <div className="h-10 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden mb-2 px-4 gap-1">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-white/80"
                    style={{
                      width: i % 3 === 0 ? "3px" : i % 2 === 0 ? "1.5px" : "2px",
                      opacity: i % 4 === 0 ? 0.4 : 0.9,
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] text-white/40 tracking-widest">
                VERIFIED TICKET TOKEN · 9823-VOO-SF-2026
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
