/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform } from "motion/react";
import { Sparkles, ArrowRight, Star, MapPin, Calendar as CalendarIcon, User, X, ChevronLeft, ChevronRight, Clock, Heart, Compass as CompassIcon, ChevronDown, ChevronUp, BookOpen, Award, CheckCircle2, FileDown, Github, ShieldCheck, Terminal, Layers, Code2, Lock, GraduationCap } from "lucide-react";
import Navbar from "./components/Navbar";
import SkillsSection from "./components/SkillsSection";
import ProjectsSection from "./components/ProjectsSection";
import StudentsSection from "./components/StudentsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import CourseRegistrationModal, { CourseRegistrationData } from "./components/CourseRegistrationModal";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import BackToTop from "./components/BackToTop";

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
    orb1: "rgba(16, 185, 129, 0.05)", // Gentle emerald glow
    orb2: "rgba(5, 150, 105, 0.06)",  // Deep dark jade
    orb3: "rgba(255, 255, 255, 0.02)", // Central white dust
    orb4: "rgba(10, 10, 10, 0.20)",   // Obsidian velvet shadow
    gridColor: "rgba(16, 185, 129, 0.02)",
    lineColor: "rgba(16, 185, 129, 0.05)",
  },
  {
    name: "Cyber Jade",
    orb1: "rgba(16, 185, 129, 0.07)", // Emerald glow
    orb2: "rgba(52, 211, 153, 0.05)", // Mint mist
    orb3: "rgba(20, 184, 166, 0.04)", // Soft teal glow
    orb4: "rgba(6, 78, 59, 0.15)",    // Deep forest shadow
    gridColor: "rgba(16, 185, 129, 0.03)",
    lineColor: "rgba(52, 211, 153, 0.06)",
  },
  {
    name: "Forest Obsidian",
    orb1: "rgba(5, 150, 105, 0.06)", // Deep emerald shadow
    orb2: "rgba(16, 185, 129, 0.05)", // Delicate emerald
    orb3: "rgba(52, 211, 153, 0.03)", // Mint shine
    orb4: "rgba(15, 23, 42, 0.15)",  // Deep obsidian
    gridColor: "rgba(16, 185, 129, 0.02)",
    lineColor: "rgba(16, 185, 129, 0.06)",
  },
  {
    name: "Obsidian Silver",
    orb1: "rgba(255, 255, 255, 0.03)", // Platinum ray
    orb2: "rgba(16, 185, 129, 0.03)", // Subtle emerald hint
    orb3: "rgba(51, 65, 85, 0.05)",   // Charcoal depth
    orb4: "rgba(15, 23, 42, 0.1)",    // Obsidian blackness
    gridColor: "rgba(255, 255, 255, 0.02)",
    lineColor: "rgba(16, 185, 129, 0.05)",
  },
];

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const DEFAULT_HOMEPAGE_CLASSES = [
  {
    id: "lumin",
    courseImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    courseName: "Modern Next.js Development",
    instructor: "Roozbeh",
    price: "$199",
    shortDescription: "Explore modern Next.js application development, routing, rendering strategies, project structure, and scalable web architectures.",
    description: "Explore modern Next.js application development, routing, rendering strategies, project structure, and scalable web architectures.",
    sessions: 16,
    status: "Published",
    displayOrder: 1,
    tags: ["Next.js", "React", "Web"],
    syllabus: [
      { id: "next-1", title: "Next.js Fundamentals & Project Setup", description: "Next.js core concepts, directory configuration, TypeScript setup, and configuration files.", duration: "Session 1" },
      { id: "next-2", title: "App Router Architecture", description: "Deep dive into App Router, file-system based conventions, and route segments.", duration: "Session 2" },
      { id: "next-3", title: "Server Components & Client Components", description: "RSC mental model, client component boundary rules, and seamless data passing.", duration: "Session 3" },
      { id: "next-4", title: "Layouts, Templates & Nested Routes", description: "Root and nested layouts, templates vs layouts, parallel routes, and intercepted routes.", duration: "Session 4" },
      { id: "next-5", title: "Dynamic & Catch-All Routes", description: "Dynamic segment matching, optional catch-all parameters, and generateStaticParams.", duration: "Session 5" },
      { id: "next-6", title: "Data Fetching & Caching", description: "Fetch API cache configurations, on-demand revalidation, and request deduplication.", duration: "Session 6" },
      { id: "next-7", title: "Server Actions", description: "Mutations with Server Actions, form progressive enhancement, and optimistic UI updates.", duration: "Session 7" },
      { id: "next-8", title: "Loading & Error UI", description: "Instant loading states with loading.js, Suspense streams, error.js, and global-error.js.", duration: "Session 8" },
      { id: "next-9", title: "Middleware & Route Protection", description: "Edge runtime middleware, cookie inspection, bot protection, and route rewrites.", duration: "Session 9" },
      { id: "next-10", title: "Authentication & Authorization", description: "Session management, JWT verification, role-based protection, and secure Auth flows.", duration: "Session 10" },
      { id: "next-11", title: "API Routes & Backend Integration", description: "Route Handlers (GET, POST, etc.), streaming responses, and backend proxy integrations.", duration: "Session 11" },
      { id: "next-12", title: "Image & Font Optimization", description: "Next.js Image component, responsive image sizes, and zero-layout-shift web fonts.", duration: "Session 12" },
      { id: "next-13", title: "SEO & Metadata Management", description: "Dynamic metadata generation, OpenGraph tags, sitemap.xml, and robots.txt generation.", duration: "Session 13" },
      { id: "next-14", title: "Performance Optimization", description: "Core Web Vitals tuning, bundle analyzer inspection, and server-side streaming.", duration: "Session 14" },
      { id: "next-15", title: "Deployment & Production Configuration", description: "Vercel and self-hosted Node/Docker builds, environment secrets, and edge caching.", duration: "Session 15" },
      { id: "next-16", title: "Building Production-Ready Next.js Applications", description: "End-to-end full-stack capstone project featuring real-time state, DB integration, and CI/CD.", duration: "Session 16" }
    ]
  },
  {
    id: "apex",
    courseImage: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?q=80&w=800&auto=format&fit=crop",
    courseName: "Frontend Development with TypeScript",
    instructor: "Roozbeh",
    price: "$179",
    shortDescription: "Learn how TypeScript improves code quality, maintainability, and scalability in modern frontend applications.",
    description: "Learn how TypeScript improves code quality, maintainability, and scalability in modern frontend applications.",
    sessions: 16,
    status: "Published",
    displayOrder: 2,
    tags: ["TypeScript", "React", "JavaScript"],
    syllabus: [
      { id: "ts-1", title: "TypeScript Fundamentals", description: "JavaScript superset syntax, compiler configuration (tsconfig), and runtime behavior.", duration: "Session 1" },
      { id: "ts-2", title: "Type Annotations & Type Inference", description: "Primitive types, inferred types, contextual typing, and strict mode flags.", duration: "Session 2" },
      { id: "ts-3", title: "Interfaces & Type Aliases", description: "Declaring object shapes, extending interfaces, intersections, and architectural differences.", duration: "Session 3" },
      { id: "ts-4", title: "Union & Intersection Types", description: "Discriminated unions, exhaustiveness checks, and composing complex composite types.", duration: "Session 4" },
      { id: "ts-5", title: "Functions & Generics", description: "Generic functions, constraints, defaults, function overloading, and higher-order typing.", duration: "Session 5" },
      { id: "ts-6", title: "Enums & Literal Types", description: "Numeric and string enums, const assertions, string literal types, and template literals.", duration: "Session 6" },
      { id: "ts-7", title: "Advanced Type Manipulation", description: "Keyof, typeof, indexed access types, conditional types, and distributive conditionals.", duration: "Session 7" },
      { id: "ts-8", title: "Utility Types", description: "Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract, and ReturnType.", duration: "Session 8" },
      { id: "ts-9", title: "Type-Safe React Components", description: "Typing functional components, children, polymorphic components, and forwardRef.", duration: "Session 9" },
      { id: "ts-10", title: "Props, State & Event Typing", description: "Strict typing for mouse, keyboard, and form events, component props, and complex state.", duration: "Session 10" },
      { id: "ts-11", title: "Custom Hooks with TypeScript", description: "Strict return tuple and object typing, generic hooks, and hook dependency typing.", duration: "Session 11" },
      { id: "ts-12", title: "API Response & Data Modeling", description: "DTO contracts, schema validation with Zod/io-ts, and type-safe HTTP client wrappers.", duration: "Session 12" },
      { id: "ts-13", title: "Type-Safe Forms & Validation", description: "Integrating react-hook-form with Zod schemas for end-to-end form type safety.", duration: "Session 13" },
      { id: "ts-14", title: "Error Handling & Type Guards", description: "User-defined type guards (is), assertion signatures (asserts), and safe error narrowing.", duration: "Session 14" },
      { id: "ts-15", title: "TypeScript with React & Next.js", description: "Typing Server Components, Route Handlers, Server Actions, and Next.js dynamic params.", duration: "Session 15" },
      { id: "ts-16", title: "Building Scalable Type-Safe Applications", description: "Large-scale monorepo configurations, strict linting, shared types, and architectural testing.", duration: "Session 16" }
    ]
  },
  {
    id: "bgbunty",
    courseImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
    courseName: "Web Security & Bug Bounty",
    instructor: "Roozbeh",
    price: "$189",
    shortDescription: "An introduction to web application security, vulnerability discovery, OWASP methodologies, and practical bug bounty research.",
    description: "An introduction to web application security, vulnerability discovery, OWASP methodologies, and practical bug bounty research.",
    sessions: 18,
    status: "Published",
    displayOrder: 3,
    tags: ["Cybersecurity", "OWASP", "Bug Bounty"],
    syllabus: [
      { id: "sec-1", title: "Web Security Fundamentals", description: "Core cybersecurity principles, threat modeling, confidentiality, integrity, and availability.", duration: "Session 1" },
      { id: "sec-2", title: "HTTP/HTTPS & Web Architecture", description: "HTTP request/response lifecycle, headers, cookies, TLS/SSL encryption, and proxying.", duration: "Session 2" },
      { id: "sec-3", title: "Authentication & Session Security", description: "Session fixation, JWT vulnerabilities, brute-force defenses, and credential stuffing.", duration: "Session 3" },
      { id: "sec-4", title: "Access Control & Authorization", description: "Privilege levels, vertical and horizontal authorization flaws, and permission matrices.", duration: "Session 4" },
      { id: "sec-5", title: "OWASP Top 10", description: "Detailed taxonomy of the OWASP Top 10 web vulnerabilities and real-world attack vectors.", duration: "Session 5" },
      { id: "sec-6", title: "Information Disclosure", description: "Finding sensitive file leaks, debug endpoints, exposed credentials, and stack trace risks.", duration: "Session 6" },
      { id: "sec-7", title: "Security Misconfigurations", description: "Default credentials, directory indexing, overly permissive CORS, and cloud misconfigs.", duration: "Session 7" },
      { id: "sec-8", title: "Cross-Site Scripting (XSS)", description: "Reflected, Stored, and DOM-based XSS, bypass techniques, and CSP defense mechanics.", duration: "Session 8" },
      { id: "sec-9", title: "SQL Injection", description: "Classic, blind (boolean & time-based), union-based SQLi, and parameterized defense.", duration: "Session 9" },
      { id: "sec-10", title: "Cross-Site Request Forgery (CSRF)", description: "SameSite cookie policies, anti-CSRF token verification, and defense-in-depth mitigations.", duration: "Session 10" },
      { id: "sec-11", title: "Server-Side Request Forgery (SSRF)", description: "Blind and out-of-band SSRF, cloud metadata exfiltration (AWS/GCP), and allowlist parsing.", duration: "Session 11" },
      { id: "sec-12", title: "File Upload Vulnerabilities", description: "Web shells, MIME bypass, extension blacklisting flaws, and secure cloud storage.", duration: "Session 12" },
      { id: "sec-13", title: "IDOR & Broken Access Control", description: "Insecure Direct Object References, parameter tampering, and API endpoint enumeration.", duration: "Session 13" },
      { id: "sec-14", title: "API Security Testing", description: "Testing REST and GraphQL APIs, mass assignment, rate-limit bypassing, and schema leaks.", duration: "Session 14" },
      { id: "sec-15", title: "Reconnaissance & Attack Surface Discovery", description: "Target scoping, passive/active intelligence gathering, technology fingerprinting, and ASN mapping.", duration: "Session 15" },
      { id: "sec-16", title: "Vulnerability Validation & Impact Assessment", description: "Creating reliable proof-of-concepts (PoC), calculating CVSS scores, and impact demonstration.", duration: "Session 16" },
      { id: "sec-17", title: "Bug Bounty Methodology", description: "Platforms (HackerOne, Bugcrowd), reading program scopes, triage etiquette, and triage workflows.", duration: "Session 17" },
      { id: "sec-18", title: "Writing Professional Bug Reports", description: "Drafting high-payout vulnerability disclosures, clear reproduction steps, and remediation advice.", duration: "Session 18" }
    ]
  },
  {
    id: "hunt",
    courseImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    courseName: "Ethical Hacking & Hunting",
    instructor: "Roozbeh",
    price: "$199",
    shortDescription: "Practical learning focused on security testing, reconnaissance, vulnerability research, and threat hunting fundamentals.",
    description: "Practical learning focused on security testing, reconnaissance, vulnerability research, and threat hunting fundamentals.",
    sessions: 18,
    status: "Published",
    displayOrder: 4,
    tags: ["Ethical Hacking", "Hunting", "Security"],
    syllabus: [
      { id: "hunt-1", title: "Ethical Hacking Fundamentals", description: "Legal frameworks, ethics, rules of engagement, and red team vs blue team dynamics.", duration: "Session 1" },
      { id: "hunt-2", title: "Cybersecurity & Attack Lifecycle", description: "Cyber Kill Chain, MITRE ATT&CK framework, and understanding threat actor tactics.", duration: "Session 2" },
      { id: "hunt-3", title: "Linux for Security Professionals", description: "Command line mastery, file permissions, bash scripting, network utilities, and system logs.", duration: "Session 3" },
      { id: "hunt-4", title: "Networking & Network Reconnaissance", description: "TCP/IP, subnetting, DNS, packet analysis with Wireshark, and network protocol fundamentals.", duration: "Session 4" },
      { id: "hunt-5", title: "Information Gathering & OSINT", description: "Open-source intelligence, corporate domain profiling, public registries, and social recon.", duration: "Session 5" },
      { id: "hunt-6", title: "Passive & Active Reconnaissance", description: "Stealthy discovery techniques, DNS querying, CDN identification, and surface footprinting.", duration: "Session 6" },
      { id: "hunt-7", title: "Subdomain Enumeration", description: "Certificate transparency logs, brute forcing, wordlists, and permutation engines.", duration: "Session 7" },
      { id: "hunt-8", title: "Port & Service Enumeration", description: "Nmap scanning strategies, service banner grabbing, NSE scripts, and firewall evasion.", duration: "Session 8" },
      { id: "hunt-9", title: "Vulnerability Assessment", description: "Vulnerability scanners (Nessus, OpenVAS, Nuclei), false positive filtering, and CVE analysis.", duration: "Session 9" },
      { id: "hunt-10", title: "Web Application Security Testing", description: "Burp Suite professional workflows, proxy interception, repeater, intruder, and match & replace.", duration: "Session 10" },
      { id: "hunt-11", title: "API & Authentication Testing", description: "JWT manipulation, OAuth flaw auditing, GraphQL introspection, and session replay.", duration: "Session 11" },
      { id: "hunt-12", title: "Exploitation Fundamentals", description: "Metasploit framework, payload generation with msfvenom, and understanding memory safeguards.", duration: "Session 12" },
      { id: "hunt-13", title: "Privilege Escalation Concepts", description: "Linux and Windows local enumeration, SUID binaries, misconfigured sudo, and unquoted service paths.", duration: "Session 13" },
      { id: "hunt-14", title: "Post-Exploitation Fundamentals", description: "Maintaining access, pivoting through internal subnets, credential dumping, and artifact cleanup.", duration: "Session 14" },
      { id: "hunt-15", title: "Security Tools & Automation", description: "Automating workflows with Python, Go tools (ffuf, httpx, subfinder), and bash pipelines.", duration: "Session 15" },
      { id: "hunt-16", title: "Vulnerability Hunting Methodology", description: "Systematic hunting strategies, asset tracking, continuous monitoring, and diffing new features.", duration: "Session 16" },
      { id: "hunt-17", title: "Responsible Disclosure", description: "Coordinated disclosure timelines, communicating with enterprise security teams, and hall of fame.", duration: "Session 17" },
      { id: "hunt-18", title: "Hands-on Security Labs & Real-World Scenarios", description: "Practicing on simulated targets, CTF challenges, lab walk-throughs, and real-world attack simulations.", duration: "Session 18" }
    ]
  }
];

const FALLBACK_COURSE_SYLLABUS: Record<string, Array<{ id: string; title: string; description: string; duration: string }>> = {
  lumin: DEFAULT_HOMEPAGE_CLASSES[0].syllabus,
  apex: DEFAULT_HOMEPAGE_CLASSES[1].syllabus,
  bgbunty: DEFAULT_HOMEPAGE_CLASSES[2].syllabus,
  hunt: DEFAULT_HOMEPAGE_CLASSES[3].syllabus
};

function getCourseSyllabus(cls: any): Array<{ id: string; title: string; description: string; duration: string }> {
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("userRole") || "user");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDashboardPage, setIsDashboardPage] = useState(window.location.hash === "#dashboard");
  const [isAdminPage, setIsAdminPage] = useState(window.location.hash === "#admin");

  const animatedTexts = useMemo(() => [
    "Full Stack Engineering",
    "React & Vite Optimization",
    "Cloud Computing & Deployments",
    "Elegant Design Systems"
  ], []);

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = animatedTexts[currentTextIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      }, 50);
    } else {
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }, 100);
    }

    if (!isDeleting && currentText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentTextIndex, animatedTexts]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#login") {
        setIsLoginModalOpen(true);
        window.location.hash = "";
      } else {
        setIsDashboardPage(hash === "#dashboard");
        setIsAdminPage(hash === "#admin");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Redirect unauthenticated user accessing dashboard/admin back to landing page, keeping modal closed
  useEffect(() => {
    if ((isDashboardPage || isAdminPage) && !isLoggedIn) {
      setIsDashboardPage(false);
      setIsAdminPage(false);
      window.location.hash = "";
    }
  }, [isDashboardPage, isAdminPage, isLoggedIn]);

  // Redirect to corresponding dashboard if already authenticated user tries to access login when open
  useEffect(() => {
    if (isLoginModalOpen && isLoggedIn) {
      setIsLoginModalOpen(false);
      if (userRole === "admin") {
        window.location.hash = "#admin";
      } else {
        window.location.hash = "#dashboard";
      }
    }
  }, [isLoginModalOpen, isLoggedIn, userRole]);

  useEffect(() => {
    if (!isDashboardPage && !isAdminPage && window.location.hash) {
      const targetId = window.location.hash.substring(1);
      if (targetId && targetId !== "login" && targetId !== "dashboard" && targetId !== "admin") {
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            const navbarHeight = 84;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - navbarHeight;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }
        }, 120);
      }
    }
  }, [isDashboardPage, isAdminPage]);

  const [presetIndex, setPresetIndex] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const classesSectionRef = useRef<HTMLElement>(null);

  // Global sticky scroll progress
  const { scrollYProgress: globalScrollYProgress } = useScroll();
  const globalScrollWidth = useTransform(globalScrollYProgress, [0, 1], ["0%", "100%"]);

  // Scroll Progress for Hero / Who's Me
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
  });
  const smoothHeroProgress = useSpring(heroScrollProgress, { stiffness: 85, damping: 22, restDelta: 0.001 });
  const heroProgressBarWidth = useTransform(smoothHeroProgress, [0.05, 0.95], ["0%", "100%"]);

  // Scroll Progress for Classes / Academy Section
  const { scrollYProgress: classesScrollProgress } = useScroll({
    target: classesSectionRef,
    offset: ["start end", "end start"],
  });
  const smoothClassesProgress = useSpring(classesScrollProgress, { stiffness: 85, damping: 22, restDelta: 0.001 });
  const classesProgressBarWidth = useTransform(smoothClassesProgress, [0.1, 0.9], ["0%", "100%"]);

  const preset = PRESETS[presetIndex];

  // Dynamic Classes state synchronized with the CMS Admin Dashboard
  const [homepageClasses, setHomepageClasses] = useState<any[]>(() => {
    const saved = localStorage.getItem("cms_current_config");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config && Array.isArray(config.classes)) {
          const nonTechzo = config.classes.filter((c: any) => c.id !== "techzo");
          const updated = nonTechzo.map((c: any) => {
            const def = DEFAULT_HOMEPAGE_CLASSES.find((d) => d.id === c.id);
            if (def && (!c.syllabus || c.syllabus.length < 10 || !c.courseImage || c.courseImage.includes("photo-1550751827-4bd374c3f58b"))) {
              return { ...c, syllabus: def.syllabus, sessions: def.sessions, courseName: def.courseName, courseImage: def.courseImage };
            }
            return c;
          });
          const existingIds = new Set(updated.map((c: any) => c.id));
          const missingDefaults = DEFAULT_HOMEPAGE_CLASSES.filter((c) => !existingIds.has(c.id));
          const merged = [...updated, ...missingDefaults];
          localStorage.setItem("cms_current_config", JSON.stringify({ ...config, classes: merged }));
          return merged;
        }
      } catch (e) {
        console.error("Failed to parse homepage classes", e);
      }
    }
    return DEFAULT_HOMEPAGE_CLASSES;
  });

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

  // Reload homepage classes whenever hash changes so that it picks up any admin dashboard edits!
  useEffect(() => {
    const handleHashChange = () => {
      const saved = localStorage.getItem("cms_current_config");
      if (saved) {
        try {
          const config = JSON.parse(saved);
          if (config && Array.isArray(config.classes)) {
            const nonTechzo = config.classes.filter((c: any) => c.id !== "techzo");
            const updated = nonTechzo.map((c: any) => {
              const def = DEFAULT_HOMEPAGE_CLASSES.find((d) => d.id === c.id);
              if (def && (!c.syllabus || c.syllabus.length < 10 || !c.courseImage || c.courseImage.includes("photo-1550751827-4bd374c3f58b"))) {
                return { ...c, syllabus: def.syllabus, sessions: def.sessions, courseName: def.courseName, courseImage: def.courseImage };
              }
              return c;
            });
            const existingIds = new Set(updated.map((c: any) => c.id));
            const missingDefaults = DEFAULT_HOMEPAGE_CLASSES.filter((c) => !existingIds.has(c.id));
            setHomepageClasses([...updated, ...missingDefaults]);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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

  if (isDashboardPage && isLoggedIn) {
    if (userRole === "teacher") {
      return (
        <TeacherDashboard 
          onLogout={() => {
            setIsLoggedIn(false);
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userRole");
            window.location.hash = "#login";
          }}
          onGoHome={() => {
            window.location.hash = "#";
          }}
        />
      );
    }
    return (
      <UserDashboard 
        onLogout={() => {
          setIsLoggedIn(false);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userRole");
          window.location.hash = "#login";
        }}
        onGoHome={() => {
          window.location.hash = "#";
        }}
      />
    );
  }

  if (isAdminPage && isLoggedIn && userRole === "admin") {
    return (
      <AdminDashboard 
        onLogout={() => {
          setIsLoggedIn(false);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userRole");
          window.location.hash = "#login";
        }}
        onGoHome={() => {
          window.location.hash = "#";
        }}
      />
    );
  }

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
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
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
              src="/src/assets/images/ChatGPT Image Jun 28, 2026, 10_07_30 PM.png"
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
              I'M
            </span>

            {/* Main Headline with typing effect */}
            <div className="flex flex-col items-start relative mt-4">
              <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-[0.22em] text-white uppercase leading-none z-20">
                ROOZZERO
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
            src="/src/assets/images/ChatGPT Image Jun 28, 2026, 10_07_30 PM.png"
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
            I'M
          </span>

          {/* Main Headline with typing effect */}
          <div className="flex flex-col items-start relative mt-4">
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[0.22em] text-white uppercase leading-none z-20">
              ROOZZERO
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
                About Me
              </span>
            </div>
          </div>

          {/* Title & Subtitle Column (Right) */}
          <div className="lg:col-span-9 space-y-4">
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Who's Me
            </h2>
            <p className="font-sans text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
              Hi, I'm Roozbeh Tavakoli | a Computer Engineer and Frontend Developer focused on building modern, scalable, and user-centered web experiences.
            </p>
            
            {/* Elegant Action Buttons: CV & GitHub */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.a
                href="#"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] active:scale-[0.98] transition-all duration-300 font-sans"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                <FileDown size={16} className="transition-transform duration-300 group-hover:translate-y-[-1px]" />
              </motion.a>
              <motion.a
                href="https://github.com/roozzero"
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
                src="/src/assets/images/photo_2024-10-20_19-21-55.jpg"
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
            
            {/* Card 1: Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.3)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-[215px] sm:h-[220px] rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.035] via-white/[0.015] to-transparent p-6 flex flex-col justify-between shadow-xl hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className="font-mono text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase">
                  EXPERIENCE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-[9px] font-mono text-emerald-400">
                  <Clock size={10} className="text-emerald-400" />
                  <span>7+ Years Exp</span>
                </span>
              </div>

              <div className="my-auto py-1 relative z-10">
                <span className="block font-sans text-4xl sm:text-5xl font-light tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  7+
                </span>
                <p className="font-sans text-xs text-white/50 tracking-wide mt-1.5 truncate">
                  React · Next.js · TypeScript
                </p>
              </div>

              <div className="h-8 flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[10px] font-mono text-white/40 relative z-10">
                <span>Core Technologies</span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Production Active
                </span>
              </div>
            </motion.div>

            {/* Card 2: Main Fields */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.3)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="h-[215px] sm:h-[220px] rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.035] via-white/[0.015] to-transparent p-6 flex flex-col justify-between shadow-xl hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className="font-mono text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase">
                  Main Fields
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-[9px] font-mono text-emerald-400">
                  <ShieldCheck size={10} className="text-emerald-400" />
                  <span>Dev &amp; Security</span>
                </span>
              </div>

              <div className="my-auto py-1 relative z-10">
                <span className="block font-sans text-4xl sm:text-5xl font-light tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  2
                </span>
                <p className="font-sans text-xs text-white/50 tracking-wide mt-1.5 truncate">
                  Development · Cybersecurity
                </p>
              </div>

              <div className="h-8 flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[10px] font-mono text-white/40 relative z-10">
                <span>Primary Disciplines</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  Dual Expertise
                </span>
              </div>
            </motion.div>

            {/* Card 3: Development Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.3)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="h-[215px] sm:h-[220px] rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.035] via-white/[0.015] to-transparent p-6 flex flex-col justify-between shadow-xl hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className="font-mono text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase">
                  Development Tools
                </span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 text-[9px] font-mono font-medium">
                  <Terminal size={10} className="text-emerald-400" />
                  <span>Frontend Stack</span>
                </div>
              </div>

              <div className="my-auto py-1 relative z-10">
                <span className="block font-sans text-4xl sm:text-5xl font-light tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  4+
                </span>
                <p className="font-sans text-xs text-white/50 tracking-wide mt-1.5 truncate">
                  React · Next.js · Tailwind · Git
                </p>
              </div>

              <div className="h-8 flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[10px] font-mono text-white/40 relative z-10">
                <span>Toolkit</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  Production Ready
                </span>
              </div>
            </motion.div>

            {/* Card 4: Engineering Focus */}
            <motion.div
              id="who-s-me-card-security-design"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, borderColor: "rgba(16,185,129,0.3)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="h-[215px] sm:h-[220px] rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.035] via-white/[0.015] to-transparent p-6 flex flex-col justify-between shadow-xl hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className="font-mono text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase">
                  Engineering Focus
                </span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 text-[9px] font-mono font-medium">
                  <Award size={10} className="text-emerald-400" />
                  <span>Architecture Quality</span>
                </div>
              </div>

              <div className="my-auto py-1 relative z-10">
                <span className="block font-sans text-4xl sm:text-5xl font-light tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  A+
                </span>
                <p className="font-sans text-xs text-white/50 tracking-wide mt-1.5 truncate">
                  Software &amp; Web Development
                </p>
              </div>

              <div className="h-8 flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[10px] font-mono text-white/40 relative z-10">
                <span className="flex items-center gap-1 text-white/60">
                  <Sparkles size={11} className="text-emerald-400" />
                  <span>Full-Stack Standards</span>
                </span>
                <span className="text-emerald-400/90 font-semibold">ROOZZERO™</span>
              </div>
            </motion.div>

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
                Academy
              </span>
            </div>
          </div>

          {/* Title & Subtitle Column (Right) */}
          <div className="lg:col-span-9 space-y-4">
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Latest Classes
            </h2>
            <p className="font-sans text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
              Explore our dynamic curriculum, interactive resources, and live lecture schedules.
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
              .map((cls) => {
                const syllabusItems = getCourseSyllabus(cls);
                const tagsList = Array.isArray(cls.tags) ? cls.tags : [];
                const isOpen = !!openSyllabus[cls.id];

                return (
                  <div
                    key={cls.id}
                    className="flex flex-col bg-zinc-950/40 border border-white/[0.04] rounded-3xl p-5 lg:p-6 hover:border-white/[0.08] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group h-full justify-between"
                  >
                    <div>
                      {/* Premium Course Header Info */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                          <span className="text-[10px] tracking-widest text-[#10b981] uppercase font-bold">
                            {cls.id === "techzo" ? "LIVE Masterclass" : cls.id === "lumin" ? "Featured Class" : "Special Class"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">Price:</span>
                          <span className="text-sm font-black text-white px-2.5 py-0.5 bg-white/[0.05] border border-white/10 rounded-full flex items-center gap-1">
                            <span className="text-[#10b981] font-bold text-xs">$</span>
                            {cls.price ? cls.price.replace("$", "") : "199"}
                          </span>
                        </div>
                      </div>

                      {/* Course visual banner area matching course title */}
                      <div className="relative aspect-[16/10] w-full rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl mb-5 shrink-0 bg-zinc-950 flex items-center justify-center group/custom">
                        <img
                          src={cls.courseImage}
                          className="absolute inset-0 h-full w-full object-cover group-hover/custom:scale-105 transition-transform duration-700 ease-out"
                          alt={cls.courseName}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/15" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_65%)] pointer-events-none" />
                        
                        {/* Top Tag & Stats Overlay */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                          <span className="px-2.5 py-0.5 bg-black/70 backdrop-blur-md border border-white/10 text-white/90 rounded-full font-mono text-[9px] tracking-wide font-black uppercase">
                            {cls.sessions || 16} Sessions
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-500/90 text-black font-extrabold rounded-md text-[8px] tracking-widest uppercase shadow-md shadow-emerald-500/30">
                            {cls.id === "lumin" ? "Featured" : cls.id === "apex" ? "Architecture" : "Security"}
                          </span>
                        </div>

                        {/* Instructor name overlay */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                            <User size={10} className="text-emerald-400" />
                          </div>
                          <span className="text-[9px] text-white/90 font-mono font-bold tracking-wide uppercase">Instructor: {cls.instructor || "Roozbeh"}</span>
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

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key={`syllabus-content-${cls.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden bg-black/40 border-t border-white/[0.04]"
                          >
                            <div className="p-4 space-y-3.5 text-left text-xs text-white/60 max-h-[460px] overflow-y-auto pr-1">
                              {syllabusItems.map((syl: any, sIdx: number) => (
                                <div key={syl.id || sIdx} className={`flex items-start gap-3 ${sIdx > 0 ? "border-t border-white/[0.02] pt-3" : ""}`}>
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 mt-0.5 shrink-0">
                                    {sIdx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="font-bold text-white text-[12px] leading-snug">{syl.title}</p>
                                      {syl.duration && (
                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 text-white/40 shrink-0">
                                          {syl.duration}
                                        </span>
                                      )}
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
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
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

      {/* PREMIUM CENTRAL LOGIN MODAL OVERLAY */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(role) => {
          setIsLoggedIn(true);
          setUserRole(role);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", role);
          // Redirect is handled gracefully with loading simulation
          setTimeout(() => {
            setIsLoginModalOpen(false);
            if (role === "admin") {
              window.location.hash = "#admin";
            } else {
              window.location.hash = "#dashboard";
            }
          }, 1500);
        }}
      />
    </div>
  );
}

