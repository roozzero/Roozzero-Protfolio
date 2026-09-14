import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Instagram, Github, Linkedin, Sparkles, ArrowRight, User, 
  Folder, CheckSquare, Inbox, Calendar as CalendarIcon, BarChart2, 
  Plus, Settings, Check, LogOut, ChevronDown, ChevronRight, 
  MessageSquare, PlusCircle, Search, ExternalLink, RefreshCw,
  Clock, HelpCircle, Bell, ArrowLeft, Briefcase, Award,
  LayoutDashboard, BookOpen, Menu, X, Upload, Trash2, Camera, ClipboardList, Book, Copy,
  FileText, FileArchive, FileCode, Download, AlertCircle, FileSpreadsheet, Paperclip, FileImage,
  Printer, Lock, AlertTriangle, Filter, ZoomIn, ZoomOut, RotateCcw, Phone, Mail, Shield, Eye, EyeOff, Palette,
  Moon, Sun, Monitor, Crop
} from "lucide-react";

interface UserDashboardProps {
  onLogout?: () => void;
  onGoHome?: () => void;
}

export interface AssignmentDetail {
  id: string;
  assignmentNum: number;
  title: string;
  course: string;
  description: string;
  publishDate: string;
  dueDate: string;
  status: "Not Submitted" | "Submitted" | "Under Review" | "Graded" | "Deadline Passed";
  grade: string | null;
  published: boolean;
  files?: { name: string; size: string; type: string }[];
  submittedFile?: { name: string; size: string; type: string };
  submittedGithubUrl?: string;
  submittedNotes?: string;
  feedback?: string;
  correctedFile?: { name: string; size: string };
}

export interface CourseResource {
  id: string;
  title: string;
  course: string;
  uploadDate: string;
  fileType: string;
  fileName: string;
  fileSize: string;
  published: boolean;
}

export const getInitialCourseResources = (): CourseResource[] => {
  const saved = localStorage.getItem("userResources");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const initial: CourseResource[] = [
    {
      id: "r1",
      title: "Production Bundle & Code-Splitting Guide",
      course: "Advanced React & Architecture",
      uploadDate: "June 10, 2026",
      fileType: "PDF",
      fileName: "react_code_splitting_production_guide.pdf",
      fileSize: "4.2 MB",
      published: true
    },
    {
      id: "r2",
      title: "Advanced Memory Profiling Workshop Boilerplates",
      course: "Advanced React & Architecture",
      uploadDate: "June 20, 2026",
      fileType: "ZIP",
      fileName: "memory_profiling_workshop_exercises.zip",
      fileSize: "15.8 MB",
      published: true
    },
    {
      id: "r3",
      title: "Syllabus Presentation Slide Decks",
      course: "Advanced React & Architecture",
      uploadDate: "June 01, 2026",
      fileType: "PPTX",
      fileName: "advanced_react_architecture_syllabus_slides.pptx",
      fileSize: "5.1 MB",
      published: true
    },
    {
      id: "r4",
      title: "Aesthetic Color Palettes & Contrast Design Guide",
      course: "Premium Dark Design Systems",
      uploadDate: "May 15, 2026",
      fileType: "Image",
      fileName: "contrast_ratio_reference_board.png",
      fileSize: "1.8 MB",
      published: true
    },
    {
      id: "r5",
      title: "Micro-interactions & Spring Physics Presets",
      course: "Premium Dark Design Systems",
      uploadDate: "May 25, 2026",
      fileType: "Source Code",
      fileName: "spring_physics_framer_motion_presets.ts",
      fileSize: "250 KB",
      published: true
    },
    {
      id: "r6",
      title: "Deep Learning Foundations Lectures",
      course: "Machine Learning Foundations",
      uploadDate: "June 28, 2026",
      fileType: "Video",
      fileName: "machine_learning_foundations_lecture_01.mp4",
      fileSize: "142.5 MB",
      published: false
    }
  ];

  localStorage.setItem("userResources", JSON.stringify(initial));
  return initial;
};

export const getInitialDetailedAssignments = (): AssignmentDetail[] => {
  const saved = localStorage.getItem("userAssignments");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].description !== undefined) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const initial: AssignmentDetail[] = [
    {
      id: "a1",
      assignmentNum: 1,
      title: "Custom Hooks & Memory Leak Audits",
      course: "Advanced React & Architecture",
      description: "Design custom React hooks that handle secure local state synchronization across windows. Complete an audit on the memory profiler inside Chrome DevTools, locate 3 simulated memory leaks, and patch them.",
      publishDate: "June 03, 2026",
      dueDate: "July 12, 2026, 11:59 PM",
      status: "Not Submitted",
      grade: null,
      published: true,
      files: [
        { name: "react_memory_leak_audit_guide.pdf", size: "2.4 MB", type: "PDF" },
        { name: "dashboard_boilerplate_workspace.zip", size: "12.8 MB", type: "ZIP" }
      ]
    },
    {
      id: "a2",
      assignmentNum: 2,
      title: "Concurrent Features Exploration",
      course: "Advanced React & Architecture",
      description: "Implement non-blocking UI rendering using React 18 transitions. Optimize high-volume search components with useTransition and useDeferredValue to ensure input feedback is instant.",
      publishDate: "June 17, 2026",
      dueDate: "August 01, 2026, 11:59 PM",
      status: "Not Submitted",
      grade: null,
      published: true,
      files: [
        { name: "concurrent_rendering_syllabus.pdf", size: "1.1 MB", type: "PDF" }
      ]
    },
    {
      id: "a3",
      assignmentNum: 1,
      title: "Micro-interactions & Physics Canvas",
      course: "Premium Dark Design Systems",
      description: "Create an interactive fluid simulation using HTML5 Canvas or SVG inside React, incorporating beautiful motion micro-interactions, responsive sizing, and spring-physics.",
      publishDate: "June 01, 2026",
      dueDate: "June 25, 2026, 11:59 PM",
      status: "Graded",
      grade: "A+",
      published: true,
      files: [
        { name: "microinteractions_curriculum_spec.pdf", size: "3.5 MB", type: "PDF" }
      ],
      submittedFile: { name: "galaxy_canvas_interaction_code.zip", size: "1.2 MB", type: "ZIP" },
      submittedGithubUrl: "https://github.com/courtney-henry/fluid-canvas-interactions",
      submittedNotes: "I used custom spring physics inside Framer Motion combined with canvas rendering. It achieves 60fps on mobile.",
      feedback: "Outstanding visual precision. The hover micro-interactions are highly responsive. Your code is modular, well-commented, and perfectly styled.",
      correctedFile: { name: "graded_annotated_solution.zip", size: "1.3 MB" }
    },
    {
      id: "a4",
      assignmentNum: 2,
      title: "Bento Grid Layouts & Glowing Shadows",
      course: "Premium Dark Design Systems",
      description: "Develop a bento-grid styled interactive dashboard panel. Style components using Tailwind CSS utility classes and custom color variables, maintaining exactly 0.0 CLS.",
      publishDate: "June 15, 2026",
      dueDate: "July 20, 2026, 11:59 PM",
      status: "Under Review",
      grade: null,
      published: true,
      submittedFile: { name: "bento_grid_interactive_dashboard.zip", size: "4.8 MB", type: "ZIP" },
      submittedGithubUrl: "https://github.com/courtney-henry/bento-dashboard",
      submittedNotes: "I focused on responsiveness and elegant drop shadows. It fits perfectly on mobile up to ultra-wide desktop monitors."
    },
    {
      id: "a5",
      assignmentNum: 1,
      title: "Linear Regression Foundations",
      course: "Machine Learning Foundations",
      description: "Formulate simple linear regression equations, derive cost functions, and construct optimization passes using batch gradient descent from scratch.",
      publishDate: "July 10, 2026",
      dueDate: "July 31, 2026, 11:59 PM",
      status: "Not Submitted",
      grade: null,
      published: false, // Course 3 has NO published assignments by default!
      files: [
        { name: "linear_regression_formulas.pdf", size: "850 KB", type: "PDF" }
      ]
    }
  ];

  localStorage.setItem("userAssignments", JSON.stringify(initial));
  return initial;
};

export interface DiscussionMessage {
  id: string;
  sender: "Student" | "Instructor" | "Academy Admin";
  senderName: string;
  avatarText: string;
  text: string;
  time: string;
  attachments?: { name: string; type: "Image" | "PDF"; url?: string }[];
}

export interface Conversation {
  id: string;
  courseId: string;
  title: string;
  recipient: "Academy Administrator" | "Course Instructor";
  status: "Replied" | "Under Review" | "Closed";
  lastActivity: string;
  messages: DiscussionMessage[];
}

export const getInitialConversations = (): Conversation[] => {
  const saved = localStorage.getItem("userCourseConversations");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const initial: Conversation[] = [
    {
      id: "c1",
      courseId: "1",
      title: "Question about Server-Side Rendering in React 19",
      recipient: "Course Instructor",
      status: "Replied",
      lastActivity: "June 29, 2026, 11:45 AM",
      messages: [
        {
          id: "m1",
          sender: "Student",
          senderName: "Courtney Henry",
          avatarText: "CH",
          text: "Hi Dr. Sarah, I'm working on the Server Components section. Should we prefer using server actions for all mutations, or are standard API routes still recommended for decoupled custom architectures?",
          time: "June 29, 2026, 10:15 AM"
        },
        {
          id: "m2",
          sender: "Instructor",
          senderName: "Dr. Sarah Vance",
          avatarText: "SV",
          text: "Hello Courtney! Server Actions are great for form submissions and simple mutations within the same origin. However, for a fully decoupled application, custom APIs, or third-party webhooks, standard API routes remain highly robust. I've attached a reference diagram on SSR mutation patterns for your study.",
          time: "June 29, 2026, 11:45 AM",
          attachments: [
            { name: "ssr_mutation_flows.png", type: "Image" }
          ]
        }
      ]
    },
    {
      id: "c2",
      courseId: "1",
      title: "Access credentials to VPC cloud environment for sandbox deployment",
      recipient: "Academy Administrator",
      status: "Under Review",
      lastActivity: "June 30, 2026, 8:12 AM",
      messages: [
        {
          id: "m1",
          sender: "Student",
          senderName: "Courtney Henry",
          avatarText: "CH",
          text: "Hi support team, I need access to the private sandbox AWS environment to deploy my final React architectural project. Can you please check and grant the necessary IAM credentials to my user account?",
          time: "June 30, 2026, 8:12 AM"
        }
      ]
    },
    {
      id: "c3",
      courseId: "2",
      title: "Syllabus details on Contrast ratios and WCAG AA compliance in Dark Themes",
      recipient: "Course Instructor",
      status: "Replied",
      lastActivity: "June 25, 2026, 4:30 PM",
      messages: [
        {
          id: "m1",
          sender: "Student",
          senderName: "Courtney Henry",
          avatarText: "CH",
          text: "In dark interfaces, what contrast ratio is recommended for body copy versus tiny secondary captions to retain high readability without causing visual strain?",
          time: "June 25, 2026, 2:00 PM"
        },
        {
          id: "m2",
          sender: "Instructor",
          senderName: "Marcus Aurelius",
          avatarText: "MA",
          text: "Courtney, for premium dark systems we aim for at least 4.5:1 (WCAG AA) for standard body copy. For captions, you can go lower to 3:1 only if font-weight or size is increased slightly. I've attached our internal premium contrast guideline cheat sheet.",
          time: "June 25, 2026, 4:30 PM",
          attachments: [
            { name: "wcag_dark_contrast_standards.pdf", type: "PDF" }
          ]
        }
      ]
    },
    {
      id: "c4",
      courseId: "3",
      title: "Required Math Prerequisites for Linear Regression Lessons",
      recipient: "Course Instructor",
      status: "Closed",
      lastActivity: "June 20, 2026, 5:15 PM",
      messages: [
        {
          id: "m1",
          sender: "Student",
          senderName: "Courtney Henry",
          avatarText: "CH",
          text: "Hi Dr. Turing, do I need to deeply study partial derivatives before starting Session 2, or is basic matrix multiplication sufficient?",
          time: "June 20, 2026, 1:10 PM"
        },
        {
          id: "m2",
          sender: "Instructor",
          senderName: "Dr. Alan Turing",
          avatarText: "AT",
          text: "Courtney, basic matrix multiplication is highly sufficient for now. We will introduce partial derivatives of the cost function gently when we code Gradient Descent. No need to stress!",
          time: "June 20, 2026, 5:15 PM"
        }
      ]
    }
  ];

  localStorage.setItem("userCourseConversations", JSON.stringify(initial));
  return initial;
};

export const validateGitHubUrl = (url: string): boolean => {
  if (!url) return true;
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
  return githubRegex.test(url.trim());
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "Not Submitted":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 font-sans">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          Not Submitted
        </span>
      );
    case "Submitted":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 font-sans">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Submitted
        </span>
      );
    case "Under Review":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          Under Review
        </span>
      );
    case "Graded":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Graded
        </span>
      );
    case "Deadline Passed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 font-sans">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          Deadline Passed
        </span>
      );
    default:
      return null;
  }
};

export const getResourceFileIcon = (fileType: string) => {
  const type = fileType ? fileType.toUpperCase() : "";
  if (type.includes("PDF")) {
    return <FileText className="text-red-400 font-bold" size={20} />;
  } else if (type.includes("ZIP") || type.includes("RAR")) {
    return <FileArchive className="text-yellow-400" size={20} />;
  } else if (type.includes("CODE") || type.includes("SOURCE") || type.includes("JS") || type.includes("TS") || type.includes("HTML") || type.includes("CSS")) {
    return <FileCode className="text-indigo-400" size={20} />;
  } else if (type.includes("IMAGE") || type.includes("PNG") || type.includes("JPG") || type.includes("JPEG") || type.includes("GIF")) {
    return <FileImage className="text-emerald-400" size={20} />;
  } else if (type.includes("PPTX") || type.includes("SLIDES") || type.includes("PRESENTATION")) {
    return <FileSpreadsheet className="text-amber-400" size={20} />;
  } else if (type.includes("DOC") || type.includes("DOCX") || type.includes("WORD")) {
    return <FileText className="text-blue-400" size={20} />;
  } else {
    return <Paperclip className="text-zinc-400" size={20} />;
  }
};

interface Task {
  id: string;
  name: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  section: "InProgress" | "ToDo" | "Upcoming";
}

interface SearchResult {
  id: string;
  type: "course" | "project" | "message" | "assignment";
  title: string;
  subtitle: string;
  originalItem: any;
}

function CountUp({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setCount(end);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime: number | null = null;
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Cubic easeOut function for premium feel
            const easeOutCubic = 1 - Math.pow(1 - percentage, 3);
            const current = Math.floor(easeOutCubic * end);
            
            setCount(current);
            if (progress < duration) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [end, duration]);

  return <span ref={elementRef} className="tabular-nums font-extrabold">{count}</span>;
}

interface SessionDetail {
  id: string;
  sessionNum: number;
  topic: string;
  duration: string;
  date: string;
  time: string;
  status: "Completed" | "Not Held" | "Cancelled" | "Scheduled";
  cancellationReason?: string;
  rescheduledDateTime?: string;
  meetingLink?: string;
}

const generateInitialSessions = (): { [courseId: string]: SessionDetail[] } => {
  return {
    "1": [
      { id: "1-1", sessionNum: 1, topic: "Vite & HMR Essentials", duration: "90 Mins", date: "June 03, 2026", time: "10:00 AM – 11:30 AM", status: "Completed" },
      { id: "1-2", sessionNum: 2, topic: "State Managers & Flux", duration: "90 Mins", date: "June 10, 2026", time: "10:00 AM – 11:30 AM", status: "Completed" },
      { id: "1-3", sessionNum: 3, topic: "Component Modeling", duration: "90 Mins", date: "June 17, 2026", time: "10:00 AM – 11:30 AM", status: "Completed" },
      { id: "1-4", sessionNum: 4, topic: "Custom Hooks", duration: "90 Mins", date: "June 24, 2026", time: "10:00 AM – 11:30 AM", status: "Completed" },
      { id: "1-5", sessionNum: 5, topic: "Concurrent Rendering", duration: "90 Mins", date: "July 01, 2026", time: "10:00 AM – 11:30 AM", status: "Completed" },
      { id: "1-6", sessionNum: 6, topic: "Fiber Architecture", duration: "90 Mins", date: "July 08, 2026", time: "10:00 AM – 11:30 AM", status: "Completed" },
      { id: "1-7", sessionNum: 7, topic: "Suspense & Transitions", duration: "90 Mins", date: "July 15, 2026", time: "10:00 AM – 11:30 AM", status: "Completed" },
      { id: "1-8", sessionNum: 8, topic: "Server Components", duration: "90 Mins", date: "July 22, 2026", time: "10:00 AM – 11:30 AM", status: "Completed" },
      { id: "1-9", sessionNum: 9, topic: "Performance Tuning", duration: "90 Mins", date: "July 29, 2026", time: "10:00 AM – 11:30 AM", status: "Scheduled", meetingLink: "https://zoom.us/j/98765432101" },
      { id: "1-10", sessionNum: 10, topic: "Memory Leak Audits", duration: "90 Mins", date: "August 05, 2026", time: "10:00 AM – 11:30 AM", status: "Not Held" },
      { id: "1-11", sessionNum: 11, topic: "Testing & Mocking", duration: "90 Mins", date: "August 12, 2026", time: "10:00 AM – 11:30 AM", status: "Cancelled", cancellationReason: "Instructor attending React Global Summit. Content moved to Session 12 self-study." },
      { id: "1-12", sessionNum: 12, topic: "Production Deployment", duration: "90 Mins", date: "August 19, 2026", time: "10:00 AM – 11:30 AM", status: "Not Held" }
    ],
    "2": [
      { id: "2-1", sessionNum: 1, topic: "Swiss Typography", duration: "90 Mins", date: "May 12, 2026", time: "14:00 – 15:30", status: "Completed" },
      { id: "2-2", sessionNum: 2, topic: "Color Theory & Contrast", duration: "90 Mins", date: "May 19, 2026", time: "14:00 – 15:30", status: "Completed" },
      { id: "2-3", sessionNum: 3, topic: "Tailwind Variables", duration: "90 Mins", date: "May 26, 2026", time: "14:00 – 15:30", status: "Completed" },
      { id: "2-4", sessionNum: 4, topic: "Micro-interactions", duration: "90 Mins", date: "June 02, 2026", time: "14:00 – 15:30", status: "Completed" },
      { id: "2-5", sessionNum: 5, topic: "Bento Grid Layouts", duration: "90 Mins", date: "June 09, 2026", time: "14:00 – 15:30", status: "Completed" },
      { id: "2-6", sessionNum: 6, topic: "Dark Mode Principles", duration: "90 Mins", date: "June 16, 2026", time: "14:00 – 15:30", status: "Completed" },
      { id: "2-7", sessionNum: 7, topic: "Fluid Layouts & Spacing", duration: "90 Mins", date: "June 23, 2026", time: "14:00 – 15:30", status: "Completed" },
      { id: "2-8", sessionNum: 8, topic: "Motion Design", duration: "90 Mins", date: "June 30, 2026", time: "14:00 – 15:30", status: "Completed" },
      { id: "2-9", sessionNum: 9, topic: "Component Libraries", duration: "90 Mins", date: "July 07, 2026", time: "14:00 – 15:30", status: "Completed" },
      { id: "2-10", sessionNum: 10, topic: "System Documentation", duration: "90 Mins", date: "July 14, 2026", time: "14:00 – 15:30", status: "Completed" }
    ],
    "3": [
      { id: "3-1", sessionNum: 1, topic: "Linear Regression Foundations", duration: "120 Mins", date: "July 15, 2026", time: "14:00 – 16:00", status: "Scheduled", meetingLink: "https://zoom.us/j/12345678901" },
      { id: "3-2", sessionNum: 2, topic: "Gradient Descent Algorithms", duration: "120 Mins", date: "July 22, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-3", sessionNum: 3, topic: "Multi-layer Perceptrons", duration: "120 Mins", date: "July 29, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-4", sessionNum: 4, topic: "Neural Network Tuning", duration: "120 Mins", date: "August 05, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-5", sessionNum: 5, topic: "Fine-tuning Models", duration: "120 Mins", date: "August 12, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-6", sessionNum: 6, topic: "Prompt Engineering", duration: "120 Mins", date: "August 19, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-7", sessionNum: 7, topic: "Transformer Models", duration: "120 Mins", date: "August 26, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-8", sessionNum: 8, topic: "Attention Mechanisms", duration: "120 Mins", date: "September 02, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-9", sessionNum: 9, topic: "Convolutional Nets", duration: "120 Mins", date: "September 09, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-10", sessionNum: 10, topic: "Recurrent Architectures", duration: "120 Mins", date: "September 16, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-11", sessionNum: 11, topic: "Reinforcement Learning", duration: "120 Mins", date: "September 23, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-12", sessionNum: 12, topic: "Generative Adversarial Nets", duration: "120 Mins", date: "September 30, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-13", sessionNum: 13, topic: "Clustering & SVMs", duration: "120 Mins", date: "October 07, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-14", sessionNum: 14, topic: "PCA & Dimension Reduction", duration: "120 Mins", date: "October 14, 2026", time: "14:00 – 16:00", status: "Not Held" },
      { id: "3-15", sessionNum: 15, topic: "Final ML Capstone", duration: "120 Mins", date: "October 21, 2026", time: "14:00 – 16:00", status: "Not Held" }
    ]
  };
};

interface CertificateCardProps {
  course: {
    id: string;
    title: string;
    instructor: string;
    startDate: string;
    endDate: string;
    totalSessions: number;
    progress: number;
  };
  studentName?: string;
  showCustomToast: (message: string, type?: "info" | "success" | "warning") => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  course,
  studentName = "Courtney Henry",
  showCustomToast
}) => {
  const isPassed = course.progress >= 60;
  const finalGrade = course.progress >= 90 ? "A" : course.progress >= 60 ? "B" : "C";
  const totalHours = course.totalSessions * 4;

  return (
    <div className="space-y-4 font-sans text-center">
      <div className="relative">
        {/* LOCKED STATE FOR FAILED / LOW PROGRESS COURSES */}
        {!isPassed && (
          <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/75 rounded-3xl flex flex-col items-center justify-center text-center p-6 border border-white/10">
            <div className="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg mb-4">
              <Lock size={26} className="stroke-[1.8]" />
            </div>
            <h4 className="font-sans text-base font-black text-white tracking-tight">
              Certificate Locked
            </h4>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm mt-1 mb-2 font-medium">
              Official graduation credentials require a passing final grade status. Attain at least 60% session progress to generate your verified certificate.
            </p>
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-[10px] text-white/40 font-mono font-semibold">
              Current Course Progress: {course.progress}%
            </div>
          </div>
        )}

        {/* THE ACTUAL GORGEOUS CERTIFICATE */}
        <div className={`relative w-full border-2 border-amber-500/30 p-6 sm:p-12 rounded-3xl overflow-hidden bg-gradient-to-b from-[#0e0e15] to-[#050508] shadow-2xl ${!isPassed ? "opacity-30 select-none pointer-events-none" : ""}`}>
          {/* Watermark grid and decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none" />

          {/* Thin inner border */}
          <div className="absolute inset-2 sm:inset-4 border border-amber-500/15 rounded-2xl pointer-events-none" />

          {/* Corner decorations */}
          <div className="absolute top-5 left-5 w-4 h-4 border-t-2 border-l-2 border-amber-500/40" />
          <div className="absolute top-5 right-5 w-4 h-4 border-t-2 border-r-2 border-amber-500/40" />
          <div className="absolute bottom-5 left-5 w-4 h-4 border-b-2 border-l-2 border-amber-500/40" />
          <div className="absolute bottom-5 right-5 w-4 h-4 border-b-2 border-r-2 border-amber-500/40" />

          {/* Certificate Content */}
          <div className="space-y-6 text-center relative z-10 py-4 sm:py-6">
            {/* Academy Logo Header */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/5">
                <Award size={28} className="stroke-[1.5]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/80 font-black">
                  ROOZZERO ACADEMY
                </h4>
                <p className="text-[8px] text-white/30 uppercase tracking-[0.15em] font-medium">
                  PREMIUM GRADUATION CREDENTIALS
                </p>
              </div>
            </div>

            {/* Main Certificate Title */}
            <div className="space-y-2">
              <h1 className="font-sans text-xl sm:text-3xl font-black text-white tracking-wider uppercase leading-none">
                Certificate of Completion
              </h1>
              <p className="text-[10px] text-white/40 italic font-medium">
                This administrative credential certifies that the candidate has satisfactorily met all academic modules.
              </p>
            </div>

            {/* Student Name Display */}
            <div className="py-2">
              <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono font-bold block mb-1">PROUDLY PRESENTED TO</span>
              <h2 className="font-sans text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-tight py-1">
                {studentName}
              </h2>
              <div className="w-16 h-[1px] bg-amber-500/30 mx-auto mt-2" />
            </div>

            {/* Course Title and Hours Statement */}
            <div className="max-w-md mx-auto space-y-1">
              <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                for demonstrating outstanding proficiency and completing the curriculum requirements of the certified training course:
              </p>
              <h3 className="font-sans text-sm sm:text-base font-black text-white tracking-wide uppercase py-1">
                {course.title}
              </h3>
              <p className="text-[9px] text-white/40 font-mono">
                A course of instruction comprising <span className="text-white/70 font-bold">{totalHours} Hours</span> of syllabus sessions.
              </p>
            </div>

            {/* Dual Signatures and Seals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center pt-6 max-w-2xl mx-auto border-t border-white/[0.04] text-left">
              {/* Left Signature */}
              <div className="text-center sm:text-left space-y-1">
                <span className="block font-serif text-sm italic text-amber-200/80 tracking-wide select-none">
                  {course.instructor}
                </span>
                <div className="w-full h-[1px] bg-white/10" />
                <span className="block text-[8px] text-white/30 uppercase font-bold tracking-widest font-mono">
                  Syllabus Director
                </span>
              </div>

              {/* Center Gold Stamp Seal */}
              <div className="flex justify-center select-none">
                <div className="relative flex items-center justify-center h-20 w-20 rounded-full border border-amber-500/20 bg-gradient-to-tr from-amber-500/10 to-yellow-500/5 shadow-inner">
                  <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-[spin_60s_linear_infinite]" />
                  <div className="text-center space-y-0.5 z-10">
                    <Sparkles className="text-amber-400 mx-auto" size={16} />
                    <span className="block text-[7px] text-amber-400 font-bold tracking-wider font-mono">
                      VERIFIED
                    </span>
                    <span className="block text-[5px] text-white/30 font-bold font-mono">
                      SECURE SEAL
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Administrative verification */}
              <div className="text-center sm:text-right space-y-1">
                <span className="block font-mono text-[9px] text-white/70 font-bold">
                  {course.startDate.split(",")[1]?.trim() || "2026"}
                </span>
                <div className="w-full h-[1px] bg-white/10" />
                <span className="block text-[8px] text-white/30 uppercase font-bold tracking-widest font-mono">
                  Issue Date
                </span>
              </div>
            </div>

            {/* Footer details: Certificate ID and Grade */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.02] text-[8px] text-white/30 font-mono">
              <div className="text-left font-medium">
                CREDENTIAL ID: <span className="text-white/55 font-bold uppercase">RZ-CRT-{course.id}092-2026</span>
              </div>
              <div className="text-right font-medium">
                FINAL TRANSCRIPT GRADE: <span className="text-amber-400 font-black">{finalGrade}</span> ({course.progress}% Progress)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CERTIFICATE ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => {
            if (!isPassed) {
              showCustomToast("Certificate is currently locked.", "warning");
              return;
            }
            showCustomToast("Preparing PDF generation...", "info");
            setTimeout(() => {
              showCustomToast("Downloaded Course Certificate PDF successfully!", "success");
            }, 1200);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/15 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center ${!isPassed ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          <FileText size={14} className="text-indigo-400" />
          <span>Download PDF</span>
        </button>

        <button
          onClick={() => {
            if (!isPassed) {
              showCustomToast("Certificate is currently locked.", "warning");
              return;
            }
            showCustomToast("Compiling PNG layout...", "info");
            setTimeout(() => {
              showCustomToast("Saved Certificate Image to local downloads!", "success");
            }, 1000);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/15 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center ${!isPassed ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          <FileImage size={14} className="text-emerald-400" />
          <span>Download Image</span>
        </button>

        <button
          onClick={() => {
            if (!isPassed) {
              showCustomToast("Certificate is currently locked.", "warning");
              return;
            }
            showCustomToast("Initiating secure printing layouts...", "info");
            setTimeout(() => {
              window.print();
            }, 800);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/15 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center ${!isPassed ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          <Printer size={14} className="text-amber-400" />
          <span>Print Certificate</span>
        </button>
      </div>
    </div>
  );
};

interface PremiumFeedbackModalProps {
  course: {
    id: string;
    title: string;
    instructor: string;
    startDate: string;
    endDate: string;
    totalSessions: number;
    progress: number;
  };
  onClose: () => void;
}

const PremiumFeedbackModal: React.FC<PremiumFeedbackModalProps> = ({
  course,
  onClose
}) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isPassed = course.progress >= 60;
  const finalGrade = course.progress >= 90 ? "A" : course.progress >= 60 ? "B" : "C";
  const totalHours = course.totalSessions * 4;

  let recommendation = {
    strengths: "Excellent grasp of concurrent rendering paradigms and performance tuning. Demonstrated exceptional engineering in designing custom hooks and memory leak audits.",
    weaknesses: "Could spend a bit more focus on documenting decoupled custom architectures and service-to-service state synchronization flows.",
    suggestions: "Deepen understanding of React Server Components (RSC) and study HTTP/3 streaming strategies for complex edge delivery.",
    comments: "Courtney has shown stellar performance throughout the core syllabus. Highly capable of leading complex web engineering projects."
  };

  if (course.title.toLowerCase().includes("design")) {
    recommendation = {
      strengths: "Unparalleled eye for pixel-perfection, Swiss typography principles, and WCAG AA contrast compliance in complex dark layouts.",
      weaknesses: "Occasionally spent too much time perfecting micro-interaction timing in early sandbox drafts before establishing baseline wireframes.",
      suggestions: "Perfect standard design token automation using Style Dictionary to scale systems across multiple platforms like Android and iOS.",
      comments: "A masterclass student. Courtney's ability to maintain a dark design theme with aesthetic harmony and high usability is phenomenal."
    };
  } else if (course.title.toLowerCase().includes("learning") || course.title.toLowerCase().includes("machine")) {
    recommendation = {
      strengths: "Strong theoretical foundations in linear algebra and basic matrix operations.",
      weaknesses: "Lack of active session participation and practical coding lab hand-ins so far.",
      suggestions: "Allocate dedicated hours to step-by-step linear regression foundations and coding gradient descent algorithms from scratch.",
      comments: "Must prioritize syllabus lectures and homework submissions. With consistent attendance, has high potential to grasp advanced deep learning models."
    };
  }

  // Get instructor initials
  const initials = course.instructor
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden p-4">
      {/* Backdrop tap-to-close */}
      <div className="absolute inset-0 z-10" onClick={onClose} />

      {/* Modal content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative max-w-2xl w-full bg-[#050508] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-20 font-sans text-left"
      >
        {/* Glow backgrounds */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all cursor-pointer z-30"
          title="Close Feedback"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/[0.05] pb-5 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm font-sans shrink-0">
            {initials}
          </div>
          <div>
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Official Instructor Evaluation</span>
            <h3 className="font-sans text-lg font-black text-white leading-snug mt-0.5">{course.instructor}</h3>
            <p className="text-xs text-white/40 font-sans mt-0.5">{course.title}</p>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-6">
          {/* Grade & Comments summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#08080c] border border-white/[0.04] rounded-2xl p-4 text-center flex flex-col justify-center min-h-[100px]">
              <span className="text-[9px] text-white/40 uppercase font-mono block tracking-wider mb-1">Final Grade</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-4xl font-black font-mono ${
                  finalGrade === "A" ? "text-emerald-400" : finalGrade === "B" ? "text-indigo-400" : "text-amber-400"
                }`}>{finalGrade}</span>
                <span className="text-[11px] text-white/40 font-mono">({course.progress}%)</span>
              </div>
            </div>

            <div className="sm:col-span-2 bg-[#08080c] border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-center min-h-[100px]">
              <span className="text-[9px] text-white/40 uppercase font-mono block tracking-wider mb-1">Academic Status</span>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${isPassed ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className={`text-sm font-black uppercase tracking-wider ${isPassed ? "text-emerald-400" : "text-rose-400"}`}>
                  {isPassed ? "Passed & Graduated" : "Requirements Pending"}
                </span>
              </div>
              <p className="text-[11px] text-white/40 font-sans mt-1">
                Completed on {course.endDate} ({totalHours} total course hours).
              </p>
            </div>
          </div>

          {/* Detailed comment block */}
          <div className="bg-[#08080c]/60 border border-white/[0.04] rounded-2xl p-4 space-y-2 relative">
            <span className="text-[9px] text-indigo-400 font-mono font-bold tracking-widest block uppercase">Instructor's Written Review</span>
            <p className="text-xs text-white/80 italic leading-relaxed font-sans">
              "{recommendation.comments}"
            </p>
          </div>

          {/* Strengths & Weaknesses (Areas for improvement) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-mono">
                Primary Strengths
              </span>
              <p className="text-xs text-white/60 leading-relaxed font-sans pl-1 font-medium">
                {recommendation.strengths}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 font-mono">
                Areas for Improvement
              </span>
              <p className="text-xs text-white/60 leading-relaxed font-sans pl-1 font-medium">
                {recommendation.weaknesses}
              </p>
            </div>
          </div>

          {/* Suggestion / Pathway */}
          <div className="border-t border-white/[0.04] pt-4 space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 font-mono">
              Final Pathway Recommendation
            </span>
            <p className="text-xs text-white/70 leading-relaxed font-sans font-medium pl-1">
              {recommendation.suggestions}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-white/30 font-mono">
          <span>Date of Evaluation: {course.endDate}</span>
          <span className="text-indigo-400/80">RoZ Academy Registrar</span>
        </div>
      </motion.div>
    </div>
  );
};

interface PremiumCertificateViewerModalProps {
  course: {
    id: string;
    title: string;
    instructor: string;
    startDate: string;
    endDate: string;
    totalSessions: number;
    progress: number;
  };
  studentName?: string;
  onClose: () => void;
  showCustomToast: (message: string, type?: "info" | "success" | "warning") => void;
}

const PremiumCertificateViewerModal: React.FC<PremiumCertificateViewerModalProps> = ({
  course,
  studentName = "Courtney Henry",
  onClose,
  showCustomToast
}) => {
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  // Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent default scroll behavior on mouse wheel over container
  useEffect(() => {
    const handleWheelRaw = (e: WheelEvent) => {
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        e.preventDefault();
        const zoomIntensity = 0.15;
        setScale(prev => {
          const nextScale = e.deltaY < 0 ? prev + zoomIntensity : prev - zoomIntensity;
          return Math.max(0.5, Math.min(3.5, nextScale));
        });
      }
    };

    window.addEventListener("wheel", handleWheelRaw, { passive: false });
    return () => window.removeEventListener("wheel", handleWheelRaw);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setScale(1.75);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPanOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const ratio = currentDistance / lastTouchDistance.current;
      lastTouchDistance.current = currentDistance;
      setScale(prev => Math.max(0.5, Math.min(3.5, prev * ratio)));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistance.current = null;
  };

  const handleDownloadPdf = () => {
    setIsPreparingDownload(true);
    showCustomToast("Preparing PDF generation...", "info");
    
    setTimeout(() => {
      try {
        const docName = `RZ-CRT-${course.title.replace(/\s+/g, "-")}.pdf`;
        const blob = new Blob(["%PDF-1.4 ... (Verified Certificate PDF File) ..."], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = docName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showCustomToast("Downloaded Course Certificate PDF successfully!", "success");
      } catch (err) {
        showCustomToast("Could not generate PDF. Please try again.", "warning");
      } finally {
        setIsPreparingDownload(false);
      }
    }, 1200);
  };

  const handlePrint = () => {
    showCustomToast("Initiating secure printing layouts...", "info");
    setTimeout(() => {
      window.print();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden">
      {/* Dynamic styles to print ONLY the certificate card layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-certificate-container, #print-certificate-container * {
            visibility: visible !important;
          }
          #print-certificate-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 2cm !important;
            background: black !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999999 !important;
          }
        }
      ` }} />

      {/* Backdrop tap-to-close */}
      <div 
        className="absolute inset-0 z-10" 
        onClick={() => {
          if (scale === 1 && !isDragging) onClose();
        }}
      />

      {/* Main modal container */}
      <div className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center p-4 sm:p-8 z-20 pointer-events-none">
        
        {/* Close Button Top-Right Corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-full transition-all cursor-pointer pointer-events-auto z-40 border border-white/5"
          title="Close Viewer"
        >
          <X size={20} />
        </button>

        {/* Certificate Display Area */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            transition: isDragging ? "none" : "transform 0.15s ease-out"
          }}
          className="w-full max-w-3xl pointer-events-auto select-none"
        >
          <div id="print-certificate-container" className="bg-black/40 rounded-3xl p-1">
            <CertificateCard 
              course={course} 
              studentName={studentName} 
              showCustomToast={showCustomToast}
            />
          </div>
        </div>

        {/* Professional floating toolbar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 px-3 bg-[#0a0a0f]/90 backdrop-blur-lg border border-white/10 rounded-full shadow-2xl pointer-events-auto z-30 max-w-[95vw] overflow-x-auto whitespace-nowrap scrollbar-none">
          {/* Zoom Out */}
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          {/* Reset Zoom */}
          <button
            onClick={() => {
              setScale(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw size={16} />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => setScale(prev => Math.min(3.5, prev + 0.25))}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isPreparingDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Download PDF"
          >
            {isPreparingDownload ? (
              <div className="h-3.5 w-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span>Download PDF</span>
          </button>

          {/* Print Certificate */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-400 rounded-full text-xs font-bold transition-all cursor-pointer"
            title="Print Certificate"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Close Viewer */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-full text-xs font-bold transition-all cursor-pointer"
            title="Close Viewer"
          >
            <X size={13} />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserDashboard({ onLogout, onGoHome }: UserDashboardProps) {
  const currentYear = new Date().getFullYear();

  // State to simulate new projects list
  const [projectsList, setProjectsList] = useState([
    { name: "Product launch", tasks: "6 tasks", teammates: "12 teammates", color: "from-purple-500 to-indigo-500" },
    { name: "Team brainstorm", tasks: "2 tasks", teammates: "32 teammates", color: "from-blue-500 to-cyan-500" },
    { name: "Branding launch", tasks: "4 tasks", teammates: "9 teammates", color: "from-teal-500 to-emerald-500" }
  ]);

  // Inbox interactive state
  const [emails, setEmailList] = useState([
    {
      id: "1",
      from: "Professor Sarah Vance",
      subject: "Syllabus Update: Week 4 Assignments",
      date: "9:24 AM",
      body: "Hello Courtney,\n\nI have updated the Week 4 syllabus with additional reading materials on React hooks and state management. Please review them before the next lecture.\n\nBest,\nSarah",
      read: false,
      attachments: [
        { name: "Syllabus_Update_Week4.pdf", type: "PDF" as const, size: "1.2 MB" },
        { name: "React_State_Patterns_Reference.pdf", type: "PDF" as const, size: "850 KB" }
      ]
    },
    {
      id: "2",
      from: "Roozzero Admin",
      subject: "Welcome to Premium Student Portal",
      date: "Yesterday",
      body: "Welcome Courtney! Your Roozzero Premium student workspace has been successfully provisioned. Enjoy the AI-powered task recommendations, priority course enrollments, and customized planner boards.\n\nCheers,\nAdmin",
      read: true,
      attachments: [
        { name: "rozacademy_guide_v1.pdf", type: "PDF" as const, size: "3.4 MB" },
        { name: "dashboard_layout_mockup.png", type: "Image" as const, size: "1.1 MB" }
      ]
    },
    {
      id: "3",
      from: "John Doe (Teammate)",
      subject: "Group Assignment Feedback",
      date: "June 29",
      body: "Hey Courtney, looked at the custom hooks outline you drafted. The approach is extremely solid! Let's get together during the next lab to assemble the final design system presentation.",
      read: true
    },
  ]);

  // My Courses interactive state
  const [courses, setCourses] = useState([
    {
      id: "1",
      title: "Advanced React & Architecture",
      instructor: "Dr. Sarah Vance",
      startDate: "June 01, 2026",
      endDate: "August 15, 2026",
      totalSessions: 12,
      completedSessions: 8,
      nextSession: "July 01, 2026 at 10:00 AM",
      status: "Active",
      thumbnail: "/src/assets/images/react_thumbnail_1782829644127.jpg",
      progress: 67,
      lessons: [
        "Vite & HMR Essentials",
        "State Managers & Flux",
        "Component Modeling",
        "Custom Hooks",
        "Concurrent Rendering",
        "Fiber Architecture",
        "Suspense & Transitions",
        "Server Components",
        "Performance Tuning",
        "Memory Leak Audits",
        "Testing & Mocking",
        "Production Deployment"
      ]
    },
    {
      id: "2",
      title: "Premium Dark Design Systems",
      instructor: "Marcus Aurelius",
      startDate: "May 10, 2026",
      endDate: "July 20, 2026",
      totalSessions: 10,
      completedSessions: 10,
      nextSession: "None (Course Completed)",
      status: "Completed",
      thumbnail: "/src/assets/images/design_thumbnail_1782829662379.jpg",
      progress: 100,
      lessons: [
        "Swiss Typography",
        "Color Theory & Contrast",
        "Tailwind Variables",
        "Micro-interactions",
        "Bento Grid Layouts",
        "Dark Mode Principles",
        "Fluid Layouts & Spacing",
        "Motion Design",
        "Component Libraries",
        "System Documentation"
      ]
    },
    {
      id: "3",
      title: "Machine Learning Foundations",
      instructor: "Dr. Alan Turing",
      startDate: "July 15, 2026",
      endDate: "September 30, 2026",
      totalSessions: 15,
      completedSessions: 0,
      nextSession: "July 15, 2026 at 02:00 PM",
      status: "Waiting to Start",
      thumbnail: "/src/assets/images/ml_thumbnail_1782829674713.jpg",
      progress: 0,
      lessons: [
        "Linear Regression Foundations",
        "Gradient Descent Algorithms",
        "Multi-layer Perceptrons",
        "Neural Network Tuning",
        "Fine-tuning Models",
        "Prompt Engineering",
        "Transformer Models",
        "Attention Mechanisms",
        "Convolutional Nets",
        "Recurrent Architectures",
        "Reinforcement Learning",
        "Generative Adversarial Nets",
        "Clustering & SVMs",
        "PCA & Dimension Reduction",
        "Final ML Capstone"
      ]
    }
  ]);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<"All" | "Active" | "Completed" | "Waiting to Start">("All");

  const [courseDetailsTab, setCourseDetailsTab] = useState<string>("Overview");
  const [expandedSessions, setExpandedSessions] = useState<number[]>([]);
  const [customToasts, setCustomToasts] = useState<{ id: string; message: string; type: "info" | "success" | "warning" }[]>([]);
  const [isClassNowSimulated, setIsClassNowSimulated] = useState<boolean>(false);
  
  const [courseSessions, setCourseSessions] = useState<{ [courseId: string]: SessionDetail[] }>(() => {
    const saved = localStorage.getItem("student_course_sessions");
    let current = saved ? JSON.parse(saved) : generateInitialSessions();
    
    // Automatically match and populate the meeting links from the teacher!
    const savedTeacherRaw = localStorage.getItem("teacher_sessions");
    if (savedTeacherRaw) {
      try {
        const teacherSessions = JSON.parse(savedTeacherRaw);
        const mapStudentCourseIdToTeacherCourseIdLocal = (studentCourseId: string): string => {
          if (studentCourseId === "1") return "react-adv";
          if (studentCourseId === "2") return "swiss-typo";
          if (studentCourseId === "3") return "ml-found";
          return "react-adv";
        };

        const findMatchingStudentSessionLocal = (studentSessionsList: any[], teacherTitle: string) => {
          const normalizedTeacher = teacherTitle.toLowerCase();
          let match = studentSessionsList.find((s: any) => 
            normalizedTeacher.includes(s.topic.toLowerCase()) || 
            s.topic.toLowerCase().includes(normalizedTeacher)
          );
          if (match) return match;

          const teacherWords = normalizedTeacher.split(/\s+/).filter((w: string) => w.length > 3);
          match = studentSessionsList.find((s: any) => {
            const studentWords = s.topic.toLowerCase().split(/\s+/);
            return teacherWords.some((tw: string) => studentWords.includes(tw));
          });
          if (match) return match;

          match = studentSessionsList.find((s: any) => s.status === "Scheduled");
          if (match) return match;

          match = studentSessionsList.find((s: any) => s.status === "Not Held");
          if (match) return match;

          return studentSessionsList[studentSessionsList.length - 1];
        };

        Object.keys(current).forEach(studentCourseId => {
          const teacherCourseId = mapStudentCourseIdToTeacherCourseIdLocal(studentCourseId);
          const teacherCourseSessions = teacherSessions.filter((ts: any) => ts.courseId === teacherCourseId);
          
          teacherCourseSessions.forEach((ts: any) => {
            if (ts.link) {
              const matchedStudentSess = findMatchingStudentSessionLocal(current[studentCourseId], ts.title);
              if (matchedStudentSess) {
                current[studentCourseId] = current[studentCourseId].map((s: any) => {
                  if (s.id === matchedStudentSess.id) {
                    return {
                      ...s,
                      meetingLink: ts.link,
                      meetingPlatform: ts.meetingPlatform || "Google Meet",
                      status: "Scheduled"
                    };
                  }
                  return s;
                });
              }
            }
          });
        });
      } catch (e) {
        console.error("Error matching sessions:", e);
      }
    }
    return current;
  });

  // Sync courseSessions to localStorage when changed
  useEffect(() => {
    localStorage.setItem("student_course_sessions", JSON.stringify(courseSessions));
  }, [courseSessions]);

  const [activeJoinSession, setActiveJoinSession] = useState<SessionDetail | null>(null);
  const [simulatedNowSessions, setSimulatedNowSessions] = useState<{ [sessionId: string]: boolean }>({});
  
  // Reschedule/Cancel state for simulator inputs
  const [simRescheduleDate, setSimRescheduleDate] = useState("July 05, 2026");
  const [simRescheduleTime, setSimRescheduleTime] = useState("10:00 AM – 11:30 AM");
  const [simCancelReason, setSimCancelReason] = useState("Instructor has an urgent scheduling conflict.");
  const [showSimulatorPanel, setShowSimulatorPanel] = useState(false);
  
  const handleCancelSessionSim = (sessionId: string) => {
    setCourseSessions(prev => {
      const updated = { ...prev };
      const sessionsList = updated[selectedCourseId || ""] || [];
      updated[selectedCourseId || ""] = sessionsList.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: "Cancelled" as const,
            cancellationReason: simCancelReason || "Cancelled due to instructor schedule conflict."
          };
        }
        return s;
      });
      return updated;
    });
    showCustomToast("Session Cancelled simulation applied!", "success");
  };

  const handleRescheduleSessionSim = (sessionId: string) => {
    setCourseSessions(prev => {
      const updated = { ...prev };
      const sessionsList = updated[selectedCourseId || ""] || [];
      updated[selectedCourseId || ""] = sessionsList.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: "Scheduled" as const,
            date: simRescheduleDate,
            time: simRescheduleTime
          };
        }
        return s;
      });
      return updated;
    });
    showCustomToast("Session Rescheduled simulation applied!", "success");
  };

  const handleCompleteSessionSim = (sessionId: string) => {
    setCourseSessions(prev => {
      const updated = { ...prev };
      const sessionsList = updated[selectedCourseId || ""] || [];
      updated[selectedCourseId || ""] = sessionsList.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: "Completed" as const
          };
        }
        return s;
      });
      return updated;
    });
    showCustomToast("Session Completed simulation applied!", "success");
  };

  const handleResetSessionSim = (sessionId: string) => {
    setCourseSessions(prev => {
      const updated = { ...prev };
      const sessionsList = updated[selectedCourseId || ""] || [];
      updated[selectedCourseId || ""] = sessionsList.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: "Not Held" as const,
            cancellationReason: undefined,
            date: s.sessionNum <= 8 ? "June 10, 2026" : "July 12, 2026"
          };
        }
        return s;
      });
      return updated;
    });
    showCustomToast("Session status reset to default!", "info");
  };

  const handleToggleClassTimeSim = (sessionId: string) => {
    setSimulatedNowSessions(prev => {
      const isNow = !prev[sessionId];
      if (isNow) {
        showCustomToast("Class Scheduled Time is Active NOW! Click 'Join Class' to test the Live Modal.", "success");
      } else {
        showCustomToast("Scheduled time simulation turned off.", "info");
      }
      return {
        ...prev,
        [sessionId]: isNow
      };
    });
  };
  
  const [courseDiscussions, setCourseDiscussions] = useState<{ [courseId: string]: { id: string; sender: string; role: string; time: string; text: string }[] }>({
    "1": [
      { id: "1", sender: "Dr. Sarah Vance", role: "Instructor", time: "10:05 AM", text: "Welcome to Advanced React & Architecture! Please make sure to review the syllabus." },
      { id: "2", sender: "Courtney Henry", role: "Student (You)", time: "10:12 AM", text: "Excited for this course! I am working on the first assignment." }
    ],
    "2": [
      { id: "1", sender: "Marcus Aurelius", role: "Instructor", time: "Yesterday", text: "Great job on the Swiss Typography design layouts, everyone." }
    ],
    "3": [
      { id: "1", sender: "Dr. Alan Turing", role: "Instructor", time: "Monday", text: "Class starts soon. Get ready to dive into Linear Regression." }
    ]
  });
  const [newDiscussionText, setNewDiscussionText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const showCustomToast = (message: string, type: "info" | "success" | "warning" = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setCustomToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setCustomToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const [downloadingResourceId, setDownloadingResourceId] = useState<string | null>(null);

  const handleDownloadResource = (resource: CourseResource) => {
    setDownloadingResourceId(resource.id);
    showCustomToast(`Preparing reference material: ${resource.fileName}`, "info");
    setTimeout(() => {
      try {
        const dummyContent = `--- ROOZZERO PREMIUM LEARNING SYSTEMS ---\nResource: ${resource.title}\nCourse: ${resource.course}\nFile Name: ${resource.fileName}\nSize: ${resource.fileSize}\nPublished Date: ${resource.uploadDate}\n\nThis reference work is prepared for premium student research. Use this materials guide to master the coursework!`;
        const blob = new Blob([dummyContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = resource.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showCustomToast(`Download started: "${resource.fileName}"`, "success");
      } catch (err) {
        showCustomToast(`Download error: Could not save ${resource.fileName}`, "warning");
      } finally {
        setDownloadingResourceId(null);
      }
    }, 1000);
  };

  // Assignments interactive state
  const [assignments, setAssignments] = useState<AssignmentDetail[]>(getInitialDetailedAssignments);

  useEffect(() => {
    localStorage.setItem("userAssignments", JSON.stringify(assignments));
  }, [assignments]);

  // Course resources interactive state
  const [resources, setResources] = useState<CourseResource[]>(getInitialCourseResources);

  useEffect(() => {
    localStorage.setItem("userResources", JSON.stringify(resources));
  }, [resources]);

  // Premium interactive discussion messaging system states
  const [conversations, setConversations] = useState<Conversation[]>(getInitialConversations);
  const [activeDiscussionFilter, setActiveDiscussionFilter] = useState<"All" | "Replied" | "Under Review" | "Closed">("All");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [confirmingCloseConvId, setConfirmingCloseConvId] = useState<string | null>(null);

  // Reply section states
  const [discussionReplyText, setDiscussionReplyText] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<{ name: string; type: "Image" | "PDF" } | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // New discussion modal states
  const [isNewDiscussionModalOpen, setIsNewDiscussionModalOpen] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionRecipient, setNewDiscussionRecipient] = useState<"Academy Administrator" | "Course Instructor">("Course Instructor");
  const [newDiscussionMessage, setNewDiscussionMessage] = useState("");
  const [newDiscussionAttachment, setNewDiscussionAttachment] = useState<{ name: string; type: "Image" | "PDF" } | null>(null);

  useEffect(() => {
    localStorage.setItem("userCourseConversations", JSON.stringify(conversations));
  }, [conversations]);

  // Sync resources, assignments, and conversations state from local storage dynamically
  useEffect(() => {
    const handleSync = () => {
      const savedRes = localStorage.getItem("userResources");
      if (savedRes) {
        try {
          const parsed = JSON.parse(savedRes);
          if (Array.isArray(parsed)) {
            setResources(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      const savedAss = localStorage.getItem("userAssignments");
      if (savedAss) {
        try {
          const parsed = JSON.parse(savedAss);
          if (Array.isArray(parsed)) {
            setAssignments(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }

      const savedConv = localStorage.getItem("userCourseConversations");
      if (savedConv) {
        try {
          const parsed = JSON.parse(savedConv);
          if (Array.isArray(parsed)) {
            setConversations(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Synchronize with Instructor Actions in Teacher Dashboard
      
      // A. Synchronize Sessions/Schedule
      const teacherSessionsRaw = localStorage.getItem("teacher_sessions");
      if (teacherSessionsRaw) {
        try {
          const teacherSessions = JSON.parse(teacherSessionsRaw);
          const mapStudentCourseIdToTeacherCourseId = (studentCourseId: string): string => {
            if (studentCourseId === "1") return "react-adv";
            if (studentCourseId === "2") return "swiss-typo";
            if (studentCourseId === "3") return "ml-found";
            return "react-adv";
          };

          const findMatchingStudentSession = (studentSessionsList: any[], teacherTitle: string) => {
            const normalizedTeacher = teacherTitle.toLowerCase();
            let match = studentSessionsList.find((s: any) => 
              normalizedTeacher.includes(s.topic.toLowerCase()) || 
              s.topic.toLowerCase().includes(normalizedTeacher)
            );
            if (match) return match;
            const teacherWords = normalizedTeacher.split(/\s+/).filter((w: string) => w.length > 3);
            match = studentSessionsList.find((s: any) => {
              const studentWords = s.topic.toLowerCase().split(/\s+/);
              return teacherWords.some((tw: string) => studentWords.includes(tw));
            });
            return match || studentSessionsList[0];
          };

          setCourseSessions((prevSessions) => {
            const updated = { ...prevSessions };
            let changed = false;
            Object.keys(updated).forEach((studentCourseId) => {
              const teacherCourseId = mapStudentCourseIdToTeacherCourseId(studentCourseId);
              const teacherCourseSessions = teacherSessions.filter((ts: any) => ts.courseId === teacherCourseId);
              
              teacherCourseSessions.forEach((ts: any) => {
                const matchedStudentSess = findMatchingStudentSession(updated[studentCourseId], ts.title);
                if (matchedStudentSess) {
                  const existingSess = updated[studentCourseId].find(s => s.id === matchedStudentSess.id);
                  if (existingSess && (
                    existingSess.meetingLink !== ts.link || 
                    existingSess.meetingPlatform !== ts.meetingPlatform || 
                    existingSess.date !== ts.date || 
                    existingSess.time !== ts.time ||
                    existingSess.status !== ts.status
                  )) {
                    changed = true;
                    // Trigger a notification if class is rescheduled or cancelled
                    if (existingSess.status !== ts.status) {
                      addNotification(
                        `Class Status Updated`,
                        `Session ${existingSess.sessionNum} "${existingSess.topic}" is now ${ts.status}.`,
                        "course"
                      );
                    } else if (existingSess.date !== ts.date || existingSess.time !== ts.time) {
                      addNotification(
                        `Class Rescheduled`,
                        `Session ${existingSess.sessionNum} has been rescheduled to ${ts.date} @ ${ts.time}.`,
                        "course"
                      );
                    }
                    
                    updated[studentCourseId] = updated[studentCourseId].map((s: any) => {
                      if (s.id === matchedStudentSess.id) {
                        return {
                          ...s,
                          meetingLink: ts.link || s.meetingLink,
                          meetingPlatform: ts.meetingPlatform || s.meetingPlatform || "Google Meet",
                          date: ts.date || s.date,
                          time: ts.time || s.time,
                          status: ts.status || s.status
                        };
                      }
                      return s;
                    });
                  }
                }
              });
            });
            return changed ? updated : prevSessions;
          });
        } catch (e) {
          console.error("Sync sessions error:", e);
        }
      }

      // B. Synchronize Assignments, Grades & Feedback
      const teacherAssignmentsRaw = localStorage.getItem("teacher_assignments");
      if (teacherAssignmentsRaw) {
        try {
          const teacherAssignments = JSON.parse(teacherAssignmentsRaw);
          setAssignments((prevAssignments) => {
            let changed = false;
            const updated = prevAssignments.map((stAsg) => {
              const match = teacherAssignments.find((ta: any) => 
                ta.title.toLowerCase().trim() === stAsg.title.toLowerCase().trim() ||
                stAsg.title.toLowerCase().includes(ta.title.toLowerCase()) ||
                ta.title.toLowerCase().includes(stAsg.title.toLowerCase())
              );
              if (match) {
                const sub = match.submissions?.find((s: any) => s.studentName === "Courtney Henry" || s.studentId === "stu-1");
                let newStatus = stAsg.status;
                let newGrade = stAsg.grade;
                let feedback = stAsg.feedback;

                if (sub) {
                  if (sub.status === "Graded") {
                    newStatus = "Graded";
                    newGrade = sub.grade;
                    feedback = sub.feedback;
                  } else if (sub.status === "Submitted") {
                    newStatus = "Submitted";
                  }
                }

                if (stAsg.status !== newStatus || stAsg.grade !== newGrade || stAsg.feedback !== feedback || stAsg.description !== match.description || stAsg.dueDate !== (match.dueDate + ", 11:59 PM")) {
                  changed = true;
                  if (stAsg.grade !== newGrade && newGrade !== null) {
                    addNotification(
                      "Grade Published",
                      `Your assignment "${stAsg.title}" has been graded: ${newGrade}/100.`,
                      "milestone"
                    );
                  } else if (stAsg.dueDate !== (match.dueDate + ", 11:59 PM")) {
                    addNotification(
                      "Assignment Deadline Updated",
                      `"${stAsg.title}" is now due on ${match.dueDate}.`,
                      "assignment"
                    );
                  }
                  
                  return {
                    ...stAsg,
                    description: match.description,
                    dueDate: match.dueDate + ", 11:59 PM",
                    status: newStatus,
                    grade: newGrade,
                    feedback: feedback
                  };
                }
              }
              return stAsg;
            });

            // Add newly published assignment
            teacherAssignments.forEach((ta: any) => {
              const exists = prevAssignments.some((sa) => 
                sa.title.toLowerCase().trim() === ta.title.toLowerCase().trim() ||
                sa.title.toLowerCase().includes(ta.title.toLowerCase()) ||
                ta.title.toLowerCase().includes(sa.title.toLowerCase())
              );
              if (!exists && ta.status === "Published") {
                const courseIdMap: { [key: string]: string } = {
                  "react-adv": "Advanced React & Architecture",
                  "swiss-typo": "Premium Dark Design Systems",
                  "ml-found": "Machine Learning Foundations"
                };
                const newAsg: AssignmentDetail = {
                  id: `ta-${ta.id}`,
                  assignmentNum: prevAssignments.filter(a => a.course === (courseIdMap[ta.courseId] || ta.courseTitle)).length + 1,
                  title: ta.title,
                  course: courseIdMap[ta.courseId] || ta.courseTitle,
                  description: ta.description,
                  publishDate: ta.publishDate,
                  dueDate: ta.dueDate + ", 11:59 PM",
                  status: "Not Submitted",
                  grade: null,
                  published: true
                };
                updated.push(newAsg);
                changed = true;
                addNotification(
                  "New Assignment Published",
                  `"${ta.title}" has been published for ${newAsg.course}.`,
                  "assignment"
                );
              }
            });

            // Filter out deleted assignments
            const filtered = updated.filter((stAsg) => {
              if (stAsg.id.startsWith("ta-")) {
                const taId = stAsg.id.replace("ta-", "");
                const existsInTeacher = teacherAssignments.some((ta: any) => ta.id === taId);
                if (!existsInTeacher) {
                  changed = true;
                  return false;
                }
              }
              return true;
            });

            return changed ? filtered : prevAssignments;
          });
        } catch (e) {
          console.error("Sync assignments error:", e);
        }
      }

      // C. Synchronize Resources
      const teacherResourcesRaw = localStorage.getItem("teacher_resources");
      if (teacherResourcesRaw) {
        try {
          const teacherResources = JSON.parse(teacherResourcesRaw);
          setResources((prevResources) => {
            let changed = false;
            const updated = prevResources.map((stRes) => {
              const match = teacherResources.find((tr: any) => tr.title === stRes.title);
              if (match) {
                if (stRes.fileName !== match.fileName || stRes.fileSize !== match.fileSize) {
                  changed = true;
                  return {
                    ...stRes,
                    fileName: match.fileName,
                    fileSize: match.fileSize
                  };
                }
              }
              return stRes;
            });

            teacherResources.forEach((tr: any) => {
              const exists = prevResources.some((sr) => sr.title === tr.title);
              if (!exists) {
                const courseIdMap: { [key: string]: string } = {
                  "react-adv": "Advanced React & Architecture",
                  "swiss-typo": "Premium Dark Design Systems",
                  "ml-found": "Machine Learning Foundations"
                };
                const newRes: CourseResource = {
                  id: `tr-${tr.id}`,
                  course: courseIdMap[tr.courseId] || "Advanced React & Architecture",
                  title: tr.title,
                  fileName: tr.fileName,
                  fileSize: tr.fileSize,
                  fileType: tr.type || "PDF",
                  uploadDate: tr.uploadDate || "Just now",
                  published: true
                };
                updated.push(newRes);
                changed = true;
                addNotification(
                  "New Resource Uploaded",
                  `Resource "${tr.title}" was uploaded by your instructor.`,
                  "project"
                );
              }
            });

            const filtered = updated.filter((stRes) => {
              if (stRes.id.startsWith("tr-")) {
                const trId = stRes.id.replace("tr-", "");
                const existsInTeacher = teacherResources.some((tr: any) => tr.id === trId);
                if (!existsInTeacher) {
                  changed = true;
                  return false;
                }
              }
              return true;
            });

            return changed ? filtered : prevResources;
          });
        } catch (e) {
          console.error("Sync resources error:", e);
        }
      }

      // D. Synchronize Discussions
      const teacherDiscussionsRaw = localStorage.getItem("teacher_discussions");
      if (teacherDiscussionsRaw) {
        try {
          const teacherDiscussions = JSON.parse(teacherDiscussionsRaw);
          setConversations((prevConversations) => {
            let changed = false;
            const updated = prevConversations.map((stConv) => {
              const match = teacherDiscussions.find((td: any) => 
                td.title.toLowerCase().trim() === stConv.title.toLowerCase().trim() &&
                td.studentName === "Courtney Henry"
              );
              if (match) {
                const instructorReplies = match.replies || [];
                const baseMessage = stConv.messages[0];
                const studentReplies = stConv.messages.slice(1).filter(m => m.sender === "Student");
                
                const mergedMessages = [baseMessage];
                const allReplies = [
                  ...studentReplies.map(r => ({ ...r, orderTime: 0 })), 
                  ...instructorReplies.map((r: any, idx: number) => ({
                    id: r.id || `tr-${idx}`,
                    sender: r.role === "Student" ? "Student" : "Instructor",
                    senderName: r.sender,
                    avatarText: r.role === "Student" ? "CH" : "SV",
                    text: r.text,
                    time: r.time,
                    orderTime: idx + 1
                  }))
                ];
                
                const seen = new Set();
                allReplies.forEach((reply) => {
                  const key = `${reply.sender}-${reply.text}`;
                  if (!seen.has(key)) {
                    seen.add(key);
                    mergedMessages.push({
                      id: reply.id,
                      sender: reply.sender as any,
                      senderName: reply.senderName,
                      avatarText: reply.avatarText,
                      text: reply.text,
                      time: reply.time
                    });
                  }
                });

                const hasNewMessages = mergedMessages.length !== stConv.messages.length;
                const statusChanged = stConv.status !== match.status;

                if (hasNewMessages || statusChanged) {
                  changed = true;
                  if (statusChanged && match.status === "Replied") {
                    addNotification(
                      "New Reply Received",
                      `Dr. Sarah Vance replied to "${stConv.title}".`,
                      "message"
                    );
                  }
                  return {
                    ...stConv,
                    status: match.status,
                    messages: mergedMessages,
                    lastActivity: match.replies?.length > 0 ? match.replies[match.replies.length - 1].time : stConv.lastActivity
                  };
                }
              }
              return stConv;
            });

            return changed ? updated : prevConversations;
          });
        } catch (e) {
          console.error("Sync discussions error:", e);
        }
      }
    };

    window.addEventListener("storage", handleSync);
    const interval = setInterval(handleSync, 2000);
    
    return () => {
      window.removeEventListener("storage", handleSync);
      clearInterval(interval);
    };
  }, []);

  // Selected assignment for the premium details page
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Redesigned assignments tab state
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<"All" | "Pending" | "Submitted" | "Reviewing" | "Revision Required" | "Completed">("All");
  const [assignmentCourseSearch, setAssignmentCourseSearch] = useState<string>("");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [animatedCounts, setAnimatedCounts] = useState({
    Pending: 0,
    Submitted: 0,
    Reviewing: 0,
    RevisionRequired: 0,
    Completed: 0
  });
  const hasAnimatedAssignmentsRef = useRef(false);
  const prevAssignmentsCountsRef = useRef({
    Pending: 0,
    Submitted: 0,
    Reviewing: 0,
    RevisionRequired: 0,
    Completed: 0
  });
  const activeAssignmentsAnimationRef = useRef<number | null>(null);

  const [dragActive, setDragActive] = useState(false);

  // Achievements sub-tabs, certificates viewer and statistics animation states
  const [achievementsTab, setAchievementsTab] = useState<"Overview" | "Certificates" | "Completed Courses" | "Teacher Feedback">("Overview");
  const [achievementsAnimatedCounts, setAchievementsAnimatedCounts] = useState({
    Certificates: 0,
    CompletedCourses: 0,
    AcademicGrade: 0,
    CompletedAssignments: 0
  });
  const hasAnimatedAchievementsRef = useRef(false);
  const activeAchievementsAnimationRef = useRef<number | null>(null);
  const [viewingCertificateCourse, setViewingCertificateCourse] = useState<string | null>(null);
  const [viewingFeedbackCourse, setViewingFeedbackCourse] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [githubUrl, setGithubUrl] = useState("");
  const [notesText, setNotesText] = useState("");
  const [githubError, setGithubError] = useState("");
  const [uploadedFileState, setUploadedFileState] = useState<{ name: string; size: string; type: string } | null>(null);
  const assignmentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedAssignmentId) {
      const current = assignments.find(a => a.id === selectedAssignmentId);
      if (current) {
        setUploadedFileState(current.submittedFile || null);
        setGithubUrl(current.submittedGithubUrl || "");
        setNotesText(current.submittedNotes || "");
        setGithubError("");
        setUploadProgress(0);
        setIsUploading(false);
      }
    }
  }, [selectedAssignmentId, assignments]);

  // Reset selected assignment when active course changes to a different course
  useEffect(() => {
    if (selectedCourseId && selectedAssignmentId) {
      const assignment = assignments.find(a => a.id === selectedAssignmentId);
      const course = courses.find(c => c.id === selectedCourseId);
      if (assignment && course && assignment.course !== course.title) {
        setSelectedAssignmentId(null);
      }
    } else if (!selectedCourseId) {
      setSelectedAssignmentId(null);
    }
  }, [selectedCourseId]);
  
  // Profile picture, name, and bio states (durably persisted)
  const [profilePic, setProfilePic] = useState<string>(() => localStorage.getItem("userProfilePic") || "");
  const [profileName, setProfileName] = useState<string>(() => localStorage.getItem("userName") || "Courtney Henry");
  const [profileBio, setProfileBio] = useState<string>(() => localStorage.getItem("userBio") || "Undergraduate student majoring in Computer Science & Interactive Design.");

  // Redesigned Settings Tab Draft States
  const [draftProfilePic, setDraftProfilePic] = useState<string>(profilePic);
  const [draftBio, setDraftBio] = useState<string>(profileBio);
  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropRotate, setCropRotate] = useState<number>(0);
  const [photoUploadProgress, setPhotoUploadProgress] = useState<number | null>(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    return (localStorage.getItem("portalTheme") as "light" | "dark" | "system") || "dark";
  });
  const [draftTheme, setDraftTheme] = useState<"light" | "dark" | "system">(theme);

  const [secCurrentPassword, setSecCurrentPassword] = useState<string>("");
  const [secNewPassword, setSecNewPassword] = useState<string>("");
  const [secConfirmPassword, setSecConfirmPassword] = useState<string>("");
  const [isGoogleAccount, setIsGoogleAccount] = useState<boolean>(false);

  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isSavingAppearance, setIsSavingAppearance] = useState<boolean>(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

  const [accountSubmittedErrors, setAccountSubmittedErrors] = useState<Record<string, string>>({});
  const [securitySubmittedErrors, setSecuritySubmittedErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraftProfilePic(profilePic);
  }, [profilePic]);

  useEffect(() => {
    setDraftBio(profileBio);
  }, [profileBio]);
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<"dashboard" | "inbox" | "courses" | "assignments" | "achievements" | "calendar" | "settings">("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Helper to map raw status to display status
  const mapToDisplayStatus = (status: string): "Pending" | "Submitted" | "Reviewing" | "Revision Required" | "Completed" => {
    if (status === "Not Submitted" || status === "Pending" || status === "Deadline Passed") return "Pending";
    if (status === "Under Review" || status === "Reviewing") return "Reviewing";
    if (status === "Graded" || status === "Completed") return "Completed";
    if (status === "Revision Required") return "Revision Required";
    return "Submitted";
  };

  // Animate statistics counters from 0 when assignments tab is active
  useEffect(() => {
    if (activeTab !== "assignments") return;

    const currentPending = assignments.filter(a => mapToDisplayStatus(a.status) === "Pending").length;
    const currentSubmitted = assignments.filter(a => mapToDisplayStatus(a.status) === "Submitted").length;
    const currentReviewing = assignments.filter(a => mapToDisplayStatus(a.status) === "Reviewing").length;
    const currentRevisionRequired = assignments.filter(a => mapToDisplayStatus(a.status) === "Revision Required").length;
    const currentCompleted = assignments.filter(a => mapToDisplayStatus(a.status) === "Completed").length;

    const targetCounts = {
      Pending: currentPending,
      Submitted: currentSubmitted,
      Reviewing: currentReviewing,
      RevisionRequired: currentRevisionRequired,
      Completed: currentCompleted
    };

    if (!hasAnimatedAssignmentsRef.current) {
      // Initial animation from 0 to targetCounts (strictly once)
      hasAnimatedAssignmentsRef.current = true;
      
      const startTime = performance.now();
      const duration = 1000; // ms

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease out cubic

        const newCounts = {
          Pending: Math.round(easeProgress * targetCounts.Pending),
          Submitted: Math.round(easeProgress * targetCounts.Submitted),
          Reviewing: Math.round(easeProgress * targetCounts.Reviewing),
          RevisionRequired: Math.round(easeProgress * targetCounts.RevisionRequired),
          Completed: Math.round(easeProgress * targetCounts.Completed)
        };

        setAnimatedCounts(newCounts);

        if (progress < 1) {
          activeAssignmentsAnimationRef.current = requestAnimationFrame(animate);
        } else {
          prevAssignmentsCountsRef.current = targetCounts;
        }
      };

      if (activeAssignmentsAnimationRef.current) cancelAnimationFrame(activeAssignmentsAnimationRef.current);
      activeAssignmentsAnimationRef.current = requestAnimationFrame(animate);

    } else {
      // Already animated initially, check if underlying data has actually changed
      const prev = prevAssignmentsCountsRef.current;
      const changedKeys = (Object.keys(targetCounts) as Array<keyof typeof targetCounts>).filter(
        key => targetCounts[key] !== prev[key]
      );

      if (changedKeys.length > 0) {
        // Something changed! Animate ONLY the affected keys from their previous values to their new values
        const startTime = performance.now();
        const duration = 800; // ms
        const startValues = { ...prev };

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);

          setAnimatedCounts(currentAnimated => {
            const updated = { ...currentAnimated };
            changedKeys.forEach(key => {
              const start = startValues[key];
              const end = targetCounts[key];
              updated[key] = Math.round(start + easeProgress * (end - start));
            });
            return updated;
          });

          if (progress < 1) {
            activeAssignmentsAnimationRef.current = requestAnimationFrame(animate);
          } else {
            // Sync final values exactly
            setAnimatedCounts(targetCounts);
            prevAssignmentsCountsRef.current = targetCounts;
          }
        };

        if (activeAssignmentsAnimationRef.current) cancelAnimationFrame(activeAssignmentsAnimationRef.current);
        activeAssignmentsAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // No changes, ensure animated values stay exactly matched with targetCounts
        setAnimatedCounts(targetCounts);
      }
    }

    return () => {
      if (activeAssignmentsAnimationRef.current) {
        cancelAnimationFrame(activeAssignmentsAnimationRef.current);
      }
    };
  }, [activeTab, assignments]);

  // Trigger achievements stat animation only once when Achievements tab is viewed
  useEffect(() => {
    if (activeTab !== "achievements") return;
    if (hasAnimatedAchievementsRef.current) return;

    const certsCount = courses.filter(c => c.status === "Completed").length;
    const completedCoursesCount = courses.filter(c => c.status === "Completed").length;
    const gradeValue = 4.0; // GPA 4.0
    const completedAssignmentsCount = assignments.filter(a => a.status === "Graded" || a.status === "Completed").length;

    hasAnimatedAchievementsRef.current = true;

    const startTime = performance.now();
    const duration = 1200; // ms

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setAchievementsAnimatedCounts({
        Certificates: Math.round(easeProgress * certsCount),
        CompletedCourses: Math.round(easeProgress * completedCoursesCount),
        AcademicGrade: Math.round(easeProgress * gradeValue * 10) / 10,
        CompletedAssignments: Math.round(easeProgress * completedAssignmentsCount)
      });

      if (progress < 1) {
        activeAchievementsAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    activeAchievementsAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (activeAchievementsAnimationRef.current) {
        cancelAnimationFrame(activeAchievementsAnimationRef.current);
      }
    };
  }, [activeTab, courses, assignments]);
  
  // Drag and drop states
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Settings tab preferences states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Settings Redesign States
  const [settingsActiveTab, setSettingsActiveTab] = useState<"Account" | "Profile" | "Appearance" | "Security">("Account");
  
  const [firstName, setFirstName] = useState<string>(() => localStorage.getItem("userFirstName") || "Courtney");
  const [lastName, setLastName] = useState<string>(() => localStorage.getItem("userLastName") || "Henry");
  const [username, setUsername] = useState<string>(() => localStorage.getItem("userUsername") || "courtney_h");
  const [savedUsername, setSavedUsername] = useState<string>(() => localStorage.getItem("userSavedUsername") || "courtney_h");
  
  // Last username change date (ISO format)
  // By default, set it to "2026-05-15" (47 days ago from 2026-07-01), which is eligible
  const [lastUsernameChangeDate, setLastUsernameChangeDate] = useState<string>(
    () => localStorage.getItem("userLastUsernameChangeDate") || "2026-05-15"
  );
  const [adminApproved, setAdminApproved] = useState<boolean>(false);
  
  const [emailAddress, setEmailAddress] = useState<string>(() => localStorage.getItem("userEmail") || "schoepplake@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    const raw = localStorage.getItem("userPhone");
    const digits = raw ? raw.replace(/\D/g, "") : "";
    return /^0?9\d{9}$/.test(digits) ? digits : "9123456789";
  });
  const [countryCode, setCountryCode] = useState<string>("IR");
  
  // Username validation states
  const [usernameValidationMsg, setUsernameValidationMsg] = useState<string>("✓ Available");
  const [usernameValidationStatus, setUsernameValidationStatus] = useState<"idle" | "loading" | "valid" | "taken" | "invalid">("valid");
  
  // Email validation states
  const [emailValidationMsg, setEmailValidationMsg] = useState<string>("✓ Email is available and valid");
  const [emailValidationStatus, setEmailValidationStatus] = useState<"idle" | "loading" | "valid" | "taken" | "invalid">("valid");
  
  // Saving states
  const [isSavingAccount, setIsSavingAccount] = useState<boolean>(false);
  const [isRequestingAdmin, setIsRequestingAdmin] = useState<boolean>(false);

  // Username live validation with debounced simulated AJAX check
  useEffect(() => {
    if (username === savedUsername) {
      setUsernameValidationStatus("valid");
      setUsernameValidationMsg("✓ Available");
      return;
    }

    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameValidationStatus("invalid");
      setUsernameValidationMsg("✗ Username is required.");
      return;
    }

    const usernameRegex = /^[A-Za-z0-9_.]+$/;
    if (!usernameRegex.test(trimmed)) {
      setUsernameValidationStatus("invalid");
      setUsernameValidationMsg("✗ Username can only contain English letters, numbers, underscores, and periods.");
      return;
    }

    setUsernameValidationStatus("loading");
    setUsernameValidationMsg("Checking availability...");

    const timeoutId = setTimeout(() => {
      const takenUsernames = ["admin", "root", "administrator", "professor", "marcus", "vance", "henry", "scholar", "alice", "bob", "schoepplake"];
      if (takenUsernames.includes(trimmed.toLowerCase())) {
        setUsernameValidationStatus("taken");
        setUsernameValidationMsg("✗ This username is already in use.");
      } else {
        setUsernameValidationStatus("valid");
        setUsernameValidationMsg("✓ Available");
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [username, savedUsername]);

  // Email live validation with debounced simulated AJAX check
  useEffect(() => {
    const trimmed = emailAddress.trim();
    if (!trimmed) {
      setEmailValidationStatus("invalid");
      setEmailValidationMsg("✗ Email address is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailValidationStatus("invalid");
      setEmailValidationMsg("✗ Invalid email format.");
      return;
    }

    setEmailValidationStatus("loading");
    setEmailValidationMsg("Verifying email uniqueness...");

    const timeoutId = setTimeout(() => {
      const takenEmails = ["taken@rozacademy.com", "admin@rozacademy.com", "professor@rozacademy.com", "marcus@rozacademy.com", "vance@rozacademy.com"];
      if (takenEmails.includes(trimmed.toLowerCase())) {
        setEmailValidationStatus("taken");
        setEmailValidationMsg("✗ This email is already registered to another account.");
      } else {
        setEmailValidationStatus("valid");
        setEmailValidationMsg("✓ Email is available and valid");
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [emailAddress]);

  const validateIranPhone = (num: string) => {
    const digits = num.replace(/\D/g, "");
    if (!digits) {
      return "Phone number is required.";
    }
    if (!/^0?9\d{9}$/.test(digits)) {
      return "Please enter a valid Iranian mobile number starting with 9 (e.g., 9123456789).";
    }
    return "";
  };

  const getFirstNameError = (): string => {
    const val = firstName.trim();
    if (!val) {
      return "First name is required.";
    }
    if (val.length < 3) {
      return "First name must contain at least 3 characters.";
    }
    if (val.length > 50) {
      return "First name cannot exceed 50 characters.";
    }
    return "";
  };

  const getLastNameError = (): string => {
    const val = lastName.trim();
    if (!val) {
      return "Last name is required.";
    }
    if (val.length < 3) {
      return "Last name must contain at least 3 characters.";
    }
    if (val.length > 50) {
      return "Last name cannot exceed 50 characters.";
    }
    return "";
  };

  const getUsernameChangePolicyDetails = () => {
    const changeDateObj = new Date(lastUsernameChangeDate);
    const todayObj = new Date("2026-07-01");
    
    const diffTime = todayObj.getTime() - changeDateObj.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const isWithin30Days = diffDays < 30 && diffDays >= 0;
    
    return {
      diffDays,
      isWithin30Days,
      eligibleDate: new Date(changeDateObj.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }),
      lastChangedFormatted: changeDateObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    };
  };

  // Profile Image validation, crop, resize and storage removal
  const processProfileImage = (file: File) => {
    const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validFormats.includes(file.type)) {
      alert("Unsupported format. Please upload a JPG, JPEG, PNG, or WEBP image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Perfect 256x256 crop
        const size = 256;
        canvas.width = size;
        canvas.height = size;

        const minDimension = Math.min(img.width, img.height);
        const sx = (img.width - minDimension) / 2;
        const sy = (img.height - minDimension) / 2;

        ctx.drawImage(
          img,
          sx,
          sy,
          minDimension,
          minDimension,
          0,
          0,
          size,
          size
        );

        const base64Image = canvas.toDataURL("image/webp", 0.85);
        
        // Remove previous from storage implicitly by replacing
        localStorage.setItem("userProfilePic", base64Image);
        setProfilePic(base64Image);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processProfileImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processProfileImage(file);
    }
  };

  const removeProfilePic = () => {
    localStorage.removeItem("userProfilePic");
    setProfilePic("");
  };

  // Format current date dynamically based on user's locale (e.g., "Tue, June 30")
  const [formattedDate, setFormattedDate] = useState("");
  useEffect(() => {
    const now = new Date();
    // Default locale-based format that respects browser language settings
    setFormattedDate(now.toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric" }));
  }, []);

  // AJAX Search states & engine
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification states
  interface NotificationItem {
    id: string;
    title: string;
    preview: string;
    timestamp: string;
    read: boolean;
    type: "message" | "course" | "assignment" | "project" | "milestone";
    targetId?: string;
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: "New Message from Dr. Vance",
      preview: "Syllabus Update: Week 4 Assignments",
      timestamp: "9:24 AM",
      read: false,
      type: "message",
      targetId: "1"
    },
    {
      id: "n2",
      title: "Course Progress Update",
      preview: "Advanced React progress is at 68%",
      timestamp: "10 mins ago",
      read: false,
      type: "course",
      targetId: "1"
    },
    {
      id: "n3",
      title: "Assignment Due Soon",
      preview: "Custom Hooks & Memory Leak Audits is due tomorrow",
      timestamp: "Yesterday",
      read: true,
      type: "assignment",
      targetId: "1"
    },
    {
      id: "n4",
      title: "Welcome to Premium Student Portal",
      preview: "Enjoy your customized student workspace",
      timestamp: "June 29",
      read: true,
      type: "message",
      targetId: "2"
    }
  ]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [pulseBadge, setPulseBadge] = useState(false);

  // Dispatch helper to add new academic/milestone notification with instant pulse trigger
  const addNotification = (
    title: string,
    preview: string,
    type: "message" | "course" | "assignment" | "project" | "milestone",
    targetId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      title,
      preview,
      timestamp: "Just now",
      read: false,
      type,
      targetId
    };
    setNotifications(prev => [newNotif, ...prev]);
    setPulseBadge(true);
    // Auto-reset bounce state after 2 seconds
    setTimeout(() => setPulseBadge(false), 2000);
  };

  // Close dropdowns on mouse clicks outside ref elements
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard accessibility: Escape key closes active dropdown panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchDropdownOpen(false);
        setIsNotificationDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Simulated live search matching index with 400ms debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsSearchDropdownOpen(true);

    const delayDebounce = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results: SearchResult[] = [];

      // Search academic courses
      courses.forEach(c => {
        if (c.title.toLowerCase().includes(query) || c.instructor.toLowerCase().includes(query)) {
          results.push({
            id: c.id,
            type: "course",
            title: c.title,
            subtitle: `Syllabus under ${c.instructor}`,
            originalItem: c
          });
        }
      });

      // Search active workspaces / projects
      projectsList.forEach((p, idx) => {
        if (p.name.toLowerCase().includes(query)) {
          results.push({
            id: idx.toString(),
            type: "project",
            title: p.name,
            subtitle: `${p.tasks} • ${p.teammates}`,
            originalItem: p
          });
        }
      });

      // Search message list / emails
      emails.forEach(e => {
        if (
          e.from.toLowerCase().includes(query) ||
          e.subject.toLowerCase().includes(query) ||
          e.body.toLowerCase().includes(query)
        ) {
          results.push({
            id: e.id,
            type: "message",
            title: e.subject,
            subtitle: `Message from ${e.from}`,
            originalItem: e
          });
        }
      });

      // Search assignments
      assignments.forEach(a => {
        if (a.title.toLowerCase().includes(query) || a.course.toLowerCase().includes(query)) {
          results.push({
            id: a.id,
            type: "assignment",
            title: a.title,
            subtitle: `${a.course} • Status: ${a.status}`,
            originalItem: a
          });
        }
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, courses, projectsList, emails, assignments]);

  // Handle click on search result item
  const handleResultClick = (result: SearchResult) => {
    setIsSearchDropdownOpen(false);
    setSearchQuery("");
    
    if (result.type === "course") {
      setActiveTab("courses");
    } else if (result.type === "project") {
      setActiveTab("dashboard");
    } else if (result.type === "message") {
      setActiveTab("inbox");
      setSelectedEmailId(result.id);
    } else if (result.type === "assignment") {
      setActiveTab("assignments");
    }
  };

  // Click on single notification card
  const handleNotificationClick = (n: NotificationItem) => {
    // Mark as read
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    setIsNotificationDropdownOpen(false);

    // Dynamic routing
    if (n.type === "message" && n.targetId) {
      setActiveTab("inbox");
      setSelectedEmailId(n.targetId);
    } else if (n.type === "course") {
      setActiveTab("courses");
    } else if (n.type === "assignment") {
      setActiveTab("assignments");
    } else if (n.type === "project") {
      setActiveTab("dashboard");
    } else if (n.type === "milestone") {
      setActiveTab("achievements");
    }
  };

  // Highlighting matching strings within the lists
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-indigo-500/30 text-indigo-300 font-extrabold px-0.5 rounded-sm">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Helper to render correct icons in dropdown panel
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare size={13} className="text-blue-400" />;
      case "course": return <BookOpen size={13} className="text-purple-400" />;
      case "assignment": return <ClipboardList size={13} className="text-amber-400" />;
      case "project": return <Folder size={13} className="text-emerald-400" />;
      case "milestone": return <Award size={13} className="text-yellow-400" />;
      default: return <Bell size={13} className="text-indigo-400" />;
    }
  };

  // State to toggle active calendar day index
  const [activeDayIndex, setActiveDayIndex] = useState(3); // Mon 07
  const daysOfWeek = [
    { day: "Fri", num: "04" },
    { day: "Sat", num: "05" },
    { day: "Sun", num: "06" },
    { day: "Mon", num: "07" },
    { day: "Tue", num: "08" },
    { day: "Wed", num: "09" },
    { day: "Thu", num: "10" }
  ];

  // Collapsible sections in Tasks
  const [isInProgressOpen, setIsInProgressOpen] = useState(true);
  const [isToDoOpen, setIsToDoOpen] = useState(true);
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(true);

  // Task lists
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", name: "One-on-One Meeting with Counselor", priority: "High", dueDate: "Today", section: "InProgress" },
    { id: "2", name: "Submit grading spreadsheet for design system class", priority: "Low", dueDate: "3 days left", section: "InProgress" },
    { id: "3", name: "Review updated course curriculum mockups", priority: "Medium", dueDate: "Tomorrow", section: "ToDo" },
    { id: "4", name: "Complete ML linear algebra worksheets", priority: "Low", dueDate: "Next week", section: "Upcoming" }
  ]);

  // Add Task inline form state
  const [showAddTaskInline, setShowAddTaskInline] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskSection, setNewTaskSection] = useState<"InProgress" | "ToDo" | "Upcoming">("InProgress");

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: newTaskName,
        priority: newTaskPriority,
        dueDate: "Today",
        section: newTaskSection
      };
      setTasks([...tasks, newTask]);
      setNewTaskName("");
      setShowAddTaskInline(false);
    }
  };

  const handleToggleTaskSection = (taskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        // Simple cycle transition for interactive demo
        const nextSec: Record<string, "InProgress" | "ToDo" | "Upcoming"> = {
          InProgress: "ToDo",
          ToDo: "Upcoming",
          Upcoming: "InProgress"
        };
        return { ...t, section: nextSec[t.section] };
      }
      return t;
    }));
  };

  // AI assistant simulation state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const triggerAskAi = () => {
    setShowAiModal(true);
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      setAiResponse(
        "Based on your active tasks and courses, you have 'One-on-One Meeting with Counselor' starting soon. I have compiled course updates from your inbox to review. Would you like me to draft your preparation notes?"
      );
    }, 1500);
  };

  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      setProjectsList([
        ...projectsList,
        {
          name: newProjectName,
          tasks: "0 tasks",
          teammates: "1 teammate",
          color: "from-emerald-500 to-cyan-500"
        }
      ]);
      addNotification(
        "New Workspace Activated",
        `Created new workspace project: "${newProjectName}"`,
        "project"
      );
      setNewProjectName("");
      setShowAddProject(false);
    }
  };

  const [selectedEmailId, setSelectedEmailId] = useState("1");
  const [inboxSearch, setInboxSearch] = useState("");

  const handleAdvanceCourse = (courseId: string) => {
    setCourses(courses.map(c => {
      if (c.id === courseId) {
        const nextProgress = Math.min(c.progress + 10, 100);
        return { ...c, progress: nextProgress };
      }
      return c;
    }));
  };

  const toggleLessonCompleted = (courseId: string, index: number) => {
    setCourses(prevCourses => prevCourses.map(course => {
      if (course.id === courseId) {
        const newCompleted = index < course.completedSessions ? index : index + 1;
        const newProgress = Math.round((newCompleted / course.totalSessions) * 100);
        let newStatus = course.status;
        if (newCompleted === 0) {
          newStatus = "Waiting to Start";
        } else if (newCompleted === course.totalSessions) {
          newStatus = "Completed";
        } else {
          newStatus = "Active";
        }
        return {
          ...course,
          completedSessions: newCompleted,
          progress: newProgress,
          status: newStatus,
          nextSession: newCompleted === course.totalSessions ? "None (Course Completed)" : course.nextSession
        };
      }
      return course;
    }));
  };

  const renderStatusBadge = (status: "Active" | "Completed" | "Waiting to Start") => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Completed
          </span>
        );
      case "Waiting to Start":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Waiting to Start
          </span>
        );
      default:
        return null;
    }
  };

  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);

  const handleUploadAssignment = (id: string) => {
    setSubmittingAssignmentId(id);
    setTimeout(() => {
      setAssignments(assignments.map(a => {
        if (a.id === id) {
          addNotification(
            "Assignment Submitted Successfully",
            `Your work for "${a.title}" was received for review.`,
            "assignment",
            id
          );
          return { ...a, status: "Submitted", grade: "Pending Review" };
        }
        return a;
      }));
      setSubmittingAssignmentId(null);
    }, 1200);
  };

  // Achievements interactive state
  const [streak, setStreak] = useState(5);
  const [xp, setXp] = useState(2450);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [badges, setBadges] = useState([
    { id: "1", title: "React Master", description: "Successfully completed 5 React lessons", unlocked: true, icon: "⚛️" },
    { id: "2", title: "Pixel Perfect", description: "Styled a UI component with pristine contrast ratios", unlocked: true, icon: "🎨" },
    { id: "3", title: "First Submission", description: "Submitted your first course assignment", unlocked: false, icon: "📤" },
    { id: "4", title: "AI Whisperer", description: "Generated 10 speaking point outlines with Prodify AI", unlocked: true, icon: "🤖" },
  ]);

  const handleCheckIn = () => {
    if (!hasCheckedInToday) {
      setStreak(prev => prev + 1);
      setXp(prev => prev + 150);
      setHasCheckedInToday(true);
      // Unlock badge if streak becomes 6
      setBadges(badges.map(b => b.id === "3" ? { ...b, unlocked: true } : b));
      addNotification(
        "Streak Level Up! 🔥",
        `Claimed daily check-in bonus! Streak: ${streak + 1} Days, XP: +150`,
        "milestone"
      );
    }
  };

  // Calendar interactive state
  const [calendarEvents, setCalendarEvents] = useState([
    { id: "1", title: "One-on-One Meeting with Counselor", time: "10:00 - 11:00 am", date: "Mon 07", desc: "Brief status update regarding course curriculum mockups." },
    { id: "2", title: "Syllabus Review Session", time: "2:00 - 3:30 pm", date: "Tue 08", desc: "Deep dive review with Dr. Sarah Vance." },
    { id: "3", title: "ML Study Group", time: "6:00 - 7:30 pm", date: "Thu 10", desc: "Peer session covering Gradient Descent formulas." },
  ]);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingTime, setNewMeetingTime] = useState("1:00 - 2:00 pm");
  const [newMeetingDesc, setNewMeetingDesc] = useState("");

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMeetingTitle.trim()) {
      const activeDayObj = daysOfWeek[activeDayIndex];
      const newEv = {
        id: Date.now().toString(),
        title: newMeetingTitle,
        time: newMeetingTime,
        date: `${activeDayObj.day} ${activeDayObj.num}`,
        desc: newMeetingDesc || "No description provided."
      };
      setCalendarEvents([...calendarEvents, newEv]);
      addNotification(
        "New Meeting Scheduled",
        `Scheduled "${newMeetingTitle}" on July ${activeDayObj.num}.`,
        "course"
      );
      setNewMeetingTitle("");
      setNewMeetingDesc("");
    }
  };

  // Profile Image validation, crop, resize and storage removal with zoom & rotate
  const processProfileImageWithCrop = (file: File, zoom: number, rotate: number) => {
    // 1. Verify file size is <= 2MB
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("File size exceeds 2 MB limit.");
      showCustomToast("File size exceeds 2 MB limit.", "warning");
      return;
    }

    // 2. Verify file format (JPG, PNG, WEBP)
    const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validFormats.includes(file.type)) {
      setPhotoError("Unsupported format. Please upload JPG, PNG, or WEBP.");
      showCustomToast("Unsupported format. Please upload JPG, PNG, or WEBP.", "warning");
      return;
    }

    setPhotoError(null);
    setIsPhotoUploading(true);
    setPhotoUploadProgress(0);

    // Simulate an asynchronous upload progress bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setPhotoUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Complete upload, read and apply crop via HTML canvas
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const size = 256;
            canvas.width = size;
            canvas.height = size;

            // Fill canvas background
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, size, size);

            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.rotate((rotate * Math.PI) / 180);
            
            // Draw centered crop and apply scaling zoom factor
            const minDimension = Math.min(img.width, img.height);
            const sx = (img.width - minDimension) / 2;
            const sy = (img.height - minDimension) / 2;

            ctx.drawImage(
              img,
              sx,
              sy,
              minDimension,
              minDimension,
              (-size / 2) * zoom,
              (-size / 2) * zoom,
              size * zoom,
              size * zoom
            );
            ctx.restore();

            const base64Image = canvas.toDataURL("image/webp", 0.85);
            setDraftProfilePic(base64Image);
            setIsPhotoUploading(false);
            setPhotoUploadProgress(null);
            showCustomToast("Photo uploaded and cropped successfully!", "success");
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }, 200);
  };

  // Profile Save handler
  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      localStorage.setItem("userProfilePic", draftProfilePic);
      localStorage.setItem("userBio", draftBio);
      
      setProfilePic(draftProfilePic);
      setProfileBio(draftBio);
      
      setIsSavingProfile(false);
      setSettingsSuccess(true);
      showCustomToast("Profile settings saved successfully!", "success");
      setTimeout(() => setSettingsSuccess(false), 3000);
    }, 1000);
  };

  // Appearance Tab Save handler
  const handleSaveAppearance = () => {
    setIsSavingAppearance(true);
    setTimeout(() => {
      localStorage.setItem("portalTheme", draftTheme);
      setTheme(draftTheme);
      setIsSavingAppearance(false);
      setSettingsSuccess(true);
      showCustomToast("Appearance settings saved successfully!", "success");
      setTimeout(() => setSettingsSuccess(false), 3000);
    }, 1000);
  };

  // Password complexity check
  const validatePassword = (pass: string) => {
    const hasMinLen = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    return {
      hasMinLen,
      hasUpper,
      hasLower,
      hasNumber,
      isValid: hasMinLen && hasUpper && hasLower && hasNumber
    };
  };

  // Security Tab Save handler
  const handleSaveSecurity = () => {
    const errors: Record<string, string> = {};

    if (!isGoogleAccount && !secCurrentPassword) {
      errors.currentPassword = "Current password is required to change password.";
    }

    if (!secNewPassword) {
      errors.newPassword = "New password is required.";
    } else {
      const validation = validatePassword(secNewPassword);
      if (!validation.hasMinLen) {
        errors.newPassword = "Password must contain at least 8 characters.";
      } else if (!validation.hasUpper) {
        errors.newPassword = "Password must include at least one uppercase letter.";
      } else if (!validation.hasLower) {
        errors.newPassword = "Password must include at least one lowercase letter.";
      } else if (!validation.hasNumber) {
        errors.newPassword = "Password must include at least one number.";
      }
    }

    if (secNewPassword && !secConfirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (secNewPassword && secNewPassword !== secConfirmPassword) {
      errors.confirmPassword = "Password confirmation does not match.";
    }

    if (Object.keys(errors).length > 0) {
      setSecuritySubmittedErrors(errors);
      const firstErrorMsg = Object.values(errors)[0];
      showCustomToast(firstErrorMsg, "warning");
      return;
    }

    setSecuritySubmittedErrors({});
    setIsSavingSecurity(true);
    setTimeout(() => {
      setSecCurrentPassword("");
      setSecNewPassword("");
      setSecConfirmPassword("");
      setIsSavingSecurity(false);
      setSettingsSuccess(true);
      showCustomToast(isGoogleAccount ? "Password set successfully for your Google Sign-In!" : "Password updated successfully!", "success");
      setTimeout(() => setSettingsSuccess(false), 3000);
    }, 1200);
  };

  // Check if there are any unsaved changes in the active settings tab
  const hasUnsavedChanges = () => {
    if (settingsActiveTab === "Account") {
      return (
        firstName !== (localStorage.getItem("userFirstName") || "Courtney") ||
        lastName !== (localStorage.getItem("userLastName") || "Henry") ||
        username !== (localStorage.getItem("userSavedUsername") || "courtney_h") ||
        emailAddress !== (localStorage.getItem("userEmail") || "schoepplake@gmail.com") ||
        phoneNumber !== (localStorage.getItem("userPhone") || "9123456789")
      );
    }
    if (settingsActiveTab === "Profile") {
      return draftProfilePic !== profilePic || draftBio !== profileBio;
    }
    if (settingsActiveTab === "Appearance") {
      return draftTheme !== theme;
    }
    if (settingsActiveTab === "Security") {
      return secCurrentPassword !== "" || secNewPassword !== "" || secConfirmPassword !== "";
    }
    return false;
  };

  // Unified global cancel / discard changes
  const handleGlobalCancel = () => {
    setShowCancelConfirm(false);
    if (settingsActiveTab === "Account") {
      setFirstName(localStorage.getItem("userFirstName") || "Courtney");
      setLastName(localStorage.getItem("userLastName") || "Henry");
      setUsername(localStorage.getItem("userSavedUsername") || localStorage.getItem("userUsername") || "courtney_h");
      setSavedUsername(localStorage.getItem("userSavedUsername") || localStorage.getItem("userUsername") || "courtney_h");
      setEmailAddress(localStorage.getItem("userEmail") || "schoepplake@gmail.com");
      setPhoneNumber(localStorage.getItem("userPhone") || "9123456789");
      setCountryCode("IR");
      setAccountSubmittedErrors({});
      showCustomToast("Account changes discarded.", "info");
    } else if (settingsActiveTab === "Profile") {
      setDraftProfilePic(profilePic);
      setDraftBio(profileBio);
      setIsEditingPhoto(false);
      setCropZoom(1);
      setCropRotate(0);
      setPhotoError(null);
      showCustomToast("Profile changes discarded.", "info");
    } else if (settingsActiveTab === "Appearance") {
      setDraftTheme(theme);
      showCustomToast("Appearance changes discarded.", "info");
    } else if (settingsActiveTab === "Security") {
      setSecCurrentPassword("");
      setSecNewPassword("");
      setSecConfirmPassword("");
      showCustomToast("Security changes discarded.", "info");
    }
  };

  // Triggers checking unsaved changes and prompting the confirmation modal
  const clickCancel = () => {
    if (hasUnsavedChanges()) {
      setShowCancelConfirm(true);
    } else {
      handleGlobalCancel();
    }
  };

  // Unified global save handler
  const handleGlobalSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (settingsActiveTab === "Account") {
      handleSaveAccount({ preventDefault: () => {} } as any);
    } else if (settingsActiveTab === "Profile") {
      handleSaveProfile();
    } else if (settingsActiveTab === "Appearance") {
      handleSaveAppearance();
    } else if (settingsActiveTab === "Security") {
      handleSaveSecurity();
    }
  };

  // Account Tab Save handler
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingAccount) return;

    const errors: Record<string, string> = {};

    // 1. First Name
    const fName = firstName.trim();
    if (!fName) {
      errors.firstName = "First name is required.";
    } else if (fName.length < 3) {
      errors.firstName = "First name must contain at least 3 characters.";
    } else if (fName.length > 50) {
      errors.firstName = "First name cannot exceed 50 characters.";
    }

    // 2. Last Name
    const lName = lastName.trim();
    if (!lName) {
      errors.lastName = "Last name is required.";
    } else if (lName.length < 3) {
      errors.lastName = "Last name must contain at least 3 characters.";
    } else if (lName.length > 50) {
      errors.lastName = "Last name cannot exceed 50 characters.";
    }

    // 3. Username
    const uName = username.trim();
    if (!uName) {
      errors.username = "Username handle is required.";
    } else {
      const usernameRegex = /^[A-Za-z0-9_.]+$/;
      if (!usernameRegex.test(uName)) {
        errors.username = "Username can only contain English letters, numbers, underscores, and periods.";
      } else {
        const takenUsernames = ["admin", "root", "administrator", "professor", "marcus", "vance", "henry", "scholar", "alice", "bob", "schoepplake"];
        if (takenUsernames.includes(uName.toLowerCase()) && uName.toLowerCase() !== (localStorage.getItem("userSavedUsername") || "courtney_h").toLowerCase()) {
          errors.username = "This username is already in use.";
        }
      }
    }

    // 4. Email Address
    const email = emailAddress.trim();
    if (!email) {
      errors.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Invalid email format.";
      } else {
        const takenEmails = ["taken@rozacademy.com", "admin@rozacademy.com", "professor@rozacademy.com", "marcus@rozacademy.com", "vance@rozacademy.com"];
        if (takenEmails.includes(email.toLowerCase()) && email.toLowerCase() !== (localStorage.getItem("userEmail") || "schoepplake@gmail.com").toLowerCase()) {
          errors.email = "This email is already registered to another account.";
        }
      }
    }

    // 5. Phone Number (Iran format)
    const phoneErr = validateIranPhone(phoneNumber);
    if (phoneErr) {
      errors.phoneNumber = phoneErr;
    }

    if (Object.keys(errors).length > 0) {
      setAccountSubmittedErrors(errors);
      const firstErrorMsg = Object.values(errors)[0];
      showCustomToast(firstErrorMsg, "warning");
      return;
    }

    setAccountSubmittedErrors({});
    setIsSavingAccount(true);

    setTimeout(() => {
      localStorage.setItem("userFirstName", firstName);
      localStorage.setItem("userLastName", lastName);
      localStorage.setItem("userUsername", username);
      localStorage.setItem("userSavedUsername", username);
      localStorage.setItem("userEmail", emailAddress);
      localStorage.setItem("userPhone", phoneNumber);
      localStorage.setItem("userCountryCode", "IR");

      if (username !== savedUsername) {
        const todayStr = "2026-07-01";
        localStorage.setItem("userLastUsernameChangeDate", todayStr);
        setLastUsernameChangeDate(todayStr);
        setSavedUsername(username);
        setAdminApproved(false);
      }

      setIsSavingAccount(false);
      setSettingsSuccess(true);
      showCustomToast("Account settings saved successfully!", "success");
      setTimeout(() => setSettingsSuccess(false), 3000);
    }, 1200);
  };

  // Unified list of sidebar navigation items (stating types cleanly)
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inbox", label: "Inbox", icon: Inbox, badge: emails.filter(e => !e.read).length },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: CheckSquare },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const getActiveMode = () => {
    if (draftTheme === "system") {
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      }
      return "dark";
    }
    return draftTheme;
  };

  return (
    <div className={`min-h-screen w-full bg-[#030304] text-white flex relative overflow-hidden font-sans ${getActiveMode() === "light" ? "theme-light text-slate-900" : ""}`}>
      {/* Background glowing elements */}
      {ambientGlow && (
        <>
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[300px] pointer-events-none blur-[150px] bg-gradient-to-tr from-indigo-500/[0.02] to-cyan-500/[0.02] rounded-full z-0" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] pointer-events-none blur-[150px] bg-gradient-to-tr from-[#10b981]/[0.02] to-emerald-600/[0.015] rounded-full z-0" />
        </>
      )}

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="hidden md:flex flex-col w-64 bg-[#060609]/95 backdrop-blur-md border-r border-white/[0.05] h-screen sticky top-0 shrink-0 z-20 p-5 justify-between">
        <div className="space-y-6">
          
          {/* User profile details header at top of sidebar */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <button 
                id="sidebar-profile-trigger"
                onClick={() => setIsProfileModalOpen(true)}
                className="relative group focus:outline-none"
                title="View / Edit Profile Picture"
              >
                <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 p-[1.5px] flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105">
                  <div className="h-full w-full rounded-full bg-[#0d0d12] flex items-center justify-center overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs font-bold text-white">CH</span>
                    )}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border border-[#060609] shadow-sm animate-pulse" />
              </button>
              
              <div className="flex flex-col text-left">
                <span className="font-sans text-xs font-semibold text-white/90 leading-tight block truncate max-w-[110px]">{profileName}</span>
                <span className="font-sans text-[9px] text-emerald-400 font-bold tracking-wider uppercase leading-none mt-1">Online</span>
              </div>
            </div>
            
            {/* Quick logout trigger icon */}
            <button 
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.05]"
              title="Logout Account"
            >
              <LogOut size={14} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <span className="px-2 text-[9px] font-bold text-white/30 tracking-widest uppercase block mb-3">PORTAL MENU</span>
            
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl font-sans text-xs font-semibold relative transition-all duration-300 ${
                    isActive 
                      ? "text-white bg-white/[0.04] border border-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.4)]" 
                      : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-pill"
                      className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-indigo-500 to-emerald-400 rounded-r-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <IconComp size={15} className={`${isActive ? "text-indigo-400" : "opacity-70"}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {"badge" in item && item.badge && item.badge > 0 ? (
                    <span className="bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Go-Home shortcut at bottom of list */}
          <div className="pt-2 border-t border-white/[0.03]">
            <button 
              onClick={onGoHome}
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white/40 hover:text-white/80 hover:bg-white/[0.02] transition-all"
            >
              <ArrowLeft size={13} className="opacity-70" />
              <span>Back to Landing</span>
            </button>
          </div>

        </div>

        {/* BOTTOM SIDEBAR AREA */}
        <div className="space-y-4">
          {/* Prodify Branding */}
          <div className="p-4 rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent text-left relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 h-10 w-10 pointer-events-none blur-xl bg-indigo-500/20 rounded-full" />
            <span className="font-sans text-xs font-black text-white block mb-1 uppercase tracking-wider">ROOZZERO</span>
            <p className="font-sans text-[10px] text-white/35 leading-relaxed font-normal">
              Premium client academic environment. Optimized layout.
            </p>
          </div>
        </div>
      </aside>

      {/* MOBILE COLLAPSIBLE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-[#060609] border-r border-white/10 p-5 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[10px] font-black tracking-widest text-white/40 uppercase">NAVIGATION</span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg border border-white/10 bg-white/[0.02] text-white/60 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Profile detail at top of mobile menu */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="relative focus:outline-none"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 p-[1.5px] flex items-center justify-center">
                        <div className="h-full w-full rounded-full bg-[#0d0d12] flex items-center justify-center overflow-hidden">
                          {profilePic ? (
                            <img src={profilePic} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-xs font-bold text-white">CH</span>
                          )}
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-[#060609]" />
                    </button>
                    <div className="flex flex-col text-left">
                      <span className="font-sans text-xs font-bold text-white leading-tight block truncate max-w-[120px]">{profileName}</span>
                      <span className="font-sans text-[9px] text-emerald-400 font-bold tracking-wider uppercase leading-none mt-0.5">Online</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/[0.04] transition-all"
                  >
                    <LogOut size={14} />
                  </button>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  {sidebarItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl font-sans text-xs font-semibold relative transition-all ${
                          isActive 
                            ? "text-white bg-white/[0.04] border border-white/[0.05] shadow-lg" 
                            : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                        }`}
                      >
                        <IconComp size={15} className={`${isActive ? "text-indigo-400" : "opacity-70"}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {"badge" in item && item.badge && item.badge > 0 ? (
                          <span className="bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-white/[0.03]">
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onGoHome) onGoHome();
                    }}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white/40 hover:text-white/80 hover:bg-white/[0.02] transition-all"
                  >
                    <ArrowLeft size={13} className="opacity-70" />
                    <span>Back to Landing</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.01] text-left">
                <span className="font-sans text-[10px] font-bold text-white/50 block uppercase">ROOZZERO</span>
                <p className="font-sans text-[9px] text-white/30 leading-normal mt-1">Premium portal.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN MAIN CONTENT PANEL */}
      <main className="flex-1 min-h-screen overflow-y-auto pb-16 relative z-10 flex flex-col">
        
        {/* PREMIUM UNIFIED TOPBAR */}
        <header id="dashboard-topbar" className="sticky top-0 z-30 w-full border-b border-white/[0.05] bg-[#060609]/90 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.04] transition-all shrink-0"
              title="Open Navigation Menu"
              id="mobile-nav-toggle"
            >
              <Menu size={16} />
            </button>
            
            {/* Dynamic Date & Personalized Greeting */}
            <div className="flex flex-col text-left">
              <span className="font-sans text-[11px] font-normal text-white/40 tracking-wider uppercase font-mono leading-none">
                {formattedDate}
              </span>
              <h1 className="font-sans text-base sm:text-lg font-extrabold text-white tracking-tight leading-none mt-1">
                Hello, {profileName.split(" ")[0]}
              </h1>
            </div>
          </div>

          {/* AJAX Live Search Container */}
          <div ref={searchRef} className="flex-1 max-w-md relative mx-1 sm:mx-3">
            <div className="relative group">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search courses, projects, messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-full pl-9 pr-9 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/30 focus:bg-white/[0.04] focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <RefreshCw size={12} className="text-indigo-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Live Search dropdown */}
            <AnimatePresence>
              {isSearchDropdownOpen && searchQuery.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#09090e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1 max-h-[300px] overflow-y-auto"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-2.5 rounded-xl hover:bg-white/[0.04] transition-all flex items-start gap-3 text-left group"
                      >
                        <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-white/40 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all shrink-0">
                          {result.type === "course" && <BookOpen size={13} />}
                          {result.type === "project" && <Folder size={13} />}
                          {result.type === "message" && <Inbox size={13} />}
                          {result.type === "assignment" && <CheckSquare size={13} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-sans text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {highlightMatch(result.title, searchQuery)}
                          </h4>
                          <p className="font-sans text-[10px] text-white/40 truncate">
                            {highlightMatch(result.subtitle, searchQuery)}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center text-white/40 space-y-1.5">
                      <p className="font-sans text-xs font-semibold text-white/60">No results found</p>
                      <p className="text-[10px]">No matches found for "{searchQuery}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications Bell */}
          <div ref={notificationRef} className="relative shrink-0 flex items-center">
            <button
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="p-2.5 rounded-full border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20 transition-all relative"
              title="Notifications"
            >
              <Bell size={15} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className={`absolute top-0 right-0 h-4 min-w-[16px] px-1 bg-gradient-to-r from-red-500 to-pink-500 border border-[#060609] rounded-full flex items-center justify-center text-[8px] font-black text-white ${pulseBadge ? "animate-bounce scale-110 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : ""}`}>
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative z-10">{notifications.filter(n => !n.read).length}</span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            <AnimatePresence>
              {isNotificationDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-[#09090e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1"
                >
                  <div className="p-3 border-b border-white/[0.05] flex items-center justify-between">
                    <span className="font-sans text-[10px] font-bold text-white/40 tracking-wider uppercase">Latest Notifications</span>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <button
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                        className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[320px] overflow-y-auto py-1 space-y-1">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full p-2.5 rounded-xl hover:bg-white/[0.04] transition-all flex items-start gap-3 text-left border relative ${
                            !n.read 
                              ? "bg-white/[0.01] border-indigo-500/10" 
                              : "bg-transparent border-transparent"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/10 shrink-0 mt-0.5">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`font-sans text-xs truncate block ${!n.read ? "text-white font-bold" : "text-white/80"}`}>
                                {n.title}
                              </span>
                              <span className="font-mono text-[8px] text-white/30 shrink-0">{n.timestamp}</span>
                            </div>
                            <p className="font-sans text-[10px] text-white/40 truncate">
                              {n.preview}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center text-white/40 space-y-2">
                        <Bell size={20} className="mx-auto text-white/20 animate-pulse" />
                        <div className="space-y-0.5">
                          <p className="font-sans text-xs font-semibold text-white/60">No notifications</p>
                          <p className="text-[10px]">You are completely up to date!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* CONTAINER INSIDE MAIN */}
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 pt-8 sm:pt-10 space-y-8 relative z-10 text-left flex-1 w-full">

          {/* RENDERING DYNAMIC PORTAL PAGES */}
          {activeTab === "inbox" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mail list */}
              <div className="lg:col-span-1 bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-base font-extrabold text-white">Your Messages</h3>
                  <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {emails.filter(e => !e.read).length} Unread
                  </span>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="text"
                    placeholder="Search inbox..."
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  {(() => {
                    const filteredEmails = emails.filter(email => 
                      email.subject.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                      email.from.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                      email.body.toLowerCase().includes(inboxSearch.toLowerCase())
                    );
                    if (filteredEmails.length === 0) {
                      return (
                        <div className="text-center py-8 text-white/30 text-xs font-sans">
                          No messages found.
                        </div>
                      );
                    }
                    return filteredEmails.map((email) => (
                      <button
                        key={email.id}
                        onClick={() => {
                          setSelectedEmailId(email.id);
                          setEmailList(emails.map(e => e.id === email.id ? { ...e, read: true } : e));
                        }}
                        className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                          selectedEmailId === email.id
                            ? "bg-white/[0.04] border-white/10"
                            : "bg-transparent border-transparent hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-sans text-xs font-bold text-white block truncate max-w-[130px]">{email.from}</span>
                          <span className="font-mono text-[9px] text-white/40">{email.date}</span>
                        </div>
                        <span className={`font-sans text-xs block truncate ${email.read ? "text-white/60 font-normal" : "text-white font-bold"}`}>
                          {email.subject}
                        </span>
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {/* Message Details */}
              <div className="lg:col-span-2 bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 space-y-6">
                {(() => {
                  const currentEmail = emails.find(e => e.id === selectedEmailId) || emails[0];
                  if (!currentEmail) return <div className="text-white/40 text-sm text-left">No email selected.</div>;
                  return (
                    <>
                      <div className="border-b border-white/[0.05] pb-4 space-y-2 text-left animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs text-white/40">From: <strong className="text-white">{currentEmail.from}</strong></span>
                          <span className="font-mono text-[10px] text-white/40">{currentEmail.date}</span>
                        </div>
                        <h2 className="font-sans text-lg font-black text-white leading-tight">{currentEmail.subject}</h2>
                      </div>
                      <div className="bg-white/[0.01] border border-white/[0.03] p-5 rounded-2xl min-h-[160px] text-left animate-fade-in">
                        <p className="font-sans text-xs text-white/80 leading-relaxed whitespace-pre-line">{currentEmail.body}</p>
                      </div>

                      {/* Attachments rendering if available */}
                      {currentEmail.attachments && currentEmail.attachments.length > 0 && (
                        <div className="pt-4 border-t border-white/[0.05] space-y-2.5 mt-4 text-left animate-fade-in">
                          <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block font-bold">Attachments ({currentEmail.attachments.length})</span>
                          <div className="flex flex-wrap gap-2.5">
                            {currentEmail.attachments.map((att, i) => (
                              <button
                                type="button"
                                key={i}
                                onClick={() => showCustomToast(`Downloading "${att.name}"...`, "success")}
                                className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-sans transition-colors bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 cursor-pointer group"
                              >
                                {att.type === "PDF" ? (
                                  <FileText size={13} className="text-rose-400 group-hover:scale-110 transition-transform" />
                                ) : (
                                  <FileImage size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="underline font-medium">{att.name}</span>
                                {att.size && <span className="text-[10px] text-white/30 font-mono font-normal">({att.size})</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === "courses" && selectedCourseId && (() => {
            const selectedCourse = courses.find(c => c.id === selectedCourseId);
            if (!selectedCourse) return null;

            return (
              <div className="space-y-6 animate-fade-in text-left pb-10 w-full relative">
                {/* Premium Animated Custom Toast Notifications */}
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
                  <AnimatePresence>
                    {customToasts.map((toast) => (
                      <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="pointer-events-auto w-full p-4 rounded-2xl bg-black/90 border border-white/10 shadow-2xl backdrop-blur-xl flex items-start gap-3 text-left"
                      >
                        <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                          toast.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : toast.type === "warning"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        }`}>
                          <Sparkles size={12} className={toast.type === "success" ? "" : "animate-pulse"} />
                        </div>
                        <p className="text-xs font-semibold text-white/95 leading-relaxed flex-1">
                          {toast.message}
                        </p>
                        <button
                          onClick={() => setCustomToasts(prev => prev.filter(t => t.id !== toast.id))}
                          className="text-white/20 hover:text-white/60 transition-colors text-[10px] uppercase font-bold tracking-wider shrink-0"
                        >
                          Dismiss
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Course Header */}
                <div className="space-y-4">
                  {/* Back button */}
                  <button
                    onClick={() => {
                      setSelectedCourseId(null);
                      setCourseDetailsTab("Overview"); // Reset to Overview tab when navigating back
                    }}
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white font-sans text-xs font-semibold uppercase tracking-wider transition-colors self-start cursor-pointer group"
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Courses</span>
                  </button>

                  {/* Course Title */}
                  <div className="space-y-2 text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
                      {selectedCourse.instructor}
                    </span>
                    <h1 className="font-sans text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                      {selectedCourse.title}
                    </h1>
                  </div>

                  {/* Tab Navigation - Sticky on desktop */}
                  <div className="lg:sticky lg:top-0 z-30 backdrop-blur-md lg:bg-[#040407]/85 py-3 border-b border-white/[0.04] -mx-4 px-4 sm:-mx-8 sm:px-8 overflow-x-auto scrollbar-none flex items-center gap-1.5 transition-all">
                    {[
                      "Overview",
                      "Schedule",
                      "Assignments",
                      "Resources",
                      "Discussion",
                      "Feedback",
                      "Attendance"
                    ].map((tab) => {
                      const isActive = courseDetailsTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setCourseDetailsTab(tab)}
                          className="relative px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer"
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeCourseTabIndicator"
                              className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-white" : "text-white/40 hover:text-white/80"}`}>
                            {tab}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Contents */}
                <div className="pt-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={courseDetailsTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="w-full"
                    >
                      {/* OVERVIEW TAB */}
                      {courseDetailsTab === "Overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          
                          {/* Left Column (Main details & syllabus) */}
                          <div className="lg:col-span-7 space-y-6">
                            
                            {/* Course Information Card */}
                            <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                              <div className="absolute top-0 right-0 h-32 w-32 pointer-events-none blur-3xl bg-indigo-500/[0.02] rounded-full" />
                              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest text-left">Course Information</h3>
                              
                              <div className="space-y-2 text-left">
                                <h2 className="font-sans text-xl font-black text-white">{selectedCourse.title}</h2>
                                <p className="text-xs text-white/50 leading-relaxed font-medium">
                                  {selectedCourse.title === "Advanced React & Architecture" 
                                    ? "Master modern frontend engineering using Vite, clean react states, fiber rendering engine principles, custom lifecycle hooks, concurrent modes, performance auditing, and enterprise-grade system design."
                                    : selectedCourse.title === "Premium Dark Design Systems"
                                    ? "Unlock the secrets of high-fidelity user interface aesthetics. Delve into Swiss grids, golden ratios, tailwind custom variable workflows, micro-interactions, dark-mode styling principles, and modular system layouts."
                                    : "Dive deep into the mathematical foundations of machine learning. Implement and train models from scratch covering linear regression, gradient descent algorithms, multi-layer perceptrons, neural net architectures, and modern transformers."}
                                </p>
                              </div>

                              <div className="flex items-center gap-6 pt-4 border-t border-white/[0.04]">
                                <div>
                                  <span className="block text-[10px] text-white/30 uppercase tracking-wider font-bold mb-0.5 text-left">Faculty Lead</span>
                                  <span className="text-xs font-bold text-indigo-400 block text-left">{selectedCourse.instructor}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] text-white/30 uppercase tracking-wider font-bold mb-0.5 text-left">Curriculum Duration</span>
                                  <span className="text-xs font-semibold text-white/80 block text-left">{selectedCourse.totalSessions} Sessions</span>
                                </div>
                              </div>
                            </div>

                            {/* Course Progress Section */}
                            <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                              <div className="absolute top-0 right-0 h-32 w-32 pointer-events-none blur-3xl bg-emerald-500/[0.02] rounded-full" />
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Course Progress</h3>
                                <div className="flex items-baseline gap-1">
                                  <span className="font-mono text-xl font-black text-emerald-400">{selectedCourse.progress}%</span>
                                  <span className="text-[10px] text-white/30">Completed</span>
                                </div>
                              </div>
                              <div className="h-3 w-full bg-white/[0.05] rounded-full overflow-hidden relative">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${selectedCourse.progress}%` }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full relative"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
                                </motion.div>
                              </div>
                              <div className="flex justify-between items-center mt-3 text-[10px] text-white/40 font-bold">
                                <span>Session 0</span>
                                <span>{selectedCourse.completedSessions} of {selectedCourse.totalSessions} Sessions Completed</span>
                                <span>Session {selectedCourse.totalSessions}</span>
                              </div>
                            </div>

                            {/* Course Syllabus Accordion */}
                            <div className="space-y-3 text-left">
                              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Academic Syllabus ({selectedCourse.totalSessions} Sessions)</h3>
                              <div className="space-y-2">
                                {selectedCourse.lessons.map((les, index) => {
                                  const isCompleted = index < selectedCourse.completedSessions;
                                  const isOpen = expandedSessions.includes(index);
                                  
                                  return (
                                    <div 
                                      key={index} 
                                      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                        isCompleted 
                                          ? "bg-emerald-500/[0.01] border-emerald-500/10 hover:border-emerald-500/20" 
                                          : isOpen
                                          ? "bg-indigo-500/[0.01] border-indigo-500/20"
                                          : "bg-[#08080c] border-white/[0.06] hover:border-white/10"
                                      }`}
                                    >
                                      {/* Accordion Trigger Header */}
                                      <button
                                        onClick={() => {
                                          setExpandedSessions(prev => 
                                            prev.includes(index) 
                                              ? prev.filter(i => i !== index) 
                                              : [...prev, index]
                                          );
                                        }}
                                        className="w-full p-4 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border transition-all ${
                                            isCompleted 
                                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                              : isOpen
                                              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                                              : "bg-white/[0.02] border-white/10 text-white/40"
                                          }`}>
                                            {index + 1}
                                          </div>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                                            <span className={`font-sans text-xs sm:text-sm font-bold transition-all ${
                                              isCompleted 
                                                ? "text-emerald-400 line-through" 
                                                : "text-white/90"
                                            }`}>
                                              {les}
                                            </span>
                                            {isCompleted && (
                                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[8px] font-extrabold uppercase tracking-widest text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                                                Completed
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="text-white/40 hover:text-white transition-colors shrink-0">
                                          {isOpen ? (
                                            <ChevronDown size={16} className="text-indigo-400" />
                                          ) : (
                                            <ChevronRight size={16} />
                                          )}
                                        </div>
                                      </button>

                                      {/* Accordion Expandable Content with smooth transition */}
                                      <AnimatePresence initial={false}>
                                        {isOpen && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                            className="overflow-hidden border-t border-white/[0.04] bg-[#050508]/40"
                                          >
                                            <div className="p-4 space-y-3 text-xs leading-relaxed text-white/60">
                                              <p className="font-medium text-white/70">
                                                {isCompleted 
                                                  ? `You completed this session successfully. Under the instruction of ${selectedCourse.instructor}, you mastered the fundamentals, did hands-on code labs, and finished all required exercises.`
                                                  : `This session covers depth investigations of ${les.toLowerCase()}. Active preparation is required. Prepare any reading materials and bring your questions to class.`}
                                              </p>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[10px] border-t border-white/[0.02]">
                                                <div className="space-y-1">
                                                  <span className="block text-white/30 uppercase tracking-wider font-bold">Objectives</span>
                                                  <ul className="list-disc pl-3.5 space-y-0.5 font-medium">
                                                    <li>Conceptual understanding & architectural mapping</li>
                                                    <li>Live-coding exercises and system modeling</li>
                                                    <li>Interactive problem solving & peer review</li>
                                                  </ul>
                                                </div>
                                                <div className="space-y-1">
                                                  <span className="block text-white/30 uppercase tracking-wider font-bold">Assigned Materials</span>
                                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/5 font-mono text-[9px] text-white/70">Slides Lecture.pdf</span>
                                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/5 font-mono text-[9px] text-white/70">Github Codebase Repo</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Right Column (Dates, Contacts, Next Class) */}
                          <div className="lg:col-span-5 space-y-6">
                            
                            {/* Course Dates Card */}
                            <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest text-left">Academic Dates</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-1.5 text-left">
                                  <div className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                    <CalendarIcon size={12} />
                                  </div>
                                  <div>
                                    <span className="block text-[9px] text-white/30 uppercase tracking-wider font-bold">Term Begins</span>
                                    <span className="text-xs font-bold text-white/90">{selectedCourse.startDate}</span>
                                  </div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-1.5 text-left">
                                  <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <CalendarIcon size={12} />
                                  </div>
                                  <div>
                                    <span className="block text-[9px] text-white/30 uppercase tracking-wider font-bold">Term Concludes</span>
                                    <span className="text-xs font-bold text-white/90">{selectedCourse.endDate}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Instructor Contact Card */}
                            <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest text-left">Instructor Contact</h3>
                              {(() => {
                                const getTelegramLink = (instructor: string) => {
                                  if (instructor.includes("Sarah")) return { label: "@sarahvance_phd", url: "https://t.me/sarahvance_phd" };
                                  if (instructor.includes("Marcus")) return { label: "@marcus_design", url: "https://t.me/marcus_design" };
                                  return { label: "@alan_turing", url: "https://t.me/alan_turing" };
                                };
                                const tg = getTelegramLink(selectedCourse.instructor);
                                return (
                                  <a 
                                    href={tg.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-center justify-between group cursor-pointer text-left"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Send size={15} className="-rotate-45" />
                                      </div>
                                      <div>
                                        <span className="block text-[10px] text-white/30 uppercase tracking-wider font-bold">Direct Telegram Chat</span>
                                        <span className="text-xs font-bold text-sky-400 font-mono">{tg.label}</span>
                                      </div>
                                    </div>
                                    <ExternalLink size={12} className="text-white/25 group-hover:text-white/60 transition-colors" />
                                  </a>
                                );
                              })()}
                            </div>

                            {/* Next Class */}
                            <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 sm:p-6 space-y-4 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                              <div className="absolute top-0 right-0 h-24 w-24 pointer-events-none blur-3xl bg-indigo-500/[0.03] rounded-full" />
                              <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest text-left">Next Class</h3>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
                                  Live Room
                                </span>
                              </div>
                              
                              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/70">
                                    <Clock size={14} />
                                  </div>
                                  <div className="text-left">
                                    <span className="block text-[9px] text-white/30 uppercase tracking-wider font-bold">Scheduled Time</span>
                                    <span className="text-sm font-black text-white">Saturday — 18:00</span>
                                  </div>
                                </div>
                              </div>

                              {/* Class status simulation switcher */}
                              <div className="p-3 rounded-2xl bg-[#0c0c14]/40 border border-white/[0.03] flex items-center justify-between gap-3 text-xs">
                                <div className="text-left">
                                  <span className="block text-[9px] text-white/30 uppercase tracking-wider font-bold">Simulator Controls</span>
                                  <span className="text-[10px] text-white/60 font-medium font-sans block text-left">Is Scheduled Time Right Now?</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setIsClassNowSimulated(!isClassNowSimulated);
                                    showCustomToast(
                                      `Simulation toggled: ${!isClassNowSimulated ? "Class time is active!" : "Class time is inactive."}`, 
                                      "info"
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all border shrink-0 cursor-pointer ${
                                    isClassNowSimulated 
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                      : "bg-white/[0.03] border-white/10 text-white/40 hover:text-white/70"
                                  }`}
                                >
                                  {isClassNowSimulated ? "Active Now" : "Inactive"}
                                </button>
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  if (!isClassNowSimulated) {
                                    showCustomToast(
                                      "Your class has not started yet. Please wait until the scheduled time.",
                                      "warning"
                                    );
                                  } else {
                                    showCustomToast(
                                      "Your instructor is waiting for you. Please join the class from the Schedule tab.",
                                      "success"
                                    );
                                  }
                                }}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <span>Join Class</span>
                                <ArrowRight size={13} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCHEDULE TAB */}
                      {courseDetailsTab === "Schedule" && (() => {
                        const currentCourseSessions = courseSessions[selectedCourse.id] || [];
                        return (
                          <div className="space-y-6 text-left animate-fade-in">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <h2 className="font-sans text-xl font-black text-white">Class Schedule</h2>
                                <p className="text-xs text-white/40">Overview of all upcoming live stream interactive sessions.</p>
                              </div>
                              
                              {/* Simulator control toggler */}
                              <button
                                onClick={() => {
                                  setShowSimulatorPanel(!showSimulatorPanel);
                                  showCustomToast(
                                    `Simulator Overlay Controls ${!showSimulatorPanel ? "Enabled" : "Disabled"}`,
                                    "info"
                                  );
                                }}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                                  showSimulatorPanel
                                    ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                                    : "bg-[#0c0c14] border-white/[0.06] text-white/60 hover:text-white hover:border-white/12"
                                }`}
                              >
                                <div className={`h-2.5 w-2.5 rounded-full ${showSimulatorPanel ? "bg-indigo-400 animate-pulse" : "bg-white/20"}`} />
                                <span>{showSimulatorPanel ? "Disable Simulation Mode" : "Enable Simulation Mode"}</span>
                              </button>
                            </div>

                            {/* Global Simulation Options panel */}
                            <AnimatePresence>
                              {showSimulatorPanel && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden border border-indigo-500/20 bg-indigo-500/[0.02] rounded-3xl"
                                >
                                  <div className="p-5 space-y-4 text-xs">
                                    <div className="flex items-center gap-2 font-black text-indigo-400 uppercase tracking-widest text-[10px]">
                                      <Settings size={12} className="animate-spin" style={{ animationDuration: "12s" }} />
                                      <span>Instructor Action Simulation Deck</span>
                                    </div>
                                    <p className="text-white/60 leading-relaxed max-w-xl">
                                      Use these simulator controls to model the instructor's actions (cancelling/rescheduling) and dynamic system states (marking completed, or activating scheduled class hours) to watch the UI adapt instantly.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                      {/* Reschedule Date option */}
                                      <div className="space-y-1.5 text-left">
                                        <label className="block text-[9px] text-white/40 uppercase font-bold tracking-wider font-sans">
                                          Rescheduled Date
                                        </label>
                                        <input
                                          type="text"
                                          value={simRescheduleDate}
                                          onChange={(e) => setSimRescheduleDate(e.target.value)}
                                          className="w-full bg-[#050508] border border-white/10 rounded-xl px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-indigo-500/50"
                                          placeholder="e.g. July 05, 2026"
                                        />
                                      </div>

                                      {/* Reschedule Time option */}
                                      <div className="space-y-1.5 text-left">
                                        <label className="block text-[9px] text-white/40 uppercase font-bold tracking-wider font-sans">
                                          Rescheduled Time Slot
                                        </label>
                                        <input
                                          type="text"
                                          value={simRescheduleTime}
                                          onChange={(e) => setSimRescheduleTime(e.target.value)}
                                          className="w-full bg-[#050508] border border-white/10 rounded-xl px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-indigo-500/50"
                                          placeholder="e.g. 10:00 AM – 11:30 AM"
                                        />
                                      </div>

                                      {/* Cancellation Reason option */}
                                      <div className="space-y-1.5 text-left">
                                        <label className="block text-[9px] text-white/40 uppercase font-bold tracking-wider font-sans">
                                          Cancellation Reason
                                        </label>
                                        <input
                                          type="text"
                                          value={simCancelReason}
                                          onChange={(e) => setSimCancelReason(e.target.value)}
                                          className="w-full bg-[#050508] border border-white/10 rounded-xl px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-indigo-500/50"
                                          placeholder="e.g. Instructor attending React Global Summit."
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Responsive Sessions Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {currentCourseSessions.map((session) => {
                                const isCompleted = session.status === "Completed";
                                const isScheduled = session.status === "Scheduled";
                                const isCancelled = session.status === "Cancelled";
                                const isNotHeld = session.status === "Not Held";
                                const isClassActiveNow = simulatedNowSessions[session.id] || false;

                                return (
                                  <motion.div
                                    key={session.id}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    transition={{ duration: 0.2 }}
                                    className={`relative flex flex-col justify-between rounded-3xl border text-left p-5 shadow-lg transition-all overflow-hidden ${
                                      isCompleted
                                        ? "bg-emerald-500/[0.01] border-emerald-500/10 hover:border-emerald-500/20 opacity-80"
                                        : isCancelled
                                        ? "bg-rose-500/[0.01] border-rose-500/10 hover:border-rose-500/20"
                                        : isScheduled
                                        ? "bg-[#08080c] border-indigo-500/15 hover:border-indigo-500/30"
                                        : "bg-[#08080c] border-white/[0.05] hover:border-white/10"
                                    }`}
                                  >
                                    {/* Subtle completion visual overlay/accent */}
                                    {isCompleted && (
                                      <div className="absolute top-0 right-0 h-1 w-full bg-emerald-500/20" />
                                    )}

                                    <div>
                                      {/* Card Header (Session Number & Status Badge) */}
                                      <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/30">
                                          Session {session.sessionNum}
                                        </span>
                                        
                                        {/* Animated Status Badge Transitions */}
                                        <div className="transition-all duration-300">
                                          {isCompleted && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                                              Completed
                                            </span>
                                          )}
                                          {isScheduled && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/25 shadow-[0_0_8px_rgba(59,130,246,0.1)]">
                                              Scheduled
                                            </span>
                                          )}
                                          {isNotHeld && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-white/[0.04] text-white/40 border border-white/10">
                                              Not Held
                                            </span>
                                          )}
                                          {isCancelled && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.1)]">
                                              Cancelled
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Card Body (Topics / Lesson) */}
                                      <div className="space-y-4">
                                        <h4 className={`font-sans text-sm font-bold text-white tracking-tight leading-snug group-hover:text-indigo-200 transition-colors ${
                                          isCompleted ? "line-through text-white/60" : ""
                                        }`}>
                                          {session.topic}
                                        </h4>

                                        {/* Grid details */}
                                        <div className="grid grid-cols-1 gap-2 pt-4 text-[10px] text-white/50 leading-normal font-medium border-t border-white/[0.03] mt-3">
                                          <div className="flex items-center gap-2">
                                            <Clock size={11} className="text-indigo-400 shrink-0" />
                                            <span>Duration: {session.duration}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <CalendarIcon size={11} className="text-indigo-400 shrink-0" />
                                            <span>Date: {session.date}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock size={11} className="text-indigo-400 shrink-0" />
                                            <span>Time: {session.time}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Alert Callouts & Join class button footer */}
                                    <div className="mt-4 pt-1">
                                      {isCancelled && (
                                        <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-3 text-[10px] text-rose-300 leading-normal">
                                          <span className="font-extrabold block text-rose-400 mb-0.5">⚠️ Session Cancelled</span>
                                          <p className="font-medium text-white/60">
                                            {session.cancellationReason || "The instructor has cancelled this lecture session."}
                                          </p>
                                        </div>
                                      )}

                                      {/* Join Class button */}
                                      {(isScheduled || isNotHeld) && (
                                        <motion.button
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() => {
                                            if (!isClassActiveNow) {
                                              showCustomToast(
                                                "Your class has not started yet. Please wait until the scheduled time.",
                                                "warning"
                                              );
                                            } else {
                                              setActiveJoinSession(session);
                                            }
                                          }}
                                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                                        >
                                          <span>Join Class</span>
                                          <ArrowRight size={13} />
                                        </motion.button>
                                      )}
                                    </div>

                                    {/* Inline card simulation deck */}
                                    {showSimulatorPanel && (
                                      <div className="mt-5 pt-3.5 border-t border-dashed border-white/10 text-left space-y-2">
                                        <span className="block text-[8px] font-mono uppercase font-black text-indigo-400 tracking-wider">
                                          Card Simulator
                                        </span>
                                        <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold">
                                          <button
                                            onClick={() => handleCancelSessionSim(session.id)}
                                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 border border-rose-500/15 rounded-lg text-center transition-colors cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleRescheduleSessionSim(session.id)}
                                            className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 border border-blue-500/15 rounded-lg text-center transition-colors cursor-pointer"
                                          >
                                            Reschedule
                                          </button>
                                          <button
                                            onClick={() => handleCompleteSessionSim(session.id)}
                                            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/15 rounded-lg text-center transition-colors cursor-pointer"
                                          >
                                            Complete
                                          </button>
                                          <button
                                            onClick={() => handleResetSessionSim(session.id)}
                                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-lg text-center transition-colors cursor-pointer"
                                          >
                                            Reset
                                          </button>
                                        </div>

                                        {(isScheduled || isNotHeld) && (
                                          <button
                                            onClick={() => handleToggleClassTimeSim(session.id)}
                                            className={`w-full py-1 text-[8px] font-extrabold uppercase tracking-widest rounded-lg border text-center transition-colors cursor-pointer ${
                                              isClassActiveNow
                                                ? "bg-amber-500/15 border-amber-500/25 text-amber-400 font-sans"
                                                : "bg-white/[0.02] border-white/10 text-white/40 hover:text-white/60 font-sans"
                                            }`}
                                          >
                                            {isClassActiveNow ? "⚡ simulated: active now" : "⌛ simulate: set time to now"}
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Modern Join Modal Connection inside AnimatePresence */}
                            <AnimatePresence>
                              {activeJoinSession && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                                >
                                  <motion.div
                                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.95, y: 15, opacity: 0 }}
                                    transition={{ type: "spring", duration: 0.35 }}
                                    className="relative w-full max-w-md p-6 bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl space-y-6 text-left overflow-hidden font-sans"
                                  >
                                    {/* Glow decorative background */}
                                    <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                                    
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <h3 className="font-sans text-xs font-extrabold text-white uppercase tracking-widest">
                                          Live Classroom Connection
                                        </h3>
                                      </div>
                                      <button
                                        onClick={() => setActiveJoinSession(null)}
                                        className="text-white/40 hover:text-white hover:bg-white/5 p-1.5 rounded-xl transition-all cursor-pointer"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="space-y-4">
                                      <div className="space-y-1">
                                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-sans">
                                          Session {activeJoinSession.sessionNum} Live Link
                                        </span>
                                        <h4 className="font-sans text-base font-black text-white leading-snug">
                                          {activeJoinSession.topic}
                                        </h4>
                                      </div>

                                      {/* New requested fields: Platform, Time, Instructor */}
                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                          <span className="block text-[8px] text-white/30 uppercase tracking-wider font-bold">
                                            Platform Name
                                          </span>
                                          <span className="font-bold text-white">
                                            {activeJoinSession.meetingPlatform || "Google Meet"}
                                          </span>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                          <span className="block text-[8px] text-white/30 uppercase tracking-wider font-bold">
                                            Instructor
                                          </span>
                                          <span className="font-bold text-white truncate block">
                                            {selectedCourse.instructor}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1 text-xs">
                                        <span className="block text-[8px] text-white/30 uppercase tracking-wider font-bold">
                                          Class Scheduled Time
                                        </span>
                                        <span className="font-bold text-white font-mono">
                                          {activeJoinSession.date} @ {activeJoinSession.time}
                                        </span>
                                      </div>

                                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                                        <span className="block text-[9px] text-white/30 uppercase tracking-wider font-bold font-sans">
                                          Access Link URL
                                        </span>
                                        <div className="flex items-center gap-2 bg-[#050508] border border-white/10 rounded-xl px-3 py-2">
                                          <span className="text-xs font-mono text-white/70 select-all truncate flex-1">
                                            {activeJoinSession.meetingLink || `https://meet.google.com/roo-zzero-s${activeJoinSession.sessionNum}`}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 text-xs text-white/50 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3">
                                        <Sparkles size={14} className="text-indigo-400 shrink-0" />
                                        <p className="leading-normal font-sans">
                                          Please ensure your webcam is active and your sound settings are verified before launching.
                                        </p>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                      <button
                                        onClick={() => {
                                          const link = activeJoinSession.meetingLink || `https://meet.google.com/roo-zzero-s${activeJoinSession.sessionNum}`;
                                          navigator.clipboard.writeText(link);
                                          showCustomToast("Meeting link copied successfully.", "success");
                                        }}
                                        className="py-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-white/20 font-sans"
                                      >
                                        <Copy size={13} />
                                        <span>Copy Link</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          const link = activeJoinSession.meetingLink || `https://meet.google.com/roo-zzero-s${activeJoinSession.sessionNum}`;
                                          showCustomToast("Launching live classroom application...", "success");
                                          try {
                                            window.open(link, "_blank");
                                          } catch (e) {
                                            console.warn(e);
                                          }
                                        }}
                                        className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all cursor-pointer font-sans"
                                      >
                                        <ExternalLink size={13} />
                                        <span>Join Meeting</span>
                                      </button>
                                    </div>
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })()}

                      {/* ASSIGNMENTS TAB */}
                      {courseDetailsTab === "Assignments" && (() => {
                        const courseAssignments = assignments.filter(
                          (a) => a.course === selectedCourse.title && a.published
                        );

                        // If an assignment is selected, show details view
                        if (selectedAssignmentId) {
                          const currentAssignment = assignments.find((a) => a.id === selectedAssignmentId);
                          if (currentAssignment && currentAssignment.course === selectedCourse.title) {
                            // Helper for file type icons
                            const getFileIcon = (type: string) => {
                              switch (type?.toUpperCase()) {
                                case "ZIP":
                                  return <FileArchive className="text-yellow-400" size={18} />;
                                case "PDF":
                                  return <FileText className="text-rose-400" size={18} />;
                                case "IMAGE":
                                  return <FileImage className="text-emerald-400" size={18} />;
                                case "SOURCE CODE":
                                  return <FileCode className="text-indigo-400" size={18} />;
                                default:
                                  return <FileText className="text-indigo-400" size={18} />;
                              }
                            };

                            // File size / extension check
                            const validateFile = (file: File): boolean => {
                              const maxSize = 10 * 1024 * 1024; // 10MB
                              if (file.size > maxSize) {
                                showCustomToast("File size exceeds 10MB limit.", "warning");
                                return false;
                              }
                              const allowedExtensions = [
                                "pdf", "zip", "rar", "png", "jpg", "jpeg", "gif", 
                                "doc", "docx", "js", "ts", "tsx", "jsx", "py", "cpp", "c", "java", "html", "css"
                              ];
                              const fileExtension = file.name.split('.').pop()?.toLowerCase() || "";
                              if (!allowedExtensions.includes(fileExtension)) {
                                showCustomToast(`Unsupported file format (.${fileExtension}).`, "warning");
                                return false;
                              }
                              return true;
                            };

                            // Simulated progress upload
                            const handleFileUpload = (file: File) => {
                              if (!validateFile(file)) return;
                              setIsUploading(true);
                              setUploadProgress(0);
                              const interval = setInterval(() => {
                                setUploadProgress((prev) => {
                                  if (prev >= 100) {
                                    clearInterval(interval);
                                    setIsUploading(false);
                                    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
                                    let typeStr = "Document";
                                    const ext = file.name.split('.').pop()?.toLowerCase() || "";
                                    if (["zip", "rar"].includes(ext)) typeStr = "ZIP";
                                    else if (["png", "jpg", "jpeg", "gif"].includes(ext)) typeStr = "IMAGE";
                                    else if (["pdf"].includes(ext)) typeStr = "PDF";
                                    else if (["js", "ts", "tsx", "jsx", "py", "cpp", "c", "java", "html", "css"].includes(ext)) typeStr = "SOURCE CODE";

                                    setUploadedFileState({
                                      name: file.name,
                                      size: sizeStr,
                                      type: typeStr
                                    });
                                    showCustomToast("Solution file loaded successfully.", "success");
                                    return 100;
                                  }
                                  return prev + 20;
                                });
                              }, 150);
                            };

                            // Drag & Drop handlers
                            const handleDrag = (e: React.DragEvent) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.type === "dragenter" || e.type === "dragover") {
                                setDragActive(true);
                              } else if (e.type === "dragleave") {
                                setDragActive(false);
                              }
                            };

                            const handleDrop = (e: React.DragEvent) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragActive(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleFileUpload(e.dataTransfer.files[0]);
                              }
                            };

                            // Submit submission
                            const handleSubmitSubmission = (e: React.FormEvent) => {
                              e.preventDefault();
                              if (githubUrl.trim() && !validateGitHubUrl(githubUrl)) {
                                setGithubError("Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)");
                                showCustomToast("Invalid GitHub Repository URL.", "warning");
                                return;
                              }
                              if (!uploadedFileState && !githubUrl.trim()) {
                                showCustomToast("Please upload a solution file or provide a GitHub repository link.", "warning");
                                return;
                              }

                              const updated = assignments.map((a) => {
                                if (a.id === currentAssignment.id) {
                                  return {
                                    ...a,
                                    status: "Submitted" as const,
                                    submittedFile: uploadedFileState || undefined,
                                    submittedGithubUrl: githubUrl.trim() || undefined,
                                    submittedNotes: notesText.trim() || undefined,
                                    grade: null,
                                    feedback: undefined
                                  };
                                }
                                return a;
                              });

                              setAssignments(updated);
                              showCustomToast(`Solution submitted successfully for Assignment ${currentAssignment.assignmentNum}!`, "success");
                              addNotification(
                                "Assignment Submitted",
                                `You submitted Solution for "${currentAssignment.title}".`,
                                "assignment",
                                currentAssignment.id
                              );
                            };

                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6 text-left"
                              >
                                {/* Back Button header */}
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setSelectedAssignmentId(null)}
                                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white transition-all cursor-pointer flex items-center gap-2"
                                  >
                                    <ArrowLeft size={16} />
                                    <span className="text-xs font-semibold font-sans">Back to Assignments</span>
                                  </button>
                                  <div>
                                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest block font-mono">
                                      Course Work / Assignment {currentAssignment.assignmentNum}
                                    </span>
                                    <h2 className="font-sans text-lg font-black text-white leading-tight">
                                      {currentAssignment.title}
                                    </h2>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  {/* Left details & files pane (2/3 width on desktop) */}
                                  <div className="lg:col-span-2 space-y-6">
                                    {/* Description Card */}
                                    <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-5 space-y-4 shadow-lg">
                                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.04]">
                                        <div className="flex items-center gap-4 text-xs text-white/40">
                                          <div>
                                            <span className="block text-[8px] uppercase tracking-wider text-white/30 font-bold font-mono">Published</span>
                                            <span className="text-white/80 font-medium">{currentAssignment.publishDate}</span>
                                          </div>
                                          <div className="h-4 w-px bg-white/10" />
                                          <div>
                                            <span className="block text-[8px] uppercase tracking-wider text-white/30 font-bold font-mono">Deadline</span>
                                            <span className="text-white/80 font-medium">{currentAssignment.dueDate}</span>
                                          </div>
                                        </div>
                                        {getStatusBadge(currentAssignment.status)}
                                      </div>

                                      <div className="space-y-2">
                                        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white/40">Assignment Details</h3>
                                        <p className="font-sans text-sm text-white/70 leading-relaxed whitespace-pre-line">
                                          {currentAssignment.description}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Instructor Files Card (only show if any exist) */}
                                    {currentAssignment.instructorFiles && currentAssignment.instructorFiles.length > 0 && (
                                      <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-5 space-y-3 shadow-lg">
                                        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                                          <Paperclip size={13} className="text-indigo-400" />
                                          <span>Reference Materials & Resources</span>
                                        </h3>
                                        <div className="divide-y divide-white/[0.03]">
                                          {currentAssignment.instructorFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3">
                                              <div className="flex items-center gap-2.5 overflow-hidden">
                                                {getFileIcon(file.type)}
                                                <div className="truncate text-left">
                                                  <span className="block text-xs font-semibold text-white/90 truncate max-w-[250px] sm:max-w-md" title={file.name}>
                                                    {file.name}
                                                  </span>
                                                  <span className="text-[10px] text-white/40 font-mono">{file.size} • {file.type}</span>
                                                </div>
                                              </div>
                                              <button
                                                onClick={() => showCustomToast(`Downloading source material: ${file.name}`, "success")}
                                                className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                                              >
                                                <Download size={13} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Instructor Feedback section */}
                                    {currentAssignment.status === "Graded" && (
                                      <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-5 space-y-4 shadow-lg text-left relative overflow-hidden">
                                        <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                                        <div className="flex items-center justify-between">
                                          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                            <Award size={14} className="text-emerald-400 animate-bounce" />
                                            <span>Evaluation & Feedback</span>
                                          </h3>
                                          <div className="flex items-center gap-1">
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-white/40">Grade Received</span>
                                            <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 font-mono text-xs font-black text-emerald-400">
                                              {currentAssignment.grade}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {currentAssignment.feedback && (
                                          <p className="font-sans text-xs text-white/80 leading-relaxed bg-black/30 border border-white/5 rounded-xl p-3.5 italic">
                                            "{currentAssignment.feedback}"
                                          </p>
                                        )}

                                        {currentAssignment.correctedFile && (
                                          <div className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-3 gap-3">
                                            <div className="flex items-center gap-2">
                                              <FileArchive size={15} className="text-yellow-400" />
                                              <div className="text-left font-mono text-[10px]">
                                                <span className="block font-bold text-white/90">{currentAssignment.correctedFile.name}</span>
                                                <span className="text-white/40">{currentAssignment.correctedFile.size} • Graded Annex</span>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => showCustomToast(`Downloading corrected annotated work: ${currentAssignment.correctedFile?.name}`, "success")}
                                              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                            >
                                              <Download size={11} />
                                              <span>Download</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {currentAssignment.status === "Under Review" && (
                                      <div className="bg-amber-950/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3.5 shadow-lg">
                                        <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={16} />
                                        <div className="space-y-1">
                                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-sans">Under Assessment</h4>
                                          <p className="text-xs text-white/60 leading-relaxed font-sans">
                                            Your coursework is currently being evaluated by the instructor. Grades and detailed annotated critiques will appear here as soon as published.
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right submission panel */}
                                  <div className="space-y-6">
                                    <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-5 space-y-4 shadow-lg">
                                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-white/40">
                                        {currentAssignment.status === "Submitted" || currentAssignment.status === "Graded" || currentAssignment.status === "Under Review"
                                          ? "Submission Logged"
                                          : "Submit Implementation"
                                        }
                                      </h3>

                                      <form onSubmit={handleSubmitSubmission} className="space-y-4 text-xs text-left">
                                        {/* Drag & Drop Area */}
                                        <div className="space-y-1.5">
                                          <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40">Solution File Archive (max 10MB)</label>
                                          
                                          {uploadedFileState ? (
                                            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                                              <div className="flex items-center gap-2 overflow-hidden">
                                                {getFileIcon(uploadedFileState.type)}
                                                <div className="truncate text-left font-mono text-[10px]">
                                                  <span className="block font-bold text-white/90 truncate max-w-[120px]" title={uploadedFileState.name}>
                                                    {uploadedFileState.name}
                                                  </span>
                                                  <span className="text-white/40">{uploadedFileState.size} • {uploadedFileState.type}</span>
                                                </div>
                                              </div>
                                              {currentAssignment.status === "Not Submitted" && (
                                                <button
                                                  type="button"
                                                  onClick={() => setUploadedFileState(null)}
                                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                                                >
                                                  <Trash2 size={13} />
                                                </button>
                                              )}
                                            </div>
                                          ) : (
                                            <div
                                              onDragEnter={handleDrag}
                                              onDragOver={handleDrag}
                                              onDragLeave={handleDrag}
                                              onDrop={handleDrop}
                                              onClick={() => assignmentFileInputRef.current?.click()}
                                              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                                dragActive 
                                                  ? "border-indigo-500 bg-indigo-500/5" 
                                                  : "border-white/10 hover:border-white/25 bg-black/10 hover:bg-black/20"
                                              }`}
                                            >
                                              <input
                                                type="file"
                                                ref={assignmentFileInputRef}
                                                onChange={(e) => {
                                                  if (e.target.files && e.target.files[0]) {
                                                    handleFileUpload(e.target.files[0]);
                                                  }
                                                }}
                                                className="hidden"
                                                disabled={currentAssignment.status !== "Not Submitted"}
                                              />
                                              <Upload className="text-indigo-400/80 mb-2" size={20} />
                                              <span className="font-semibold text-white/90 block mb-1">
                                                Drag file here or click to browse
                                              </span>
                                              <span className="text-[10px] text-white/40 block leading-normal">
                                                Supports ZIP, PDF, Images, Documents & Source Code
                                              </span>
                                            </div>
                                          )}

                                          {/* Uploading progress */}
                                          {isUploading && (
                                            <div className="space-y-1 pt-1.5">
                                              <div className="flex justify-between text-[10px] font-mono text-indigo-400 font-bold">
                                                <span>Uploading archive...</span>
                                                <span>{uploadProgress}%</span>
                                              </div>
                                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                  className="h-full bg-indigo-500 transition-all duration-150"
                                                  style={{ width: `${uploadProgress}%` }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* GitHub URL input */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40">GitHub Repository URL</label>
                                          <div className="relative">
                                            <Github size={13} className="absolute left-3 top-2.5 text-white/30" />
                                            <input
                                              type="text"
                                              value={githubUrl}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setGithubUrl(val);
                                                if (val.trim() && !validateGitHubUrl(val)) {
                                                  setGithubError("Please enter a valid GitHub repository URL");
                                                } else {
                                                  setGithubError("");
                                                }
                                              }}
                                              placeholder="https://github.com/username/repository"
                                              disabled={currentAssignment.status !== "Not Submitted"}
                                              className="w-full bg-[#030304] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                            />
                                          </div>
                                          {githubError && (
                                            <span className="text-[10px] text-red-400 block">{githubError}</span>
                                          )}
                                        </div>

                                        {/* Additional Notes */}
                                        <div className="space-y-1">
                                          <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40">Additional Notes</label>
                                          <textarea
                                            value={notesText}
                                            onChange={(e) => setNotesText(e.target.value)}
                                            rows={3}
                                            placeholder="Write supplementary explanation or notes for the instructor..."
                                            disabled={currentAssignment.status !== "Not Submitted"}
                                            className="w-full bg-[#030304] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 font-sans resize-none disabled:opacity-50"
                                          />
                                        </div>

                                        {/* Submit CTA */}
                                        {currentAssignment.status === "Not Submitted" ? (
                                          <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
                                          >
                                            <CheckSquare size={13} />
                                            <span>Submit Solution Work</span>
                                          </motion.button>
                                        ) : (
                                          <div className="space-y-2">
                                            <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-3 flex items-center gap-2">
                                              <Check size={14} className="text-emerald-400" />
                                              <span className="text-emerald-400 font-semibold font-sans">Assignment Locked & Logged</span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                // unlock assignment submission
                                                const updated = assignments.map((a) => {
                                                  if (a.id === currentAssignment.id) {
                                                    return { ...a, status: "Not Submitted" as const };
                                                  }
                                                  return a;
                                                });
                                                setAssignments(updated);
                                                showCustomToast("Unlocked assignment details to allow re-submission.", "info");
                                              }}
                                              className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-all cursor-pointer text-center block font-sans"
                                            >
                                              Resubmit Assignment
                                            </button>
                                          </div>
                                        )}
                                      </form>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          }
                        }

                        // Render Assignments list if no selected assignment
                        return (
                          <div className="space-y-6 text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-5 mb-2">
                              <div className="space-y-1">
                                <h2 className="font-sans text-xl font-black text-white tracking-tight flex items-center gap-2">
                                  <CheckSquare className="text-indigo-400" size={20} />
                                  <span>Course Work Assignments</span>
                                </h2>
                                <p className="text-xs text-white/40 font-sans">
                                  Track syllabus coursework, submit implementations, and review grading evaluations.
                                </p>
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                                {courseAssignments.length} Assignments Published
                              </div>
                            </div>

                            {courseAssignments.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courseAssignments.map((assignment) => (
                                  <motion.div
                                    key={assignment.id}
                                    whileHover={{ y: -3, scale: 1.01 }}
                                    className="bg-[#08080c] border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group"
                                  >
                                    {/* Subtle gradient glow */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    <div className="space-y-3 relative z-10">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">
                                          Assignment {assignment.assignmentNum}
                                        </span>
                                        {getStatusBadge(assignment.status)}
                                      </div>

                                      <div className="space-y-1.5">
                                        <h4 className="font-sans text-sm font-bold text-white tracking-tight leading-snug group-hover:text-indigo-300 transition-colors duration-200">
                                          {assignment.title}
                                        </h4>
                                        <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                                          {assignment.description}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] mt-auto relative z-10">
                                      <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                                        <Clock size={11} className="text-white/30" />
                                        <span>Due: {assignment.dueDate}</span>
                                      </div>
                                      <button
                                        onClick={() => setSelectedAssignmentId(assignment.id)}
                                        className="px-3 py-1.5 bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1 cursor-pointer font-sans"
                                      >
                                        <span>Details</span>
                                        <ArrowRight size={10} className="stroke-[2.5]" />
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] flex flex-col items-center justify-center space-y-4">
                                <div className="h-14 w-14 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/30">
                                  <ClipboardList size={28} className="stroke-[1.5]" />
                                </div>
                                <div className="space-y-1 max-w-sm">
                                  <h4 className="text-sm font-bold text-white">No assignments have been published for this course yet.</h4>
                                  <p className="text-xs text-white/40 leading-relaxed font-sans">
                                    Your instructor has not published any coursework submissions for this syllabus. Check back again soon.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* RESOURCES TAB */}
                      {courseDetailsTab === "Resources" && (() => {
                        const courseResources = resources.filter(
                          (r) => r.course === selectedCourse.title && r.published
                        );

                        return (
                          <div className="space-y-6 text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-5 mb-2">
                              <div className="space-y-1">
                                <h2 className="font-sans text-xl font-black text-white tracking-tight flex items-center gap-2">
                                  <BookOpen className="text-indigo-400" size={20} />
                                  <span>Learning Resources</span>
                                </h2>
                                <p className="text-xs text-white/40 font-sans">
                                  Access, study, and download premium learning materials, notes, and reference assets.
                                </p>
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                                {courseResources.length} Materials Published
                              </div>
                            </div>

                            {courseResources.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {courseResources.map((resource) => (
                                  <motion.div
                                    key={resource.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -3, scale: 1.01 }}
                                    className="bg-[#08080c] border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group"
                                  >
                                    {/* Subtle gradient glow */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    <div className="space-y-4 relative z-10">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                                          {getResourceFileIcon(resource.fileType)}
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase font-mono tracking-wider bg-white/5 text-white/60 border border-white/10 shrink-0">
                                          {resource.fileType}
                                        </span>
                                      </div>

                                      <div className="space-y-1.5 text-left">
                                        <h4 className="font-sans text-sm font-bold text-white tracking-tight leading-snug group-hover:text-indigo-300 transition-colors duration-200">
                                          {resource.title}
                                        </h4>
                                        <div className="font-mono text-[10px] text-white/40 flex flex-wrap items-center gap-x-2 gap-y-1">
                                          <span className="truncate max-w-[180px]" title={resource.fileName}>File: {resource.fileName}</span>
                                          {resource.fileSize && (
                                            <>
                                              <span>•</span>
                                              <span>Size: {resource.fileSize}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.04] mt-auto relative z-10">
                                      <div className="flex items-center gap-1 text-[10px] text-white/30 font-mono">
                                        <Clock size={10} />
                                        <span>Added: {resource.uploadDate}</span>
                                      </div>
                                      <button
                                        onClick={() => handleDownloadResource(resource)}
                                        disabled={downloadingResourceId === resource.id}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white disabled:text-white/40 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer font-sans shadow-md shadow-indigo-600/10 disabled:shadow-none"
                                      >
                                        {downloadingResourceId === resource.id ? (
                                          <>
                                            <RefreshCw className="animate-spin" size={11} />
                                            <span>Downloading</span>
                                          </>
                                        ) : (
                                          <>
                                            <Download size={11} />
                                            <span>Download</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] flex flex-col items-center justify-center space-y-4">
                                <div className="h-14 w-14 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/30">
                                  <BookOpen size={28} className="stroke-[1.5]" />
                                </div>
                                <div className="space-y-1 max-w-sm">
                                  <h4 className="text-sm font-bold text-white">No learning resources have been uploaded for this course yet.</h4>
                                  <p className="text-xs text-white/40 leading-relaxed font-sans">
                                    Your instructor has not published any study or reference files for this syllabus. Check back again soon.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* DISCUSSION TAB */}
                      {courseDetailsTab === "Discussion" && (() => {
                        const courseConvs = conversations.filter(c => c.courseId === selectedCourse.id);
                        const filteredConvs = courseConvs.filter(c => {
                          if (activeDiscussionFilter === "All") return true;
                          return c.status === activeDiscussionFilter;
                        });

                        const currentConversation = conversations.find(c => c.id === selectedConversationId);

                        // File upload handler for reply
                        const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setReplyAttachment({
                              name: file.name,
                              type: file.type.includes("pdf") ? "PDF" : "Image"
                            });
                            showCustomToast(`Attached file: "${file.name}"`, "info");
                          }
                        };

                        // File upload handler for new conversation modal
                        const handleNewConvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewDiscussionAttachment({
                              name: file.name,
                              type: file.type.includes("pdf") ? "PDF" : "Image"
                            });
                            showCustomToast(`Attached file to new conversation: "${file.name}"`, "info");
                          }
                        };

                        const handleSendReply = () => {
                          if (!currentConversation) return;
                          if (!discussionReplyText.trim() && !replyAttachment) {
                            showCustomToast("Please type a message or attach a file.", "warning");
                            return;
                          }

                          setIsSendingReply(true);

                          // Simulate network delay for a premium experience
                          setTimeout(() => {
                            const newMsg: DiscussionMessage = {
                              id: `m_${Date.now()}`,
                              sender: "Student",
                              senderName: "Courtney Henry",
                              avatarText: "CH",
                              text: discussionReplyText.trim(),
                              time: new Date().toLocaleString("en-US", { 
                                month: "short", 
                                day: "numeric", 
                                year: "numeric", 
                                hour: "numeric", 
                                minute: "2-digit", 
                                hour12: true 
                              }),
                              attachments: replyAttachment ? [replyAttachment] : undefined
                            };

                            const wasClosed = currentConversation.status === "Closed";

                            const updated = conversations.map(c => {
                              if (c.id === currentConversation.id) {
                                return {
                                  ...c,
                                  status: "Under Review" as const,
                                  lastActivity: newMsg.time,
                                  messages: [...c.messages, newMsg]
                                };
                              }
                              return c;
                            });

                            setConversations(updated);
                            setDiscussionReplyText("");
                            setReplyAttachment(null);
                            setIsSendingReply(false);
                            
                            if (wasClosed) {
                              showCustomToast("Conversation has been reopened.", "success");
                            } else {
                              showCustomToast("Reply sent successfully!", "success");
                            }
                          }, 800);
                        };

                        const handleStartNewConversation = () => {
                          if (!newDiscussionTitle.trim() || !newDiscussionMessage.trim()) {
                            showCustomToast("Please fill in both the title and message fields.", "warning");
                            return;
                          }

                          const formattedTime = new Date().toLocaleString("en-US", { 
                            month: "short", 
                            day: "numeric", 
                            year: "numeric", 
                            hour: "numeric", 
                            minute: "2-digit", 
                            hour12: true 
                          });

                          const newConv: Conversation = {
                            id: `c_${Date.now()}`,
                            courseId: selectedCourse.id,
                            title: newDiscussionTitle.trim(),
                            recipient: newDiscussionRecipient,
                            status: "Under Review",
                            lastActivity: formattedTime,
                            messages: [
                              {
                                id: `m_${Date.now()}`,
                                sender: "Student",
                                senderName: "Courtney Henry",
                                avatarText: "CH",
                                text: newDiscussionMessage.trim(),
                                time: formattedTime,
                                attachments: newDiscussionAttachment ? [newDiscussionAttachment] : undefined
                              }
                            ]
                          };

                          const updated = [newConv, ...conversations];
                          setConversations(updated);

                          // Close modal & reset fields
                          setIsNewDiscussionModalOpen(false);
                          setNewDiscussionTitle("");
                          setNewDiscussionMessage("");
                          setNewDiscussionAttachment(null);
                          showCustomToast("Conversation submitted! Support staff has been notified.", "success");
                        };

                        return (
                          <div className="space-y-6 text-left relative">
                            <AnimatePresence mode="wait">
                              {currentConversation ? (
                                /* SELECTED CONVERSATION CHAT VIEW */
                                <motion.div
                                  key="chat-view"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  transition={{ duration: 0.25 }}
                                  className="space-y-4"
                                >
                                  {/* Top Navigation Row */}
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#08080c] border border-white/[0.05] rounded-2xl p-4 shadow-md">
                                    <button
                                      onClick={() => setSelectedConversationId(null)}
                                      className="flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer w-fit"
                                    >
                                      <ArrowLeft size={14} />
                                      <span>Back to Discussions</span>
                                    </button>

                                    <div className="flex flex-wrap items-center gap-2.5 sm:self-end md:self-auto">
                                      <div className="flex items-center gap-2 bg-white/[0.01] border border-white/5 rounded-xl px-3 py-1.5">
                                        <span className="text-[10px] text-white/40 font-mono">Recipient:</span>
                                        <span className="text-xs font-bold text-indigo-300">{currentConversation.recipient}</span>
                                        <span className="text-white/20">•</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                          currentConversation.status === "Replied"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : currentConversation.status === "Under Review"
                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            : currentConversation.status === "Closed"
                                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                        }`}>
                                          {currentConversation.status}
                                        </span>
                                      </div>

                                      {currentConversation.status !== "Closed" && (
                                        <button
                                          onClick={() => setConfirmingCloseConvId(currentConversation.id)}
                                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/35 rounded-xl text-xs font-bold text-rose-400 transition-all cursor-pointer shadow-lg shadow-rose-500/5 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                          <X size={13} />
                                          <span>Close Conversation</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Chat Box Container */}
                                  <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                                    <div>
                                      <h3 className="font-sans text-base font-black text-white tracking-tight">
                                        {currentConversation.title}
                                      </h3>
                                      <div className="text-[10px] text-white/30 font-mono mt-1">
                                        Active course: {selectedCourse.title}
                                      </div>
                                    </div>

                                    {/* Messages History Stream */}
                                    <div className="space-y-4 max-h-[350px] sm:max-h-[420px] overflow-y-auto pr-2 border-t border-b border-white/[0.04] py-4 custom-scrollbar">
                                      {currentConversation.messages.map((msg) => {
                                        const isStudent = msg.sender === "Student";
                                        return (
                                          <div
                                            key={msg.id}
                                            className={`flex items-start gap-3 max-w-[85%] ${
                                              isStudent ? "ml-auto flex-row-reverse" : "mr-auto"
                                            }`}
                                          >
                                            {/* Avatar with custom colors */}
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm ${
                                              isStudent 
                                                ? "bg-indigo-600 border border-indigo-500" 
                                                : msg.sender === "Instructor"
                                                ? "bg-amber-600 border border-amber-500"
                                                : "bg-purple-600 border border-purple-500"
                                            }`}>
                                              {msg.avatarText}
                                            </div>

                                            {/* Message Content Bubble */}
                                            <div className="space-y-1.5 text-left">
                                              <div className={`flex items-center gap-2 ${isStudent ? "justify-end" : "justify-start"}`}>
                                                <span className="text-xs font-bold text-white/90">{msg.senderName}</span>
                                                <span className="text-[8px] px-1 py-0.2 rounded bg-white/[0.04] text-white/40 font-mono uppercase tracking-wider">
                                                  {msg.sender}
                                                </span>
                                              </div>

                                              <div className={`p-3 rounded-2xl text-xs leading-relaxed space-y-2 border ${
                                                isStudent 
                                                  ? "bg-indigo-600/10 border-indigo-500/20 rounded-tr-none text-indigo-100" 
                                                  : "bg-white/[0.02] border-white/[0.04] rounded-tl-none text-white/80"
                                              }`}>
                                                <p className="whitespace-pre-wrap">{msg.text}</p>

                                                {/* Attachments rendering */}
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                  <div className="pt-2 border-t border-white/[0.05] space-y-1 mt-1">
                                                    <span className="text-[8px] text-white/40 font-mono uppercase tracking-wider block">Attachments:</span>
                                                    {msg.attachments.map((att, i) => (
                                                      <button
                                                        key={i}
                                                        onClick={() => showCustomToast(`Opening attachment "${att.name}"`, "info")}
                                                        className="flex items-center gap-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 font-mono transition-colors bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1 w-fit cursor-pointer"
                                                      >
                                                        {att.type === "PDF" ? <FileText size={10} className="text-rose-400" /> : <FileImage size={10} className="text-emerald-400" />}
                                                        <span className="underline">{att.name}</span>
                                                      </button>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>

                                              <div className={`text-[8px] text-white/30 font-mono ${isStudent ? "text-right" : "text-left"}`}>
                                                {msg.time}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* REPLY FORM */}
                                    <div className="space-y-3">
                                      {/* Attachment preview area */}
                                      {replyAttachment && (
                                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs">
                                          <div className="flex items-center gap-2">
                                            {replyAttachment.type === "PDF" ? (
                                              <FileText className="text-red-400" size={13} />
                                            ) : (
                                              <FileImage className="text-emerald-400" size={13} />
                                            )}
                                            <span className="text-white/60 font-mono text-[10px] truncate max-w-[220px]">
                                              {replyAttachment.name}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => setReplyAttachment(null)}
                                            className="text-white/30 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                                            title="Remove Attachment"
                                          >
                                            <X size={11} />
                                          </button>
                                        </div>
                                      )}

                                      {/* Input controls layout */}
                                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                                        <div className="flex-1 w-full text-left space-y-1">
                                          <textarea
                                            placeholder={`Write your reply to ${currentConversation.recipient}...`}
                                            value={discussionReplyText}
                                            onChange={(e) => setDiscussionReplyText(e.target.value)}
                                            rows={2}
                                            className="w-full bg-white/[0.01] border border-white/10 hover:border-white/15 focus:border-indigo-500/40 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder-white/20 resize-none font-sans"
                                          />
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                                          {/* Attachment button */}
                                          <label className="p-3 bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] text-white/70 rounded-xl transition-colors cursor-pointer flex items-center justify-center">
                                            <Paperclip size={14} />
                                            <input
                                              type="file"
                                              accept="image/*,.pdf"
                                              className="hidden"
                                              onChange={handleReplyFileChange}
                                            />
                                          </label>

                                          {/* Send Reply Button */}
                                          <button
                                            onClick={handleSendReply}
                                            disabled={isSendingReply}
                                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                                          >
                                            {isSendingReply ? (
                                              <>
                                                <RefreshCw className="animate-spin" size={13} />
                                                <span>Sending...</span>
                                              </>
                                            ) : (
                                              <>
                                                <Send size={13} className="-rotate-45" />
                                                <span>Send Reply</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                /* CONVERSATIONS LIST & STATUS FILTER VIEW */
                                <motion.div
                                  key="list-view"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ duration: 0.25 }}
                                  className="space-y-6"
                                >
                                  {/* Filter and Action Header */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-5">
                                    <div className="space-y-1">
                                      <h2 className="font-sans text-xl font-black text-white tracking-tight flex items-center gap-2">
                                        <MessageSquare className="text-indigo-400" size={20} />
                                        <span>Course Discussions</span>
                                      </h2>
                                      <p className="text-xs text-white/40 font-sans">
                                        Post administrative requests, contact your syllabus instructor, or ask academic questions.
                                      </p>
                                    </div>

                                    {/* Prominent CTA to start conversation */}
                                    <button
                                      onClick={() => setIsNewDiscussionModalOpen(true)}
                                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-indigo-600/20 self-start sm:self-auto hover:translate-y-[-1px]"
                                    >
                                      <PlusCircle size={14} />
                                      <span>Start Conversation</span>
                                    </button>
                                  </div>

                                  {/* Filter Tabs Row */}
                                  <div className="flex items-center gap-1.5 bg-[#08080c] p-1 border border-white/[0.05] rounded-xl w-fit">
                                    {(["All", "Replied", "Under Review", "Closed"] as const).map((filter) => (
                                      <button
                                        key={filter}
                                        onClick={() => setActiveDiscussionFilter(filter)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          activeDiscussionFilter === filter
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "text-white/40 hover:text-white/80"
                                        }`}
                                      >
                                        {filter}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Conversations Render */}
                                  {filteredConvs.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                      {filteredConvs.map((conv) => (
                                        <motion.div
                                          key={conv.id}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          whileHover={{ y: -2, border: "1px solid rgba(255,255,255,0.12)" }}
                                          className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md transition-all duration-300 text-left relative overflow-hidden group"
                                        >
                                          <div className="space-y-2 flex-1">
                                            {/* Meta Details Badges */}
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="text-[10px] font-bold text-indigo-400 font-mono">
                                                {conv.recipient}
                                              </span>
                                              <span className="text-white/20">•</span>
                                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider border ${
                                                conv.status === "Replied"
                                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                  : conv.status === "Under Review"
                                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                              }`}>
                                                {conv.status}
                                              </span>
                                            </div>

                                            {/* Conversation Title */}
                                            <h4 className="font-sans text-sm font-bold text-white tracking-tight leading-snug group-hover:text-indigo-200 transition-colors duration-200">
                                              {conv.title}
                                            </h4>

                                            {/* Last activity timestamp */}
                                            <div className="flex items-center gap-1 text-[9px] text-white/30 font-mono">
                                              <Clock size={10} />
                                              <span>Last Activity: {conv.lastActivity}</span>
                                              <span className="mx-1">•</span>
                                              <span>{conv.messages.length} message{conv.messages.length !== 1 ? "s" : ""}</span>
                                            </div>
                                          </div>

                                          {/* View Action Button */}
                                          <button
                                            onClick={() => setSelectedConversationId(conv.id)}
                                            className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl text-xs font-bold text-white/90 transition-all cursor-pointer shrink-0 text-center shadow-sm"
                                          >
                                            View Thread
                                          </button>
                                        </motion.div>
                                      ))}
                                    </div>
                                  ) : (
                                    /* EMPTY STATE */
                                    <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] flex flex-col items-center justify-center space-y-4">
                                      <div className="h-14 w-14 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/30">
                                        <MessageSquare size={28} className="stroke-[1.5]" />
                                      </div>
                                      <div className="space-y-1.5 max-w-md">
                                        <h4 className="text-sm font-bold text-white">No discussions found</h4>
                                        <p className="text-xs text-white/40 leading-relaxed font-sans px-4">
                                          You haven't started any conversations yet. Click "Start Conversation" to contact your instructor or the academy.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* START NEW CONVERSATION MODAL DIALOG */}
                            <AnimatePresence>
                              {isNewDiscussionModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                  {/* Overlay dark backdrop */}
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsNewDiscussionModalOpen(false)}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                  />

                                  {/* Dialog content panel */}
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                    className="bg-[#0b0b12] border border-white/10 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 shadow-2xl relative z-10 text-left font-sans"
                                  >
                                    <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                                      <h3 className="font-sans text-base font-black text-white tracking-tight flex items-center gap-2">
                                        <PlusCircle className="text-indigo-400" size={18} />
                                        <span>Start New Conversation</span>
                                      </h3>
                                      <button
                                        onClick={() => setIsNewDiscussionModalOpen(false)}
                                        className="text-white/40 hover:text-white/80 p-1 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>

                                    <div className="space-y-4">
                                      {/* Message Title */}
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                                          Message Title
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Enter a brief descriptive title..."
                                          value={newDiscussionTitle}
                                          onChange={(e) => setNewDiscussionTitle(e.target.value)}
                                          className="w-full px-3 py-2 bg-white/[0.01] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-sans placeholder-white/20"
                                        />
                                      </div>

                                      {/* Recipient selection */}
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                                          Recipient Support Team
                                        </label>
                                        <select
                                          value={newDiscussionRecipient}
                                          onChange={(e) => setNewDiscussionRecipient(e.target.value as any)}
                                          className="w-full px-3 py-2 bg-[#12121c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-sans cursor-pointer"
                                        >
                                          <option value="Course Instructor">Course Instructor ({selectedCourse.instructor})</option>
                                          <option value="Academy Administrator">Academy Support / Administrator</option>
                                        </select>
                                      </div>

                                      {/* Message description body */}
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                                          Message Body
                                        </label>
                                        <textarea
                                          placeholder="Type details of your question or assistance required..."
                                          value={newDiscussionMessage}
                                          onChange={(e) => setNewDiscussionMessage(e.target.value)}
                                          rows={4}
                                          className="w-full px-3 py-2 bg-white/[0.01] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-sans placeholder-white/20 resize-none"
                                        />
                                      </div>

                                      {/* File Attachment preview and selector */}
                                      <div className="space-y-2">
                                        <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">
                                          Attachments (Image or PDF)
                                        </label>

                                        {newDiscussionAttachment ? (
                                          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2 text-xs">
                                            <div className="flex items-center gap-2">
                                              {newDiscussionAttachment.type === "PDF" ? (
                                                <FileText className="text-red-400" size={14} />
                                              ) : (
                                                <FileImage className="text-emerald-400" size={14} />
                                              )}
                                              <span className="text-white/60 font-mono text-[11px] truncate max-w-[200px]">
                                                {newDiscussionAttachment.name}
                                              </span>
                                            </div>
                                            <button
                                              onClick={() => setNewDiscussionAttachment(null)}
                                              className="text-white/30 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                                            >
                                              <X size={12} />
                                            </button>
                                          </div>
                                        ) : (
                                          <label className="border border-dashed border-white/10 hover:border-white/20 bg-white/[0.01] rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all">
                                            <Upload size={14} className="text-white/30" />
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                                              Choose file to attach
                                            </span>
                                            <span className="text-[8px] text-white/20 font-mono">
                                              Supports PDF or Images
                                            </span>
                                            <input
                                              type="file"
                                              accept="image/*,.pdf"
                                              className="hidden"
                                              onChange={handleNewConvFileChange}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    {/* Modal footer CTAs */}
                                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.05]">
                                      <button
                                        onClick={() => setIsNewDiscussionModalOpen(false)}
                                        className="px-3.5 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleStartNewConversation}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                                      >
                                        Send Message
                                      </button>
                                    </div>
                                  </motion.div>
                                </div>
                              )}
                            </AnimatePresence>

                            {/* CONFIRM CLOSE CONVERSATION MODAL */}
                            <AnimatePresence>
                              {confirmingCloseConvId && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                  {/* Overlay dark backdrop */}
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setConfirmingCloseConvId(null)}
                                    className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                                  />

                                  {/* Dialog content panel */}
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                    className="bg-[#0b0b12] border border-white/10 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-5 shadow-2xl relative z-10 text-center font-sans"
                                  >
                                    <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                                      <AlertCircle size={24} />
                                    </div>

                                    <div className="space-y-2">
                                      <h3 className="font-sans text-base font-black text-white tracking-tight">
                                        Close Conversation?
                                      </h3>
                                      <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
                                        Are you sure you want to close this discussion? This marks it as resolved. If you send a new message, it will automatically reopen.
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-center gap-3 pt-2">
                                      <button
                                        onClick={() => setConfirmingCloseConvId(null)}
                                        className="flex-1 py-2 px-4 bg-white/[0.03] hover:bg-white/[0.06] text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer text-center"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirmingCloseConvId) {
                                            const updated = conversations.map(c => {
                                              if (c.id === confirmingCloseConvId) {
                                                return { ...c, status: "Closed" as const };
                                              }
                                              return c;
                                            });
                                            setConversations(updated);
                                            setConfirmingCloseConvId(null);
                                            setSelectedConversationId(null); // Return to list view
                                            showCustomToast("Conversation marked as closed.", "success");
                                          }
                                        }}
                                        className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-600/15 text-center"
                                      >
                                        Yes, Close Thread
                                      </button>
                                    </div>
                                  </motion.div>
                                </div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })()}

                      {/* FEEDBACK TAB */}
                      {courseDetailsTab === "Feedback" && (() => {
                        const isPassed = selectedCourse.progress >= 60;
                        const finalGrade = selectedCourse.progress >= 90 ? "A" : selectedCourse.progress >= 60 ? "B" : "C";
                        const totalHours = selectedCourse.totalSessions * 4;

                        let recommendation = {
                          strengths: "Excellent grasp of concurrent rendering paradigms and performance tuning. Demonstrated exceptional engineering in designing custom hooks and memory leak audits.",
                          weaknesses: "Could spend a bit more focus on documenting decoupled custom architectures and service-to-service state synchronization flows.",
                          suggestions: "Deepen understanding of React Server Components (RSC) and study HTTP/3 streaming strategies for complex edge delivery.",
                          comments: "Courtney has shown stellar performance throughout the core syllabus. Highly capable of leading complex web engineering projects."
                        };

                        if (selectedCourse.title.toLowerCase().includes("design")) {
                          recommendation = {
                            strengths: "Unparalleled eye for pixel-perfection, Swiss typography principles, and WCAG AA contrast compliance in complex dark layouts.",
                            weaknesses: "Occasionally spent too much time perfecting micro-interaction timing in early sandbox drafts before establishing baseline wireframes.",
                            suggestions: "Perfect standard design token automation using Style Dictionary to scale systems across multiple platforms like Android and iOS.",
                            comments: "A masterclass student. Courtney's ability to maintain a dark design theme with aesthetic harmony and high usability is phenomenal."
                          };
                        } else if (selectedCourse.title.toLowerCase().includes("learning") || selectedCourse.title.toLowerCase().includes("machine")) {
                          recommendation = {
                            strengths: "Strong theoretical foundations in linear algebra and basic matrix operations.",
                            weaknesses: "Lack of active session participation and practical coding lab hand-ins so far.",
                            suggestions: "Allocate dedicated hours to step-by-step linear regression foundations and coding gradient descent algorithms from scratch.",
                            comments: "Must prioritize syllabus lectures and homework submissions. With consistent attendance, has high potential to grasp advanced deep learning models."
                          };
                        }

                        return (
                          <div className="space-y-8 text-left">
                            <div className="space-y-1">
                              <h2 className="font-sans text-xl font-black text-white">Course Evaluation & Feedback</h2>
                              <p className="text-xs text-white/40">Review your final course grades, instructor recommendations, and graduation credentials.</p>
                            </div>

                            {/* FINAL REPORT CARD */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Left / Main Details */}
                              <div className="lg:col-span-2 bg-[#08080c] border border-white/[0.06] rounded-2xl p-6 space-y-6 shadow-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                                
                                <div className="border-b border-white/[0.05] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div>
                                    <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">Academic Report</span>
                                    <h3 className="font-sans text-base font-black text-white leading-snug mt-0.5">
                                      {selectedCourse.title}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest font-mono">Status:</span>
                                    {isPassed ? (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Passed
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                        Failed
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-white/30 uppercase tracking-wider font-bold block font-mono">Start Date</span>
                                    <p className="text-xs font-semibold text-white/80">{selectedCourse.startDate}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-white/30 uppercase tracking-wider font-bold block font-mono">End Date</span>
                                    <p className="text-xs font-semibold text-white/80">{selectedCourse.endDate}</p>
                                  </div>
                                  <div className="space-y-1 col-span-2 sm:col-span-1">
                                    <span className="text-[9px] text-white/30 uppercase tracking-wider font-bold block font-mono">Total Duration</span>
                                    <p className="text-xs font-semibold text-white/80">{totalHours} Academic Hours</p>
                                  </div>
                                </div>
                              </div>

                              {/* Right / Circular Score Indicator */}
                              <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md relative">
                                <span className="absolute top-3 left-4 text-[9px] text-white/30 uppercase tracking-wider font-bold font-mono">Final Grade</span>
                                
                                <div className="relative flex items-center justify-center h-28 w-28 mt-2">
                                  {/* Dynamic visual ring */}
                                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                      cx="56"
                                      cy="56"
                                      r="48"
                                      className="stroke-white/[0.04] stroke-[6] fill-none"
                                    />
                                    <circle
                                      cx="56"
                                      cy="56"
                                      r="48"
                                      className={`stroke-[6] fill-none transition-all duration-1000 ${
                                        finalGrade === "A" 
                                          ? "stroke-emerald-400" 
                                          : finalGrade === "B" 
                                          ? "stroke-indigo-400" 
                                          : "stroke-rose-400"
                                      }`}
                                      strokeDasharray={2 * Math.PI * 48}
                                      strokeDashoffset={2 * Math.PI * 48 * (1 - (selectedCourse.progress / 100))}
                                    />
                                  </svg>
                                  <div className="flex flex-col items-center justify-center">
                                    <span className="text-4xl font-mono font-black text-white tracking-tight">
                                      {finalGrade}
                                    </span>
                                    <span className="text-[10px] text-white/40 font-mono mt-0.5">
                                      Score: {selectedCourse.progress}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* INSTRUCTOR RECOMMENDATIONS CARD */}
                            <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-6 space-y-5 shadow-md text-left font-sans">
                              <div className="border-b border-white/[0.04] pb-3 flex items-center gap-2">
                                <Award className="text-indigo-400" size={18} />
                                <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider">
                                  Instructor's Performance Recommendation
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-mono">
                                      Primary Strengths
                                    </span>
                                    <p className="text-xs text-white/70 leading-relaxed font-sans font-medium pl-1">
                                      {recommendation.strengths}
                                    </p>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 font-mono">
                                      Identified Weaknesses
                                    </span>
                                    <p className="text-xs text-white/70 leading-relaxed font-sans font-medium pl-1">
                                      {recommendation.weaknesses}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 font-mono">
                                      Future Learning Pathway
                                    </span>
                                    <p className="text-xs text-white/70 leading-relaxed font-sans font-medium pl-1">
                                      {recommendation.suggestions}
                                    </p>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 font-mono">
                                      Overall Academic Comments
                                    </span>
                                    <p className="text-xs text-white/60 italic leading-relaxed font-sans font-medium pl-1">
                                      "{recommendation.comments}"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* GRADUATION CERTIFICATE BLOCK */}
                            <div className="space-y-4 font-sans">
                              <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                                <h3 className="font-sans text-xs font-bold text-white/40 uppercase tracking-widest">
                                  Graduation Certificate
                                </h3>
                                <span className="text-[10px] text-white/30 font-mono font-medium">Verified Credential</span>
                              </div>

                              <CertificateCard course={selectedCourse} showCustomToast={showCustomToast} />
                            </div>
                          </div>
                        );
                      })()}

                      {courseDetailsTab === "Attendance" && (() => {
                        const getCourseAttendance = () => {
                          try {
                            const savedStudents = localStorage.getItem("teacher_students");
                            if (savedStudents) {
                              const parsed = JSON.parse(savedStudents);
                              const courseIdMap: { [key: string]: string } = {
                                "1": "react-adv",
                                "2": "swiss-typo",
                                "3": "ml-found"
                              };
                              const mappedId = courseIdMap[selectedCourse.id] || "react-adv";
                              const matchedStudent = parsed.find(
                                (s: any) => (s.name === "Courtney Henry" || s.id === "stu-1") && s.courseId === mappedId
                              );
                              if (matchedStudent) {
                                return matchedStudent.attendance;
                              }
                            }
                          } catch (e) {
                            console.error(e);
                          }
                          if (selectedCourse.id === "1") return 95;
                          if (selectedCourse.id === "2") return 84;
                          return 100;
                        };

                        const attendanceRate = getCourseAttendance();
                        const sessionsList = courseSessions[selectedCourse.id] || [];
                        
                        const getAttendanceStatusForSession = (sessNum: number) => {
                          if (attendanceRate >= 95) {
                            if (sessNum === 4) return "Late";
                            if (sessNum === 7) return "Excused";
                            return "Present";
                          } else if (attendanceRate >= 80) {
                            if (sessNum === 3 || sessNum === 8) return "Absent";
                            if (sessNum === 5) return "Late";
                            return "Present";
                          } else if (attendanceRate === 0) {
                            return "Absent";
                          } else {
                            if (sessNum % 5 === 0) return "Absent";
                            if (sessNum % 4 === 0) return "Late";
                            return "Present";
                          }
                        };

                        const completedSess = sessionsList.filter(s => s.status === "Completed" || s.sessionNum <= selectedCourse.completedSessions);
                        const excusedSessCount = completedSess.filter(s => getAttendanceStatusForSession(s.sessionNum) === "Excused").length;
                        const presentSessCount = completedSess.filter(s => getAttendanceStatusForSession(s.sessionNum) === "Present").length;
                        const lateSessCount = completedSess.filter(s => getAttendanceStatusForSession(s.sessionNum) === "Late").length;
                        const absentSessCount = completedSess.filter(s => getAttendanceStatusForSession(s.sessionNum) === "Absent").length;

                        return (
                          <div className="space-y-6 text-left animate-fade-in pb-10">
                            <div className="space-y-1">
                              <h2 className="font-sans text-xl font-black text-white">Attendance Tracking</h2>
                              <p className="text-xs text-white/40">
                                Real-time attendance percentage and detailed record log synchronized with your course instructor.
                              </p>
                            </div>

                            {/* Stat Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                              <div className="col-span-2 lg:col-span-1 bg-[#08080c] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between">
                                <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-wider">Attendance Rate</span>
                                <div className="mt-2 flex items-baseline gap-1">
                                  <span className="font-mono text-3xl font-black text-emerald-400">{attendanceRate}%</span>
                                </div>
                                <div className="w-full bg-white/[0.04] h-1.5 rounded-full mt-3 overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${attendanceRate}%` }} />
                                </div>
                              </div>

                              <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-5">
                                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">Present</span>
                                <span className="font-mono text-2xl font-black text-white mt-1 block">{presentSessCount}</span>
                                <span className="text-[9px] text-white/30 block mt-1">Sessions attended</span>
                              </div>

                              <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-5">
                                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block">Late</span>
                                <span className="font-mono text-2xl font-black text-white mt-1 block">{lateSessCount}</span>
                                <span className="text-[9px] text-white/30 block mt-1">Sessions late entry</span>
                              </div>

                              <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-5">
                                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Excused</span>
                                <span className="font-mono text-2xl font-black text-white mt-1 block">{excusedSessCount}</span>
                                <span className="text-[9px] text-white/30 block mt-1">Approved absence</span>
                              </div>

                              <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl p-5">
                                <span className="text-[10px] text-rose-400 font-mono font-bold uppercase tracking-wider block">Absent</span>
                                <span className="font-mono text-2xl font-black text-white mt-1 block">{absentSessCount}</span>
                                <span className="text-[9px] text-white/30 block mt-1">Unexcused absence</span>
                              </div>
                            </div>

                            {/* Detailed Log Table */}
                            <div className="bg-[#08080c] border border-white/[0.06] rounded-2xl overflow-hidden">
                              <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
                                <h3 className="font-sans text-xs font-bold text-white uppercase tracking-wider">Attendance Activity Log</h3>
                                <span className="text-[10px] text-white/30 font-mono">Synchronized view-only</span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full font-sans text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                                      <th className="p-4 text-[10px] text-white/40 uppercase tracking-wider font-bold">Session</th>
                                      <th className="p-4 text-[10px] text-white/40 uppercase tracking-wider font-bold">Topic</th>
                                      <th className="p-4 text-[10px] text-white/40 uppercase tracking-wider font-bold">Scheduled Date</th>
                                      <th className="p-4 text-[10px] text-white/40 uppercase tracking-wider font-bold">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sessionsList.map((sess) => {
                                      const isSessionCompleted = sess.status === "Completed" || sess.sessionNum <= selectedCourse.completedSessions;
                                      const status = isSessionCompleted ? getAttendanceStatusForSession(sess.sessionNum) : "Upcoming";
                                      
                                      return (
                                        <tr key={sess.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                                          <td className="p-4 text-xs font-mono font-bold text-white/70">
                                            Session {sess.sessionNum}
                                          </td>
                                          <td className="p-4 text-xs font-bold text-white">
                                            {sess.topic}
                                          </td>
                                          <td className="p-4 text-xs text-white/40 font-mono">
                                            {sess.date} @ {sess.time}
                                          </td>
                                          <td className="p-4">
                                            {isSessionCompleted ? (
                                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                                status === "Present"
                                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                  : status === "Late"
                                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                                  : status === "Excused"
                                                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                                                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                              }`}>
                                                <span className={`w-1 h-1 rounded-full ${
                                                  status === "Present"
                                                    ? "bg-emerald-400"
                                                    : status === "Late"
                                                    ? "bg-amber-400"
                                                    : status === "Excused"
                                                    ? "bg-indigo-400"
                                                    : "bg-rose-400"
                                                }`} />
                                                {status}
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/[0.03] border border-white/[0.06] text-white/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                                Upcoming
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            );
          })()}

          {activeTab === "courses" && !selectedCourseId && (() => {
            const filteredCourses = courses.filter(c => courseFilter === "All" || c.status === courseFilter);

            const getGridClass = (count: number) => {
              if (count >= 3) {
                return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full";
              } else if (count === 2) {
                return "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full";
              } else {
                return "grid grid-cols-1 max-w-md mx-auto w-full";
              }
            };

            return (
              <div className="space-y-6 animate-fade-in text-left pb-10 w-full">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/[0.04] pb-6">
                  <div className="space-y-1">
                    <h2 className="font-sans text-2xl font-black text-white tracking-tight">My Courses</h2>
                    <p className="text-xs text-white/50">Manage and join your active enrolled academic courses.</p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center bg-[#050508] border border-white/[0.04] p-1 rounded-2xl overflow-x-auto gap-1 self-start sm:self-center shrink-0">
                    {(["All", "Active", "Completed", "Waiting to Start"] as const).map((filter) => {
                      const isSelected = courseFilter === filter;
                      return (
                        <button
                          key={filter}
                          onClick={() => setCourseFilter(filter)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 ${
                            isSelected ? "text-white bg-indigo-600 shadow-md shadow-indigo-600/10" : "text-white/40 hover:text-white/70"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Layout of Course Cards */}
                {filteredCourses.length > 0 ? (
                  <div className={getGridClass(filteredCourses.length)}>
                    {filteredCourses.map((course) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ y: -5, scale: 1.015 }}
                        className="bg-[#08080c] border border-white/[0.06] rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.05)] hover:border-white/[0.1] transition-all flex flex-col justify-between text-left group w-full"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-44 w-full overflow-hidden shrink-0 bg-[#0d0d14]">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-transparent" />
                          
                          {/* Badge overlay */}
                          <div className="absolute top-4 left-4">
                            {renderStatusBadge(course.status as any)}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                          <div className="space-y-3">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                              {course.instructor}
                            </span>
                            <h3 className="font-sans text-base font-black text-white leading-snug group-hover:text-indigo-300 transition-colors">
                              {course.title}
                            </h3>
                            
                            {/* Dates & Session info */}
                            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-3 text-[11px] text-white/50 border-t border-white/[0.04]">
                              <div>
                                <span className="block text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-0.5">Start Date</span>
                                <span className="font-medium text-white/80">{course.startDate}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-0.5">End Date</span>
                                <span className="font-medium text-white/80">{course.endDate}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-0.5">Total Sessions</span>
                                <span className="font-semibold text-white/80 font-mono">{course.totalSessions} Sessions</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-0.5">Completed</span>
                                <span className="font-semibold text-white/80 font-mono">{course.completedSessions} Sessions</span>
                              </div>
                            </div>

                            {/* Next Upcoming Session */}
                            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[11px]">
                              <span className="block text-[9px] text-white/30 uppercase tracking-wider font-bold mb-1">Next Session</span>
                              <div className="flex items-center gap-2 text-white/80">
                                <Clock size={12} className="text-indigo-400 shrink-0" />
                                <span className="font-medium truncate">{course.nextSession}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Course Progress Component */}
                            <div className="space-y-1.5 pt-2">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-white/40">Syllabus Progress</span>
                                <span className="text-white/95">{course.progress}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${course.progress}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                                />
                              </div>
                            </div>

                            {/* Join Class button */}
                            <motion.button
                              whileHover={{ scale: 1.02, y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedCourseId(course.id)}
                              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all text-center flex items-center justify-center gap-2"
                            >
                              <span>Join Class</span>
                              <ArrowRight size={13} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                    <BookOpen size={40} className="mx-auto text-white/20 mb-3 animate-pulse" />
                    <p className="text-sm font-semibold text-white/50">No courses found matching "{courseFilter}"</p>
                    <button
                      onClick={() => setCourseFilter("All")}
                      className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === "assignments" && (() => {
            const getSessionNum = (assignment: AssignmentDetail) => {
              if (assignment.id === "a1") return 4;
              if (assignment.id === "a2") return 5;
              if (assignment.id === "a3") return 4;
              if (assignment.id === "a4") return 5;
              if (assignment.id === "a5") return 1;
              return assignment.assignmentNum || 1;
            };

            const getDisplayStatusBadge = (status: string) => {
              const displayStatus = mapToDisplayStatus(status);
              switch (displayStatus) {
                case "Pending":
                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Pending
                    </span>
                  );
                case "Submitted":
                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-[0_0_8px_rgba(99,102,241,0.1)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      Submitted
                    </span>
                  );
                case "Reviewing":
                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25 shadow-[0_0_8px_rgba(59,130,246,0.1)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                      Reviewing
                    </span>
                  );
                case "Revision Required":
                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.1)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                      Revision Required
                    </span>
                  );
                case "Completed":
                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Completed
                    </span>
                  );
                default:
                  return null;
              }
            };

            const handleViewAssignmentOnWorkboard = (assignment: AssignmentDetail) => {
              const matchingCourse = courses.find(c => c.title === assignment.course);
              if (matchingCourse) {
                setActiveTab("courses");
                setSelectedCourseId(matchingCourse.id);
                setCourseDetailsTab("Assignments");
                setSelectedAssignmentId(assignment.id);
                showCustomToast(`Opening "${assignment.title}" details`, "info");
              } else {
                showCustomToast("Course details not found for this assignment.", "warning");
              }
            };

            const filteredAssignments = assignments.filter((ass) => {
              const matchesStatus = assignmentStatusFilter === "All" || mapToDisplayStatus(ass.status) === assignmentStatusFilter;
              const matchesCourse = assignmentCourseSearch === "" || ass.course.toLowerCase().includes(assignmentCourseSearch.toLowerCase());
              return matchesStatus && matchesCourse;
            });

            // Get unique course titles for dropdown filter suggestions
            const uniqueCourses = Array.from(new Set(assignments.map(a => a.course))) as string[];

            return (
              <div className="space-y-8 text-left animate-fade-in w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-5">
                  <div className="space-y-1">
                    <h2 className="font-sans text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <CheckSquare className="text-indigo-400" size={24} />
                      <span>Assignments Workboard</span>
                    </h2>
                    <p className="text-xs text-white/40 font-sans">
                      Track course submissions, check review statuses, and review feedback from instructors.
                    </p>
                  </div>
                </div>

                {/* 1. STATISTICS OVERVIEW */}
                <div className="space-y-3">
                  <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-white/40">Statistics Overview</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { status: "Pending", title: "Pending", icon: Clock, count: animatedCounts.Pending, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10", activeBorder: "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-500/[0.02]" },
                      { status: "Submitted", title: "Submitted", icon: Send, count: animatedCounts.Submitted, color: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/10", activeBorder: "border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)] bg-indigo-500/[0.02]" },
                      { status: "Reviewing", title: "Reviewing", icon: Search, count: animatedCounts.Reviewing, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/10", activeBorder: "border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-blue-500/[0.02]" },
                      { status: "Revision Required", title: "Revision Required", icon: AlertTriangle, count: animatedCounts.RevisionRequired, color: "text-rose-400", bg: "bg-rose-500/5", border: "border-rose-500/10", activeBorder: "border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-rose-500/[0.02]" },
                      { status: "Completed", title: "Completed", icon: Award, count: animatedCounts.Completed, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10", activeBorder: "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/[0.02]" }
                    ].map((card) => {
                      const IconComponent = card.icon;
                      const isActive = assignmentStatusFilter === card.status;
                      return (
                        <motion.button
                          key={card.status}
                          whileHover={{ y: -4, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAssignmentStatusFilter(isActive ? "All" : card.status as any)}
                          className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                            isActive ? card.activeBorder : "bg-[#08080c] border-white/[0.06] hover:border-white/15"
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          
                          <div className="flex items-center justify-between w-full">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center border border-white/5 ${card.bg} ${card.color}`}>
                              <IconComponent size={16} />
                            </div>
                            {isActive && (
                              <span className={`text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 ${card.color}`}>
                                Active Filter
                              </span>
                            )}
                          </div>

                          <div className="mt-3">
                            <span className="block font-sans text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">
                              {card.title}
                            </span>
                            <span className="font-sans text-2xl font-black text-white leading-none">
                              {card.count}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. FILTERS */}
                <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Status Select Tabs */}
                    <div className="space-y-1.5 text-left flex-1">
                      <span className="block font-sans text-[10px] font-bold text-white/30 uppercase tracking-widest">Filter by Status</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Pending", "Submitted", "Reviewing", "Revision Required", "Completed"].map((status) => {
                          const isSelected = assignmentStatusFilter === status;
                          return (
                            <button
                              key={status}
                              onClick={() => setAssignmentStatusFilter(status as any)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                isSelected 
                                  ? "bg-indigo-600 border-indigo-500/20 text-white shadow-lg shadow-indigo-600/15" 
                                  : "bg-white/[0.01] border-white/5 hover:border-white/10 text-white/60 hover:text-white"
                              }`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Search Course Input with Suggestion Dropdown */}
                    <div className="space-y-1.5 text-left min-w-[260px] relative">
                      <span className="block font-sans text-[10px] font-bold text-white/30 uppercase tracking-widest">Search Course</span>
                      <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          type="text"
                          value={assignmentCourseSearch}
                          onChange={(e) => {
                            setAssignmentCourseSearch(e.target.value);
                            setIsCourseDropdownOpen(true);
                          }}
                          onFocus={() => setIsCourseDropdownOpen(true)}
                          placeholder="Type or select a course..."
                          className="w-full bg-white/[0.02] border border-white/10 hover:border-white/15 focus:border-white/20 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
                        />
                        {assignmentCourseSearch && (
                          <button
                            onClick={() => setAssignmentCourseSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-xs cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Suggestions */}
                      {isCourseDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setIsCourseDropdownOpen(false)} />
                          <div className="absolute top-[calc(100%+6px)] right-0 left-0 bg-[#0c0c14] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-40 max-h-48 overflow-y-auto">
                            <div className="p-1">
                              <button
                                onClick={() => {
                                  setAssignmentCourseSearch("");
                                  setIsCourseDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between"
                              >
                                <span>All Courses</span>
                                {!assignmentCourseSearch && <Check size={12} className="text-indigo-400" />}
                              </button>
                              {uniqueCourses.map((c) => {
                                const isSelected = assignmentCourseSearch.toLowerCase() === c.toLowerCase();
                                return (
                                  <button
                                    key={c}
                                    onClick={() => {
                                      setAssignmentCourseSearch(c);
                                      setIsCourseDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between"
                                  >
                                    <span className="truncate">{c}</span>
                                    {isSelected && <Check size={12} className="text-indigo-400" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Clear filters trigger */}
                  {(assignmentStatusFilter !== "All" || assignmentCourseSearch !== "") && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] mt-1">
                      <div className="text-[10px] text-white/40 font-mono">
                        Active filter: {assignmentStatusFilter !== "All" ? `Status [${assignmentStatusFilter}]` : ""} {assignmentCourseSearch ? `Course [${assignmentCourseSearch}]` : ""}
                      </div>
                      <button
                        onClick={() => {
                          setAssignmentStatusFilter("All");
                          setAssignmentCourseSearch("");
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold transition-all flex items-center gap-1 cursor-pointer font-sans"
                      >
                        <X size={12} />
                        <span>Clear All Filters</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. ASSIGNMENT CARDS LIST */}
                {filteredAssignments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAssignments.map((assignment, index) => {
                      const displayStatus = mapToDisplayStatus(assignment.status);
                      const sNum = getSessionNum(assignment);
                      return (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                          whileHover={{ y: -4, scale: 1.005 }}
                          className="bg-[#08080c] border border-white/[0.06] hover:border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-[0_4px_25px_rgba(0,0,0,0.45)] transition-all duration-300 relative overflow-hidden group text-left"
                        >
                          {/* Top-right glowing ring or shadow accent based on status */}
                          <div className={`absolute top-0 right-0 h-32 w-32 pointer-events-none blur-3xl opacity-20 rounded-full transition-all duration-500 ${
                            displayStatus === "Completed"
                              ? "bg-emerald-500/[0.04] group-hover:bg-emerald-500/[0.08]"
                              : displayStatus === "Revision Required"
                              ? "bg-rose-500/[0.04] group-hover:bg-rose-500/[0.08]"
                              : displayStatus === "Reviewing"
                              ? "bg-blue-500/[0.04] group-hover:bg-blue-500/[0.08]"
                              : displayStatus === "Submitted"
                              ? "bg-indigo-500/[0.04] group-hover:bg-indigo-500/[0.08]"
                              : "bg-amber-500/[0.04] group-hover:bg-amber-500/[0.08]"
                          }`} />

                          {/* Subtle top border accent line */}
                          <div className={`absolute top-0 inset-x-0 h-[2px] transition-all duration-300 ${
                            displayStatus === "Completed"
                              ? "bg-emerald-500/20 group-hover:bg-emerald-500/40"
                              : displayStatus === "Revision Required"
                              ? "bg-rose-500/20 group-hover:bg-rose-500/40"
                              : displayStatus === "Reviewing"
                              ? "bg-blue-500/20 group-hover:bg-blue-500/40"
                              : displayStatus === "Submitted"
                              ? "bg-indigo-500/20 group-hover:bg-indigo-500/40"
                              : "bg-amber-500/20 group-hover:bg-amber-500/40"
                          }`} />

                          {/* Top row status & metadata */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">
                                Assignment {assignment.assignmentNum}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-medium">
                                <span>Session {sNum}</span>
                                <span>•</span>
                                <span>Created: {assignment.publishDate}</span>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {getDisplayStatusBadge(assignment.status)}
                            </div>
                          </div>

                          {/* Course and Title */}
                          <div className="space-y-2">
                            <span className="block text-[10px] font-bold text-white/40 uppercase tracking-wider">
                              {assignment.course}
                            </span>
                            <h4 className="font-sans text-base font-black text-white tracking-tight leading-snug group-hover:text-indigo-300 transition-colors duration-200">
                              {assignment.title}
                            </h4>
                            <p className="text-[11px] text-white/50 leading-relaxed font-sans line-clamp-2">
                              {assignment.description}
                            </p>
                          </div>

                          {/* Footer with dates & details navigation button */}
                          <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-auto">
                            <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                              <Clock size={11} className="text-white/30" />
                              <span>Due: {assignment.dueDate}</span>
                            </div>
                            <button
                              onClick={() => handleViewAssignmentOnWorkboard(assignment)}
                              className="px-4 py-2 bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                            >
                              <span>View Details</span>
                              <ArrowRight size={11} className="stroke-[2.5]" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* 5. EMPTY STATE */
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.01] flex flex-col items-center justify-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/30">
                      <ClipboardList size={28} className="stroke-[1.5]" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="text-sm font-bold text-white">No assignments match your current filters.</h4>
                      <p className="text-xs text-white/40 leading-relaxed font-sans">
                        Try clearing some filter fields, selecting a different status filter, or typing a different course name to find your academic work.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAssignmentStatusFilter("All");
                        setAssignmentCourseSearch("");
                      }}
                      className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-white font-bold text-xs transition-all cursor-pointer font-sans"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === "achievements" && (
            <div className="space-y-6 text-left animate-fade-in w-full">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-5">
                <div className="space-y-1">
                  <h2 className="font-sans text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Award className="text-indigo-400" size={24} />
                    <span>Academic Achievements</span>
                  </h2>
                  <p className="text-xs text-white/40 font-sans">
                    View your academic credentials, course completion statistics, grades transcript, and feedback.
                  </p>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div className="sticky top-0 z-20 backdrop-blur-md bg-[#040407]/80 py-3 border-b border-white/[0.04] overflow-x-auto scrollbar-none flex items-center gap-1.5 transition-all">
                {[
                  "Overview",
                  "Certificates",
                  "Completed Courses",
                  "Teacher Feedback"
                ].map((tab) => {
                  const isActive = achievementsTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setAchievementsTab(tab as any)}
                      className="relative px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer"
                      style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeAchievementsTabIndicator"
                          className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-white" : "text-white/40 hover:text-white/80"}`}>
                        {tab}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents with animations */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={achievementsTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 pt-2"
                >
                  {/* OVERVIEW TAB */}
                  {achievementsTab === "Overview" && (
                    <div className="space-y-8">
                      {/* Achievement Statistics */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { 
                            title: "Certificates", 
                            value: achievementsAnimatedCounts.Certificates, 
                            icon: Award, 
                            color: "text-amber-400", 
                            bg: "bg-amber-500/5", 
                            border: "border-amber-500/10",
                            description: "Verifiable credentials"
                          },
                          { 
                            title: "Completed Courses", 
                            value: achievementsAnimatedCounts.CompletedCourses, 
                            icon: BookOpen, 
                            color: "text-indigo-400", 
                            bg: "bg-indigo-500/5", 
                            border: "border-indigo-500/10",
                            description: "Fully completed syllabi"
                          },
                          { 
                            title: "Academic Grade", 
                            value: achievementsAnimatedCounts.AcademicGrade === 0 ? "..." : `${achievementsAnimatedCounts.AcademicGrade.toFixed(1)} GPA`, 
                            icon: Sparkles, 
                            color: "text-purple-400", 
                            bg: "bg-purple-500/5", 
                            border: "border-purple-500/10",
                            description: "Current cumulative grade"
                          },
                          { 
                            title: "Completed Assignments", 
                            value: achievementsAnimatedCounts.CompletedAssignments, 
                            icon: CheckSquare, 
                            color: "text-emerald-400", 
                            bg: "bg-emerald-500/5", 
                            border: "border-emerald-500/10",
                            description: "Syllabus hand-ins graded"
                          }
                        ].map((stat, i) => {
                          const IconComponent = stat.icon;
                          return (
                            <motion.div
                              key={stat.title}
                              whileHover={{ y: -4, scale: 1.01 }}
                              className="bg-[#08080c] border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all relative overflow-hidden group text-left"
                            >
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{stat.title}</span>
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} ${stat.color}`}>
                                  <IconComponent size={14} />
                                </div>
                              </div>
                              <div className="mt-3 space-y-0.5">
                                <span className="block text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                                  {stat.title === "Academic Grade" && achievementsAnimatedCounts.AcademicGrade > 0 ? "4.0 GPA" : stat.value}
                                </span>
                                <span className="block text-[9px] text-white/30 font-medium">{stat.description}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Achievement Summary Section */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-white/40 border-b border-white/[0.04] pb-2">Achievement Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          {/* Latest Certificate */}
                          <div className="bg-[#08080c] border border-amber-500/10 hover:border-amber-500/20 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-amber-400 font-bold uppercase font-mono tracking-widest">Latest Certificate</span>
                                <span className="px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">Credentials Active</span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-sans text-sm font-black text-white group-hover:text-amber-300 transition-colors">Premium Dark Design Systems</h4>
                                <p className="text-[10px] text-white/40 font-mono">Issued: July 20, 2026</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setViewingCertificateCourse("Premium Dark Design Systems")}
                              className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-400 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans mt-2"
                            >
                              <span>View Certificate</span>
                              <ExternalLink size={12} />
                            </button>
                          </div>

                          {/* Latest Completed Course */}
                          <div className="bg-[#08080c] border border-indigo-500/10 hover:border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-indigo-400 font-bold uppercase font-mono tracking-widest">Completed Course</span>
                                <span className="px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Syllabus complete</span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-sans text-sm font-black text-white group-hover:text-indigo-300 transition-colors">Premium Dark Design Systems</h4>
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400" /> Completed
                                  </span>
                                  <span className="text-[10px] text-white/40 font-mono">• July 20, 2026</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-[10px] text-white/50 leading-relaxed font-sans bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-xl">
                              Marcus Aurelius: "A masterclass student. Courtney's ability to maintain a dark design theme with aesthetic harmony is phenomenal."
                            </div>
                          </div>

                          {/* Latest Teacher Feedback */}
                          <div className="bg-[#08080c] border border-purple-500/10 hover:border-purple-500/20 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-purple-400 font-bold uppercase font-mono tracking-widest">Instructor Evaluation</span>
                                <span className="px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">New Feedback</span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-sans text-sm font-black text-white group-hover:text-purple-300 transition-colors">Micro-interactions Evaluation</h4>
                                <p className="text-[10px] text-white/40 font-mono">By Professor Marcus Aurelius</p>
                              </div>
                            </div>
                            <div className="text-[11px] text-white/50 leading-relaxed font-sans line-clamp-2 bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-xl">
                              "Outstanding visual precision. The hover micro-interactions are highly responsive. Your code is modular..."
                            </div>
                            <button
                              onClick={() => {
                                setCourseDetailsTab("Feedback");
                                setSelectedCourseId("2");
                                setActiveTab("courses");
                                showCustomToast("Switched to Course Evaluation view", "info");
                              }}
                              className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 text-purple-400 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                            >
                              <span>View Feedback</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* CERTIFICATES TAB */}
                  {achievementsTab === "Certificates" && (() => {
                    const earnedCourses = courses.filter(c => c.progress >= 60);
                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {earnedCourses.length === 0 ? (
                            <div className="col-span-full py-16 px-6 bg-[#08080c] border border-white/[0.04] rounded-3xl text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4 shadow-2xl">
                              <div className="h-16 w-16 rounded-full bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500/40">
                                <Award size={32} className="stroke-[1.2]" />
                              </div>
                              <div className="space-y-1.5">
                                <h4 className="font-sans text-base font-black text-white">No Certificates Earned</h4>
                                <p className="font-sans text-xs text-white/40 leading-relaxed">
                                  You haven't earned any certificates yet. Complete your courses successfully to receive your certificates.
                                </p>
                              </div>
                            </div>
                          ) : (
                            earnedCourses.map((course) => {
                              return (
                                <motion.div
                                  key={course.id}
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-[#08080c] border border-white/[0.04] hover:border-amber-500/20 rounded-3xl p-5 flex flex-col justify-between gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 group h-full relative overflow-hidden"
                                >
                                  {/* Top right decorative glow */}
                                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-xl group-hover:bg-amber-500/[0.04] transition-all" />

                                  {/* Certificate preview image (thumbnail) */}
                                  <div className="aspect-[1.414/1] w-full rounded-2xl border-2 border-amber-500/15 bg-gradient-to-b from-[#0c0c12] to-[#040406] overflow-hidden relative flex flex-col items-center justify-between p-4 shadow-inner">
                                    {/* Subtle decorative accents */}
                                    <div className="absolute inset-1 border border-amber-500/5 rounded-xl pointer-events-none" />
                                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-xl pointer-events-none" />
                                    <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-indigo-500/[0.02] rounded-full blur-xl pointer-events-none" />
                                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                                    {/* Top: Academy name */}
                                    <div className="text-center">
                                      <h5 className="font-mono text-[7px] uppercase tracking-[0.2em] text-amber-400 font-extrabold leading-none">
                                        ROOZZERO ACADEMY
                                      </h5>
                                      <span className="text-[5px] text-white/20 uppercase tracking-widest font-mono">VERIFIED CREDENTIAL</span>
                                    </div>

                                    {/* Center: Title & Student Name */}
                                    <div className="text-center space-y-1">
                                      <span className="text-[6px] text-white/30 uppercase tracking-widest font-mono">CERTIFICATE OF COMPLETION</span>
                                      <h4 className="font-sans text-[9px] sm:text-[11px] font-black text-white uppercase tracking-wider line-clamp-1 px-2">
                                        {course.title}
                                      </h4>
                                      <p className="text-[7px] text-amber-200/80 font-serif italic">Presented to {profileName}</p>
                                    </div>

                                    {/* Bottom: Grade, Seal, Date */}
                                    <div className="w-full flex items-center justify-between text-[6px] text-white/40 font-mono border-t border-white/[0.04] pt-1.5">
                                      <span>GRADE: {course.progress >= 90 ? "A" : "B"}</span>
                                      <div className="h-4 w-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                        <Sparkles size={8} />
                                      </div>
                                      <span>RZ-CRT-{course.id}092</span>
                                    </div>

                                    {/* Interactive hover overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer" onClick={() => setViewingCertificateCourse(course.title)}>
                                      <div className="p-2.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                        <ZoomIn size={18} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Info Content Section */}
                                  <div className="space-y-3 flex-grow flex flex-col justify-between">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-1.5 text-amber-400/80">
                                        <Award size={14} className="shrink-0" />
                                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Verified Academic Credential</span>
                                      </div>
                                      <h4 className="font-sans text-base font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                                        {course.title}
                                      </h4>
                                    </div>

                                    {/* Instructor and issue date */}
                                    <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-white/[0.04] pt-3 text-white/50 font-sans">
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider block">Instructor</span>
                                        <span className="font-semibold block text-white/80">{course.instructor}</span>
                                      </div>
                                      <div className="space-y-0.5 text-right">
                                        <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider block">Issue Date</span>
                                        <span className="font-semibold block text-white/80">{course.startDate.split(",")[1]?.trim() || "2026"}</span>
                                      </div>
                                    </div>

                                    {/* Certificate serial number */}
                                    <div className="text-[10px] text-white/30 font-mono">
                                      CREDENTIAL ID: <span className="text-white/50">RZ-CRT-{course.id}092-2026</span>
                                    </div>
                                  </div>

                                  {/* Actions section */}
                                  <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                      onClick={() => setViewingCertificateCourse(course.title)}
                                      className="py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-400 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                                    >
                                      <ZoomIn size={12} />
                                      <span>View</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        showCustomToast("Preparing PDF generation...", "info");
                                        setTimeout(() => {
                                          const docName = `RZ-CRT-${course.title.replace(/\s+/g, "-")}.pdf`;
                                          const blob = new Blob(["%PDF-1.4 ..."], { type: "application/pdf" });
                                          const url = URL.createObjectURL(blob);
                                          const link = document.createElement("a");
                                          link.href = url;
                                          link.download = docName;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          URL.revokeObjectURL(url);
                                          showCustomToast("Downloaded Course Certificate PDF successfully!", "success");
                                        }, 1200);
                                      }}
                                      className="py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/15 text-white/85 hover:text-white rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                                    >
                                      <Download size={12} />
                                      <span>Download PDF</span>
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* COMPLETED COURSES TAB */}
                  {achievementsTab === "Completed Courses" && (() => {
                    const completedCoursesList = courses.filter(c => c.status === "Completed" || c.progress >= 100);
                    return (
                      <div className="space-y-6">
                        {completedCoursesList.length === 0 ? (
                          <div className="py-16 px-6 bg-[#08080c] border border-white/[0.04] rounded-3xl text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4 shadow-2xl">
                            <div className="h-16 w-16 rounded-full bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500/40">
                              <BookOpen size={32} className="stroke-[1.2]" />
                            </div>
                            <div className="space-y-1.5">
                              <h4 className="font-sans text-base font-black text-white">No Completed Courses</h4>
                              <p className="font-sans text-xs text-white/40 leading-relaxed">
                                You haven't completed any courses yet. Finish your enrolled courses to see them here.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                            {completedCoursesList.map((course) => {
                              const finalGrade = course.progress >= 90 ? "A" : course.progress >= 60 ? "B" : "C";
                              return (
                                <motion.div
                                  key={course.id}
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-[#08080c] border border-white/[0.06] hover:border-indigo-500/20 rounded-3xl p-5 flex flex-col justify-between gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 group h-full relative overflow-hidden"
                                >
                                  {/* Decorative Top-Right Glow */}
                                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/[0.02] rounded-full blur-xl group-hover:bg-indigo-500/[0.05] transition-all" />

                                  {/* Thumbnail section */}
                                  <div className="relative aspect-video w-full rounded-2xl border border-white/5 overflow-hidden bg-white/[0.02] shrink-0">
                                    {course.thumbnail ? (
                                      <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-[#0c0c14] to-[#040406] flex items-center justify-center text-white/15">
                                        <BookOpen size={48} className="stroke-[1]" />
                                      </div>
                                    )}
                                    {/* Grade badge overlay */}
                                    <div className="absolute top-3 right-3">
                                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-lg border ${
                                        finalGrade === "A" 
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/2" 
                                          : finalGrade === "B" 
                                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/2" 
                                          : "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/2"
                                      }`}>
                                        Grade {finalGrade}
                                      </span>
                                    </div>
                                    {/* Academy name badge on top left */}
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/5">
                                      <span className="text-[8px] font-mono tracking-widest text-white/60 uppercase font-bold">RoZ Completed</span>
                                    </div>
                                  </div>

                                  {/* Info Area */}
                                  <div className="space-y-4 flex-grow flex flex-col justify-between">
                                    <div className="space-y-1.5">
                                      <h3 className="font-sans text-lg font-black text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-1">
                                        {course.title}
                                      </h3>
                                      <div className="flex items-center gap-1.5 text-white/40 text-xs">
                                        <Briefcase size={13} className="text-indigo-400" />
                                        <span>Instructor: <strong className="text-white/75 font-semibold">{course.instructor}</strong></span>
                                      </div>
                                    </div>

                                    {/* Date & Session statistics */}
                                    <div className="grid grid-cols-2 gap-3 bg-white/[0.01] border border-white/[0.03] p-3 rounded-2xl text-xs font-sans">
                                      <div className="space-y-1">
                                        <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider block">Duration</span>
                                        <div className="flex items-center gap-1 text-white/80">
                                          <CalendarIcon size={12} className="text-white/40" />
                                          <span className="font-medium line-clamp-1">{course.startDate.split(",")[0]} - {course.endDate.split(",")[0]}</span>
                                        </div>
                                      </div>
                                      <div className="space-y-1 text-right">
                                        <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider block">Sessions</span>
                                        <div className="flex items-center gap-1 justify-end text-white/80">
                                          <Clock size={12} className="text-white/40" />
                                          <span className="font-mono font-bold">{course.totalSessions} sessions completed</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons Section */}
                                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.04]">
                                    {/* View Course */}
                                    <button
                                      onClick={() => {
                                        setActiveTab("courses");
                                        setSelectedCourseId(course.id);
                                        setCourseDetailsTab("Overview");
                                        showCustomToast(`Navigated to ${course.title} course area`, "success");
                                      }}
                                      className="py-2.5 px-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
                                      title="Go to Course page"
                                    >
                                      <BookOpen size={12} />
                                      <span>View Course</span>
                                    </button>

                                    {/* Certificate */}
                                    <button
                                      onClick={() => {
                                        setViewingCertificateCourse(course.title);
                                      }}
                                      className="py-2.5 px-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-400 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
                                      title="View Course Certificate"
                                    >
                                      <Award size={12} />
                                      <span>Certificate</span>
                                    </button>

                                    {/* Teacher Feedback */}
                                    <button
                                      onClick={() => {
                                        setViewingFeedbackCourse(course);
                                      }}
                                      className="py-2.5 px-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 text-purple-400 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
                                      title="View Instructor Written Feedback"
                                    >
                                      <ClipboardList size={12} />
                                      <span>Feedback</span>
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* TEACHER FEEDBACK TAB */}
                  {achievementsTab === "Teacher Feedback" && (() => {
                    const completedCoursesList = courses.filter(c => c.status === "Completed" || c.progress >= 100);
                    return (
                      <div className="space-y-6">
                        {completedCoursesList.length === 0 ? (
                          <div className="py-16 px-6 bg-[#08080c] border border-white/[0.04] rounded-3xl text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4 shadow-2xl font-sans">
                            <div className="h-16 w-16 rounded-full bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-500/40">
                              <ClipboardList size={32} className="stroke-[1.2]" />
                            </div>
                            <div className="space-y-1.5">
                              <h4 className="font-sans text-base font-black text-white">No Instructor Feedback</h4>
                              <p className="font-sans text-xs text-white/40 leading-relaxed">
                                No instructor feedback is available yet. Complete your courses and wait for your instructor's evaluation to see feedback here.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                            {completedCoursesList.map((course) => {
                              // Get course feedback based on course title
                              let recommendation = {
                                strengths: "Excellent grasp of concurrent rendering paradigms and performance tuning. Demonstrated exceptional engineering in designing custom hooks and memory leak audits.",
                                weaknesses: "Could spend a bit more focus on documenting decoupled custom architectures and service-to-service state synchronization flows.",
                                suggestions: "Deepen understanding of React Server Components (RSC) and study HTTP/3 streaming strategies for complex edge delivery.",
                                comments: "Courtney has shown stellar performance throughout the core syllabus. Highly capable of leading complex web engineering projects."
                              };

                              if (course.title.toLowerCase().includes("design")) {
                                recommendation = {
                                  strengths: "Unparalleled eye for pixel-perfection, Swiss typography principles, and WCAG AA contrast compliance in complex dark layouts.",
                                  weaknesses: "Occasionally spent too much time perfecting micro-interaction timing in early sandbox drafts before establishing baseline wireframes.",
                                  suggestions: "Perfect standard design token automation using Style Dictionary to scale systems across multiple platforms like Android and iOS.",
                                  comments: "A masterclass student. Courtney's ability to maintain a dark design theme with aesthetic harmony and high usability is phenomenal."
                                };
                              } else if (course.title.toLowerCase().includes("learning") || course.title.toLowerCase().includes("machine")) {
                                recommendation = {
                                  strengths: "Strong theoretical foundations in linear algebra and basic matrix operations.",
                                  weaknesses: "Lack of active session participation and practical coding lab hand-ins so far.",
                                  suggestions: "Allocate dedicated hours to step-by-step linear regression foundations and coding gradient descent algorithms from scratch.",
                                  comments: "Must prioritize syllabus lectures and homework submissions. With consistent attendance, has high potential to grasp advanced deep learning models."
                                };
                              }

                              const initials = course.instructor
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                              const isVance = course.instructor.includes("Vance");
                              const isMarcus = course.instructor.includes("Marcus");
                              const avatarBg = isVance 
                                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
                                : isMarcus 
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                                : "bg-purple-500/10 border-purple-500/20 text-purple-400";

                              return (
                                <motion.div
                                  key={course.id}
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-[#08080c] border border-white/[0.06] hover:border-indigo-500/20 rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 group h-full relative overflow-hidden text-left font-sans"
                                >
                                  {/* Top-Right Decorative Glow */}
                                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/[0.02] rounded-full blur-xl group-hover:bg-indigo-500/[0.04] transition-all" />

                                  <div className="space-y-4">
                                    {/* Instructor Info */}
                                    <div className="flex items-center gap-3">
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${avatarBg}`}>
                                        {initials}
                                      </div>
                                      <div className="space-y-0.5">
                                        <h4 className="font-sans text-sm font-bold text-white">{course.instructor}</h4>
                                        <span className="text-[10px] text-white/40 font-sans block">Instructor</span>
                                      </div>
                                    </div>

                                    {/* Course Details Block */}
                                    <div className="space-y-1">
                                      <h3 className="font-sans text-sm font-black text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-1">
                                        {course.title}
                                      </h3>
                                      <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-mono">
                                        <CalendarIcon size={11} className="text-white/30" />
                                        <span>{course.startDate} – {course.endDate}</span>
                                      </div>
                                    </div>

                                    {/* Feedback comments section */}
                                    <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl space-y-1.5">
                                      <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Final Feedback Quote</span>
                                      <p className="text-xs text-white/70 leading-relaxed font-sans italic line-clamp-4">
                                        "{recommendation.comments}"
                                      </p>
                                    </div>
                                  </div>

                                  {/* Actions block */}
                                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.04]">
                                    {/* Read More button */}
                                    <button
                                      onClick={() => setViewingFeedbackCourse(course)}
                                      className="py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                                      title="Read full evaluation"
                                    >
                                      <ClipboardList size={12} />
                                      <span>Read More</span>
                                    </button>

                                    {/* Go to Course button */}
                                    <button
                                      onClick={() => {
                                        setActiveTab("courses");
                                        setSelectedCourseId(course.id);
                                        setCourseDetailsTab("Overview");
                                        showCustomToast(`Navigated to ${course.title} course page`, "success");
                                      }}
                                      className="py-2.5 bg-[#0c0c14] hover:bg-white/[0.04] border border-white/10 hover:border-white/15 text-white/90 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                                      title="Go to Course details"
                                    >
                                      <BookOpen size={12} />
                                      <span>Go to Course</span>
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>

              {/* Certificate Modal Overlay Portal */}
              {viewingCertificateCourse && (() => {
                const targetCourse = courses.find(c => c.title === viewingCertificateCourse) || courses[1];
                return (
                  <PremiumCertificateViewerModal 
                    course={targetCourse} 
                    studentName={profileName}
                    onClose={() => setViewingCertificateCourse(null)}
                    showCustomToast={showCustomToast}
                  />
                );
              })()}

              {/* Teacher Feedback Modal Overlay Portal */}
              {viewingFeedbackCourse && (
                <AnimatePresence>
                  <PremiumFeedbackModal
                    course={viewingFeedbackCourse}
                    onClose={() => setViewingFeedbackCourse(null)}
                  />
                </AnimatePresence>
              )}
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Visual mini-calendar grid */}
              <div className="lg:col-span-1 bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 space-y-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-sans text-base font-extrabold text-white">July 2026</h3>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Active Month</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-white/40 mb-2">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>
                <div className="grid grid-cols-7 gap-1 justify-items-center">
                  {/* Empty cells */}
                  <div className="h-7 w-7" /><div className="h-7 w-7" />
                  {Array.from({ length: 30 }).map((_, i) => {
                    const dayNum = i + 1;
                    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                    const isSelected = daysOfWeek[activeDayIndex]?.num === formattedDay;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          const idx = daysOfWeek.findIndex(d => d.num === formattedDay);
                          if (idx !== -1) setActiveDayIndex(idx);
                        }}
                        disabled={!daysOfWeek.some(d => d.num === formattedDay)}
                        className={`h-7 w-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                          isSelected 
                            ? "bg-indigo-600 text-white shadow-md border border-indigo-400/20" 
                            : daysOfWeek.some(d => d.num === formattedDay)
                            ? "bg-white/[0.02] border border-white/5 text-white/80 hover:bg-white/10"
                            : "text-white/20 pointer-events-none"
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>

                {/* Inline form to add meeting */}
                <form onSubmit={handleAddMeeting} className="border-t border-white/[0.04] pt-4 space-y-3 text-left">
                  <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase block">Schedule New Slot</span>
                  <input
                    type="text"
                    required
                    placeholder="Meeting Title"
                    value={newMeetingTitle}
                    onChange={(e) => setNewMeetingTitle(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1:00 - 2:00 pm"
                    value={newMeetingTime}
                    onChange={(e) => setNewMeetingTime(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                  />
                  <textarea
                    placeholder="Brief description..."
                    value={newMeetingDesc}
                    onChange={(e) => setNewMeetingDesc(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all min-h-[60px]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white transition-all text-center"
                  >
                    Add to Schedule
                  </button>
                </form>
              </div>

              {/* Day's appointments list */}
              <div className="lg:col-span-2 bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 space-y-6 text-left">
                <div className="border-b border-white/[0.05] pb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">July 2026 Agenda</span>
                    <h2 className="font-sans text-lg font-black text-white">
                      Selected Day: {daysOfWeek[activeDayIndex]?.day || "Mon"} {daysOfWeek[activeDayIndex]?.num || "07"}
                    </h2>
                  </div>
                  <span className="bg-white/[0.03] border border-white/10 text-white/80 text-xs px-3 py-1 rounded-xl">
                    {calendarEvents.filter(ev => ev.date === `${daysOfWeek[activeDayIndex]?.day} ${daysOfWeek[activeDayIndex]?.num}`).length} Events
                  </span>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const activeDayStr = `${daysOfWeek[activeDayIndex]?.day} ${daysOfWeek[activeDayIndex]?.num}`;
                    const activeEvs = calendarEvents.filter(ev => ev.date === activeDayStr);
                    if (activeEvs.length === 0) {
                      return (
                        <div className="py-12 text-center text-white/30 space-y-2">
                          <p className="font-sans text-sm">No scheduled events for this day.</p>
                          <p className="text-[10px]">Use the sidebar form to add an academic slot.</p>
                        </div>
                      );
                    }
                    return activeEvs.map((ev) => (
                      <div key={ev.id} className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.06] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                        <div className="space-y-1.5 max-w-lg">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-wider">{ev.time}</span>
                          <h4 className="font-sans text-sm font-black text-white">{ev.title}</h4>
                          <p className="font-sans text-xs text-white/50 leading-relaxed">{ev.desc}</p>
                        </div>
                        <span className="inline-flex self-start md:self-center px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/[0.03] border border-white/[0.05] text-white/70">
                          Scheduled
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in pb-10 w-full font-sans">
              
              {/* Header */}
              <div className="space-y-1.5 text-left pb-2">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">Academic Portal Workspace</span>
                <h2 className="font-sans text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Settings className="text-indigo-400" size={24} />
                  <span>Portal Settings</span>
                </h2>
                <p className="text-xs text-white/40 max-w-2xl leading-relaxed">
                  Redesigned dashboard settings hub. Manage your secure student account, edit your academy profile metadata, configure portal aesthetics, and review sign-in activity.
                </p>
              </div>

              {/* Sub-tab Navigation */}
              <div className="sticky top-0 z-20 backdrop-blur-md bg-[#040407]/80 py-3 border-b border-white/[0.04] overflow-x-auto scrollbar-none flex items-center gap-1.5 transition-all">
                {[
                  { id: "Account", label: "Account", icon: User },
                  { id: "Profile", label: "Profile", icon: ClipboardList },
                  { id: "Appearance", label: "Appearance", icon: Palette },
                  { id: "Security", label: "Security", icon: Shield }
                ].map((tab) => {
                  const isActive = settingsActiveTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsActiveTab(tab.id as any)}
                      className="relative px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer flex items-center gap-2"
                      style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSettingsTabIndicator"
                          className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <TabIcon size={14} className={`relative z-10 ${isActive ? "text-white" : "text-white/40"}`} />
                      <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-white" : "text-white/40 hover:text-white/80"}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={settingsActiveTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  
                  {/* ACCOUNT TAB */}
                  {settingsActiveTab === "Account" && (
                    <div className="max-w-3xl mx-auto bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left font-sans">
                      <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                      
                      <div className="border-b border-white/[0.05] pb-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-sans text-base font-black text-white">Student Account Information</h3>
                          <p className="text-xs text-white/40">Update your primary registration profile identifiers</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-full border border-indigo-500/10 font-mono">
                          Verifiable Profile
                        </span>
                      </div>

                      <form onSubmit={handleSaveAccount} className="space-y-5">
                        
                        {/* Name Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* First Name */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">First Name</label>
                            <input
                              type="text"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className={`w-full bg-white/[0.01] hover:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                                accountSubmittedErrors.firstName 
                                  ? "border-rose-500/40 focus:border-rose-500" 
                                  : "border-white/10 focus:border-indigo-500/50"
                              }`}
                              placeholder="Courtney"
                            />
                            {accountSubmittedErrors.firstName && (
                              <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {accountSubmittedErrors.firstName}</p>
                            )}
                          </div>

                          {/* Last Name */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Last Name</label>
                            <input
                              type="text"
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className={`w-full bg-white/[0.01] hover:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                                accountSubmittedErrors.lastName 
                                  ? "border-rose-500/40 focus:border-rose-500" 
                                  : "border-white/10 focus:border-indigo-500/50"
                              }`}
                              placeholder="Henry"
                            />
                            {accountSubmittedErrors.lastName && (
                              <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {accountSubmittedErrors.lastName}</p>
                            )}
                          </div>
                        </div>

                        {/* Username Field with Change Policy Logic */}
                        {(() => {
                          const policy = getUsernameChangePolicyDetails();
                          const isLocked = policy.isWithin30Days && !adminApproved;
                          
                          return (
                            <div className="space-y-2 bg-[#0c0c14]/50 border border-white/[0.03] p-4 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Username handle</label>
                                <div className="flex items-center gap-1.5">
                                  {isLocked ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/5 text-amber-400 border border-amber-500/10">
                                      <Lock size={10} /> Read-Only
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
                                      Editable
                                    </span>
                                  )}
                                </div>
                              </div>

                              <input
                                type="text"
                                disabled={isLocked}
                                value={username}
                                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                                className={`w-full bg-white/[0.01] hover:bg-white/[0.02] disabled:hover:bg-transparent border rounded-2xl px-4 py-3 text-xs text-white disabled:text-white/40 placeholder-white/30 focus:outline-none transition-all ${
                                  isLocked 
                                    ? "border-white/[0.03] bg-transparent cursor-not-allowed" 
                                    : accountSubmittedErrors.username
                                    ? "border-rose-500/40 focus:border-rose-500"
                                    : "border-white/10 focus:border-indigo-500/50"
                                }`}
                                placeholder="courtney_h"
                              />

                              {isLocked && (
                                <p className="text-[10px] text-rose-400/90 leading-relaxed font-sans mt-1">
                                  Your username can only be changed once every 30 days (Next eligible: {policy.eligibleDate}).
                                </p>
                              )}

                              {accountSubmittedErrors.username && (
                                <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {accountSubmittedErrors.username}</p>
                              )}
                            </div>
                          );
                        })()}

                        {/* Email Address */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Email Address</label>
                          <input
                            type="email"
                            required
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className={`w-full bg-white/[0.01] hover:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                              accountSubmittedErrors.email
                                ? "border-rose-500/40 focus:border-rose-500" 
                                : "border-white/10 focus:border-indigo-500/50"
                            }`}
                            placeholder="schoepplake@gmail.com"
                          />
                          {accountSubmittedErrors.email && (
                            <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {accountSubmittedErrors.email}</p>
                          )}
                        </div>

                        {/* Phone Number Group (Iran fixed) */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Phone Number</label>
                          <div className="flex gap-3">
                            <div className="flex items-center justify-center bg-[#0c0c14] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white/80 font-sans h-11 shrink-0 select-none">
                              🇮🇷 +98 (Iran)
                            </div>
                            <input
                              type="text"
                              required
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                              className={`w-full bg-white/[0.01] hover:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all h-11 ${
                                accountSubmittedErrors.phoneNumber 
                                  ? "border-rose-500/40 focus:border-rose-500" 
                                  : "border-white/10 focus:border-indigo-500/50"
                              }`}
                              placeholder="9123456789"
                            />
                          </div>
                          {accountSubmittedErrors.phoneNumber && (
                            <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {accountSubmittedErrors.phoneNumber}</p>
                          )}
                        </div>

                        {/* Form Save Information */}
                        <div className="pt-4 border-t border-white/[0.04] text-left">
                          <p className="text-[11px] text-white/30">Changes can be saved using the global save action button below.</p>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* PROFILE TAB */}
                  {settingsActiveTab === "Profile" && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left items-start animate-fade-in font-sans">
                      {/* Profile Photo Card */}
                      <div className="xl:col-span-1 bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                        
                        <div className="border-b border-white/[0.05] pb-4">
                          <h3 className="font-sans text-sm font-black text-white">Profile Photo</h3>
                          <p className="text-[10px] text-white/40 mt-0.5">Customize your student card display image</p>
                        </div>

                        {/* Avatar Display & Canvas Crop Tools */}
                        <div className="flex flex-col items-center justify-center space-y-5">
                          <div className="relative group">
                            {/* Circular Preview Container */}
                            <div className="h-32 w-32 rounded-full border-2 border-white/10 overflow-hidden bg-zinc-950 flex items-center justify-center relative shadow-inner">
                              {draftProfilePic ? (
                                <img
                                  src={draftProfilePic}
                                  alt="Profile Preview"
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover transition-transform duration-300"
                                />
                              ) : (
                                <div className="h-full w-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-3xl font-black font-sans">
                                  {firstName.slice(0, 1).toUpperCase()}{lastName.slice(0, 1).toUpperCase()}
                                </div>
                              )}

                              {isPhotoUploading && (
                                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center space-y-2 z-10">
                                  <RefreshCw size={20} className="animate-spin text-indigo-400" />
                                  <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                                    <div 
                                      className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${photoUploadProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-[9px] font-bold text-white/80 uppercase">Uploading {photoUploadProgress}%</span>
                                </div>
                              )}
                            </div>

                            {draftProfilePic && !isPhotoUploading && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftProfilePic("");
                                  setCropZoom(1);
                                  setCropRotate(0);
                                  showCustomToast("Profile photo draft removed.", "info");
                                }}
                                className="absolute -bottom-1 -right-1 p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full border border-rose-600/30 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                                title="Remove Photo"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>

                          {/* Drag & Drop Upload Zone */}
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOver(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                processProfileImageWithCrop(file, 1, 0);
                              }
                            }}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ".jpg,.jpeg,.png,.webp";
                              input.onchange = (e: any) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  processProfileImageWithCrop(file, 1, 0);
                                }
                              };
                              input.click();
                            }}
                            className={`w-full border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer text-center space-y-1.5 select-none ${
                              dragOver
                                ? "border-indigo-500 bg-indigo-500/[0.04]"
                                : "border-white/10 hover:border-white/20 hover:bg-white/[0.01]"
                            }`}
                          >
                            <div className="h-8 w-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-white/60">
                              <Camera size={14} />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-sans text-[11px] font-bold text-white/80">Drag and drop photo here</p>
                              <p className="font-sans text-[9px] text-white/40">JPG, PNG, WEBP • Max 2 MB</p>
                            </div>
                          </div>

                          {photoError && (
                            <p className="text-[10px] text-rose-400 text-center font-sans font-bold leading-normal bg-rose-500/[0.04] border border-rose-500/10 px-3 py-1.5 rounded-xl w-full">
                              ⚠️ {photoError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bio Card */}
                      <div className="xl:col-span-2 bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                        
                        <div className="border-b border-white/[0.05] pb-4">
                          <h3 className="font-sans text-base font-black text-white">Public Profile Settings</h3>
                          <p className="text-xs text-white/40">Customize how your public bio is rendered in the academy directory</p>
                        </div>

                        <div className="space-y-5">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                                Biography
                              </label>
                              <span className={`text-[10px] font-mono font-bold ${draftBio.length >= 300 ? "text-rose-400" : "text-white/40"}`}>
                                {draftBio.length} / 300
                              </span>
                            </div>
                            
                            <textarea
                              ref={bioTextareaRef}
                              rows={4}
                              maxLength={300}
                              value={draftBio}
                              onChange={(e) => {
                                setDraftBio(e.target.value);
                                if (bioTextareaRef.current) {
                                  bioTextareaRef.current.style.height = "auto";
                                  bioTextareaRef.current.style.height = bioTextareaRef.current.scrollHeight + "px";
                                }
                              }}
                              placeholder="Brief academic biography..."
                              className="w-full bg-white/[0.01] hover:bg-white/[0.02] focus:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-sans resize-none overflow-hidden"
                            />
                            <p className="text-[10px] text-white/30 leading-normal">
                              Keep your public biography short and readable. Character counts are enforced in real-time.
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/[0.04]">
                            <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase block mb-2">DIRECTORY PREVIEW CARD</span>
                            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-start gap-4">
                              <div className="h-12 w-12 rounded-full border border-white/10 bg-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                                {draftProfilePic ? (
                                  <img 
                                    src={draftProfilePic} 
                                    alt="Avatar" 
                                    className="h-full w-full object-cover"
                                    style={{
                                      transform: `scale(${cropZoom}) rotate(${cropRotate}deg)`
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-indigo-400">
                                    {firstName.slice(0, 1).toUpperCase()}{lastName.slice(0, 1).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className="font-sans text-xs font-black text-white block">{firstName} {lastName}</span>
                                <span className="text-[9px] font-mono text-indigo-400 block uppercase font-bold">@{(username || "courtney").toLowerCase()}</span>
                                <p className="text-[10px] text-white/50 leading-relaxed italic">
                                  "{draftBio || "No biography provided yet."}"
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APPEARANCE TAB */}
                  {settingsActiveTab === "Appearance" && (
                    <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 max-w-3xl mx-auto space-y-6 text-left shadow-2xl relative overflow-hidden font-sans animate-fade-in">
                      <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                      
                      <div className="border-b border-white/[0.05] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">Portal Theme Engine</span>
                          <h3 className="font-sans text-base font-black text-white">Interface Look and Feel</h3>
                          <p className="text-xs text-white/40">Adjust background color accents and light/dark density modes</p>
                        </div>
                        <span className="text-[10px] self-start sm:self-center font-bold uppercase text-white/40 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
                          Theme Settings
                        </span>
                      </div>

                      {/* Theme Selection - Modern Horizontal Row */}
                      <div className="space-y-4 pt-2">
                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Visual Theme Selector</span>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "dark", label: "Dark Mode", icon: Moon },
                            { id: "light", label: "Light Mode", icon: Sun },
                            { id: "system", label: "System Sync", icon: Monitor }
                          ].map((item) => {
                            const isSel = draftTheme === item.id;
                            const Icon = item.icon;
                            return (
                              <button
                                type="button"
                                key={item.id}
                                onClick={() => setDraftTheme(item.id as any)}
                                className={`flex flex-col sm:flex-row items-center justify-center gap-2.5 p-4 rounded-2xl border text-center sm:text-left transition-all cursor-pointer ${
                                  isSel
                                    ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/10 text-white"
                                    : "bg-white/[0.01] hover:bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white/80"
                                }`}
                              >
                                <Icon size={16} className={isSel ? "text-white" : "text-white/60"} />
                                <span className="text-xs font-bold font-sans">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECURITY TAB */}
                  {settingsActiveTab === "Security" && (
                    <div className="max-w-3xl mx-auto bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left font-sans animate-fade-in">
                      <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                      
                      <div className="border-b border-white/[0.05] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-sans text-base font-black text-white">Credential Change</h3>
                          <p className="text-xs text-white/40">Secure your academy profile with a complex master password</p>
                        </div>
                        
                        {/* Simulated Authentication Switcher */}
                        <div className="flex bg-white/[0.02] border border-white/[0.05] p-1 rounded-xl items-center shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsGoogleAccount(false);
                              setSecCurrentPassword("");
                              setSecNewPassword("");
                              setSecConfirmPassword("");
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                              !isGoogleAccount ? "bg-indigo-600 text-white shadow" : "text-white/40 hover:text-white/70"
                            }`}
                          >
                            Standard
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsGoogleAccount(true);
                              setSecCurrentPassword("");
                              setSecNewPassword("");
                              setSecConfirmPassword("");
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                              isGoogleAccount ? "bg-indigo-600 text-white shadow" : "text-white/40 hover:text-white/70"
                            }`}
                          >
                            Google Auth
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {!isGoogleAccount && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={secCurrentPassword}
                              onChange={(e) => setSecCurrentPassword(e.target.value)}
                              placeholder="Enter current master password"
                              className={`w-full bg-white/[0.01] hover:bg-white/[0.02] focus:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none transition-all font-sans ${
                                securitySubmittedErrors.currentPassword 
                                  ? "border-rose-500/40 focus:border-rose-500" 
                                  : "border-white/10 focus:border-indigo-500/50"
                              }`}
                            />
                            {securitySubmittedErrors.currentPassword && (
                              <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {securitySubmittedErrors.currentPassword}</p>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={secNewPassword}
                              onChange={(e) => setSecNewPassword(e.target.value)}
                              placeholder="Minimum 8 characters"
                              className={`w-full bg-white/[0.01] hover:bg-white/[0.02] focus:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none transition-all font-sans ${
                                securitySubmittedErrors.newPassword 
                                  ? "border-rose-500/40 focus:border-rose-500" 
                                  : "border-white/10 focus:border-indigo-500/50"
                              }`}
                            />
                            {securitySubmittedErrors.newPassword && (
                              <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {securitySubmittedErrors.newPassword}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={secConfirmPassword}
                              onChange={(e) => setSecConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password"
                              className={`w-full bg-white/[0.01] hover:bg-white/[0.02] focus:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none transition-all font-sans ${
                                securitySubmittedErrors.confirmPassword 
                                  ? "border-rose-500/40 focus:border-rose-500" 
                                  : "border-white/10 focus:border-indigo-500/50"
                              }`}
                            />
                            {securitySubmittedErrors.confirmPassword && (
                              <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {securitySubmittedErrors.confirmPassword}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Unified Global Settings Actions */}
              <div className="pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={clickCancel}
                  className="w-full sm:w-auto px-5 py-3 border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-2xl font-bold text-xs transition-all tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGlobalSave()}
                  disabled={
                    isSavingAccount || isSavingProfile || isSavingAppearance || isSavingSecurity
                  }
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs transition-all tracking-wide flex items-center justify-center gap-2 cursor-pointer ${
                    isSavingAccount || isSavingProfile || isSavingAppearance || isSavingSecurity
                      ? "bg-indigo-600/20 text-white/40 cursor-not-allowed border border-indigo-500/10"
                      : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20 text-white border border-indigo-500"
                  }`}
                >
                  {isSavingAccount || isSavingProfile || isSavingAppearance || isSavingSecurity ? (
                    <>
                      <RefreshCw size={14} className="animate-spin animate-infinite" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

              {/* Discard Confirmation Modal */}
              <AnimatePresence>
                {showCancelConfirm && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-[#08080c] border border-white/[0.06] p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl text-left"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl shrink-0">
                          <AlertCircle size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-sans text-sm font-black text-white">Unsaved Changes Exist</h4>
                          <p className="text-xs text-white/40 leading-relaxed">
                            You have modified configurations in the <span className="text-indigo-400 font-bold">{settingsActiveTab}</span> panel. Discarding will revert to original states permanently.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowCancelConfirm(false)}
                          className="px-4 py-2 border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-white/80 rounded-xl font-bold text-[11px] transition-all cursor-pointer"
                        >
                          Keep Editing
                        </button>
                        <button
                          type="button"
                          onClick={handleGlobalCancel}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-[11px] transition-all cursor-pointer border border-rose-500/20"
                        >
                          Discard Changes
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* PREMIUM REDESIGNED DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in pb-10 w-full">
              
              {/* 1. Statistics Overview */}
              <div className="space-y-4 text-left">
                <h3 className="font-sans text-xs font-bold text-white/40 tracking-widest uppercase">
                  Workspace Statistics
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Card 1: Active Courses */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => setActiveTab("courses")}
                    className="relative overflow-hidden cursor-pointer p-5 sm:p-6 rounded-3xl border border-white/[0.06] bg-[#08080c] hover:bg-[#0c0c14] hover:border-indigo-500/20 hover:shadow-[0_15px_30px_rgba(99,102,241,0.08)] transition-all flex flex-col justify-between group h-32 sm:h-36"
                  >
                    <div className="absolute top-0 right-0 h-24 w-24 pointer-events-none blur-2xl bg-indigo-500/[0.01] group-hover:bg-indigo-500/[0.04] rounded-full transition-all duration-300" />
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white/40 group-hover:text-indigo-400 group-hover:border-indigo-500/10 transition-all shrink-0">
                        <BookOpen size={18} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="block text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                        <CountUp end={courses.filter(c => c.progress < 100).length} />
                      </span>
                      <span className="block text-[10px] sm:text-[11px] font-semibold text-white/40 group-hover:text-white/60 transition-colors mt-1.5 uppercase tracking-wider">
                        Active Courses
                      </span>
                    </div>
                  </motion.div>

                  {/* Card 2: Completed Courses */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => setActiveTab("courses")}
                    className="relative overflow-hidden cursor-pointer p-5 sm:p-6 rounded-3xl border border-white/[0.06] bg-[#08080c] hover:bg-[#0c0c14] hover:border-emerald-500/20 hover:shadow-[0_15px_30px_rgba(16,185,129,0.08)] transition-all flex flex-col justify-between group h-32 sm:h-36"
                  >
                    <div className="absolute top-0 right-0 h-24 w-24 pointer-events-none blur-2xl bg-emerald-500/[0.01] group-hover:bg-emerald-500/[0.04] rounded-full transition-all duration-300" />
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white/40 group-hover:text-emerald-400 group-hover:border-emerald-500/10 transition-all shrink-0">
                        <CheckSquare size={18} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="block text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                        <CountUp end={courses.filter(c => c.progress === 100).length + 2} />
                      </span>
                      <span className="block text-[10px] sm:text-[11px] font-semibold text-white/40 group-hover:text-white/60 transition-colors mt-1.5 uppercase tracking-wider">
                        Completed Courses
                      </span>
                    </div>
                  </motion.div>

                  {/* Card 3: My Assignments */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => setActiveTab("assignments")}
                    className="relative overflow-hidden cursor-pointer p-5 sm:p-6 rounded-3xl border border-white/[0.06] bg-[#08080c] hover:bg-[#0c0c14] hover:border-amber-500/20 hover:shadow-[0_15px_30px_rgba(245,158,11,0.08)] transition-all flex flex-col justify-between group h-32 sm:h-36"
                  >
                    <div className="absolute top-0 right-0 h-24 w-24 pointer-events-none blur-2xl bg-amber-500/[0.01] group-hover:bg-amber-500/[0.04] rounded-full transition-all duration-300" />
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white/40 group-hover:text-amber-400 group-hover:border-amber-500/10 transition-all shrink-0">
                        <ClipboardList size={18} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="block text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                        <CountUp end={assignments.length} />
                      </span>
                      <span className="block text-[10px] sm:text-[11px] font-semibold text-white/40 group-hover:text-white/60 transition-colors mt-1.5 uppercase tracking-wider">
                        My Assignments
                      </span>
                    </div>
                  </motion.div>

                  {/* Card 4: Certificates */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => setActiveTab("achievements")}
                    className="relative overflow-hidden cursor-pointer p-5 sm:p-6 rounded-3xl border border-white/[0.06] bg-[#08080c] hover:bg-[#0c0c14] hover:border-purple-500/20 hover:shadow-[0_15px_30px_rgba(168,85,247,0.08)] transition-all flex flex-col justify-between group h-32 sm:h-36"
                  >
                    <div className="absolute top-0 right-0 h-24 w-24 pointer-events-none blur-2xl bg-purple-500/[0.01] group-hover:bg-purple-500/[0.04] rounded-full transition-all duration-300" />
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white/40 group-hover:text-purple-400 group-hover:border-purple-500/10 transition-all shrink-0">
                        <Award size={18} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="block text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                        <CountUp end={badges.filter(b => b.unlocked).length} />
                      </span>
                      <span className="block text-[10px] sm:text-[11px] font-semibold text-white/40 group-hover:text-white/60 transition-colors mt-1.5 uppercase tracking-wider">
                        Certificates
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* 2. What's New */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Last Viewed Course */}
                <div className="lg:col-span-5 flex flex-col h-full text-left">
                  <h3 className="font-sans text-xs font-bold text-white/40 tracking-widest uppercase mb-4">
                    Last Viewed Course
                  </h3>
                  <div className="flex-1 bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 sm:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-40 w-40 pointer-events-none blur-3xl bg-indigo-500/[0.03] group-hover:bg-indigo-500/[0.05] rounded-full transition-all duration-300" />
                    
                    <div className="space-y-4">
                      {/* Course Thumbnail */}
                      <div className="h-28 w-full rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-white/[0.06] flex items-center justify-center relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
                        <BookOpen size={36} className="text-indigo-400/80 group-hover:scale-110 transition-transform duration-500" />
                        <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-black/40 border border-white/10 text-[9px] font-mono tracking-wider font-semibold text-white/70">
                          React / SPA
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                          {courses[0].instructor}
                        </span>
                        <h4 className="font-sans text-lg font-black text-white leading-snug">
                          {courses[0].title}
                        </h4>
                        <p className="font-sans text-xs text-white/50 leading-relaxed line-clamp-2">
                          Master component design, hooks architecture, and perform runtime optimization on high-scale Single Page Applications.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 mt-4 border-t border-white/[0.04]">
                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-white/40">Syllabus Progress</span>
                          <span className="text-white/90">{courses[0].progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                            style={{ width: `${courses[0].progress}%` }}
                          />
                        </div>
                      </div>

                      {/* More Details Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveTab("courses");
                          setSelectedCourseId(courses[0].id);
                        }}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all text-center flex items-center justify-center gap-2"
                      >
                        <span>More Details</span>
                        <ArrowRight size={13} />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Upcoming Assignment Deadlines */}
                <div className="lg:col-span-7 flex flex-col h-full text-left">
                  <h3 className="font-sans text-xs font-bold text-white/40 tracking-widest uppercase mb-4">
                    Upcoming Deadlines
                  </h3>
                  <div className="flex-1 bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 sm:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-col justify-between space-y-4">
                    <div className="space-y-3 flex-1">
                      {(() => {
                        const sorted = [...assignments].sort((a, b) => {
                          if (a.status === "Pending" && b.status !== "Pending") return -1;
                          if (a.status !== "Pending" && b.status === "Pending") return 1;
                          return a.id.localeCompare(b.id);
                        });

                        return sorted.slice(0, 3).map((ass) => {
                          let remainingText = "Completed";
                          let badgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                          
                          if (ass.status === "Pending") {
                            if (ass.id === "1") {
                              remainingText = "1 day left";
                              badgeColor = "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse";
                            } else {
                              remainingText = "5 days left";
                              badgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                            }
                          }

                          return (
                            <motion.div
                              key={ass.id}
                              whileHover={{ scale: 1.01, x: 2 }}
                              onClick={() => setActiveTab("assignments")}
                              className="group p-3.5 rounded-2xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 text-left"
                            >
                              <div className="flex-1 min-w-0 space-y-1">
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">
                                  {ass.course}
                                </span>
                                <h5 className="font-sans text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors truncate">
                                  {ass.title}
                                </h5>
                                <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                                  <span>Due: {ass.dueDate}</span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${badgeColor}`}>
                                  {remainingText}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                  ass.status === "Completed" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                    : ass.status === "Submitted"
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}>
                                  {ass.status}
                                </span>
                              </div>
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Learning Progress Roadmap */}
              <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 sm:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)] space-y-6 text-left relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-40 w-40 pointer-events-none blur-3xl bg-emerald-500/[0.02] rounded-full" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-indigo-400 tracking-widest uppercase block">Visual Path</span>
                    <h3 className="font-sans text-base font-extrabold text-white">Learning Progress Roadmap</h3>
                  </div>
                  <span className="text-white/40 text-[10px] font-mono uppercase bg-white/[0.02] border border-white/[0.06] px-2.5 py-1 rounded-md">
                    3 Completed • 1 Active
                  </span>
                </div>

                <div className="relative pt-4 pb-2">
                  <div className="hidden lg:block absolute top-[43px] left-[5%] right-[5%] h-1 bg-white/[0.04] rounded-full z-0" />
                  <div className="hidden lg:block absolute top-[43px] left-[5%] w-[68%] h-1 bg-gradient-to-r from-indigo-500 via-emerald-400 to-transparent rounded-full z-0" />

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-4 relative z-10">
                    {[
                      { id: "step1", name: "UI/UX Design Systems", status: "completed", date: "Jan 2026", icon: "🎨" },
                      { id: "step2", name: "Advanced Tailwind CSS", status: "completed", date: "Mar 2026", icon: "✨" },
                      { id: "step3", name: "State Managers & React", status: "completed", date: "May 2026", icon: "⚛️" },
                      { id: "step4", name: "Advanced React & Architecture", status: "current", progress: 68, date: "Active Now", icon: "⚡" },
                      { id: "step5", name: "Machine Learning Foundations", status: "upcoming", progress: 15, date: "Next up", icon: "🧠" }
                    ].map((step, idx) => {
                      const isCompleted = step.status === "completed";
                      const isCurrent = step.status === "current";

                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                          className="flex lg:flex-col items-center lg:text-center gap-4 lg:gap-3 group/step relative"
                        >
                          <div className="relative shrink-0">
                            {isCurrent && (
                              <div className="absolute inset-[-6px] rounded-full bg-indigo-500/20 animate-ping" />
                            )}
                            {isCompleted && (
                              <div className="absolute inset-[-4px] rounded-full bg-emerald-500/5 group-hover/step:bg-emerald-500/10 transition-all duration-300" />
                            )}
                            
                            <div className={`h-14 w-14 rounded-full p-[1.5px] flex items-center justify-center transition-all duration-500 ${
                              isCompleted 
                                ? "bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover/step:shadow-[0_0_20px_rgba(16,185,129,0.25)]" 
                                : isCurrent 
                                ? "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse" 
                                : "bg-white/10"
                            }`}>
                              <div className="h-full w-full rounded-full bg-[#0d0d14] flex items-center justify-center text-lg select-none">
                                {isCompleted ? (
                                  <span className="text-emerald-400 font-bold text-sm">✓</span>
                                ) : (
                                  <span>{step.icon}</span>
                                )}
                              </div>
                            </div>

                            <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border flex items-center justify-center text-[9px] font-black font-mono shadow-md ${
                              isCompleted 
                                ? "bg-[#08080c] border-emerald-500/30 text-emerald-400" 
                                : isCurrent 
                                ? "bg-indigo-600 border-indigo-500 text-white" 
                                : "bg-white/5 border-white/10 text-white/40"
                            }`}>
                              {idx + 1}
                            </span>
                          </div>

                          <div className="flex-1 lg:flex-1 text-left lg:text-center space-y-0.5 min-w-0">
                            <span className={`text-[9px] font-mono font-bold tracking-wider uppercase block ${
                              isCompleted ? "text-emerald-400/80" : isCurrent ? "text-indigo-400" : "text-white/30"
                            }`}>
                              {step.date}
                            </span>
                            <h4 className={`font-sans text-xs font-extrabold truncate ${
                              isCurrent ? "text-white" : isCompleted ? "text-white/80 group-hover/step:text-white" : "text-white/40"
                            }`}>
                              {step.name}
                            </h4>
                            {isCurrent && (
                              <div className="flex items-center gap-1.5 lg:justify-center mt-1">
                                <div className="w-16 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${step.progress}%` }} />
                                </div>
                                <span className="text-[8px] font-bold text-indigo-400 font-mono">{step.progress}%</span>
                              </div>
                            )}
                            {isCompleted && (
                              <span className="text-[9px] text-emerald-400/60 font-semibold block lg:text-center mt-0.5">Verified Certificate</span>
                            )}
                          </div>

                          {idx < 4 && (
                            <div className="lg:hidden absolute left-[27px] top-[56px] w-[2px] h-[32px] bg-gradient-to-b from-white/[0.08] to-transparent z-0" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* PRODIFY AI WIDGET MODAL OVERLAY */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                  <h3 className="font-sans text-xl font-bold text-white">Prodify AI Assistant</h3>
                </div>
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white transition-all text-xs border border-white/10 bg-white/[0.02]"
                >
                  Close
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] min-h-[140px] flex flex-col justify-center">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-5 w-5 border-2 border-emerald-500/35 border-t-emerald-400 rounded-full animate-spin" />
                    <p className="font-mono text-[10px] text-white/40 tracking-wider uppercase">Analyzing workspace context...</p>
                  </div>
                ) : (
                  <p className="font-sans text-sm text-white/80 leading-relaxed">
                    {aiResponse}
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 border border-white/10 rounded-xl font-semibold text-xs text-white/60 hover:text-white transition-all"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => {
                    setIsAiLoading(true);
                    setTimeout(() => {
                      setIsAiLoading(false);
                      setAiResponse("Perfect! I've created the draft outline for your VP sync and synced the agenda items to your Google Calendar. Let me know if you need anything else.");
                    }, 1000);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs text-white transition-all"
                >
                  Draft speaking points
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROFILE MODAL LIGHTBOX & FILE UPLOAD */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center space-y-6 overflow-hidden"
            >
              {/* Top border ambient glow */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] font-bold text-white/40 tracking-wider uppercase">User Profile Image</span>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white transition-all text-xs border border-white/10 bg-white/[0.02]"
                >
                  Close
                </button>
              </div>

              {/* Large Image Preview */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 p-[2px] flex items-center justify-center shadow-2xl">
                    <div className="h-full w-full rounded-full bg-[#0d0d12] flex items-center justify-center overflow-hidden">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile Large" className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-3xl font-black text-white/80">CH</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-sans text-lg font-black text-white">{profileName}</h4>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online Status
                  </span>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer text-center space-y-2 select-none ${
                  dragOver 
                    ? "border-emerald-500 bg-emerald-500/[0.02]" 
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.01]"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept=".jpg,.jpeg,.png,.webp" 
                  className="hidden" 
                />
                <div className="h-10 w-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-white/60">
                  <Camera size={18} />
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-xs font-bold text-white/80">Drag and drop here, or click to browse</p>
                  <p className="font-sans text-[10px] text-white/40">Supports JPG, JPEG, PNG, WEBP. Cropped automatically.</p>
                </div>
              </div>

              {/* Reset/Remove Action */}
              {profilePic && (
                <button
                  onClick={removeProfilePic}
                  className="flex items-center gap-2 px-4 py-2 border border-red-500/20 bg-red-500/[0.04] text-red-400 hover:bg-red-500/[0.08] hover:border-red-500/30 rounded-xl font-bold text-xs transition-all mx-auto"
                >
                  <Trash2 size={13} />
                  <span>Remove Photo</span>
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
