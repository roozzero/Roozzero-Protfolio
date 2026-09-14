import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Award, GraduationCap, CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StudentsSectionProps {
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export default function StudentsSection({ isLoggedIn, onOpenLoginModal }: StudentsSectionProps = {}) {
  const stats = [
    { value: 100, suffix: "+", label: "Happy clients" },
    { value: 250, prefix: "$", suffix: "m", label: "revenue added" },
    { value: 4.8, decimals: 1, label: "Average Rating" },
  ];

  const testimonials = [
    {
      id: "will",
      name: "Will smith",
      course: "Techzo: Creative Agency System",
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
      avatarBg: "from-orange-500 to-amber-600",
      text: "The structured course modules and hands-on project templates allowed me to transition from theory to high-fidelity interactive web development in weeks!",
    },
    {
      id: "ikta",
      name: "Ikta Sollork",
      course: "Lumin Studio Masterclass",
      rating: 4.7,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop",
      avatarBg: "from-emerald-700 to-zinc-700",
      text: "Working with this process was effortless. The vision was understood perfectly, and the designs truly represent my brand",
    },
    {
      id: "liloch",
      name: "Liloch",
      course: "Full Stack Web Development",
      rating: 5.0,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop",
      avatarBg: "from-blue-900 to-zinc-800",
      text: "Exceptional creativity and attention to detail! The final product not only looks great but also enhances user engagement",
    },
    {
      id: "diane",
      name: "Diane swag",
      course: "Aesthetics Design System",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop",
      avatarBg: "from-yellow-500 to-amber-600",
      text: "The curriculum is meticulously crafted. The combination of design principles and modern tech stack integration is unmatched.",
    },
    {
      id: "sarah",
      name: "Sarah Connor",
      course: "React & Vite Optimization",
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=120&auto=format&fit=crop",
      avatarBg: "from-purple-600 to-pink-700",
      text: "The performance and optimization course saved our startup months of engineering effort. A truly stellar program!",
    },
    {
      id: "marcus",
      name: "Marcus Aurelius",
      course: "Creative Agency System",
      rating: 5.0,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop",
      avatarBg: "from-cyan-600 to-blue-700",
      text: "A masterclass in modern digital aesthetics. It completely changed my perspective on frontend engineering.",
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
  const gap = 16;

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

  // Autoplay
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered, currentIndex, isSliding]);

  // Map absolute card index to original testimonial item
  const activeDotIndex = currentIndex % totalLength;

  return (
    <section
      id="my-students"
      className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14 md:py-18 relative text-white border-t border-white/[0.04] scroll-mt-24 overflow-visible"
    >
      {/* Background radial glows */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[450px] h-[300px] pointer-events-none blur-[150px] bg-gradient-to-tr from-emerald-500/[0.02] to-teal-500/[0.04] rounded-full z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[450px] h-[300px] pointer-events-none blur-[150px] bg-gradient-to-tr from-emerald-600/[0.02] to-emerald-400/[0.03] rounded-full z-0" />

      {/* Unified Section Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-10 md:mb-14 relative z-10 w-full">
        {/* Badge Column (Left) */}
        <div className="lg:col-span-3 flex items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm">
            <Sparkles size={11} className="text-emerald-400 animate-pulse" />
            <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-white/80 uppercase">
              MY STUDENTS
            </span>
          </div>
        </div>

        {/* Title & Subtitle Column (Right) */}
        <div className="lg:col-span-9 space-y-3">
          <h2 className="font-sans text-xl xs:text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none whitespace-nowrap">
            MY LOVELY STUDENTS
          </h2>
          <p className="font-sans text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
            Trusted by 100+ happy clients, adding $250M+ in revenue.
          </p>
        </div>
      </div>

      {/* Testimonials Card Container */}
      <div className="w-full p-6 sm:p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl relative z-10 space-y-10">
        
        {/* Header Stats & CTA Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-8 border-b border-white/[0.04] w-full">
          {/* Stats Row/Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 w-full lg:max-w-md">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-2.5 sm:p-4 flex flex-col justify-center text-center hover:border-white/[0.08] transition-colors"
              >
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-mono mt-1.5 leading-tight">
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
              className="flex-1 md:flex-initial inline-flex items-center justify-center px-3 sm:px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/90 hover:text-white hover:bg-white/10 transition-all font-sans text-[10px] sm:text-xs font-semibold tracking-[0.12em] uppercase whitespace-nowrap text-center"
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
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-full bg-white text-black font-sans text-[10px] sm:text-xs font-bold tracking-[0.12em] uppercase shadow-[0_4px_24px_rgba(255,255,255,0.08)] hover:bg-neutral-200 transition-all duration-300 whitespace-nowrap text-center"
            >
              <GraduationCap size={14} className="text-black shrink-0 hidden xs:block" />
              <span>My Courses</span>
            </motion.button>
          </div>
        </div>

        {/* Carousel Area */}
        <div 
          className="relative w-full overflow-hidden"
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
            transition={isSliding ? { type: "spring", stiffness: 260, damping: 28 } : { duration: 0 }}
            onAnimationComplete={handleAnimationComplete}
            className="flex cursor-grab active:cursor-grabbing w-full"
          >
            {items.map((test, index) => {
              // Calculate if this card is currently the active center card
              const isCenter = index === currentIndex + (visibleCards === 3 ? 1 : 0);

              return (
                <div
                  key={`${test.id}-${index}`}
                  className="shrink-0 transition-all duration-500"
                  style={{
                    width: `calc(${100 / visibleCards}% - ${(gap * (visibleCards - 1)) / visibleCards}px)`,
                    marginRight: `${gap}px`,
                  }}
                >
                  <motion.div
                    animate={{
                      scale: isCenter ? 1.02 : 0.96,
                      opacity: isCenter ? 1 : 0.7,
                    }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-[#0a0a0d]/90 backdrop-blur-md border border-white/[0.06] hover:border-emerald-500/30 rounded-3xl p-6 md:p-8 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.12)] group relative overflow-hidden select-none"
                  >
                    {/* Hover Glow Aura */}
                    <div className="absolute -inset-px bg-gradient-to-tr from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent_60%)] pointer-events-none" />

                    {/* Student Profile Row */}
                    <div className="flex items-center gap-4 pb-4 border-b border-white/[0.04]">
                      {/* Avatar Photo */}
                      <div className={`h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr ${test.avatarBg} p-[1.5px] shrink-0 shadow-lg`}>
                        <div className="w-full h-full rounded-[14px] overflow-hidden bg-zinc-900 flex items-center justify-center">
                          <img
                            src={test.avatar}
                            alt={test.name}
                            className="w-full h-full object-cover grayscale contrast-125"
                            referrerPolicy="no-referrer"
                            draggable="false"
                          />
                        </div>
                      </div>

                      {/* Name & Course */}
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="font-sans text-sm sm:text-base font-extrabold text-white tracking-tight leading-none truncate">
                          {test.name}
                        </h4>
                        <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-emerald-400 uppercase mt-1.5 block truncate">
                          {test.course}
                        </span>
                      </div>

                      {/* Check badge */}
                      <div className="w-7 h-7 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={12} className="text-[#10b981]" />
                      </div>
                    </div>

                    {/* Testimonial Text & Rating */}
                    <div className="mt-4 text-left space-y-3">
                      {/* Stars */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-emerald-400">{test.rating.toFixed(1)}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => {
                            const isFilled = i < Math.floor(test.rating);
                            return (
                              <Star
                                key={i}
                                size={10}
                                className={`${
                                  isFilled ? "fill-emerald-400 text-emerald-400" : "text-white/10"
                                } shrink-0`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Review Paragraph */}
                      <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-normal italic line-clamp-4">
                        "{test.text}"
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Carousel Footer: Dots and Controls */}
        <div className="flex justify-between items-center pt-2">
          {/* Animated Pagination Indicators */}
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
                  className="relative h-2 rounded-full transition-all duration-300 focus:outline-none"
                  style={{
                    width: isActive ? "24px" : "8px",
                    backgroundColor: isActive ? "#10b981" : "rgba(255, 255, 255, 0.15)",
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Previous/Next Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 sm:p-2.5 rounded-full border border-white/10 bg-white/[0.01] hover:bg-white/[0.08] hover:border-white/20 text-white/70 hover:text-white transition-all cursor-pointer focus:outline-none"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="p-2 sm:p-2.5 rounded-full border border-white/10 bg-white/[0.01] hover:bg-white/[0.08] hover:border-white/20 text-white/70 hover:text-white transition-all cursor-pointer focus:outline-none"
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
