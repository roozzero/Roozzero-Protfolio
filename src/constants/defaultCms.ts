import { CMSFullConfig, CMSClass } from "../types/cms";

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


export const DEFAULT_CMS_CONFIG: CMSFullConfig = {
  hero: {
    badge: "I'M",
    headline: "ROOZZERO",
    animatedTexts: [
      "Full Stack Engineering",
      "React & Vite Optimization",
      "Cloud Computing & Deployments",
      "Elegant Design Systems"
    ],
    heroImage: "/src/assets/images/ChatGPT Image Jun 28, 2026, 10_07_30 PM.png",
    subtitle: "Full Stack & Web Security Architect",
    presetIndex: 0
  },
  aboutMe: {
    badge: "About Me",
    title: "Who's Me",
    bio: "Hi, I'm Roozbeh Tavakoli | a Computer Engineer and Frontend Developer focused on building modern, scalable, and user-centered web experiences.",
    cvUrl: "#",
    githubUrl: "https://github.com/roozzero",
    portraitImage: "/src/assets/images/photo_2024-10-20_19-21-55.jpg",
    cards: [
      {
        id: "exp",
        tag: "EXPERIENCE",
        badgeText: "7+ Years Exp",
        badgeIcon: "Clock",
        statNumber: "7+",
        statSubtitle: "React · Next.js · TypeScript",
        footerLabel: "Core Technologies",
        footerValue: "Production Active"
      },
      {
        id: "fields",
        tag: "Main Fields",
        badgeText: "Dev & Security",
        badgeIcon: "ShieldCheck",
        statNumber: "2",
        statSubtitle: "Development · Cybersecurity",
        footerLabel: "Primary Disciplines",
        footerValue: "Dual Expertise"
      },
      {
        id: "tools",
        tag: "Development Tools",
        badgeText: "Frontend Stack",
        badgeIcon: "Terminal",
        statNumber: "4+",
        statSubtitle: "React · Next.js · Tailwind · Git",
        footerLabel: "Toolkit",
        footerValue: "Production Ready"
      },
      {
        id: "focus",
        tag: "Engineering Focus",
        badgeText: "Architecture Quality",
        badgeIcon: "Award",
        statNumber: "A+",
        statSubtitle: "Software & Web Development",
        footerLabel: "Full-Stack Standards",
        footerValue: "ROOZZERO™"
      }
    ]
  },
  skills: {
    badge: "MY SKILLS & STACK",
    title: "Skills & Engineering Stack",
    description: "Technologies, tools, and security skills I use to design, develop, and secure modern digital experiences.",
    skills: [
      {
        id: "react",
        name: "React.js",
        category: "frontend",
        percentage: 96,
        levelBadge: "Core Expertise · Production Lead",
        description: "Advanced state management, hooks architecture, Concurrent mode, Server Components, and zero-runtime performance tuning.",
        icon: "Code2"
      },
      {
        id: "nextjs",
        name: "Next.js",
        category: "frontend",
        percentage: 94,
        levelBadge: "Full-Stack Framework",
        description: "App Router, Server Actions, Incremental Static Regeneration (ISR), dynamic routing, and edge middleware optimization.",
        icon: "Layers"
      },
      {
        id: "nodejs",
        name: "Node.js",
        category: "backend",
        percentage: 92,
        levelBadge: "Backend Runtime",
        description: "REST & GraphQL APIs, microservices, asynchronous stream processing, and cluster scaling.",
        icon: "Server"
      },
      {
        id: "typescript",
        name: "TypeScript",
        category: "frontend",
        percentage: 95,
        levelBadge: "Strict Typing & Safety",
        description: "Complex generic types, conditional inference, union discriminations, and scalable enterprise architecture.",
        icon: "Workflow"
      },
      {
        id: "tailwind",
        name: "Tailwind CSS",
        category: "frontend",
        percentage: 98,
        levelBadge: "Design Systems & UI",
        description: "Fluid typography, modern container queries, dark theme architecture, and bespoke animation primitives.",
        icon: "Zap"
      },
      {
        id: "javascript",
        name: "JavaScript (ES6+)",
        category: "frontend",
        percentage: 96,
        levelBadge: "Modern ECMAScript",
        description: "Prototypes, event loops, async iterators, memory profiling, and modern JavaScript standards.",
        icon: "Cpu"
      },
      {
        id: "owasp",
        name: "OWASP Top 10",
        category: "security",
        percentage: 90,
        levelBadge: "Web Application Security",
        description: "Injection mitigations, CSRF/XSS shields, broken access control discovery, and threat modeling.",
        icon: "ShieldCheck"
      },
      {
        id: "threat-hunting",
        name: "Threat Hunting",
        category: "security",
        percentage: 88,
        levelBadge: "Reconnaissance & Analysis",
        description: "Offensive security testing, endpoint monitoring, attack vector analysis, and proactive vulnerability discovery.",
        icon: "Radar"
      }
    ]
  },
  projects: {
    badge: "FEATURED WORKS & LABS",
    title: "Main Works & Systems",
    description: "Selected projects and systems showcasing my experience in frontend development, modern web technologies, and security-focused engineering.",
    projects: [
      {
        id: "cinema",
        tabLabel: "TeacherShow",
        title: "TeacherShow — School Management & Smart Campus",
        badge: "School Operations & PA",
        description: "An advanced campus management portal featuring real-time attendance, schedule planning, automated bell audio broadcasting, and student performance tracking.",
        coverImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop",
        tags: ["React 19", "Tailwind CSS", "Web Audio API", "Smart School"],
        liveDemoUrl: "#",
        githubUrl: "https://github.com/roozzero",
        isPreviewDisabled: true,
        previewDisabledNotice: "Project preview is temporarily disabled"
      },
      {
        id: "security",
        tabLabel: "Aegis Sentinel",
        title: "Aegis Sentinel — Cloud Security & Threat Shield",
        badge: "Offensive Security",
        description: "Enterprise endpoint threat detection platform with real-time network attack telemetry, packet analysis, and automated CVE remediation pipelines.",
        coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
        tags: ["Threat Hunting", "Packet Analysis", "OWASP", "Next.js"],
        liveDemoUrl: "#",
        githubUrl: "https://github.com/roozzero",
        isPreviewDisabled: false
      },
      {
        id: "cloud",
        tabLabel: "Nexus Engine",
        title: "Nexus Engine — High-Performance Edge Computing",
        badge: "Distributed Systems",
        description: "High-throughput edge orchestration layer built with WebAssembly micro-kernels and decentralized data replication across global clusters.",
        coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
        tags: ["Wasm", "Edge Clusters", "TypeScript", "Node.js"],
        liveDemoUrl: "#",
        githubUrl: "https://github.com/roozzero",
        isPreviewDisabled: false
      }
    ]
  },
  classes: DEFAULT_HOMEPAGE_CLASSES,
  classesHeader: {
    badge: "Academy",
    title: "Latest Classes",
    description: "Explore our dynamic curriculum, interactive resources, and live lecture schedules."
  },
  testimonials: {
    badge: "COMMUNITY & IMPACT",
    title: "My Students & Success Stories",
    description: "Real feedback and outcomes from developers, engineers, and researchers who upgraded their skills in our academy.",
    stats: [
      { id: "s1", value: "100+", label: "Happy students & mentees" },
      { id: "s2", value: "98%", label: "Course completion rate" },
      { id: "s3", value: "4.9/5", label: "Average student satisfaction" }
    ],
    testimonials: [
      {
        id: "will",
        name: "Arman Ahmadi",
        role: "Frontend Developer",
        company: "Rayan Web Studio",
        course: "Modern React & Frontend Development",
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
        rating: 5.0,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=160&auto=format&fit=crop",
        avatarBg: "from-emerald-700 to-teal-900",
        text: "Combining TypeScript, React, and practical development gave me a much clearer understanding of how to build reliable and scalable web applications.",
        highlight: "Moved from beginner to professional projects",
        roiStat: "8+ Projects",
        location: "Tehran, Iran"
      }
    ]
  },
  contact: {
    badge: "GET IN TOUCH",
    title: "Let's Build Something Exceptional",
    description: "Have a project in mind or interested in collaboration? Send your message and let's bring your ideas to life.",
    email: "contact@roozzero.dev",
    phone: "+98 912 345 6789",
    location: "Tehran, Iran",
    telegramUrl: "https://t.me/roozzero",
    instagramUrl: "https://instagram.com/roozzero",
    githubUrl: "https://github.com/roozzero",
    linkedinUrl: "https://linkedin.com/in/roozzero"
  },
  footer: {
    animatedWords: ["BUILD", "CREATE", "ARCHITECT"],
    brandName: "ROOZZERO",
    tagline: "Creating high-performance digital experiences with modern web technologies, clean architecture, and practical engineering.",
    copyright: "ROOZZERO. All rights reserved."
  }
};

export const CMS_CONFIG_STORAGE_KEY = "cms_current_config";

export function loadCmsConfig(): CMSFullConfig {
  const saved = localStorage.getItem(CMS_CONFIG_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge with default values so any newly added sections/fields are preserved
      return {
        ...DEFAULT_CMS_CONFIG,
        ...parsed,
        hero: { ...DEFAULT_CMS_CONFIG.hero, ...(parsed.hero || {}) },
        aboutMe: {
          ...DEFAULT_CMS_CONFIG.aboutMe,
          ...(parsed.aboutMe || {}),
          cards: Array.isArray(parsed.aboutMe?.cards) && parsed.aboutMe.cards.length > 0
            ? parsed.aboutMe.cards
            : DEFAULT_CMS_CONFIG.aboutMe.cards
        },
        skills: {
          ...DEFAULT_CMS_CONFIG.skills,
          ...(parsed.skills || {}),
          skills: Array.isArray(parsed.skills?.skills) && parsed.skills.skills.length > 0
            ? parsed.skills.skills
            : DEFAULT_CMS_CONFIG.skills.skills
        },
        projects: {
          ...DEFAULT_CMS_CONFIG.projects,
          ...(parsed.projects || {}),
          projects: Array.isArray(parsed.projects?.projects) && parsed.projects.projects.length > 0
            ? parsed.projects.projects
            : DEFAULT_CMS_CONFIG.projects.projects
        },
        classes: Array.isArray(parsed.classes) && parsed.classes.length > 0
          ? parsed.classes.filter((c: any) => c.id !== "techzo")
          : DEFAULT_CMS_CONFIG.classes,
        classesHeader: {
          ...DEFAULT_CMS_CONFIG.classesHeader,
          ...(parsed.classesHeader || {})
        },
        testimonials: {
          ...DEFAULT_CMS_CONFIG.testimonials,
          ...(parsed.testimonials || {}),
          stats: Array.isArray(parsed.testimonials?.stats) && parsed.testimonials.stats.length > 0
            ? parsed.testimonials.stats
            : DEFAULT_CMS_CONFIG.testimonials.stats,
          testimonials: Array.isArray(parsed.testimonials?.testimonials) && parsed.testimonials.testimonials.length > 0
            ? parsed.testimonials.testimonials
            : DEFAULT_CMS_CONFIG.testimonials.testimonials
        },
        contact: { ...DEFAULT_CMS_CONFIG.contact, ...(parsed.contact || {}) },
        footer: {
          ...DEFAULT_CMS_CONFIG.footer,
          ...(parsed.footer || {}),
          animatedWords: Array.isArray(parsed.footer?.animatedWords) && parsed.footer.animatedWords.length > 0
            ? parsed.footer.animatedWords
            : DEFAULT_CMS_CONFIG.footer.animatedWords
        }
      };
    } catch (e) {
      console.error("Failed to parse CMS config", e);
    }
  }
  return DEFAULT_CMS_CONFIG;
}

export function saveCmsConfig(config: CMSFullConfig) {
  localStorage.setItem(CMS_CONFIG_STORAGE_KEY, JSON.stringify(config));
  // Dispatch custom browser event to update any active listener in real time
  window.dispatchEvent(new CustomEvent("cms_config_updated", { detail: config }));
}
