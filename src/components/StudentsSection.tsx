import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring
} from "motion/react";
import { loadCmsConfig } from "../constants/defaultCms";
import {
  Star,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Globe2,
  Users,
  Quote,
  Layers,
  LayoutGrid,
  Radio,
  ExternalLink,
  Zap,
  Volume2,
  Building,
  Briefcase
} from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StudentsSectionProps {
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  course: string;
  category: "all" | "frontend" | "react" | "nextjs" | "security" | "typescript" | string;
  rating: number;
  avatar: string;
  avatarBg: string;
  text: string;
  highlight: string;
  roiStat: string;
  location: string;
}

export default function StudentsSection({ isLoggedIn, onOpenLoginModal }: StudentsSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);

  const [studentsConfig, setStudentsConfig] = useState(() => loadCmsConfig().testimonials);

  useEffect(() => {
    const handleUpdate = () => {
      setStudentsConfig(loadCmsConfig().testimonials);
    };
    window.addEventListener("cms_config_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cms_config_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // View mode: "carousel" for smooth gliding stream, "grid" for interactive matrix
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeAudioStudent, setActiveAudioStudent] = useState<string | null>("will");

  // Scroll Progress and Parallax setup
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  // Scroll-linked transforms for motion graphics and cards
  const scrollOrbitAngle = useTransform(smoothProgress, [0, 1], [0, 360]);
  const scrollCounterOrbit = useTransform(smoothProgress, [0, 1], [360, 0]);
  const yParallaxGraphics = useTransform(smoothProgress, [0, 0.5, 1], [40, 0, -35]);
  const yParallaxCards = useTransform(smoothProgress, [0, 0.5, 1], [50, 0, -40]);
  const scrollTiltX = useTransform(smoothProgress, [0, 0.5, 1], [8, 0, -6]);
  const scrollTiltZ = useTransform(smoothProgress, [0, 0.5, 1], [-2, 0, 2]);
  const scrollProgressBar = useTransform(smoothProgress, [0.1, 0.85], ["0%", "100%"]);
  const ambientGlowOpacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.15, 0.8, 0.8, 0.15]);

  const stats = [
    { value: 100, suffix: "+", label: "Happy clients" },
    { value: 250, prefix: "$", suffix: "m", label: "revenue added" },
    { value: 4.8, decimals: 1, label: "Average Rating" },
  ];

  const testimonials: Testimonial[] = (studentsConfig.testimonials && studentsConfig.testimonials.length > 0)
    ? (studentsConfig.testimonials as any)
    : [
    {
      id: "will",
      name: "Arman Ahmadi",
      role: "Frontend Developer",
      company: "Rayan Web Studio",
      course: "Modern React & Frontend Development",
      category: "frontend",
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=160&auto=format&fit=crop",
      avatarBg: "from-emerald-500 to-teal-700",
      text: "The practical projects and structured lessons helped me understand React deeply and gave me the confidence to build real-world applications.",
      highlight: "Built 5+ real-world projects",
      roiStat: "5+ Projects",
      location: "Tehran, Iran"
    },
    {
      id: "ikta",
  name: "Amir Hosseini",
  role: "React Developer",
  company: "Nava Digital",
  course: "Advanced React Architecture",
  category: "react",
  rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=160&auto=format&fit=crop",
      avatarBg: "from-emerald-600 to-zinc-800",
  text: "I learned how to structure React applications properly and turn complex ideas into clean, reusable, and maintainable components.",
  highlight: "Improved development workflow",
  roiStat: "+45% Productivity",
  location: "Mashhad, Iran"
    },
    {
      id: "liloch",
      name: "Niloofar Karimi",
      role: "Junior Frontend Developer",
  company: "Pixel Studio",
  course: "Frontend Development with JavaScript",
  category: "frontend",
  rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=160&auto=format&fit=crop",
      avatarBg: "from-teal-600 to-emerald-900",
  text: "The hands-on projects made frontend development much easier to understand and gave me the confidence to start building my own applications.",
  highlight: "Started professional frontend journey",
  roiStat: "10+ Projects",
  location: "Isfahan, Iran"
    },
    {
      id: "diane",
  name: "Mohammad Rezaei",
  role: "Web Developer",
  company: "Dadeh Web",
  course: "Next.js & Modern Web Development",
  category: "nextjs",
  rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=160&auto=format&fit=crop",
      avatarBg: "from-emerald-400 to-teal-800",
  text: "The Next.js lessons helped me understand modern web architecture and how to combine performance, scalability, and clean development practices.",
  highlight: "Built production-ready applications",
  roiStat: "3+ Live Apps",
  location: "Shiraz, Iran"
    },
    {
      id: "sarah",
  name: "Ali Moradi",
  role: "Cybersecurity Learner",
  company: "Independent Researcher",
  course: "Web Security & Bug Bounty",
  category: "security",
  rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=160&auto=format&fit=crop",
      avatarBg: "from-teal-500 to-emerald-700",
  text: "The security-focused lessons changed the way I look at web applications and taught me how to approach vulnerabilities like a security researcher.",
  highlight: "Started hands-on security research",
  roiStat: "20+ Labs",
  location: "Tabriz, Iran"
    },
    {
      id: "marcus",
  name: "Sara Ebrahimi",
  role: "Frontend Developer",
  company: "Rahkaran Tech",
  course: "TypeScript & Modern Frontend",
  category: "typescript",
  rating: 5.0,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=160&auto=format&fit=crop",
      avatarBg: "from-emerald-700 to-teal-900",
  text: "Combining TypeScript, React, and practical development gave me a much clearer understanding of how to build reliable and scalable web applications.",
  highlight: "Moved from beginner to professional projects",
  roiStat: "8+ Projects",
  location: "Tehran, Iran"
    }
  ];

  // Tripled list of testimonials to create smooth seamless looping sliding window
  const items = [...testimonials, ...testimonials, ...testimonials];
  const totalLength = testimonials.length;

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [currentIndex, setCurrentIndex] = useState(totalLength);
  const [isSliding, setIsSliding] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleCards = windowWidth >= 1024 ? 3 : windowWidth >= 768 ? 2 : 1;
  const gap = 20;

  const handlePrev = () => {
    if (!isSliding) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!isSliding) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handleAnimationComplete = () => {
    if (currentIndex >= totalLength * 2) {
      setIsSliding(false);
      setCurrentIndex(currentIndex - totalLength);
    } else if (currentIndex < totalLength) {
      setIsSliding(false);
      setCurrentIndex(currentIndex + totalLength);
    }
  };

  useEffect(() => {
    if (!isSliding) {
      const raf = requestAnimationFrame(() => {
        setIsSliding(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isSliding]);

  // Autoplay for carousel
  useEffect(() => {
    if (isHovered || viewMode !== "carousel") return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, currentIndex, isSliding, viewMode]);

  // Map absolute card index to original testimonial item
  const activeDotIndex = currentIndex % totalLength;

  // Filtered testimonials for grid mode
  const filteredTestimonials = selectedCategory === "all"
    ? testimonials
    : testimonials.filter((t) => t.category === selectedCategory);

  return (
    <section
      ref={sectionRef}
      id="my-students"
      className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-14 sm:py-18 md:py-24 relative text-white border-t border-white/[0.04] scroll-mt-24 overflow-hidden"
    >
      {/* Scroll-responsive Background Ambient Auroras in Luxury Emerald */}
      <motion.div
        style={{ opacity: ambientGlowOpacity }}
        className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[550px] h-[380px] pointer-events-none blur-[160px] bg-gradient-to-tr from-emerald-500/[0.06] via-emerald-600/[0.03] to-teal-500/[0.02] rounded-full z-0"
      />
      <motion.div
        style={{ opacity: ambientGlowOpacity }}
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[350px] pointer-events-none blur-[150px] bg-gradient-to-br from-emerald-400/[0.05] via-teal-600/[0.03] to-transparent rounded-full z-0"
      />

      {/* Floating Motion Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { x: "12%", y: "18%", size: 4, dur: 7, delay: 0 },
          { x: "85%", y: "24%", size: 5, dur: 9, delay: 1 },
          { x: "45%", y: "65%", size: 3, dur: 6, delay: 2 },
          { x: "70%", y: "82%", size: 4, dur: 8, delay: 0.5 },
          { x: "22%", y: "88%", size: 6, dur: 10, delay: 1.5 },
        ].map((pt, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -25, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.25, 1],
            }}
            transition={{
              duration: pt.dur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: pt.delay,
            }}
            style={{ left: pt.x, top: pt.y, width: pt.size, height: pt.size }}
            className="absolute rounded-full bg-emerald-400/50 blur-[1px] shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          />
        ))}
      </div>

      {/* =========================================================================
          SECTION HEADER WITH MOTION GRAPHIC PILL & VIEW TOGGLES
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-10 md:mb-14 relative z-10 w-full">
        {/* Badge Column (Left) with Scroll-Driven Spinning Badge */}
        <div className="lg:col-span-3 flex flex-col items-start gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm"
          >
            <motion.span
              style={{ rotate: scrollOrbitAngle }}
              className="inline-flex text-emerald-400"
            >
              <Sparkles size={11} />
            </motion.span>
            <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-white/90 uppercase">
              {studentsConfig.badge || "MY STUDENTS & ALUMNI"}
            </span>
          </motion.div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.015] text-[10px] font-mono text-white/40">
            <Radio size={11} className="text-emerald-400 animate-pulse" />
            <span>Live Student Motion Constellation</span>
          </div>
        </div>

        {/* Title, Subtitle & View Mode Switcher */}
        <div className="lg:col-span-9 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              {studentsConfig.title || "My Lovely Students"}
            </h2>
            <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl">
              {studentsConfig.description || "Trusted by 100+ high-performing clients & graduates worldwide, adding over $250M+ in cumulative commercial value."}
            </p>
          </motion.div>

          {/* View Mode Switcher: Carousel vs 3D Grid */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md self-start md:self-auto shrink-0">
            <button
              onClick={() => setViewMode("carousel")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[10px] font-sans font-semibold tracking-wider uppercase transition-all duration-300 ${viewMode === "carousel"
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                }`}
            >
              <Layers size={12} className={viewMode === "carousel" ? "text-black" : "text-emerald-400"} />
              <span>Carousel Flow</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[10px] font-sans font-semibold tracking-wider uppercase transition-all duration-300 ${viewMode === "grid"
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                }`}
            >
              <LayoutGrid size={12} className={viewMode === "grid" ? "text-black" : "text-emerald-400"} />
              <span>Matrix Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Scroll Progress Indicator */}
      <div className="relative w-full h-[2px] bg-white/[0.06] rounded-full mb-8 overflow-hidden z-10">
        <motion.div
          style={{ width: scrollProgressBar }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
        />
      </div>

      {/* =========================================================================
          MOTION GRAPHIC: ALUMNI MASTERY & GLOBAL ORBITAL RADAR CONSTELLATION
         ========================================================================= */}
      <motion.div
        style={{ y: yParallaxGraphics }}
        className="w-full mb-10 p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Subtle grid background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.06)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

          {/* LEFT: Orbital Constellation Graphic (Scroll-Driven Rotation) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[220px] sm:min-h-[240px]">
            {/* Outer Orbit Ring */}
            <motion.div
              style={{ rotate: scrollOrbitAngle }}
              className="w-[200px] sm:w-[220px] h-[200px] sm:h-[220px] rounded-full border border-dashed border-emerald-500/20 relative flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.05)]"
            >
              {/* Satellite Node 1: Techzo */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 border border-emerald-500/40 text-[8px] font-mono text-emerald-400 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>San Francisco</span>
              </div>

              {/* Satellite Node 2: Lumin */}
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 border border-emerald-500/40 text-[8px] font-mono text-emerald-400 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Berlin</span>
              </div>

              {/* Satellite Node 3: Singapore */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 border border-emerald-500/40 text-[8px] font-mono text-emerald-400 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Singapore</span>
              </div>

              {/* Satellite Node 4: London */}
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 border border-emerald-500/40 text-[8px] font-mono text-emerald-400 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>London</span>
              </div>

              {/* Middle Orbit Ring */}
              <motion.div
                style={{ rotate: scrollCounterOrbit }}
                className="w-[130px] sm:w-[140px] h-[130px] sm:h-[140px] rounded-full border border-emerald-400/25 relative flex items-center justify-center"
              >
                {/* Micro orbit particle */}
                <div className="absolute top-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-teal-300" />

                {/* Core Center Pulse */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-400/30 backdrop-blur-sm flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                  <GraduationCap size={20} className="text-emerald-400" />
                  <span className="text-[7px] font-mono text-emerald-300 font-bold uppercase mt-0.5">ALUMNI</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Orbit Label */}
            <div className="mt-3 flex items-center gap-1.5 text-[9px] font-mono text-white/50 tracking-wider uppercase">
              <Globe2 size={11} className="text-emerald-400" />
              <span>Global Placement Constellation · 14 Countries</span>
            </div>
          </div>

          {/* RIGHT: Live Impact Telemetry & Audio Sentiment Waveform */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-emerald-400" />
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-white">
                  Real-World Graduate Telemetry
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                100% VERIFIED CAREER IMPACT
              </span>
            </div>

            {/* Telemetry Metric Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.05]">
                <p className="text-[9px] font-mono text-white/40 uppercase">Avg Promotion</p>
                <p className="text-sm font-black text-white mt-0.5">+340%</p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "88%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="h-full bg-emerald-400 rounded-full"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.05]">
                <p className="text-[9px] font-mono text-white/40 uppercase">Completion</p>
                <p className="text-sm font-black text-emerald-400 mt-0.5">99.4%</p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "99.4%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className="h-full bg-emerald-400 rounded-full"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.05]">
                <p className="text-[9px] font-mono text-white/40 uppercase">Commercial ROI</p>
                <p className="text-sm font-black text-white mt-0.5">$250M+</p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "95%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.4 }}
                    className="h-full bg-emerald-400 rounded-full"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.05]">
                <p className="text-[9px] font-mono text-white/40 uppercase">Satisfaction</p>
                <p className="text-sm font-black text-white mt-0.5">4.9 / 5.0</p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "98%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                    className="h-full bg-emerald-400 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Audio Voice Testimonial Waveform Motion Graphic */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveAudioStudent(activeAudioStudent ? null : "will")}
                  className="w-9 h-9 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25 cursor-pointer shrink-0"
                  aria-label="Toggle student audio sentiment"
                >
                  <Volume2 size={15} />
                </button>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Student Audio Feedback Reel</p>
                  <p className="text-[10px] text-white/40 font-mono">Will Smith (Founder @ Techzo) · 48kHz Digital Lossless</p>
                </div>
              </div>

              {/* Dynamic Equalizer Spectrum in Emerald */}
              <div className="flex items-end gap-1 h-6 px-2 self-center sm:self-auto">
                {[40, 75, 95, 60, 85, 30, 100, 70, 50, 90, 65, 80, 45, 95, 60, 35, 85].map((h, idx) => (
                  <motion.div
                    key={idx}
                    animate={
                      activeAudioStudent
                        ? { height: [`${h * 0.25}%`, `${h}%`, `${h * 0.35}%`] }
                        : { height: "20%" }
                    }
                    transition={{
                      duration: 0.9 + (idx % 4) * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.04,
                    }}
                    className="w-1 rounded-full bg-gradient-to-t from-emerald-600 via-emerald-400 to-emerald-200"
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
      </motion.div>

      {/* =========================================================================
          MAIN TESTIMONIALS ARENA (CAROUSEL & MATRIX MODES)
         ========================================================================= */}
      <motion.div
        style={{ scale: 1 }}
        className="w-full p-6 sm:p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl relative z-10 space-y-8"
      >
        {/* Header Stats & CTA Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/[0.04] w-full">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 w-full lg:max-w-md">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-2.5 sm:p-4 flex flex-col justify-center text-center hover:border-emerald-500/20 transition-all group"
              >
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-mono mt-1.5 leading-tight group-hover:text-emerald-400/80 transition-colors">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-row flex-nowrap md:flex-wrap items-center gap-3 w-full md:w-auto">
            <motion.a
              href="#classes"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("classes");
                if (element) {
                  const navbarHeight = 84;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - navbarHeight;
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
              }}
              className="flex-1 md:flex-initial inline-flex items-center justify-center px-3 sm:px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/90 hover:text-white hover:bg-white/10 transition-all font-sans text-[10px] sm:text-xs font-semibold tracking-[0.12em] uppercase whitespace-nowrap text-center cursor-pointer"
            >
              See All Courses
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const checkIsLoggedIn = isLoggedIn !== undefined ? isLoggedIn : (localStorage.getItem("isLoggedIn") === "true");
                if (checkIsLoggedIn) {
                  window.location.hash = "#dashboard";
                } else {
                  if (onOpenLoginModal) {
                    onOpenLoginModal();
                  } else {
                    window.location.hash = "#login";
                  }
                }
              }}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-full bg-white text-black font-sans text-[10px] sm:text-xs font-bold tracking-[0.12em] uppercase shadow-[0_4px_24px_rgba(255,255,255,0.08)] hover:bg-neutral-200 transition-all duration-300 whitespace-nowrap text-center cursor-pointer"
            >
              <GraduationCap size={14} className="text-black shrink-0 hidden xs:block" />
              <span>My Courses</span>
            </motion.button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: SMOOTH 3D PARALLAX CAROUSEL FLOW
           ========================================================================= */}
        {viewMode === "carousel" ? (
          <motion.div
            style={{ y: yParallaxCards, rotateX: scrollTiltX, rotateZ: scrollTiltZ }}
            className="perspective-[1200px]"
          >
            <div
              className="relative w-full overflow-hidden select-none py-2"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -50 || info.velocity.x < -300) {
                    handleNext();
                  } else if (info.offset.x > 50 || info.velocity.x > 300) {
                    handlePrev();
                  }
                }}
                animate={{
                  x: `calc(-${currentIndex} * (${100 / visibleCards}% + ${gap / visibleCards}px))`,
                }}
                transition={isSliding ? { type: "spring", stiffness: 240, damping: 26 } : { duration: 0 }}
                onAnimationComplete={handleAnimationComplete}
                className="flex cursor-grab active:cursor-grabbing w-full items-stretch"
              >
                {items.map((test, index) => {
                  const isCenter = index === currentIndex + (visibleCards === 3 ? 1 : 0);

                  return (
                    <div
                      key={`${test.id}-${index}`}
                      className="shrink-0 transition-all duration-500 flex"
                      style={{
                        width: `calc(${100 / visibleCards}% - ${(gap * (visibleCards - 1)) / visibleCards}px)`,
                        marginRight: `${gap}px`,
                      }}
                    >
                      {/* Interactive Moving Card with Floating Physics */}
                      <motion.div
                        animate={{
                          scale: isCenter ? 1.02 : 0.95,
                          opacity: isCenter ? 1 : 0.65,
                          y: [0, isCenter ? -6 : -2, 0],
                        }}
                        transition={{
                          scale: { duration: 0.4 },
                          opacity: { duration: 0.4 },
                          y: {
                            duration: 4 + (index % 3) * 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (index % 4) * 0.3,
                          },
                        }}
                        whileHover={{
                          y: -10,
                          scale: 1.03,
                          transition: { duration: 0.25 },
                        }}
                        className="w-full flex flex-col justify-between bg-[#090a0d]/95 backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 transition-colors duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.85)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.18)] group relative overflow-hidden"
                      >
                        {/* Interactive Border Beam Glow */}
                        <div className="absolute -inset-px bg-gradient-to-tr from-emerald-500/0 via-emerald-500/0 to-emerald-500/15 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_65%)] pointer-events-none" />

                        {/* Top Row: Student Profile */}
                        <div>
                          <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.04]">
                            {/* Avatar Photo with Gradient Aura */}
                            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${test.avatarBg} p-[1.5px] shrink-0 shadow-lg relative group-hover:scale-105 transition-transform duration-300`}>
                              <div className="w-full h-full rounded-[14px] overflow-hidden bg-zinc-900 flex items-center justify-center">
                                <img
                                  src={test.avatar}
                                  alt={test.name}
                                  className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                                  referrerPolicy="no-referrer"
                                  draggable="false"
                                />
                              </div>
                              {/* Verified Status Dot */}
                              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#090a0d] flex items-center justify-center">
                                <CheckCircle2 size={8} className="text-black stroke-[3]" />
                              </span>
                            </div>

                            {/* Name, Role & Company */}
                            <div className="flex-1 text-left min-w-0">
                              <h4 className="font-sans text-sm sm:text-base font-extrabold text-white tracking-tight leading-none truncate group-hover:text-emerald-300 transition-colors">
                                {test.name}
                              </h4>
                              <p className="text-[10px] text-white/50 truncate mt-1 flex items-center gap-1 font-sans">
                                <Briefcase size={9} className="text-emerald-400 shrink-0" />
                                <span>{test.role}</span>
                              </p>
                              <span className="text-[9px] font-mono text-white/40 block truncate">
                                @ {test.company} · {test.location}
                              </span>
                            </div>

                            {/* Program Badge */}
                            <div className="w-7 h-7 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 group-hover:border-emerald-500/30 transition-colors">
                              <Quote size={12} className="text-emerald-400 opacity-60 group-hover:opacity-100" />
                            </div>
                          </div>

                          {/* Course Tag & ROI Stat Highlight */}
                          <div className="flex items-center justify-between gap-2 mt-3 pt-1">
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full truncate font-bold">
                              {test.course}
                            </span>
                            <span className="text-[9px] font-mono text-white/60 bg-white/[0.04] px-2 py-0.5 rounded-full shrink-0">
                              {test.roiStat}
                            </span>
                          </div>

                          {/* Testimonial Text & Rating */}
                          <div className="mt-3.5 text-left space-y-2.5">
                            {/* Stars */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-emerald-400">{test.rating.toFixed(1)}</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={10}
                                    className={`${i < Math.floor(test.rating) ? "fill-emerald-400 text-emerald-400" : "text-white/10"
                                      } shrink-0`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Review Paragraph */}
                            <p className="font-sans text-xs sm:text-[13px] text-white/70 leading-relaxed italic line-clamp-4">
                              "{test.text}"
                            </p>
                          </div>
                        </div>

                        {/* Bottom Highlight Tag */}
                        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-white/40 font-mono">
                          <span className="truncate max-w-[180px] text-emerald-400/90 font-medium">
                            ✓ {test.highlight}
                          </span>
                          <span className="text-[9px] text-white/30 uppercase">Verified</span>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Carousel Footer: Dynamic Dots and Navigation Controls */}
            <div className="flex justify-between items-center pt-5 border-t border-white/[0.04]">
              {/* Animated Liquid Pagination Indicators */}
              <div className="flex items-center gap-2 select-none">
                {testimonials.map((_, idx) => {
                  const isActive = idx === activeDotIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!isSliding) return;
                        setCurrentIndex(totalLength + idx);
                      }}
                      className="relative h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer"
                      style={{
                        width: isActive ? "28px" : "8px",
                        backgroundColor: isActive ? "#10b981" : "rgba(255, 255, 255, 0.15)",
                        boxShadow: isActive ? "0 0 10px rgba(16, 185, 129, 0.7)" : "none",
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  );
                })}
              </div>

              {/* Previous/Next Navigation Controls with Emerald Accents */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 sm:p-2.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-emerald-500 hover:text-black hover:border-emerald-500 text-white/70 transition-all duration-300 cursor-pointer focus:outline-none shadow-sm"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 sm:p-2.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-emerald-500 hover:text-black hover:border-emerald-500 text-white/70 transition-all duration-300 cursor-pointer focus:outline-none shadow-sm"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
              VIEW 2: 3D STAGGERED MATRIX GRID WITH COURSE CATEGORY FILTERS
             ========================================================================= */
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {[
                { id: "all", label: "All Students" },
                { id: "frontend", label: "Frontend" },
                { id: "react", label: "React" },
                { id: "nextjs", label: "Next.js" },
                { id: "security", label: "Web Security" },
                { id: "typescript", label: "TypeScript" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-sans font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${selectedCategory === cat.id
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 font-bold scale-[1.02]"
                    : "bg-white/[0.03] text-white/50 border border-white/5 hover:text-white hover:bg-white/[0.08]"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid Layout with Motion Stagger & 3D Entrance */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredTestimonials.map((test, index) => (
                  <motion.div
                    key={test.id}
                    layout
                    initial={{ opacity: 0, y: 40, scale: 0.92, rotateX: 12 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{
                      y: -8,
                      scale: 1.02,
                      transition: { duration: 0.25 },
                    }}
                    className="flex flex-col justify-between bg-[#090a0d]/95 backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.18)] group relative overflow-hidden"
                  >
                    <div className="absolute -inset-px bg-gradient-to-tr from-emerald-500/0 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div>
                      {/* Top Header */}
                      <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.04]">
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${test.avatarBg} p-[1.5px] shrink-0 shadow-lg relative`}>
                          <div className="w-full h-full rounded-[14px] overflow-hidden bg-zinc-900 flex items-center justify-center">
                            <img
                              src={test.avatar}
                              alt={test.name}
                              className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                              referrerPolicy="no-referrer"
                              draggable="false"
                            />
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#090a0d] flex items-center justify-center">
                            <CheckCircle2 size={8} className="text-black stroke-[3]" />
                          </span>
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-sans text-base font-extrabold text-white tracking-tight leading-none truncate group-hover:text-emerald-300 transition-colors">
                            {test.name}
                          </h4>
                          <p className="text-[10px] text-white/50 truncate mt-1 flex items-center gap-1 font-sans">
                            <Briefcase size={9} className="text-emerald-400 shrink-0" />
                            <span>{test.role}</span>
                          </p>
                          <span className="text-[9px] font-mono text-white/40 block truncate">
                            @ {test.company}
                          </span>
                        </div>
                      </div>

                      {/* Course & Metric */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-1">
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full truncate font-bold">
                          {test.course}
                        </span>
                        <span className="text-[9px] font-mono text-white/60 bg-white/[0.04] px-2 py-0.5 rounded-full shrink-0">
                          {test.roiStat}
                        </span>
                      </div>

                      {/* Rating & Review */}
                      <div className="mt-3.5 text-left space-y-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-emerald-400">{test.rating.toFixed(1)}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                className={`${i < Math.floor(test.rating) ? "fill-emerald-400 text-emerald-400" : "text-white/10"
                                  } shrink-0`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="font-sans text-xs sm:text-[13px] text-white/70 leading-relaxed italic line-clamp-4">
                          "{test.text}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-white/40 font-mono">
                      <span className="truncate max-w-[180px] text-emerald-400/90 font-medium">
                        ✓ {test.highlight}
                      </span>
                      <span className="text-[9px] text-white/30 uppercase">{test.location}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

      </motion.div>
    </section>
  );
}
