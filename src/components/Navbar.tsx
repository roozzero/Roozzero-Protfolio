import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, User, ArrowRight } from "lucide-react";

interface NavbarProps {
  onPresetChange?: () => void;
  currentPresetName?: string;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export default function Navbar({ onPresetChange, currentPresetName, isLoggedIn, onOpenLoginModal }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  // Track scroll position to add a subtle micro-border or slight glass background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    "Home",
    "Who's Me",
    "Skills",
    "Projects",
    "Classes",
    "My Students",
    "Contact Me",
  ];

  // Automatic Scroll Spy using IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -65% 0px", // Trigger when section is in active view area
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const matchedItem = menuItems.find(
            (item) => item.toLowerCase().replace(/[^a-z0-9]/g, "-") === id
          );
          if (matchedItem) {
            setActiveItem(matchedItem);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    menuItems.forEach((item) => {
      const id = item.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      id="main-navigation-bar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out select-none ${
        scrolled
          ? "bg-black/80 backdrop-blur-md border-b border-white/[0.04] py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          : "bg-transparent border-b border-transparent py-5"
      }`}
      aria-label="Primary Navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-between">
          
          {/* LEFT: Logo - Maintained exactly where it was */}
          <div className="flex items-center">
            {/* Logo container matching Image 2 brand aesthetic */}
            <a
              href="#home"
              id="brand-logo-container"
              className="group flex items-center gap-3 transition-opacity duration-300 hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-white/20 rounded-md p-1"
              aria-label="ROOZZERO Logo"
            >
              {/* The elegant serif capital R */}
              <div 
                id="logo-brandmark" 
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] font-serif text-xl font-bold text-white shadow-inner transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.06] overflow-hidden"
              >
                <img 
                  src="/src/assets/images/001.png" 
                  alt="R" 
                  className="h-full w-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Wide geometric letter-spaced BRAND TEXT exactly like image 2 */}
              <div className="flex flex-col">
                <span className="font-sans text-[11px] font-semibold tracking-[0.28em] text-white uppercase leading-none transition-colors duration-300 group-hover:text-white">
                  ROOZZERO
                </span>
                <span className="mt-[3px] font-sans text-[7px] font-light tracking-[0.15em] text-white/40 uppercase leading-none">
                  Editorial
                </span>
              </div>
            </a>
          </div>

          {/* CENTER: Navigation Links - Perfectly centered on a single line with equal spacing */}
          <div className="hidden lg:flex flex-1 justify-center px-4">
            <ul className="flex items-center gap-1.5">
              {menuItems.map((item) => {
                const isActive = activeItem === item;
                return (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const id = item.toLowerCase().replace(/[^a-z0-9]/g, "-");
                        setActiveItem(item);
                        const element = document.getElementById(id);
                        if (element) {
                          const navbarHeight = 84;
                          const elementPosition = element.getBoundingClientRect().top;
                          const offsetPosition = elementPosition + window.scrollY - navbarHeight;
                          window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                          });
                        }
                      }}
                      className={`relative px-3.5 py-2 font-sans text-[10.5px] font-medium tracking-[0.2em] uppercase transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 rounded-md ${
                        isActive ? "text-emerald-400 font-semibold" : "text-white/50 hover:text-white/90"
                      }`}
                    >
                      <span>{item}</span>
                      
                      {/* Premium subtle bottom active border dot or bar in emerald */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute bottom-[-4px] left-1/2 h-[1.5px] w-4 -translate-x-1/2 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT: Login Link & Mobile Menu Controls */}
          <div className="flex items-center gap-4">
            {/* Premium Login Link on the far right side of the navbar */}
            <a
              href={isLoggedIn ? (localStorage.getItem("userRole") === "admin" ? "#admin" : "#dashboard") : "#login"}
              onClick={(e) => {
                if (!isLoggedIn && onOpenLoginModal) {
                  e.preventDefault();
                  onOpenLoginModal();
                }
              }}
              id="right-login-link"
              className="hidden lg:flex items-center gap-1.5 font-sans text-[10px] font-medium tracking-[0.18em] text-white/60 hover:text-white uppercase transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white/20 rounded-md px-3.5 py-1.5 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:text-white"
              aria-label={isLoggedIn ? "Access Dashboard" : "Access Account Login"}
            >
              <User size={12} className="opacity-70" />
              <span>{isLoggedIn ? (localStorage.getItem("userRole") === "admin" ? "Admin" : "Dashboard") : "Login"}</span>
            </a>

            {/* Mobile Menu Controls */}
            <div className="flex lg:hidden items-center gap-3">
              {/* Login button visible on mobile left of hamburger */}
              <a
                href={isLoggedIn ? (localStorage.getItem("userRole") === "admin" ? "#admin" : "#dashboard") : "#login"}
                onClick={(e) => {
                  if (!isLoggedIn && onOpenLoginModal) {
                    e.preventDefault();
                    onOpenLoginModal();
                  }
                }}
                className="flex sm:hidden items-center gap-1 font-sans text-[10px] font-medium tracking-[0.15em] text-white/70 hover:text-white uppercase transition-colors"
                aria-label={isLoggedIn ? "Dashboard" : "Login"}
              >
                <User size={12} />
                <span>{isLoggedIn ? (localStorage.getItem("userRole") === "admin" ? "Admin" : "Dashboard") : "Login"}</span>
              </a>

              {/* Interactive Hamburger button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-md p-2 text-white/70 hover:text-white hover:bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300"
                aria-expanded={isOpen}
                aria-label="Toggle Navigation Menu"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <X size={18} className="transition-transform duration-300 rotate-90" /> : <Menu size={18} />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE OVERLAY: Luxury pure black sliding background with smooth motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden absolute top-full left-0 right-0 border-b border-white/[0.05] bg-black/95 backdrop-blur-lg shadow-2xl py-6 px-4"
          >
            <div className="flex flex-col gap-4">
              <div className="px-2 pb-2 border-b border-white/[0.03] flex items-center justify-between">
                <span className="font-sans text-[9px] font-semibold tracking-[0.25em] text-white/40 uppercase">
                  Menu Navigation
                </span>
                {onPresetChange && (
                  <button
                    onClick={onPresetChange}
                    className="text-[8px] font-medium tracking-[0.1em] text-white/50 hover:text-white border border-white/10 rounded px-2 py-0.5"
                  >
                    Change Lights
                  </button>
                )}
              </div>

              <ul className="flex flex-col gap-1">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <a
                      href={`#${item.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const id = item.toLowerCase().replace(/[^a-z0-9]/g, "-");
                        setActiveItem(item);
                        setIsOpen(false);
                        const element = document.getElementById(id);
                        if (element) {
                          const navbarHeight = 84;
                          const elementPosition = element.getBoundingClientRect().top;
                          const offsetPosition = elementPosition + window.scrollY - navbarHeight;
                          window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                          });
                        }
                      }}
                      className="flex items-center justify-between px-3 py-2.5 font-sans text-[11px] font-medium tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/[0.02] rounded-md transition-all duration-300 uppercase"
                    >
                      <span>{item}</span>
                      <ArrowRight size={10} className="opacity-30" />
                    </a>
                  </motion.li>
                ))}
              </ul>

              {/* Login option in mobile overlay menu list */}
              <div className="mt-2 pt-4 border-t border-white/[0.03]">
                <a
                  href={isLoggedIn ? (localStorage.getItem("userRole") === "admin" ? "#admin" : "#dashboard") : "#login"}
                  onClick={(e) => {
                    if (!isLoggedIn && onOpenLoginModal) {
                      e.preventDefault();
                      setIsOpen(false);
                      onOpenLoginModal();
                    } else {
                      setIsOpen(false);
                    }
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/10 bg-white/[0.03] font-sans text-[11px] font-medium tracking-[0.2em] text-white hover:bg-white/10 transition-all duration-300 uppercase"
                >
                  <User size={12} />
                  <span>{isLoggedIn ? (localStorage.getItem("userRole") === "admin" ? "Admin Dashboard" : "User Dashboard") : "Account Login"}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
