import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash, Edit, Save, BookOpen, User, DollarSign, Calendar, ChevronDown, ChevronUp,
  AlertTriangle, Move, Sparkles, Check, CheckCircle2, RotateCcw, Image as ImageIcon,
  Clock, BookOpenCheck, Sliders, Play, Trash2, ArrowUp, ArrowDown, ExternalLink
} from "lucide-react";
import { CMSFullConfig, CMSClass } from "../../types/cms";

// Initial default classes matching the public Home Page courses
export const DEFAULT_HOMEPAGE_CLASSES: CMSClass[] = [
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
    tags: ["Next.js", "React", "Web"] as any,
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
  } as any,
  {
    id: "apex",
    courseImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    courseName: "Frontend Development with TypeScript",
    instructor: "Roozbeh",
    price: "$179",
    shortDescription: "Learn how TypeScript improves code quality, maintainability, and scalability in modern frontend applications.",
    description: "Learn how TypeScript improves code quality, maintainability, and scalability in modern frontend applications.",
    sessions: 16,
    status: "Published",
    displayOrder: 3,
    tags: ["TypeScript", "React", "JavaScript"] as any,
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
  } as any,
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
    displayOrder: 4,
    tags: ["Cybersecurity", "OWASP", "Bug Bounty"] as any,
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
  } as any,
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
    displayOrder: 5,
    tags: ["Ethical Hacking", "Hunting", "Security"] as any,
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
  } as any
];

// Beautiful Unsplash developer images for easy banner selection
const SUGGESTED_BANNER_IMAGES = [
  { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop", name: "Cyber Matrix Security" },
  { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop", name: "Microchip Board Grid" },
  { url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop", name: "Modern React Development" },
  { url: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?q=80&w=800&auto=format&fit=crop", name: "Lines of Code Workspace" },
  { url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop", name: "UX Design Canvas Wireframe" },
  { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop", name: "Sublime Code IDE Editor" }
];

interface HomepageManagementTabProps {
  showCustomToast: (msg: string, type?: "info" | "success" | "warning") => void;
}

export default function HomepageManagementTab({ showCustomToast }: HomepageManagementTabProps) {
  // Load configuration or fall back
  const [currentConfig, setCurrentConfig] = useState<CMSFullConfig>(() => {
    const saved = localStorage.getItem("cms_current_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.classes)) {
          const nonTechzo = parsed.classes.filter((c: any) => c.id !== "techzo");
          const updatedClasses = nonTechzo.map((c: any) => {
            const def = DEFAULT_HOMEPAGE_CLASSES.find((d) => d.id === c.id);
            if (def && (!c.syllabus || c.syllabus.length < 10 || !c.courseImage || c.courseImage.includes("photo-1550751827-4bd374c3f58b"))) {
              return { ...c, syllabus: def.syllabus, sessions: def.sessions, courseName: def.courseName, courseImage: def.courseImage };
            }
            return c;
          });
          const existingIds = new Set(updatedClasses.map((c: any) => c.id));
          const missingDefaults = DEFAULT_HOMEPAGE_CLASSES.filter((c) => !existingIds.has(c.id));
          const merged = [...updatedClasses, ...missingDefaults];
          const newConfig = { ...parsed, classes: merged };
          localStorage.setItem("cms_current_config", JSON.stringify(newConfig));
          return newConfig;
        }
      } catch (e) {
        console.error("Failed to parse config from storage", e);
      }
    }
    // Setup initial config containing default classes
    const initialConfig: any = {
      classes: DEFAULT_HOMEPAGE_CLASSES,
      general: { websiteTitle: "RoozZero Academy" }
    };
    localStorage.setItem("cms_current_config", JSON.stringify(initialConfig));
    return initialConfig;
  });

  const [draftClasses, setDraftClasses] = useState<CMSClass[]>(() => {
    return currentConfig.classes || [];
  });

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  
  // Delete confirmation modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Gallery picker states
  const [activePickerIdx, setActivePickerIdx] = useState<number | null>(null);

  // Check if draft has changed compared to current config
  const hasChanges = JSON.stringify(draftClasses) !== JSON.stringify(currentConfig.classes);

  const handleSaveDraft = () => {
    const updatedConfig = { ...currentConfig, classes: draftClasses };
    setCurrentConfig(updatedConfig);
    localStorage.setItem("cms_current_config", JSON.stringify(updatedConfig));
    showCustomToast("Classes layout saved as Draft!", "info");
  };

  const handlePublish = () => {
    const updatedConfig = { ...currentConfig, classes: draftClasses };
    setCurrentConfig(updatedConfig);
    localStorage.setItem("cms_current_config", JSON.stringify(updatedConfig));
    showCustomToast("Changes published successfully! Home Page is updated.", "success");
  };

  const handleResetDraft = () => {
    setDraftClasses(currentConfig.classes || []);
    showCustomToast("Draft restored to last published state.", "info");
  };

  // Drag and Drop ordering handlers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...draftClasses];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    // Update display orders based on index
    const updatedList = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setDraftClasses(updatedList);
    setDraggedIndex(null);
    showCustomToast("Rearranged course layout order.", "success");
  };

  const moveOrder = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === draftClasses.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const list = [...draftClasses];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    const updatedList = list.map((item, index) => ({
      ...item,
      displayOrder: index + 1
    }));

    setDraftClasses(updatedList);
  };

  // Add new course
  const handleAddNewCourse = () => {
    const nextOrder = draftClasses.length + 1;
    const newId = `cl-${Date.now()}`;
    const newCourse: CMSClass = {
      id: newId,
      courseImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
      courseName: "New High-Fidelity Masterclass",
      instructor: "Roozbeh",
      price: "$199",
      description: "A fresh course focusing on modular design architecture and deployment patterns.",
      sessions: 8,
      status: "Draft",
      displayOrder: nextOrder,
      tags: ["React", "TypeScript", "Vite"] as any,
      syllabus: [
        { id: `s1-${Date.now()}`, title: "Module 1: Layout Fundamentals", description: "Structuring pixel-perfect CSS grids and flex containers.", duration: "45 mins" }
      ] as any
    };

    setDraftClasses((prev) => [...prev, newCourse]);
    setExpandedCourseId(newId);
    showCustomToast("New course card template added. Start customizing!", "success");
  };

  const confirmDeleteCourse = () => {
    if (!deleteTargetId) return;
    setDraftClasses((prev) => prev.filter((item) => item.id !== deleteTargetId));
    setDeleteTargetId(null);
    showCustomToast("Course deleted successfully.", "warning");
  };

  // Field change handler helper
  const handleFieldChange = (courseId: string, field: keyof CMSClass, value: any) => {
    setDraftClasses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, [field]: value } : c))
    );
  };

  // Syllabus items management
  const handleAddSyllabusItem = (courseId: string) => {
    setDraftClasses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const currentSyllabus = (c as any).syllabus || [];
          const nextIndex = currentSyllabus.length + 1;
          const newItem = {
            id: `s-${Date.now()}`,
            title: `Module ${nextIndex}: Topic Title`,
            description: "Provide short bullet items or learning details.",
            duration: "45 mins"
          };
          return { ...c, syllabus: [...currentSyllabus, newItem] };
        }
        return c;
      })
    );
    showCustomToast("Added new syllabus module.", "info");
  };

  const handleEditSyllabusItem = (courseId: string, itemIndex: number, field: string, value: any) => {
    setDraftClasses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const syllabusCopy = [...((c as any).syllabus || [])];
          if (syllabusCopy[itemIndex]) {
            syllabusCopy[itemIndex] = { ...syllabusCopy[itemIndex], [field]: value };
          }
          return { ...c, syllabus: syllabusCopy };
        }
        return c;
      })
    );
  };

  const handleDeleteSyllabusItem = (courseId: string, itemIndex: number) => {
    setDraftClasses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const syllabusCopy = [...((c as any).syllabus || [])];
          syllabusCopy.splice(itemIndex, 1);
          return { ...c, syllabus: syllabusCopy };
        }
        return c;
      })
    );
    showCustomToast("Syllabus module removed.", "warning");
  };

  return (
    <div id="homepage-classes-panel" className="flex flex-col h-full bg-[#050508] p-6 space-y-6 overflow-y-auto select-none">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookOpen size={18} />
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">Classes Management</h1>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Configure courses appearing in the public Home Page Classes list. Change values, toggle statuses, and rearrange positions.
          </p>
        </div>

        {/* Action button states */}
        <div className="flex items-center gap-2.5">
          {hasChanges && (
            <button
              onClick={handleResetDraft}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-white/70 hover:text-white flex items-center gap-1.5 transition-all bg-white/[0.01]"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}

          <button
            onClick={handleSaveDraft}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              hasChanges
                ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20"
                : "border-white/5 text-white/40 cursor-not-allowed bg-transparent"
            }`}
            disabled={!hasChanges}
          >
            <Save size={13} />
            Save Draft
          </button>

          <button
            onClick={handlePublish}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_4px_12px_rgba(99,102,241,0.15)] ${
              hasChanges
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-indigo-600/50 text-white/50 cursor-not-allowed"
            }`}
          >
            <Sparkles size={13} />
            Publish Changes
          </button>
        </div>
      </div>

      {/* Top statistics banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
            <BookOpen size={16} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Total Courses</p>
            <p className="text-lg font-black text-white mt-0.5">{draftClasses.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Published</p>
            <p className="text-lg font-black text-white mt-0.5">
              {draftClasses.filter((c) => c.status === "Published").length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Draft / Hidden</p>
            <p className="text-lg font-black text-white mt-0.5">
              {draftClasses.filter((c) => c.status !== "Published").length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Drag-and-Drop Course Cards container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-1.5">
            <Sliders size={11} className="text-indigo-400" />
            Drag or use arrows to change website layout order
          </span>
          <button
            onClick={handleAddNewCourse}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
          >
            <Plus size={13} />
            Add Course Card
          </button>
        </div>

        <div className="space-y-3.5">
          {draftClasses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/5 space-y-3">
              <BookOpen size={24} className="text-white/20 mx-auto" />
              <p className="text-xs text-white/40">No course cards configured. Click "Add Course Card" above to build your first layout card!</p>
            </div>
          ) : (
            draftClasses.map((cls, idx) => {
              const isExpanded = expandedCourseId === cls.id;
              const isPublished = cls.status === "Published";
              const syllabusItems = (cls as any).syllabus || [];
              const tagsList = Array.isArray(cls.tags) ? cls.tags : [];

              return (
                <div
                  key={cls.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? "bg-zinc-950/80 border-indigo-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.4)]"
                      : "bg-[#0b0b10]/95 border-white/[0.03] hover:border-white/[0.07]"
                  }`}
                >
                  
                  {/* Card Header Row */}
                  <div className="p-4 flex items-center justify-between gap-4 select-none">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/45 p-1 transition-colors">
                        <Move size={14} />
                      </div>

                      {/* Quick Thumbnail Preview */}
                      <div className="relative h-10 w-10 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden shrink-0">
                        <img src={cls.courseImage} className="h-full w-full object-cover" alt="" />
                      </div>

                      {/* Course Basics */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white tracking-tight truncate">{cls.courseName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isPublished
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                          }`}>
                            {cls.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-white/40 font-semibold">
                          <span className="flex items-center gap-1"><User size={10} className="text-indigo-400/70" /> {cls.instructor || "Roozbeh"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><DollarSign size={10} className="text-emerald-400/70" /> {cls.price}</span>
                          <span>•</span>
                          <span>{cls.sessions} Sessions</span>
                          <span>•</span>
                          <span>{syllabusItems.length} syllabus modules</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Row Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      
                      {/* Move controls for accessibility */}
                      <div className="flex items-center gap-0.5 mr-2">
                        <button
                          onClick={() => moveOrder(idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 text-white/20 hover:text-white/60 disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => moveOrder(idx, "down")}
                          disabled={idx === draftClasses.length - 1}
                          className="p-1.5 text-white/20 hover:text-white/60 disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => setExpandedCourseId(isExpanded ? null : cls.id)}
                        className="p-2 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] text-white/60 hover:text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        <span className="text-[10px] font-bold px-1">{isExpanded ? "Collapse" : "Edit Card"}</span>
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(cls.id)}
                        className="p-2 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/25 text-rose-400 rounded-xl transition-all cursor-pointer"
                        title="Delete Course Card"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Form Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-white/[0.04] bg-black/35"
                      >
                        <div className="p-5 space-y-5">
                          
                          {/* Part A: Basic Configuration Row */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            
                            {/* Course Title */}
                            <div className="md:col-span-2 flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Course Name</label>
                              <input
                                type="text"
                                value={cls.courseName}
                                onChange={(e) => handleFieldChange(cls.id, "courseName", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="Enter course name..."
                              />
                            </div>

                            {/* Instructor Name */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Instructor</label>
                              <input
                                type="text"
                                value={cls.instructor || "Roozbeh"}
                                onChange={(e) => handleFieldChange(cls.id, "instructor", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="Instructor name..."
                              />
                            </div>

                            {/* Course Status */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Status</label>
                              <select
                                value={cls.status}
                                onChange={(e) => handleFieldChange(cls.id, "status", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-indigo-400 font-bold focus:outline-none transition-all cursor-pointer"
                              >
                                <option value="Published">Published (Active on page)</option>
                                <option value="Draft">Draft (Invisible on page)</option>
                                <option value="Hidden">Hidden (Hidden)</option>
                              </select>
                            </div>
                          </div>

                          {/* Part B: Layout metadata row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Price */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Price (USD)</label>
                              <input
                                type="text"
                                value={cls.price}
                                onChange={(e) => handleFieldChange(cls.id, "price", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="e.g. $199"
                              />
                            </div>

                            {/* Total sessions */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Number of Sessions</label>
                              <input
                                type="number"
                                value={cls.sessions}
                                onChange={(e) => handleFieldChange(cls.id, "sessions", parseInt(e.target.value) || 0)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="e.g. 12"
                              />
                            </div>

                            {/* Tags list (comma separated) */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Badges/Tags (Comma separated)</label>
                              <input
                                type="text"
                                value={tagsList.join(", ")}
                                onChange={(e) => {
                                  const list = e.target.value.split(",").map(item => item.trim()).filter(Boolean);
                                  handleFieldChange(cls.id, "tags", list);
                                }}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="e.g. HTML5, React, Vite"
                              />
                            </div>
                          </div>

                          {/* Part C: Banner & Description */}
                          <div className="space-y-4">
                            
                            {/* Image Selection Block */}
                            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Course Banner Image Source</span>
                                <span className="text-[10px] text-white/30 font-mono">16:10 Aspect recommended</span>
                              </div>
                              
                              <div className="flex flex-col md:flex-row items-stretch gap-4">
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={cls.courseImage}
                                    onChange={(e) => handleFieldChange(cls.id, "courseImage", e.target.value)}
                                    className="w-full bg-zinc-950 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none transition-all"
                                    placeholder="Enter image URL..."
                                  />
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setActivePickerIdx(activePickerIdx === idx ? null : idx)}
                                      className="px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <ImageIcon size={11} /> Select from Suggestions
                                    </button>
                                  </div>
                                </div>
                                <div className="w-24 shrink-0 rounded-xl border border-white/10 overflow-hidden relative bg-zinc-900 flex items-center justify-center">
                                  <img src={cls.courseImage} className="w-full h-full object-cover" alt="" />
                                </div>
                              </div>

                              {/* Nested Suggested Image List */}
                              <AnimatePresence>
                                {activePickerIdx === idx && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden border-t border-white/5 pt-3 mt-2"
                                  >
                                    <p className="text-[9px] text-white/40 font-bold uppercase mb-2">Beautiful developer mockups (Click to choose):</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                      {SUGGESTED_BANNER_IMAGES.map((img) => (
                                        <button
                                          key={img.url}
                                          type="button"
                                          onClick={() => {
                                            handleFieldChange(cls.id, "courseImage", img.url);
                                            setActivePickerIdx(null);
                                            showCustomToast("Banner image updated.", "success");
                                          }}
                                          className="p-1 rounded-lg border border-white/5 hover:border-indigo-500/40 bg-zinc-950 overflow-hidden text-center transition-all group/picker cursor-pointer"
                                        >
                                          <div className="aspect-[16/10] rounded overflow-hidden relative mb-1">
                                            <img src={img.url} className="h-full w-full object-cover group-hover/picker:scale-110 transition-transform duration-300" alt="" />
                                          </div>
                                          <span className="text-[8px] text-white/40 font-semibold group-hover/picker:text-white block truncate">{img.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Short description */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Short Course Description (Appears on Card)</label>
                              <textarea
                                rows={2}
                                value={cls.description}
                                onChange={(e) => handleFieldChange(cls.id, "description", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all resize-none"
                                placeholder="Describe course outcomes cleanly..."
                              />
                            </div>
                          </div>

                          {/* Part D: Expandable Syllabus Modules List */}
                          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <BookOpenCheck size={14} className="text-indigo-400" />
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/80">Course Syllabus Chapters</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddSyllabusItem(cls.id)}
                                className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={11} /> Add Syllabus Module
                              </button>
                            </div>

                            <div className="space-y-3">
                              {syllabusItems.length === 0 ? (
                                <p className="text-[10px] text-white/30 text-center py-3 font-semibold">No syllabus modules defined yet. Add some topics!</p>
                              ) : (
                                syllabusItems.map((syl: any, sIdx: number) => (
                                  <div key={syl.id || sIdx} className="p-3.5 rounded-lg bg-zinc-950/70 border border-white/[0.03] flex items-start gap-3.5">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 mt-0.5 shrink-0">
                                      {sIdx + 1}
                                    </span>
                                    
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                                      {/* Chapter Title */}
                                      <div className="sm:col-span-8 flex flex-col gap-1">
                                        <span className="text-[8px] font-bold uppercase text-white/30 tracking-widest">Chapter Title</span>
                                        <input
                                          type="text"
                                          value={syl.title}
                                          onChange={(e) => handleEditSyllabusItem(cls.id, sIdx, "title", e.target.value)}
                                          className="bg-transparent border-b border-white/10 hover:border-white/20 focus:border-indigo-500 text-xs font-bold text-white focus:outline-none pb-0.5"
                                          placeholder="e.g. Advanced Routing..."
                                        />
                                      </div>

                                      {/* Duration */}
                                      <div className="sm:col-span-4 flex flex-col gap-1">
                                        <span className="text-[8px] font-bold uppercase text-white/30 tracking-widest">Duration Label</span>
                                        <input
                                          type="text"
                                          value={syl.duration}
                                          onChange={(e) => handleEditSyllabusItem(cls.id, sIdx, "duration", e.target.value)}
                                          className="bg-transparent border-b border-white/10 hover:border-white/20 focus:border-indigo-500 text-xs text-white/80 font-mono focus:outline-none pb-0.5"
                                          placeholder="e.g. 45 mins"
                                        />
                                      </div>

                                      {/* Chapter Description */}
                                      <div className="sm:col-span-12 flex flex-col gap-1 mt-1">
                                        <span className="text-[8px] font-bold uppercase text-white/30 tracking-widest">Chapter Content Details</span>
                                        <input
                                          type="text"
                                          value={syl.description}
                                          onChange={(e) => handleEditSyllabusItem(cls.id, sIdx, "description", e.target.value)}
                                          className="bg-transparent border-b border-white/10 hover:border-white/20 focus:border-indigo-500 text-[11px] text-white/50 focus:outline-none pb-0.5"
                                          placeholder="Brief overview of topics discussed..."
                                        />
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSyllabusItem(cls.id, sIdx)}
                                      className="p-1.5 text-white/20 hover:text-rose-400 mt-1 cursor-pointer transition-colors"
                                      title="Delete Syllabus Module"
                                    >
                                      <Trash size={12} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECURE DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b0f] border border-white/10 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl text-center space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Delete Course Card?</h4>
                <p className="text-xs text-white/55 mt-1.5 leading-relaxed">
                  Are you absolutely sure you want to remove this course card layout? This action cannot be undone and will delete all associated course metadata.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCourse}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Delete Course
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
