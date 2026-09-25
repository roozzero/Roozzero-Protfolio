import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform } from "motion/react";
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
  Clock,
  Heart,
  Compass as CompassIcon,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  CheckCircle2,
  FileDown,
  Github,
  ShieldCheck,
  Terminal,
  Layers,
  Code2,
  Lock,
  GraduationCap
} from "lucide-react";
import Navbar from "./Navbar";
import SkillsSection from "./SkillsSection";
import ProjectsSection from "./ProjectsSection";
import StudentsSection from "./StudentsSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import CourseRegistrationModal from "./CourseRegistrationModal";
import { CMSFullConfig } from "../types/cms";
import { DEFAULT_HOMEPAGE_CLASSES } from "../constants/defaultCms";

interface Preset {
  name: string;
  orb1: string;
  orb2: string;
  orb3: string;
  orb4: string;
  gridColor: string;
  lineColor: string;
}

const PRESETS: Preset[] = [
  {
    name: "Emerald Minimalist",
    orb1: "rgba(16, 185, 129, 0.05)",
    orb2: "rgba(5, 150, 105, 0.06)",
    orb3: "rgba(255, 255, 255, 0.02)",
    orb4: "rgba(10, 10, 10, 0.20)",
    gridColor: "rgba(16, 185, 129, 0.02)",
    lineColor: "rgba(16, 185, 129, 0.05)",
  },
  {
    name: "Cyber Jade",
    orb1: "rgba(16, 185, 129, 0.07)",
    orb2: "rgba(52, 211, 153, 0.05)",
    orb3: "rgba(20, 184, 166, 0.04)",
    orb4: "rgba(6, 78, 59, 0.15)",
    gridColor: "rgba(16, 185, 129, 0.03)",
    lineColor: "rgba(52, 211, 153, 0.06)",
  },
  {
    name: "Forest Obsidian",
    orb1: "rgba(5, 150, 105, 0.06)",
    orb2: "rgba(16, 185, 129, 0.05)",
    orb3: "rgba(52, 211, 153, 0.03)",
    orb4: "rgba(15, 23, 42, 0.15)",
    gridColor: "rgba(16, 185, 129, 0.02)",
    lineColor: "rgba(16, 185, 129, 0.06)",
  },
  {
    name: "Obsidian Silver",
    orb1: "rgba(255, 255, 255, 0.03)",
    orb2: "rgba(16, 185, 129, 0.03)",
    orb3: "rgba(51, 65, 85, 0.05)",
    orb4: "rgba(15, 23, 42, 0.1)",
    gridColor: "rgba(255, 255, 255, 0.02)",
    lineColor: "rgba(16, 185, 129, 0.05)",
  },
];

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const FALLBACK_COURSE_SYLLABUS: Record<string, Array<{ id: string; title: string; description: string; duration?: string }>> = {
  lumin: DEFAULT_HOMEPAGE_CLASSES[0]?.syllabus || [],
  apex: DEFAULT_HOMEPAGE_CLASSES[1]?.syllabus || [],
  bgbunty: DEFAULT_HOMEPAGE_CLASSES[2]?.syllabus || [],
  hunt: DEFAULT_HOMEPAGE_CLASSES[3]?.syllabus || [],
};

function getCourseSyllabus(cls: any): Array<{ id: string; title: string; description: string; duration?: string }> {
  if (cls?.id && FALLBACK_COURSE_SYLLABUS[cls.id]) {
    if (!Array.isArray(cls?.syllabus) || cls.syllabus.length < 10) {
      return FALLBACK_COURSE_SYLLABUS[cls.id];
    }
  }
  if (Array.isArray(cls?.syllabus) && cls.syllabus.length > 0) {
    return cls.syllabus;
  }
  if (cls?.id && FALLBACK_COURSE_SYLLABUS[cls.id]) {
    return FALLBACK_COURSE_SYLLABUS[cls.id];
  }
  return [
    { id: "m1", title: "Module 1: Foundations & Architecture Setup", description: "Core concepts, project initialization, design tokens, and environment configuration.", duration: "45 mins" },
    { id: "m2", title: "Module 2: Interactive Components & State Flow", description: "Building reusable components, state handling, and interactive layouts.", duration: "60 mins" },
    { id: "m3", title: "Module 3: Visual Polish & Performance Engineering", description: "Optimization techniques, animation polish, and edge case resilience.", duration: "50 mins" },
    { id: "m4", title: "Module 4: Production Deployment & Best Practices", description: "Testing, CI/CD pipeline integration, production builds, and documentation.", duration: "40 mins" }
  ];
}

interface LandingViewProps {
  isLoggedIn: boolean;
  userRole: string;
  onOpenLoginModal: () => void;
  cmsConfig: CMSFullConfig;
  homepageClasses: any[];
  currentText: string;
}

export default function LandingView({
  isLoggedIn,
  userRole,
  onOpenLoginModal,
  cmsConfig,
  homepageClasses,
  currentText,
}: LandingViewProps) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const whoMeSectionRef = useRef<HTMLElement>(null);
  const classesSectionRef = useRef<HTMLElement>(null);

  // Global sticky scroll progress
  const { scrollYProgress: globalScrollYProgress } = useScroll();
  const globalScrollWidth = useTransform(globalScrollYProgress, [0, 1], ["0%", "100%"]);

  // Scroll Progress for Hero / Who's Me
  const { scrollYProgress: whoMeScrollProgress } = useScroll({
    target: whoMeSectionRef,
    offset: ["start end", "end start"],
  });
  const smoothWhoMeProgress = useSpring(whoMeScrollProgress, { stiffness: 85, damping: 22, restDelta: 0.001 });
  const heroProgressBarWidth = useTransform(smoothWhoMeProgress, [0.05, 0.95], ["0%", "100%"]);

  // Scroll Progress for Classes / Academy Section
  const { scrollYProgress: classesScrollProgress } = useScroll({
    target: classesSectionRef,
    offset: ["start end", "end start"],
  });
  const smoothClassesProgress = useSpring(classesScrollProgress, { stiffness: 85, damping: 22, restDelta: 0.001 });
  const classesProgressBarWidth = useTransform(smoothClassesProgress, [0.1, 0.9], ["0%", "100%"]);

  const preset = PRESETS[presetIndex];

  // Interactive Classes state
  const [openSyllabus, setOpenSyllabus] = useState<Record<string, boolean>>({});

  // Course Registration States
  const [selectedCourseForRegistration, setSelectedCourseForRegistration] = useState<any | null>(null);
  const [isCourseRegModalOpen, setIsCourseRegModalOpen] = useState(false);
  const [registeredCourseIds, setRegisteredCourseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("user_registered_courses");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) return list.map((item: any) => item.courseId);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [courseToast, setCourseToast] = useState<string | null>(null);

  const showCourseToast = (msg: string) => {
    setCourseToast(msg);
    setTimeout(() => setCourseToast(null), 4000);
  };

  // Mouse tracking utilizing Framer Motion's off-main-thread spring system
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 45, stiffness: 120, mass: 1.2 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Initial middle position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(rect.width / 2);
      mouseY.set(rect.height / 2);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          mouseX.set(x);
          mouseY.set(y);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [mouseX, mouseY]);

  // Handle interaction to change presets and emit visual light ripples
  const handleContainerInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Add fresh ripple
      const newRipple = {
        id: Date.now() + Math.random(),
        x,
        y,
      };
      setRipples((prev) => [...prev, newRipple]);

      // Cycle preset index
      setPresetIndex((prev) => (prev + 1) % PRESETS.length);
    }
  };

  // Generate slow, premium floating ambient dust motes
  const dustParticles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 0.8,
      startX: `${Math.random() * 100}%`,
      startY: `${Math.random() * 100}%`,
      endX: `${Math.random() * 100}%`,
      endY: `${Math.random() * 100}%`,
      duration: Math.random() * 20 + 20, // 20s to 40s
      delay: Math.random() * -15, // staggered starts
    }));
  }, []);

  return (
    <div id="ambient-canvas-wrapper" className="min-h-screen w-full bg-black overflow-x-hidden font-sans scroll-smooth flex flex-col items-center">
      {/* Global Sticky Scroll Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none">
        <motion.div
          style={{ width: globalScrollWidth }}
          className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
        />
      </div>

      {/* Premium Navigation Header */}
      <Navbar
        onPresetChange={() => setPresetIndex((prev) => (prev + 1) % PRESETS.length)}
        currentPresetName={preset.name}
        isLoggedIn={isLoggedIn}
        onOpenLoginModal={onOpenLoginModal}
      />

      {/* Hero Section */}
      <section
        ref={heroSectionRef}
        id="home"
        className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-12 pt-24 sm:pt-28 md:pt-32 overflow-hidden"
      >
        {/* Mobile-Only Hero Layout (Visible on mobile breakpoints only) */}
        <div id="hero-mobile-layout" className="flex flex-col w-full max-w-7xl md:hidden relative z-10 pt-4 pb-8">
          {/* Hero Image on Top */}
          <div 
            onClick={() => setPresetIndex((prev) => (prev + 1) % PRESETS.length)}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.04] bg-black cursor-pointer shadow-lg active:scale-[0.99] transition-transform duration-300 animate-fade-in"
          >
            <img
              src={cmsConfig.hero?.heroImage || "/src/assets/images/ChatGPT Image Jun 28, 2026, 10_07_30 PM.png"}
              alt="ROOZZERO Portrait Background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-[center_15%] opacity-80 mix-blend-luminosity filter brightness-[0.7] contrast-[105%]"
            />
            {/* Cinematic lighting overlay to match original dark-theme premium appearance */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
            <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.85) 100%)" />
          </div>

          {/* Hero Text Below Image */}
          <div className="mt-8 flex flex-col items-start text-left px-2">
            {/* Small Heading */}
            <span className="font-sans text-xs font-semibold tracking-[0.3em] text-white/50 uppercase leading-none">
              {cmsConfig.hero?.badge || "I'M"}
            </span>

            {/* Main Headline with typing effect */}
            <div className="flex flex-col items-start relative mt-4">
              <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-[0.22em] text-white uppercase leading-none z-20">
                {cmsConfig.hero?.headline || "ROOZZERO"}
              </h1>
              
              <div className="flex items-center gap-1.5 mt-3 min-h-[20px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-emerald-400 uppercase">
                  {currentText}
                </span>
                <span className="font-mono text-white animate-pulse">|</span>
              </div>
            </div>
          </div>
        </div>

        {/* 16:9 Aspect Ratio Luxurious Floating Gallery Container (Hidden on mobile breakpoints) */}
        <div
          id="hero-16-9-frame"
          ref={containerRef}
          onClick={handleContainerInteraction}
          className="hidden md:block relative aspect-[16/9] w-full max-w-7xl cursor-pointer overflow-hidden rounded-2xl border border-white/[0.02] bg-black shadow-[0_0_150px_rgba(0,0,0,0.98)]"
          style={{
            "--orb-1": preset.orb1,
            "--orb-2": preset.orb2,
            "--orb-3": preset.orb3,
            "--orb-4": preset.orb4,
            "--grid-color": preset.gridColor,
            "--line-color": preset.lineColor,
            transition: "all 2000ms cubic-bezier(0.16, 1, 0.3, 1)",
          } as React.CSSProperties}
        >
         {/* Layer -1: Premium Dark Hero Background Image */}
        <div id="hero-image-background-container" className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
          <img
            src={cmsConfig.hero?.heroImage || "/src/assets/images/ChatGPT Image Jun 28, 2026, 10_07_30 PM.png"}
            alt="ROOZZERO Portrait Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-65 mix-blend-luminosity filter brightness-75 contrast-[105%]"
          />
          {/* Subtle dark linear and radial overlays to merge image edge with deep dark pure black borders and elevate left text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient(circle at 35% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.95) 100%)" />
        </div>

        {/* Layer 0a: Editorial Aesthetic Subtle Depth Dark Vignette */}
        <div
          id="editorial-subtle-depth"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(10, 10, 10, 0) 0%, rgba(0, 0, 0, 0.8) 100%)",
          }}
        />

        {/* Layer 0b: Editorial Aesthetic Ambient Center Soft Light */}
        <div
          id="editorial-ambient-center"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] pointer-events-none blur-[60px] z-10"
          style={{
            background: "radial-gradient(ellipse, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0) 80%)",
          }}
        />

        {/* Layer 0c: Editorial Aesthetic Horizon Line divider */}
        <div
          id="editorial-horizon-line"
          className="absolute bottom-[15%] left-0 right-0 h-[1px] pointer-events-none z-20"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)",
          }}
        />

        {/* Layer 0d: Editorial Aesthetic Rim Lighting */}
        <div
          id="editorial-rim-lighting"
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          style={{
            boxShadow: "inset 0 0 200px rgba(255, 255, 255, 0.015)",
          }}
        />

        {/* Layer 1: Volumetric Floating Light Source A (Ambient drift) */}
        <motion.div
          id="ambient-orb-indigo"
          className="absolute -top-1/4 -left-1/4 h-full w-full rounded-full blur-[160px] pointer-events-none"
          animate={{
            x: ["-10%", "15%", "-5%"],
            y: ["-5%", "10%", "-15%"],
            scale: [1, 1.15, 0.9],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{
            background: "var(--orb-1)",
            transition: "background 2000ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Layer 2: Volumetric Floating Light Source B (Ambient drift) */}
        <motion.div
          id="ambient-orb-violet"
          className="absolute -bottom-1/3 -right-1/4 h-full w-full rounded-full blur-[180px] pointer-events-none"
          animate={{
            x: ["10%", "-15%", "5%"],
            y: ["15%", "-10%", "-5%"],
            scale: [1.1, 0.9, 1.05],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{
            background: "var(--orb-2)",
            transition: "background 2000ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Layer 3: Volumetric Floating Light Source C (Ambient drift) */}
        <motion.div
          id="ambient-orb-teal"
          className="absolute top-1/3 left-1/3 h-[80%] w-[80%] rounded-full blur-[140px] pointer-events-none"
          animate={{
            x: ["-20%", "20%", "-10%"],
            y: ["20%", "-15%", "10%"],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{
            background: "var(--orb-3)",
            transition: "background 2000ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Layer 4: Volumetric Floating Light Source D (Ambient drift) */}
        <motion.div
          id="ambient-orb-gold"
          className="absolute top-10 right-1/4 h-[60%] w-[60%] rounded-full blur-[150px] pointer-events-none"
          animate={{
            x: ["15%", "-10%", "10%"],
            y: ["-10%", "20%", "-5%"],
            scale: [0.95, 1.1, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{
            background: "var(--orb-4)",
            transition: "background 2000ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Layer 5: Interactive Soft Mouse Follower Ambient Light Beam */}
        <motion.div
          id="interactive-mouse-glow"
          className="absolute h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-[110px] mix-blend-screen opacity-55"
          style={{
            left: glowX,
            top: glowY,
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 40%, transparent 70%)",
          }}
        />

        {/* Layer 6: Future Tech Isometric Linear Grid Plane with slow movement */}
        <div id="perspective-grid-container" className="absolute inset-x-0 bottom-0 h-[45%] overflow-hidden pointer-events-none select-none">
          <motion.div
            id="scrolling-grid"
            className="w-full h-[200%] origin-bottom"
            animate={{
              backgroundPositionY: ["0px", "100px"],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundImage: "linear-gradient(to right, var(--grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
              transform: "perspective(260px) rotateX(74deg) translateY(-20px) scale(1.3)",
              maskImage: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)",
              transition: "all 2000ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>

        {/* Layer 7: Luxury Vector Architectural Waves */}
        <svg
          id="ambient-vector-curves"
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          viewBox="0 0 1440 810"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="vectorCurveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--line-color)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--line-color)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--line-color)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="vectorCurveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--line-color)" stopOpacity="0" />
              <stop offset="35%" stopColor="var(--line-color)" stopOpacity="0.25" />
              <stop offset="75%" stopColor="var(--line-color)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--line-color)" stopOpacity="0" />
            </linearGradient>
            <filter id="softVectorGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Slow float-animated SVG Bezier group A */}
          <motion.g
            animate={{
              y: [0, -14, 0],
              rotate: [0, 0.4, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path
              d="M -100 405 C 320 180, 1120 630, 1540 405"
              stroke="url(#vectorCurveGrad1)"
              strokeWidth="1.5"
              filter="url(#softVectorGlow)"
              style={{ transition: "stroke 2000ms cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          </motion.g>

          {/* Slow float-animated SVG Bezier group B */}
          <motion.g
            animate={{
              y: [0, 10, 0],
              rotate: [0, -0.3, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path
              d="M -100 250 C 480 580, 960 120, 1540 580"
              stroke="url(#vectorCurveGrad2)"
              strokeWidth="1"
              strokeDasharray="5 5"
              style={{ transition: "stroke 2000ms cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          </motion.g>
        </svg>

        {/* Layer 8: Gentle drifting cosmic micro-particles (Dust Motes) */}
        <div id="ambient-particles-overlay" className="absolute inset-0 pointer-events-none overflow-hidden">
          {dustParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white/25 blur-[0.4px]"
              style={{
                width: p.size,
                height: p.size,
              }}
              animate={{
                x: [p.startX, p.endX, p.startX],
                y: [p.startY, p.endY, p.startY],
                opacity: [0, 0.28, 0.28, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Layer 9: Interactive Click ripples of soft energy */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border border-white/10"
            style={{
              left: ripple.x,
              top: ripple.y,
              background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 80%)",
            }}
            initial={{ width: 0, height: 0, opacity: 0.8, scale: 0.7 }}
            animate={{ width: 500, height: 500, opacity: 0, scale: 1.25 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
            }}
          />
        ))}

        {/* Layer 10: Film Grain texture for gorgeous cinema depth and anti-banding */}
        <svg
          id="film-grain-mask"
          className="pointer-events-none absolute inset-0 z-40 h-full w-full opacity-[0.016] mix-blend-overlay"
        >
          <filter id="noiseTurbulence">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseTurbulence)" />
        </svg>

        {/* Layer 11: High-end border vignette shadow to seal depth boundaries */}
        <div
          id="bezel-shadow-vignette"
          className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_60px_rgba(0,0,0,0.95)] z-20"
        />

        {/* Layer 12: Premium Editorial Typography on the bottom-left */}
        <motion.div
          id="hero-left-centered-typography"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="absolute left-8 sm:left-12 md:left-16 lg:left-24 bottom-12 sm:bottom-16 md:bottom-20 lg:bottom-24 z-30 flex flex-col items-start text-left select-all pointer-events-auto"
        >
          {/* Small Heading */}
          <span className="font-sans text-xs sm:text-sm font-semibold tracking-[0.3em] text-white/50 uppercase leading-none">
            {cmsConfig.hero?.badge || "I'M"}
          </span>

          {/* Main Headline with typing effect */}
          <div className="flex flex-col items-start relative mt-4">
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[0.22em] text-white uppercase leading-none z-20">
              {cmsConfig.hero?.headline || "ROOZZERO"}
            </h1>
            
            <div className="flex items-center gap-1.5 mt-3 min-h-[20px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-emerald-400 uppercase">
                {currentText}
              </span>
              <span className="font-mono text-white animate-pulse">|</span>
            </div>
          </div>
        </motion.div>
      </div>
      </section>

      {/* WHO'S ME SECTION */}
      <section
        ref={whoMeSectionRef}
        id="who-s-me"
        className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14 md:py-18 relative text-white scroll-mt-24"
      >
        {/* Subtle decorative background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none blur-[150px] bg-gradient-to-tr from-white/[0.01] to-white/[0.03] rounded-full z-0" />

        {/* Top Header Row: Badge & Statement & CTA (Unified Header) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 md:mb-16 relative z-10 w-full">
          
          {/* Badge Column (Left) */}
          <div className="lg:col-span-3 flex items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm">
              <Sparkles size={11} className="text-white/80 animate-pulse" />
              <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-white/80 uppercase">
                {cmsConfig.aboutMe?.badge || "About Me"}
              </span>
            </div>
          </div>

          {/* Title & Subtitle Column (Right) */}
          <div className="lg:col-span-9 space-y-4">
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              {cmsConfig.aboutMe?.title || "Who's Me"}
            </h2>
            <p className="font-sans text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
              {cmsConfig.aboutMe?.bio || "Hi, I'm Roozbeh Tavakoli | a Computer Engineer and Frontend Developer focused on building modern, scalable, and user-centered web experiences."}
            </p>
            
            {/* Elegant Action Buttons: CV & GitHub */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.a
                href={cmsConfig.aboutMe?.cvUrl || "#"}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] active:scale-[0.98] transition-all duration-300 font-sans"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                <FileDown size={16} className="transition-transform duration-300 group-hover:translate-y-[-1px]" />
              </motion.a>
              <motion.a
                href={cmsConfig.aboutMe?.githubUrl || "https://github.com/roozzero"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] active:scale-[0.98] transition-all duration-300 font-sans"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                <Github size={16} />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Dynamic Scroll Progress Line - Unified to Emerald Glow */}
        <div className="relative w-full h-[2px] bg-white/[0.06] rounded-full mb-8 overflow-hidden z-10">
          <motion.div
            style={{ width: heroProgressBarWidth }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.8)]"
          />
        </div>

        {/* Bottom Body Row: Image & Cards Grid wrapped in our specified container */}
        <div className="w-full p-6 sm:p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Side: Large Portrait Image (3:4 aspect) */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent opacity-20 group-hover:opacity-40 blur-md transition duration-1000"></div>
            <div className="relative h-full min-h-[380px] sm:min-h-[480px] lg:min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
              <img
                src={cmsConfig.aboutMe?.portraitImage || "/src/assets/images/photo_2024-10-20_19-21-55.jpg"}
                alt="ROOZZERO Bio Portrait"
                className="w-full h-full object-cover contrast-[1.05] brightness-[0.9] saturate-[0.85] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              {/* Cinematic lighting vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-radial-gradient(circle at 50% 30%, transparent 20%, rgba(0,0,0,0.4) 100%) pointer-events-none" />
            </div>
          </div>

          {/* Right Side: Bento Grid of Stats Cards with Unified Equal Sizes */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            {cmsConfig.aboutMe?.cards?.map((card, cIdx) => (
              <motion.div
                key={card.id || cIdx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.3)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: cIdx * 0.05 }}
                className="h-[215px] sm:h-[220px] rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.035] via-white/[0.015] to-transparent p-6 flex flex-col justify-between shadow-xl hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <span className="font-mono text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase">
                    {card.tag}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-[9px] font-mono text-emerald-400">
                    <Sparkles size={10} className="text-emerald-400" />
                    <span>{card.badgeText}</span>
                  </span>
                </div>

                <div className="my-auto py-1 relative z-10">
                  <span className="block font-sans text-4xl sm:text-5xl font-light tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    {card.statNumber}
                  </span>
                  <p className="font-sans text-xs text-white/50 tracking-wide mt-1.5 truncate">
                    {card.statSubtitle}
                  </p>
                </div>

                <div className="h-8 flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[10px] font-mono text-white/40 relative z-10">
                  <span>{card.footerLabel}</span>
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {card.footerValue}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* SKILLS SECTION WITH MOTION GRAPHICS & SCROLL PARALLAX */}
      <SkillsSection />

      {/* PROJECTS SECTION WITH MOTION GRAPHICS & SCROLL PARALLAX */}
      <ProjectsSection />

      {/* CLASSES SECTION */}
      <section
        ref={classesSectionRef}
        id="classes"
        className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14 md:py-18 relative text-white scroll-mt-24 border-t border-white/[0.04] overflow-hidden"
      >
        {/* Decorative background glows */}
        <div className="absolute top-1/4 right-1/4 translate-x-1/2 w-[450px] h-[300px] pointer-events-none blur-[150px] bg-gradient-to-tr from-[#10b981]/[0.03] to-teal-500/[0.03] rounded-full z-0" />
        <div className="absolute bottom-1/3 left-1/3 -translate-x-1/2 w-[350px] h-[220px] pointer-events-none blur-[120px] bg-gradient-to-tr from-emerald-600/[0.02] to-emerald-400/[0.03] rounded-full z-0" />

        {/* Header Block (Unified Header) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-8 md:mb-10 relative z-10 w-full">
          {/* Badge Column (Left) */}
          <div className="lg:col-span-3 flex items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm">
              <Sparkles size={11} className="text-emerald-400 animate-pulse" />
              <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-white/80 uppercase">
                {cmsConfig.classesSection?.badge || "Academy"}
              </span>
            </div>
          </div>

          {/* Title & Description Column (Right) */}
          <div className="lg:col-span-9 space-y-4">
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              {cmsConfig.classesSection?.title || "My Classes"}
            </h2>
            <p className="font-sans text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
              {cmsConfig.classesSection?.subtitle || "Explore comprehensive, industry-aligned engineering and security curriculums tailored for modern builders."}
            </p>
          </div>
        </div>

        {/* Dynamic Scroll Progress Line - Unified to Emerald Glow */}
        <div className="relative w-full h-[2px] bg-white/[0.06] rounded-full mb-8 overflow-hidden z-10">
          <motion.div
            style={{ width: classesProgressBarWidth }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.8)]"
          />
        </div>

        {/* Classes Content wrapped in our specified container */}
        <div className="w-full p-6 sm:p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">

            {homepageClasses
              .filter((cls) => cls.status === "Published")
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((cls, idx) => {
                const isOpen = openSyllabus[cls.id] || false;
                const isEnrolled = registeredCourseIds.includes(cls.id);
                const syllabusItems = getCourseSyllabus(cls);
                const tagsList = Array.isArray(cls.tags) ? cls.tags : ["Engineering", "Frontend", "TypeScript"];

                return (
                  <div
                    key={cls.id}
                    className="relative group rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-7 backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/30 hover:bg-white/[0.035] hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Course Image + Actions */}
                      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-6 border border-white/[0.04] bg-neutral-900 shadow-md">
                        <img
                          src={cls.courseImage}
                          alt={cls.courseName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 contrast-[1.05]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-emerald-400 font-mono text-[10px] tracking-wider uppercase backdrop-blur-md">
                            Active Curriculum
                          </span>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-black font-sans font-bold text-xs tracking-tight shadow-lg">
                            {cls.price || "Free"}
                          </span>
                        </div>

                        {/* Direct Register Action on Image Corner */}
                        <div className="absolute bottom-3 right-3 z-10">
                          {isEnrolled ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-medium backdrop-blur-md shadow-lg">
                              <CheckCircle2 size={13} />
                              <span>Enrolled</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCourseForRegistration(cls);
                                setIsCourseRegModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-emerald-400 transition-colors text-xs font-sans font-semibold shadow-xl active:scale-95 cursor-pointer"
                            >
                              <GraduationCap size={13} />
                              <span>Enroll Now</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Short Description under course title as requested */}
                      <div className="space-y-2 text-left mb-5">
                        <h3 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#10b981] transition-colors duration-300">
                          {cls.courseName}
                        </h3>

                        {/* Short Description */}
                        <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed min-h-[38px]">
                          {cls.shortDescription || cls.description}
                        </p>

                        {/* Quick Course Info Row */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-white/40">
                          <span className="flex items-center gap-1 text-white/60">
                            <Clock size={12} className="text-emerald-400" />
                            <span>{cls.sessions || 12} Interactive Sessions</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-white/60">
                            <Award size={12} className="text-emerald-400" />
                            <span>Verified Certificate</span>
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400/90 font-mono">
                            Instructor: {cls.instructor || "Roozbeh"}
                          </span>
                        </div>
                      </div>

                      {/* Tech Badges / Tags */}
                      <div className="flex flex-wrap gap-2 mb-5 border-b border-white/[0.04] pb-4">
                        {tagsList.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-emerald-500/[0.03] border border-emerald-500/20 text-emerald-400 font-mono text-[10px] tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* COLLAPSIBLE SYLLABUS DROPDOWN MENU */}
                    <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl overflow-hidden transition-all duration-300">
                      <button
                        type="button"
                        id={`syllabus-btn-${cls.id}`}
                        aria-expanded={isOpen}
                        onClick={() => setOpenSyllabus((prev) => ({ ...prev, [cls.id]: !prev[cls.id] }))}
                        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left hover:bg-white/[0.03] transition-colors cursor-pointer group/btn"
                      >
                        <div className="flex items-center gap-2 text-white/90 min-w-0">
                          <BookOpen size={15} className="text-[#10b981] group-hover/btn:scale-110 transition-transform shrink-0" />
                          <span className="font-bold text-xs sm:text-sm tracking-wide truncate">
                            Course Curriculum & Syllabus
                          </span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
                            {syllabusItems.length} Modules
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/50 group-hover/btn:text-white shrink-0">
                          <span className="text-[10px] hidden sm:inline font-mono">
                            {isOpen ? "Hide Syllabus" : "View Syllabus"}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={16} className="text-emerald-400 transition-transform" />
                          ) : (
                            <ChevronDown size={16} className="text-white/60 group-hover/btn:text-emerald-400 transition-transform" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className="overflow-hidden border-t border-white/[0.05] bg-black/40"
                          >
                            <div className="p-3.5 sm:p-5 space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar">
                              {syllabusItems.map((syl: any, sIdx: number) => (
                                <div
                                  key={syl.id || sIdx}
                                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all flex items-start gap-3"
                                >
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-mono text-[10px] mt-0.5">
                                    {sIdx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="text-xs font-semibold text-white/90 truncate">{syl.title}</h4>
                                      <span className="text-[10px] font-mono text-emerald-400/80 shrink-0">{syl.duration}</span>
                                    </div>
                                    <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{syl.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                );
              })}

          </div>

        </div>
      </section>

      {/* MY STUDENTS SECTION */}
      <StudentsSection 
        isLoggedIn={isLoggedIn} 
        onOpenLoginModal={onOpenLoginModal}
      />

      {/* CONTACT ME SECTION */}
      <ContactSection />

      {/* FOOTER SECTION */}
      <Footer />

      {/* BACK TO TOP BUTTON */}
      <BackToTop />

      {/* FLOATING ENROLLMENT NOTIFICATION TOAST */}
      {courseToast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl bg-[#0e1017] border border-emerald-500/40 text-white shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={15} />
          </div>
          <span className="text-xs font-sans text-white/90">{courseToast}</span>
          <button
            onClick={() => setCourseToast(null)}
            className="text-white/40 hover:text-white ml-1 p-1"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* COURSE REGISTRATION MODAL */}
      <CourseRegistrationModal
        isOpen={isCourseRegModalOpen}
        course={selectedCourseForRegistration}
        onClose={() => {
          setIsCourseRegModalOpen(false);
          setSelectedCourseForRegistration(null);
        }}
        onEnrollSuccess={(registration) => {
          setRegisteredCourseIds((prev) => [...prev, registration.courseId]);
          showCourseToast(`Successfully enrolled in ${registration.courseName}!`);
        }}
      />
    </div>
  );
}
