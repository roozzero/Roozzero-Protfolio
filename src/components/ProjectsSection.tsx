import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { loadCmsConfig } from "../constants/defaultCms";
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
  GraduationCap,
  School,
  Bell,
  BookOpen,
  UserCheck,
  Settings2,
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
  Volume2,
  Lock,
  Zap,
  Play,
  AlertTriangle,
  Server,
  Globe,
  Wifi,
  Database,
  ShieldAlert,
  Gauge,
  RefreshCw,
  Smartphone,
  Video,
  Users
} from "lucide-react";

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const [projectsConfig, setProjectsConfig] = useState(() => loadCmsConfig().projects);

  useEffect(() => {
    const handleUpdate = () => {
      setProjectsConfig(loadCmsConfig().projects);
    };
    window.addEventListener("cms_config_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cms_config_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Active Project Selection
  const [activeProject, setActiveProject] = useState<"cinema" | "security" | "cloud">("cinema");

  // Interactive Project states for Voo's Cinema
  const [activeScreen, setActiveScreen] = useState<number>(2); // Default to centerpiece (After Earth)
  const [selectedDate, setSelectedDate] = useState<number>(5); // Default calendar date selected (July 5)
  const [selectedShowtime, setSelectedShowtime] = useState<string>("13:00"); // Selected movie showtime
  const [selectedSeats, setSelectedSeats] = useState<string[]>(["C4", "C5"]); // Selected seat IDs
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);

  // Interactive Project states for Aegis Sentinel (Multi-Mobile Showcase)
  const [securityActiveScreen, setSecurityActiveScreen] = useState<number>(2); // Default to centerpiece (Active Shield)
  const [shieldActive, setShieldActive] = useState<boolean>(true);
  const [threatFilter, setThreatFilter] = useState<"all" | "critical" | "mitigated">("all");

  // Interactive Project states for Nexus Engine (Multi-Mobile Showcase)
  const [cloudActiveScreen, setCloudActiveScreen] = useState<number>(2); // Default to centerpiece (Engine Console)
  const [selectedClusterRegion, setSelectedClusterRegion] = useState<string>("us-east");
  const [isCompilingWasm, setIsCompilingWasm] = useState<boolean>(false);

  // Scroll Progress and Parallax setup
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 85, damping: 22, restDelta: 0.001 });

  // Scroll-linked transforms and 3D perspective shifts
  const yParallaxLeft = useTransform(smoothProgress, [0, 0.5, 1], [35, 0, -30]);
  const yParallaxRight = useTransform(smoothProgress, [0, 0.5, 1], [65, 0, -45]);
  const rotateX3D = useTransform(smoothProgress, [0, 0.5, 1], [6, 0, -5]);
  const rotateYDeck = useTransform(smoothProgress, [0, 0.5, 1], [-3, 0, 3]);
  const scaleCenter = useTransform(smoothProgress, [0, 0.35, 0.8, 1], [0.97, 1, 1, 0.97]);
  const ambientGlowOpacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.2, 0.85, 0.85, 0.2]);
  const scrollBarWidth = useTransform(smoothProgress, [0.1, 0.9], ["0%", "100%"]);
  
  // Motion Graphic rotations linked directly to user scrolling
  const filmReelRotate = useTransform(smoothProgress, [0, 1], [0, 1080]);
  const scrollRadarSweep = useTransform(smoothProgress, [0, 1], [0, 720]);
  const scrollCpuRotate = useTransform(smoothProgress, [0, 1], [0, 360]);
  const projectorBeamAngle = useTransform(smoothProgress, [0, 1], [-12, 12]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 md:py-24 relative text-white scroll-mt-24 border-t border-white/[0.04] overflow-hidden"
    >
      {/* Dynamic Ambient Background Glows linked to scroll - Unified Emerald Theme */}
      <motion.div
        style={{ opacity: ambientGlowOpacity }}
        className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[550px] h-[350px] pointer-events-none blur-[150px] bg-gradient-to-tr from-emerald-500/[0.08] via-emerald-600/[0.04] to-transparent rounded-full z-0"
      />
      <motion.div
        style={{ opacity: ambientGlowOpacity }}
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[450px] h-[300px] pointer-events-none blur-[140px] bg-gradient-to-br from-emerald-400/[0.06] via-teal-600/[0.03] to-transparent rounded-full z-0"
      />

      {/* Header Block with Motion Graphics Pill & Category Tabs */}
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
              {projectsConfig.badge || "FEATURED WORKS & LABS"}
            </span>
          </motion.div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.015] text-[10px] font-mono text-white/40">
            <Radio size={11} className="text-emerald-400 animate-pulse" />
            <span>Interactive 3D Motion Stage</span>
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
              {projectsConfig.title || "Main Works & Systems"}
            </h2>
            <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl">
              {projectsConfig.description || "Selected projects and systems showcasing my experience in frontend development, modern web technologies, and security-focused engineering."}
            </p>
          </motion.div>

          {/* Project Switcher Navigation - Unified Emerald Theme */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md self-start md:self-auto shrink-0">
            {[
              {
                id: "cinema",
                label: projectsConfig.projects.find((p) => p.id === "cinema")?.tabLabel || "TeacherShow",
                icon: GraduationCap
              },
              {
                id: "security",
                label: projectsConfig.projects.find((p) => p.id === "security")?.tabLabel || "Aegis Sentinel",
                icon: ShieldCheck
              },
              {
                id: "cloud",
                label: projectsConfig.projects.find((p) => p.id === "cloud")?.tabLabel || "Nexus Engine",
                icon: Terminal
              },
            ].map((p) => {
              const Icon = p.icon;
              const isCurrent = activeProject === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProject(p.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[10px] font-sans font-semibold tracking-wider uppercase transition-all duration-300 ${
                    isCurrent
                      ? "bg-white text-black shadow-lg shadow-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon size={12} className={isCurrent ? "text-black" : "text-emerald-400"} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Scroll Progress Line - Unified to Emerald Glow */}
      <div className="relative w-full h-[2px] bg-white/[0.06] rounded-full mb-8 overflow-hidden z-10">
        <motion.div
          style={{ width: scrollBarWidth }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.8)]"
        />
      </div>

      {/* Main Container */}
      <motion.div
        style={{ scale: scaleCenter }}
        className="w-full p-6 sm:p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl relative z-10"
      >
        {/* =========================================================================
            VIEW 1: TEACHERSHOW SCHOOL MANAGEMENT PLATFORM (Unified Emerald Luxury)
           ========================================================================= */}
        {activeProject === "cinema" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* LEFT COLUMN: Brand Story, Motion Graphics Reel, Audio Wave & Technical Metrics */}
            <motion.div
              style={{ y: yParallaxLeft }}
              className="lg:col-span-4 space-y-7 lg:sticky lg:top-28"
            >
              {/* Brand Logo & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 select-none">
                  <span className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">TeacherShow</span>
                </div>

                {/* Status indicator */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 font-mono text-[9px] font-bold uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  School System
                </span>
              </div>

              {/* Description & Overview */}
              <div className="space-y-3">
                <h3 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-white/95 leading-tight">
                  Educational Platform
                </h3>
                <p className="font-sans text-sm text-white/60 leading-relaxed">
                  A comprehensive educational management platform designed to streamline school operations, digital learning, examinations, reporting, student services, and administrative workflows.
                </p>
              </div>

              {/* MOTION GRAPHIC: TeacherSho Online Learning & Live Classroom Hub */}
              <div className="p-4 rounded-2xl border border-white/[0.07] bg-black/40 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-16 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], rotate: [0, 4, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Video size={13} className="text-emerald-400" />
                    </motion.div>
                    <span className="font-mono text-[10px] text-white/80 uppercase tracking-wider font-semibold">
                      Live Classroom &amp; Interactive Stream
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-emerald-400 font-bold flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Active Online Session
                  </span>
                </div>

                {/* Dynamic Live Audio/Video Stream Waveform in Emerald */}
                <div className="flex items-end justify-between gap-1 h-10 px-1 relative">
                  {[45, 80, 55, 95, 60, 90, 75, 40, 100, 70, 50, 95, 85, 65, 90, 70, 85, 60, 35].map((height, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [`${height * 0.25}%`, `${height}%`, `${height * 0.35}%`],
                      }}
                      transition={{
                        duration: 1.1 + (i % 4) * 0.25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.04,
                      }}
                      className="flex-1 rounded-full bg-gradient-to-t from-emerald-600 via-emerald-400 to-emerald-200 opacity-80 group-hover:opacity-100 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    />
                  ))}
                </div>

                {/* Live Telemetry & Learning Analytics */}
                <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[9px] font-mono text-white/50">
                  <span className="flex items-center gap-1.5">
                    <Users size={11} className="text-emerald-400" />
                    <span className="text-white/80 font-medium">148 Students Connected</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                    <Sparkles size={10} />
                    <span>HD 1080p • Low Latency</span>
                  </span>
                </div>
              </div>

              {/* Technical Specifications Grid - Tailored to TeacherSho EdTech Platform */}
              <div className="border-t border-dashed border-white/10 pt-5">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-colors">
                    <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mb-1">Architecture</p>
                    <p className="font-sans text-xs font-bold text-white">Full-Stack LMS</p>
                    <p className="font-mono text-[8px] text-emerald-400/80 mt-0.5">React &amp; Node.js</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-colors">
                    <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mb-1">Live Engine</p>
                    <p className="font-sans text-xs font-bold text-emerald-400">WebRTC Stream</p>
                    <p className="font-mono text-[8px] text-white/40 mt-0.5">Real-time Socket</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-colors">
                    <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mb-1">User Roles</p>
                    <p className="font-sans text-xs font-bold text-white">Teachers &amp; Pupils</p>
                    <p className="font-mono text-[8px] text-emerald-400/80 mt-0.5">Role-Based RBAC</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View Project is currently disabled as requested */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="relative group/viewbtn">
                  <button
                    disabled
                    type="button"
                    aria-disabled="true"
                    className="inline-flex items-center gap-2 px-4 py-2 font-sans text-[10px] font-bold tracking-[0.18em] uppercase rounded-xl bg-white/[0.06] text-white/40 border border-white/10 cursor-not-allowed select-none transition-all duration-300"
                  >
                    <Lock size={12} className="text-white/40" />
                    <span>View Project (Disabled)</span>
                  </button>
                  <div className="opacity-0 group-hover/viewbtn:opacity-100 transition-opacity duration-200 pointer-events-none absolute -top-8 left-0 px-2.5 py-1 bg-black/90 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono rounded shadow-xl whitespace-nowrap z-30">
                    Project preview is temporarily disabled
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: 3D Interactive Phone Mockup Stack with Parallax, Scroll Tilt & Projector Beam */}
            <motion.div
              style={{ y: yParallaxRight, rotateX: rotateX3D, rotateY: rotateYDeck }}
              className="lg:col-span-8 w-full flex flex-col items-center perspective-[1200px]"
            >
              {/* Virtual Projector Light Beam casting onto the 3D Mockup Arena */}
              <div className="relative w-full max-w-[600px] flex justify-center pointer-events-none mb-1">
                <motion.div
                  style={{ rotate: projectorBeamAngle }}
                  className="w-3/4 h-20 bg-gradient-to-b from-emerald-400/20 via-emerald-500/[0.05] to-transparent blur-2xl rounded-t-full pointer-events-none"
                />
              </div>

              {/* Screen Switcher Tabs - Styled specifically with school management icons */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl mb-4 self-center backdrop-blur-md">
                {[
                  { id: 1, label: "Manage", icon: CalendarIcon },
                  { id: 2, label: "Platform", icon: School },
                  { id: 3, label: "Teacher", icon: UserCheck },
                  { id: 4, label: "Student", icon: GraduationCap },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeScreen === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveScreen(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-sans tracking-wider transition-all duration-300 uppercase ${
                        isActive
                          ? "bg-emerald-500 text-black shadow-[0_4px_14px_rgba(16,185,129,0.4)] font-bold scale-[1.02]"
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
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center scale-90">
                          <div className="w-2 h-2 rounded-full bg-black flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[1.5px] border-t-transparent border-b-[1.5px] border-b-transparent border-l-[2.5px] border-l-emerald-500 ml-[0.3px]" />
                          </div>
                        </div>
                        <div className="flex items-center text-[9px] text-white/80 font-medium">
                          <MapPin size={8} className="text-emerald-400 mr-0.5" />
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
                        <span className="text-emerald-400 font-medium">12:30 PM</span>
                        <span>11PM</span>
                      </div>
                      <div className="relative w-full h-1 bg-white/10 rounded-full my-1.5">
                        <div className="absolute left-0 right-[40%] h-full bg-emerald-500" />
                        <div className="absolute left-[60%] -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-md border border-emerald-500 top-1/2 cursor-pointer" />
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
                                ? "bg-emerald-500 text-black font-bold shadow-[0_0_8px_rgba(16,185,129,0.6)] scale-110"
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
                        className="flex-1 h-6 rounded-lg bg-emerald-500 text-black text-[9px] font-bold tracking-wider uppercase flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
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
                  {/* Dynamic edge illumination in emerald */}
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.06] via-transparent to-emerald-600/[0.08] opacity-60 group-hover/device:opacity-100 transition-opacity duration-700 pointer-events-none" />

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
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center scale-90">
                          <div className="w-2 h-2 rounded-full bg-black flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[1.5px] border-t-transparent border-b-[1.5px] border-b-transparent border-l-[2.5px] border-l-emerald-500 ml-[0.3px]" />
                          </div>
                        </div>
                        <div className="flex items-center text-[9px] text-white/80 font-medium">
                          <MapPin size={8} className="text-emerald-400 mr-0.5" />
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
                      <span className="text-[9px] font-medium text-emerald-400/80">Coming Soon</span>
                    </div>

                    {/* Movie Poster Card */}
                    <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/[0.07] bg-gradient-to-b from-[#06100c] to-[#020204] flex flex-col items-center justify-between p-3.5 shadow-inner">
                      {/* Space Nebula Background in Emerald */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.2)_0%,transparent_65%)] pointer-events-none" />
                      <div className="absolute bottom-1/4 w-[130px] h-[130px] rounded-full bg-emerald-500/[0.08] blur-[25px] pointer-events-none" />

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
                        <p className="text-[5px] text-emerald-400 uppercase tracking-widest font-bold">SUMMER CINEMA</p>
                      </div>

                      {/* Bottom Ticket Label */}
                      <div className="w-full bg-black/50 backdrop-blur-md border border-white/[0.06] p-1.5 rounded-xl flex justify-between items-center relative z-10">
                        <div className="text-left">
                          <p className="text-[8px] font-bold text-white leading-tight">After Earth</p>
                          <p className="text-[6.5px] text-white/40">Daily: 13:00, 17:30</p>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-[5.5px] font-bold tracking-wide text-white/80 bg-white/[0.08] px-1 py-0.5 rounded border border-white/[0.04]">IMAX</span>
                          <span className="text-[5.5px] font-bold tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded">CINETECH</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Dock */}
                    <div className="flex justify-around items-center pt-2.5 mt-2 border-t border-white/[0.05] text-white/30 text-[10px]">
                      <CompassIcon size={12} className="text-emerald-400 cursor-pointer" />
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
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center scale-90">
                          <div className="w-2 h-2 rounded-full bg-black flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[1.5px] border-t-transparent border-b-[1.5px] border-b-transparent border-l-[2.5px] border-l-emerald-500 ml-[0.3px]" />
                          </div>
                        </div>
                        <div className="flex items-center text-[9px] text-white/80 font-medium">
                          <MapPin size={8} className="text-emerald-400 mr-0.5" />
                          <span className="truncate max-w-[85px]">San Francisco</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <h4 className="text-[11px] font-bold text-white tracking-wide truncate">After Earth: Special Edition</h4>
                      <p className="text-[7px] text-white/40 uppercase">Duration: 100 mins</p>
                    </div>

                    {/* Hero Trailer Scene */}
                    <div className="relative h-[95px] w-full rounded-xl overflow-hidden bg-gradient-to-tr from-[#091510] via-[#102a20] to-[#0A0B0E] border border-white/5 flex items-center justify-center mb-2 shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none" />
                      <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                        <Play size={10} className="text-emerald-400 ml-[1px]" />
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
                        <p className="text-emerald-400 font-bold flex items-center justify-center gap-0.5">
                          <Star size={6} fill="#10b981" /> 8.4
                        </p>
                        <p className="text-white/30">IMDb</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[7.5px] text-white/50 leading-relaxed mb-2 line-clamp-2">
                      Crash-landing leaves teenager Kitai and his legendary father Cypher stranded on Earth, where predatory evolved creatures rule...
                    </p>

                    {/* Showtime Selection in Emerald */}
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
                                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
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
                        className="flex-1 h-6 rounded-lg bg-emerald-500 text-black text-[9px] font-bold tracking-wider uppercase flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
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
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center scale-90">
                          <div className="w-2 h-2 rounded-full bg-black flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[1.5px] border-t-transparent border-b-[1.5px] border-b-transparent border-l-[2.5px] border-l-emerald-500 ml-[0.3px]" />
                          </div>
                        </div>
                        <div className="flex items-center text-[9px] text-white/80 font-medium">
                          <MapPin size={8} className="text-emerald-400 mr-0.5" />
                          <span className="truncate max-w-[85px]">San Francisco</span>
                        </div>
                      </div>
                    </div>

                    {/* Curved Cinema Screen */}
                    <div className="flex flex-col items-center flex-1 py-1">
                      <div className="w-4/5 h-2.5 border-t-[1.5px] border-emerald-400/40 rounded-[50%] flex items-center justify-center relative mb-4">
                        <div className="absolute top-0 w-3/4 h-[4px] bg-gradient-to-b from-emerald-500/20 to-transparent blur-[1px]" />
                        <span className="text-[5px] text-emerald-400/70 uppercase tracking-widest font-black absolute top-1.5 scale-90">CINEMA SCREEN</span>
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
                                      ? "bg-emerald-500 border border-emerald-400 text-black font-bold shadow-[0_0_6px_rgba(16,185,129,0.7)] scale-105"
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
                          <span className="w-2 h-2 rounded-[2px] bg-emerald-500" />
                          <span className="text-emerald-400 font-bold">Selected</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-[7.5px] font-medium text-white/70">
                          {selectedSeats.length > 0 ? (
                            <>
                              <span className="text-emerald-400 font-bold">{selectedSeats.length}</span> tickets • <span className="text-white font-bold">${(selectedSeats.length * 14.5).toFixed(2)}</span>
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
                        className={`flex-1 h-6 rounded-lg text-black text-[9px] font-bold tracking-wider uppercase flex items-center justify-center shadow-lg transition-all ${
                          selectedSeats.length === 0
                            ? "bg-white/[0.03] text-white/30 border border-white/5 cursor-not-allowed shadow-none"
                            : "bg-emerald-500 hover:bg-emerald-400 hover:shadow-emerald-500/25 cursor-pointer"
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
                      activeScreen === id ? "bg-emerald-400 w-6" : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to screen mockup ${id}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: AEGIS SENTINEL - CYBERSECURITY & THREAT DEFENSE (Multi-Mobile Deck)
           ========================================================================= */}
        {activeProject === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Interactive Overview */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Brand Header & Mode Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <ShieldCheck size={26} />
                  </span>
                  <div>
                    <span className="font-mono text-[9px] text-emerald-400 tracking-widest uppercase">
                      ZERO-TRUST DEFENSE
                    </span>
                    <h3 className="font-sans text-3xl sm:text-4xl font-black text-white">
                      Aegis Sentinel
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE DECK</span>
                </div>
              </div>

              <p className="font-sans text-sm sm:text-base text-white/70 leading-relaxed">
                Automated vulnerability scanner and runtime intrusion prevention system. Inspects WebSocket packets, sanitizes incoming AST payloads, and protects enterprise APIs against OWASP Top 10 vectors in real-time.
              </p>

              {/* Real-time Threat Radar Motion Graphic */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-4 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                  <div className="flex items-center gap-2 font-mono text-xs text-white/70">
                    <Terminal size={14} className="text-emerald-400" />
                    <span>daemon/aegis-runtime.telemetry</span>
                  </div>
                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    PORT 443 ARMED
                  </span>
                </div>

                {/* Radar visualization */}
                <div className="relative h-28 rounded-xl bg-black border border-emerald-500/20 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] pointer-events-none" />
                  <div className="w-24 h-24 rounded-full border border-emerald-500/20 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-emerald-500/30 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                    </div>
                  </div>
                  {/* Rotating beam */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.35)_360deg)]" />
                  </motion.div>
                  {/* Pulsing Intercept Blips */}
                  <span className="absolute top-4 left-10 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="absolute bottom-5 right-12 w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="absolute text-[8px] font-mono text-emerald-400/80 bottom-1 left-2">
                    0.8ms SWEEP · 0 BREACHES
                  </span>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 block">LATENCY</span>
                  <span className="text-sm font-bold text-emerald-400">0.8 ms</span>
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

              {/* Master Shield Toggle */}
              <button
                onClick={() => setShieldActive(!shieldActive)}
                className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                  shieldActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  {shieldActive ? "Zero-Trust Shield: ARMED & PROTECTING" : "Zero-Trust Shield: PAUSED"}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/40 text-[9px] uppercase tracking-wider">
                  {shieldActive ? "Active" : "Standby"}
                </span>
              </button>
            </div>

            {/* Right Column: 3D Multi-Mobile Screen Deck */}
            <motion.div style={{ y: yParallaxRight }} className="lg:col-span-7 flex flex-col items-center relative">
              {/* Virtual Projector Light Beam from Top */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
                <motion.div
                  style={{ rotate: projectorBeamAngle }}
                  className="w-3/4 h-20 bg-gradient-to-b from-emerald-400/20 via-emerald-500/[0.05] to-transparent blur-2xl rounded-t-full pointer-events-none"
                />
              </div>

              {/* Screen Switcher Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl mb-4 self-center backdrop-blur-md">
                {[
                  { id: 1, label: "Threat Radar", icon: Radio },
                  { id: 2, label: "Active Shield", icon: ShieldCheck },
                  { id: 3, label: "AST Audit", icon: Terminal },
                  { id: 4, label: "Incident Log", icon: Activity },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = securityActiveScreen === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSecurityActiveScreen(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-sans tracking-wider transition-all duration-300 uppercase cursor-pointer ${
                        isActive
                          ? "bg-emerald-500 text-black shadow-[0_4px_14px_rgba(16,185,129,0.4)] font-bold scale-[1.02]"
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
                
                {/* SCREEN 1: Threat Radar Mobile */}
                <motion.div
                  animate={{
                    x: securityActiveScreen === 1 ? 0 : securityActiveScreen === 2 ? -155 : securityActiveScreen === 3 ? -265 : -340,
                    y: securityActiveScreen === 1 ? 0 : securityActiveScreen === 2 ? 10 : securityActiveScreen === 3 ? 20 : 30,
                    scale: securityActiveScreen === 1 ? 1.03 : securityActiveScreen === 2 ? 0.91 : securityActiveScreen === 3 ? 0.84 : 0.78,
                    rotate: securityActiveScreen === 1 ? 0 : securityActiveScreen === 2 ? -4 : securityActiveScreen === 3 ? -7 : -10,
                    opacity: securityActiveScreen === 1 ? 1 : securityActiveScreen === 2 ? 0.85 : securityActiveScreen === 3 ? 0.5 : 0.2,
                    zIndex: securityActiveScreen === 1 ? 30 : securityActiveScreen === 2 ? 20 : securityActiveScreen === 3 ? 10 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setSecurityActiveScreen(1)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.08] bg-[#09090C] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden group/phone"
                >
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative font-sans">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    {/* Nav Bar */}
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <Radio size={9} className="text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-white font-bold">Threat Radar</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                        PORT 443
                      </span>
                    </div>

                    {/* Mini Sweep Canvas */}
                    <div className="relative w-full aspect-square rounded-2xl bg-zinc-950 border border-emerald-500/20 p-2 flex items-center justify-center mb-3 overflow-hidden">
                      <div className="w-full h-full rounded-full border border-emerald-500/15 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 rounded-full border border-emerald-500/20 flex items-center justify-center">
                          <div className="w-1/2 h-1/2 rounded-full border border-emerald-500/25 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                          </div>
                        </div>
                      </div>
                      {/* Sweep line */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.3)_360deg)]" />
                      </motion.div>
                      <span className="absolute top-5 right-8 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />
                      <span className="absolute bottom-6 left-10 w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_5px_#10b981]" />
                    </div>

                    {/* Threat List */}
                    <div className="space-y-1.5 text-[8.5px] font-mono overflow-y-auto flex-1">
                      <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">SQLi Injection Vector</p>
                          <p className="text-white/40">192.168.1.104 · /auth</p>
                        </div>
                        <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[7.5px]">BLOCKED</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">AST Buffer Exploit</p>
                          <p className="text-white/40">Port 8080 · WebSocket</p>
                        </div>
                        <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[7.5px]">DROPPED</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">DDoS SYN Packet Flood</p>
                          <p className="text-white/40">50k req/s · Rate Limiter</p>
                        </div>
                        <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[7.5px]">MITIGATED</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-white/[0.05]">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSecurityActiveScreen(2); }}
                        className="w-full h-6 rounded-lg bg-emerald-500 text-black text-[9px] font-bold tracking-wider uppercase flex items-center justify-center cursor-pointer shadow-lg hover:shadow-emerald-500/20"
                      >
                        Inspect Active Shield
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* SCREEN 2: Active Shield Mobile (Centerpiece) */}
                <motion.div
                  animate={{
                    x: securityActiveScreen === 2 ? 0 : securityActiveScreen === 1 ? 155 : securityActiveScreen === 3 ? -155 : -255,
                    y: securityActiveScreen === 2 ? 0 : securityActiveScreen === 1 ? 10 : securityActiveScreen === 3 ? 10 : 20,
                    scale: securityActiveScreen === 2 ? 1.05 : securityActiveScreen === 1 ? 0.91 : securityActiveScreen === 3 ? 0.91 : 0.85,
                    rotate: securityActiveScreen === 2 ? 0 : securityActiveScreen === 1 ? 3.5 : securityActiveScreen === 3 ? -3.5 : -6,
                    opacity: securityActiveScreen === 2 ? 1 : securityActiveScreen === 1 ? 0.85 : securityActiveScreen === 3 ? 0.85 : 0.55,
                    zIndex: securityActiveScreen === 2 ? 30 : securityActiveScreen === 1 ? 20 : securityActiveScreen === 3 ? 20 : 10,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setSecurityActiveScreen(2)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.12] bg-[#0A0A0E] p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.9)] cursor-pointer select-none overflow-hidden group/device"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.06] via-transparent to-emerald-600/[0.08] opacity-60 group-hover/device:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative font-sans">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    {/* App Header */}
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <ShieldCheck size={9} className="text-black" />
                        </div>
                        <span className="text-[10px] text-white font-bold">Aegis Sentinel</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        GLOBAL EDGE
                      </span>
                    </div>

                    {/* Shield Emblem Status Area */}
                    <div className="relative py-4 flex flex-col items-center justify-center text-center">
                      <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                        <div className="relative w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                          <ShieldCheck size={30} className="text-emerald-400" />
                        </div>
                      </div>
                      <h4 className="text-[13px] font-bold text-white tracking-wide">
                        {shieldActive ? "System Armed & Protected" : "Shield Suspended"}
                      </h4>
                      <p className="text-[9px] font-mono text-emerald-400 mt-0.5">
                        99.98% Defense Rate · 0.8ms
                      </p>
                    </div>

                    {/* Defense Layer Checklist */}
                    <div className="space-y-1.5 my-auto text-[8.5px] font-mono">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-white/80">WAF Zero-Trust Filter</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-white/80">AST Query Sanitizer</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={10} /> Online
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-white/80">TLS 1.3 Strict Handshake</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={10} /> Enforced
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-auto pt-2 border-t border-white/[0.05]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShieldActive(!shieldActive);
                        }}
                        className={`w-full h-7 rounded-lg text-[9px] font-bold tracking-wider uppercase flex items-center justify-center cursor-pointer transition-all ${
                          shieldActive
                            ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {shieldActive ? "Arm Defense Systems" : "Enable Protection"}
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* SCREEN 3: AST Audit Mobile */}
                <motion.div
                  animate={{
                    x: securityActiveScreen === 3 ? 0 : securityActiveScreen === 2 ? 155 : securityActiveScreen === 1 ? 265 : -155,
                    y: securityActiveScreen === 3 ? 0 : securityActiveScreen === 2 ? 10 : securityActiveScreen === 1 ? 20 : 10,
                    scale: securityActiveScreen === 3 ? 1.03 : securityActiveScreen === 2 ? 0.91 : securityActiveScreen === 1 ? 0.84 : 0.91,
                    rotate: securityActiveScreen === 3 ? 0 : securityActiveScreen === 2 ? 4 : securityActiveScreen === 1 ? 7 : -4,
                    opacity: securityActiveScreen === 3 ? 1 : securityActiveScreen === 2 ? 0.85 : securityActiveScreen === 1 ? 0.5 : 0.85,
                    zIndex: securityActiveScreen === 3 ? 30 : securityActiveScreen === 2 ? 20 : securityActiveScreen === 1 ? 10 : 20,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setSecurityActiveScreen(3)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.08] bg-[#09090C] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden group/phone"
                >
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative font-sans">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Terminal size={10} className="text-emerald-400" />
                        <span className="text-[10px] text-white font-bold">AST Code Scanner</span>
                      </div>
                      <span className="text-[8px] font-mono text-white/40">V8 WASM</span>
                    </div>

                    {/* AST Node Tree Display */}
                    <div className="rounded-xl bg-zinc-950 border border-white/[0.06] p-2.5 mb-3 font-mono text-[8px] space-y-1">
                      <p className="text-emerald-400 font-bold">POST /api/graphql</p>
                      <div className="pl-2 border-l border-emerald-500/20 space-y-1 text-white/70">
                        <p className="flex items-center gap-1">
                          <CheckCircle2 size={8} className="text-emerald-400" /> Payload Tokenizer [Clean]
                        </p>
                        <p className="flex items-center gap-1">
                          <CheckCircle2 size={8} className="text-emerald-400" /> JWT Verified [RS256]
                        </p>
                        <p className="flex items-center gap-1">
                          <CheckCircle2 size={8} className="text-emerald-400" /> Query Sanitizer [Safe]
                        </p>
                      </div>
                    </div>

                    {/* OWASP Summary Checklist */}
                    <div className="space-y-1.5 flex-1 font-mono text-[8.5px]">
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex justify-between text-white/80">
                          <span>OWASP Top 10</span>
                          <span className="text-emerald-400 font-bold">10/10 PASS</span>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full w-full" />
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex justify-between text-white/80">
                          <span>Memory Safety Index</span>
                          <span className="text-emerald-400 font-bold">100% Rust WASM</span>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full w-full" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-white/[0.05]">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSecurityActiveScreen(4); }}
                        className="w-full h-6 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-[9px] font-bold tracking-wider uppercase flex items-center justify-center cursor-pointer"
                      >
                        View Incident Logs
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* SCREEN 4: Incident Firewall Log Mobile */}
                <motion.div
                  animate={{
                    x: securityActiveScreen === 4 ? 0 : securityActiveScreen === 3 ? 155 : securityActiveScreen === 2 ? 255 : 340,
                    y: securityActiveScreen === 4 ? 0 : securityActiveScreen === 3 ? 10 : securityActiveScreen === 2 ? 20 : 30,
                    scale: securityActiveScreen === 4 ? 1.03 : securityActiveScreen === 3 ? 0.91 : securityActiveScreen === 2 ? 0.85 : 0.78,
                    rotate: securityActiveScreen === 4 ? 0 : securityActiveScreen === 3 ? 4 : securityActiveScreen === 2 ? 6 : 10,
                    opacity: securityActiveScreen === 4 ? 1 : securityActiveScreen === 3 ? 0.85 : securityActiveScreen === 2 ? 0.55 : 0.2,
                    zIndex: securityActiveScreen === 4 ? 30 : securityActiveScreen === 3 ? 20 : securityActiveScreen === 2 ? 10 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setSecurityActiveScreen(4)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.08] bg-[#09090C] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden group/phone"
                >
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative font-sans">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Activity size={10} className="text-emerald-400" />
                        <span className="text-[10px] text-white font-bold">Firewall Logs</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-400 animate-pulse">STREAMING</span>
                    </div>

                    {/* Live Stream Packets */}
                    <div className="space-y-1.5 font-mono text-[7.5px] overflow-y-auto flex-1">
                      <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                        <span className="text-white/40 block">[14:32:01.04]</span>
                        <span>200 OK - TLS 1.3 Key Exchange Signed</span>
                      </div>
                      <div className="p-1.5 rounded bg-red-950/30 border border-red-500/20 text-red-300">
                        <span className="text-white/40 block">[14:32:02.12]</span>
                        <span>403 BLOCKED - SQLi Payload Quarantined</span>
                      </div>
                      <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                        <span className="text-white/40 block">[14:32:02.89]</span>
                        <span>200 OK - Token Signature Validated (RS256)</span>
                      </div>
                      <div className="p-1.5 rounded bg-amber-950/30 border border-amber-500/20 text-amber-300">
                        <span className="text-white/40 block">[14:32:03.44]</span>
                        <span>429 RATE LIMIT - Bot Pattern Throttled</span>
                      </div>
                      <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                        <span className="text-white/40 block">[14:32:04.01]</span>
                        <span>200 OK - Edge Mesh Telemetry Synced</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-white/[0.05]">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSecurityActiveScreen(2); }}
                        className="w-full h-6 rounded-lg bg-emerald-500 text-black text-[9px] font-bold tracking-wider uppercase flex items-center justify-center cursor-pointer shadow-lg hover:shadow-emerald-500/20"
                      >
                        Return to Active Shield
                      </button>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Mobile pagination dots */}
              <div className="flex gap-2.5 mt-8 lg:hidden">
                {[1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setSecurityActiveScreen(id)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      securityActiveScreen === id ? "bg-emerald-400 w-6" : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to security mockup ${id}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: NEXUS ENGINE - CLOUD COMPILER & RUNTIME (Multi-Mobile Deck)
           ========================================================================= */}
        {activeProject === "cloud" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Interactive Overview */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Brand Header & Mode Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Code2 size={26} />
                  </span>
                  <div>
                    <span className="font-mono text-[9px] text-emerald-400 tracking-widest uppercase">
                      DISTRIBUTED CLOUD COMPILER
                    </span>
                    <h3 className="font-sans text-3xl sm:text-4xl font-black text-white">
                      Nexus Engine
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>WASM DECK</span>
                </div>
              </div>

              <p className="font-sans text-sm sm:text-base text-white/70 leading-relaxed">
                Zero-bundle runtime engine with serverless WASM execution. Provides ultra-low cold start times, instant Hot Module Reloading for distributed teams, and declarative tree-shaking algorithms.
              </p>

              {/* Real-time Compiler Visualization Motion Graphic */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-4 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                  <div className="flex items-center gap-2 font-mono text-xs text-white/70">
                    <Terminal size={14} className="text-emerald-400" />
                    <span>nexus-compiler --target=wasm-v8</span>
                  </div>
                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    <span>BUILD OPTIMIZED</span>
                  </span>
                </div>

                {/* Animated AST Graph Nodes */}
                <div className="grid grid-cols-3 gap-2.5 my-1">
                  {[
                    { step: "Parsing AST", sub: "Lexer Matrix" },
                    { step: "Tree Shaking", sub: "Dead Code Elim" },
                    { step: "WASM Emit", sub: "V8 Bytecode" }
                  ].map((item, idx) => (
                    <motion.div
                      key={item.step}
                      animate={{
                        borderColor: ["rgba(16,185,129,0.2)", "rgba(16,185,129,0.7)", "rgba(16,185,129,0.2)"],
                        y: [0, -3, 0]
                      }}
                      transition={{ duration: 2.2, delay: idx * 0.35, repeat: Infinity, ease: "easeInOut" }}
                      className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-center flex flex-col items-center gap-1 relative overflow-hidden"
                    >
                      <motion.div style={{ rotate: scrollCpuRotate }}>
                        <Cpu size={18} className="text-emerald-400" />
                      </motion.div>
                      <span className="font-mono text-[9px] text-white/90 font-bold">{item.step}</span>
                      <span className="font-mono text-[7px] text-emerald-300">{item.sub}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 block">COLD START</span>
                  <span className="text-sm font-bold text-emerald-400">12 ms</span>
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

              {/* Instant WASM Build Trigger */}
              <button
                onClick={() => {
                  setIsCompilingWasm(true);
                  setTimeout(() => setIsCompilingWasm(false), 1200);
                }}
                className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Zap size={16} className={isCompilingWasm ? "animate-spin" : ""} />
                  {isCompilingWasm ? "Compiling Bytecode..." : "Trigger Instant WASM Build"}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/40 text-[9px] uppercase tracking-wider">
                  {isCompilingWasm ? "12ms..." : "14.2 KB"}
                </span>
              </button>
            </div>

            {/* Right Column: 3D Multi-Mobile Screen Deck */}
            <motion.div style={{ y: yParallaxRight }} className="lg:col-span-7 flex flex-col items-center relative">
              {/* Virtual Projector Light Beam from Top */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
                <motion.div
                  style={{ rotate: projectorBeamAngle }}
                  className="w-3/4 h-20 bg-gradient-to-b from-emerald-400/20 via-emerald-500/[0.05] to-transparent blur-2xl rounded-t-full pointer-events-none"
                />
              </div>

              {/* Screen Switcher Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl mb-4 self-center backdrop-blur-md">
                {[
                  { id: 1, label: "Cluster Nodes", icon: Globe },
                  { id: 2, label: "Engine Console", icon: Cpu },
                  { id: 3, label: "Build Pipelines", icon: Layers },
                  { id: 4, label: "Resource Matrix", icon: Activity },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = cloudActiveScreen === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCloudActiveScreen(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-sans tracking-wider transition-all duration-300 uppercase cursor-pointer ${
                        isActive
                          ? "bg-emerald-500 text-black shadow-[0_4px_14px_rgba(16,185,129,0.4)] font-bold scale-[1.02]"
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
                
                {/* SCREEN 1: Cluster Nodes Mobile */}
                <motion.div
                  animate={{
                    x: cloudActiveScreen === 1 ? 0 : cloudActiveScreen === 2 ? -155 : cloudActiveScreen === 3 ? -265 : -340,
                    y: cloudActiveScreen === 1 ? 0 : cloudActiveScreen === 2 ? 10 : cloudActiveScreen === 3 ? 20 : 30,
                    scale: cloudActiveScreen === 1 ? 1.03 : cloudActiveScreen === 2 ? 0.91 : cloudActiveScreen === 3 ? 0.84 : 0.78,
                    rotate: cloudActiveScreen === 1 ? 0 : cloudActiveScreen === 2 ? -4 : cloudActiveScreen === 3 ? -7 : -10,
                    opacity: cloudActiveScreen === 1 ? 1 : cloudActiveScreen === 2 ? 0.85 : cloudActiveScreen === 3 ? 0.5 : 0.2,
                    zIndex: cloudActiveScreen === 1 ? 30 : cloudActiveScreen === 2 ? 20 : cloudActiveScreen === 3 ? 10 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setCloudActiveScreen(1)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.08] bg-[#09090C] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden group/phone"
                >
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative font-sans">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Globe size={10} className="text-emerald-400" />
                        <span className="text-[10px] text-white font-bold">Edge Mesh Nodes</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                        128 NODES
                      </span>
                    </div>

                    {/* Regional Nodes list */}
                    <div className="space-y-2 flex-1 overflow-y-auto font-mono text-[8px]">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold">US-East (Virginia)</span>
                          <span className="text-emerald-400 font-bold">0.6 ms</span>
                        </div>
                        <div className="flex justify-between text-white/50 text-[7px]">
                          <span>42 Workers Active</span>
                          <span>99.99% Uptime</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold">EU-Central (Frankfurt)</span>
                          <span className="text-emerald-400 font-bold">0.9 ms</span>
                        </div>
                        <div className="flex justify-between text-white/50 text-[7px]">
                          <span>38 Workers Active</span>
                          <span>100% Uptime</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold">AP-Northeast (Tokyo)</span>
                          <span className="text-emerald-400 font-bold">1.2 ms</span>
                        </div>
                        <div className="flex justify-between text-white/50 text-[7px]">
                          <span>48 Workers Active</span>
                          <span>99.98% Uptime</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-white/[0.05]">
                      <button
                        onClick={(e) => { e.stopPropagation(); setCloudActiveScreen(2); }}
                        className="w-full h-6 rounded-lg bg-emerald-500 text-black text-[9px] font-bold tracking-wider uppercase flex items-center justify-center cursor-pointer shadow-lg hover:shadow-emerald-500/20"
                      >
                        Launch Engine Console
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* SCREEN 2: Engine Console Mobile (Centerpiece) */}
                <motion.div
                  animate={{
                    x: cloudActiveScreen === 2 ? 0 : cloudActiveScreen === 1 ? 155 : cloudActiveScreen === 3 ? -155 : -255,
                    y: cloudActiveScreen === 2 ? 0 : cloudActiveScreen === 1 ? 10 : cloudActiveScreen === 3 ? 10 : 20,
                    scale: cloudActiveScreen === 2 ? 1.05 : cloudActiveScreen === 1 ? 0.91 : cloudActiveScreen === 3 ? 0.91 : 0.85,
                    rotate: cloudActiveScreen === 2 ? 0 : cloudActiveScreen === 1 ? 3.5 : cloudActiveScreen === 3 ? -3.5 : -6,
                    opacity: cloudActiveScreen === 2 ? 1 : cloudActiveScreen === 1 ? 0.85 : cloudActiveScreen === 3 ? 0.85 : 0.55,
                    zIndex: cloudActiveScreen === 2 ? 30 : cloudActiveScreen === 1 ? 20 : cloudActiveScreen === 3 ? 20 : 10,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setCloudActiveScreen(2)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.12] bg-[#0A0A0E] p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.9)] cursor-pointer select-none overflow-hidden group/device"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.06] via-transparent to-emerald-600/[0.08] opacity-60 group-hover/device:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative font-sans">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Cpu size={9} className="text-black" />
                        </div>
                        <span className="text-[10px] text-white font-bold">Nexus Engine</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        V8 WASM
                      </span>
                    </div>

                    {/* Reactor Status Area */}
                    <div className="relative py-4 flex flex-col items-center justify-center text-center">
                      <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full border border-dashed border-emerald-500/40"
                        />
                        <div className="relative w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                          <Cpu size={28} className="text-emerald-400" />
                        </div>
                      </div>
                      <h4 className="text-[13px] font-bold text-white tracking-wide">
                        12ms Cold Start
                      </h4>
                      <p className="text-[9px] font-mono text-emerald-400 mt-0.5">
                        45,000 Requests / Second
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="space-y-1.5 my-auto text-[8.5px] font-mono">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-white/80">Bundle Footprint</span>
                        <span className="text-emerald-400 font-bold">14.2 KB (-64%)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-white/80">Edge Cache Hit</span>
                        <span className="text-emerald-400 font-bold">98.6%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                        <span className="text-white/80">HMR Pipeline</span>
                        <span className="text-emerald-400 font-bold">Instant (0.4ms)</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-white/[0.05]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCompilingWasm(true);
                          setTimeout(() => setIsCompilingWasm(false), 1200);
                        }}
                        className="w-full h-7 rounded-lg bg-emerald-500 text-black text-[9px] font-bold tracking-wider uppercase flex items-center justify-center cursor-pointer shadow-lg hover:shadow-emerald-500/20"
                      >
                        {isCompilingWasm ? "Building Bytecode..." : "Execute Fast Deploy"}
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* SCREEN 3: Build Pipelines Mobile */}
                <motion.div
                  animate={{
                    x: cloudActiveScreen === 3 ? 0 : cloudActiveScreen === 2 ? 155 : cloudActiveScreen === 1 ? 265 : -155,
                    y: cloudActiveScreen === 3 ? 0 : cloudActiveScreen === 2 ? 10 : cloudActiveScreen === 1 ? 20 : 10,
                    scale: cloudActiveScreen === 3 ? 1.03 : cloudActiveScreen === 2 ? 0.91 : cloudActiveScreen === 1 ? 0.84 : 0.91,
                    rotate: cloudActiveScreen === 3 ? 0 : cloudActiveScreen === 2 ? 4 : cloudActiveScreen === 1 ? 7 : -4,
                    opacity: cloudActiveScreen === 3 ? 1 : cloudActiveScreen === 2 ? 0.85 : cloudActiveScreen === 1 ? 0.5 : 0.85,
                    zIndex: cloudActiveScreen === 3 ? 30 : cloudActiveScreen === 2 ? 20 : cloudActiveScreen === 1 ? 10 : 20,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setCloudActiveScreen(3)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.08] bg-[#09090C] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden group/phone"
                >
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative font-sans">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Layers size={10} className="text-emerald-400" />
                        <span className="text-[10px] text-white font-bold">Build Pipeline</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-400">12ms TOTAL</span>
                    </div>

                    {/* Pipeline stages */}
                    <div className="space-y-2 flex-1 font-mono text-[8px]">
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">1. AST Lexer &amp; Parser</p>
                          <p className="text-white/40">Tokens normalized</p>
                        </div>
                        <span className="text-emerald-400 font-bold">1.4ms</span>
                      </div>

                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">2. Dead Code Tree-Shaking</p>
                          <p className="text-white/40">-128 KB eliminated</p>
                        </div>
                        <span className="text-emerald-400 font-bold">2.1ms</span>
                      </div>

                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">3. WASM Bytecode Emit</p>
                          <p className="text-white/40">V8 compliant assembly</p>
                        </div>
                        <span className="text-emerald-400 font-bold">3.2ms</span>
                      </div>

                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">4. Edge Mesh Propagation</p>
                          <p className="text-white/40">128 nodes synchronized</p>
                        </div>
                        <span className="text-emerald-400 font-bold">5.3ms</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-white/[0.05]">
                      <button
                        onClick={(e) => { e.stopPropagation(); setCloudActiveScreen(4); }}
                        className="w-full h-6 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-[9px] font-bold tracking-wider uppercase flex items-center justify-center cursor-pointer"
                      >
                        Open Telemetry Matrix
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* SCREEN 4: Resource Matrix Mobile */}
                <motion.div
                  animate={{
                    x: cloudActiveScreen === 4 ? 0 : cloudActiveScreen === 3 ? 155 : cloudActiveScreen === 2 ? 255 : 340,
                    y: cloudActiveScreen === 4 ? 0 : cloudActiveScreen === 3 ? 10 : cloudActiveScreen === 2 ? 20 : 30,
                    scale: cloudActiveScreen === 4 ? 1.03 : cloudActiveScreen === 3 ? 0.91 : cloudActiveScreen === 2 ? 0.85 : 0.78,
                    rotate: cloudActiveScreen === 4 ? 0 : cloudActiveScreen === 3 ? 4 : cloudActiveScreen === 2 ? 6 : 10,
                    opacity: cloudActiveScreen === 4 ? 1 : cloudActiveScreen === 3 ? 0.85 : cloudActiveScreen === 2 ? 0.55 : 0.2,
                    zIndex: cloudActiveScreen === 4 ? 30 : cloudActiveScreen === 3 ? 20 : cloudActiveScreen === 2 ? 10 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 18 }}
                  onClick={() => setCloudActiveScreen(4)}
                  className="absolute w-[245px] h-[490px] rounded-[34px] border border-white/[0.08] bg-[#09090C] p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden group/phone"
                >
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-auto mr-3" />
                  </div>

                  <div className="w-full h-full rounded-[24px] bg-black overflow-hidden flex flex-col p-3 pt-5 relative font-sans">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-[9px] text-white/50 px-1 mb-2">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1.5 border border-white/30 rounded-[2px] flex items-center p-[0.5px]">
                          <span className="w-full h-full bg-white/60 rounded-[1px]" />
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Activity size={10} className="text-emerald-400" />
                        <span className="text-[10px] text-white font-bold">Telemetry Matrix</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-400">45k req/s</span>
                    </div>

                    {/* Gauges & Telemetry */}
                    <div className="space-y-2 flex-1 font-mono text-[8px]">
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                        <div className="flex justify-between text-white/80">
                          <span>CPU Load</span>
                          <span className="text-emerald-400 font-bold">18% (Nominal)</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[18%]" />
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                        <div className="flex justify-between text-white/80">
                          <span>Memory Allocated</span>
                          <span className="text-emerald-400 font-bold">24 MB / 128 MB</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[19%]" />
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                        <div className="flex justify-between text-white/80">
                          <span>Throughput Rate</span>
                          <span className="text-emerald-400 font-bold">45,120 req/s</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full w-[82%]" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-white/[0.05]">
                      <button
                        onClick={(e) => { e.stopPropagation(); setCloudActiveScreen(2); }}
                        className="w-full h-6 rounded-lg bg-emerald-500 text-black text-[9px] font-bold tracking-wider uppercase flex items-center justify-center cursor-pointer shadow-lg hover:shadow-emerald-500/20"
                      >
                        Return to Engine Console
                      </button>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Mobile pagination dots */}
              <div className="flex gap-2.5 mt-8 lg:hidden">
                {[1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setCloudActiveScreen(id)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      cloudActiveScreen === id ? "bg-emerald-400 w-6" : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to cloud mockup ${id}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* =========================================================================
          INTERACTIVE CINEMA TICKET MODAL / HOLOGRAPHIC PASS (Unified Emerald)
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
            className="w-full max-w-[360px] rounded-3xl border border-white/15 bg-gradient-to-b from-[#0a1410] via-[#09090D] to-black p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient Ticket Glow in Emerald */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <GraduationCap size={11} className="text-black" />
                </div>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-white">TeacherShow Campus Access</span>
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
                <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest">FEATURE FILM</span>
                <h4 className="font-sans text-lg font-black text-white">After Earth (IMAX 3D)</h4>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                <div>
                  <span className="text-white/40 block">DATE</span>
                  <span className="text-white font-bold">July {selectedDate}, 2026</span>
                </div>
                <div>
                  <span className="text-white/40 block">TIME</span>
                  <span className="text-emerald-400 font-bold">{selectedShowtime}</span>
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
                  <span className="text-sm font-bold text-emerald-400">${(selectedSeats.length * 14.5).toFixed(2)}</span>
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
