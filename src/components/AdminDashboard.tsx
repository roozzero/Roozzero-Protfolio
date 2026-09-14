import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, Award, MessageSquare, 
  FolderOpen, Megaphone, Calendar, BarChart3, Settings, LogOut, Bell, Search, 
  Menu, X, Check, Globe, HelpCircle, Activity, Key, Sliders, ListFilter, AlertCircle, Sparkles, ChevronRight,
  FileText, Shield, Mail
} from "lucide-react";

// Sub tab modules
import OverviewTab from "./AdminDashboard/OverviewTab";
import UsersTab from "./AdminDashboard/UsersTab";
import AcademicTab from "./AcademicTab";
import LmsTab from "./LmsTab";
import ServicesTab from "./ServicesTab";
import AdminSettingsTab from "./AdminDashboard/SettingsTab";
import SecurityTab from "./AdminDashboard/SecurityTab";
import InboxTab from "./AdminDashboard/InboxTab";
import HomepageManagementTab from "./AdminDashboard/HomepageManagementTab";

// Type references
import { AdminUser, CourseRequest, Enrollment, Exam, ActivityLog, RolePermission } from "./AdminDashboard/types";
import { Course, Student, Session, Assignment, DiscussionThread, Resource, Announcement, GradeRecord, Certificate, CalendarEvent, CourseSeason } from "../types/teacher";

// Fallback seed data to guarantee system boot-up
const fallbackCourses: Course[] = [
  { id: "react-adv", title: "Advanced React & Architecture", code: "REACT-401", studentsCount: 18, sessionsCount: 12, progress: 65, status: "Active", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300&auto=format&fit=crop" },
  { id: "swiss-typo", title: "Swiss Typography & Editorial Layout", code: "SWISS-102", studentsCount: 12, sessionsCount: 8, progress: 25, status: "Active", image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=300&auto=format&fit=crop" }
];

const fallbackStudents: Student[] = [
  { id: "stu-1", name: "Cody Fisher", email: "cody.f@academy.local", phone: "+1 (555) 019-2834", progress: 85, attendance: 95, avgGrade: 92, status: "Active", joinedDate: "2026-05-10", courseId: "react-adv", courseTitle: "Advanced React & Architecture" },
  { id: "stu-2", name: "Esther Howard", email: "esther.h@academy.local", phone: "+1 (555) 023-8123", progress: 60, attendance: 88, avgGrade: 81, status: "Active", joinedDate: "2026-05-12", courseId: "react-adv", courseTitle: "Advanced React & Architecture" }
];

const fallbackSessions: Session[] = [
  { id: "sess-1", title: "State Management & Redux Architecture", courseId: "react-adv", courseTitle: "Advanced React & Architecture", date: "2026-07-02", time: "10:00 AM", duration: "1.5 hours", studentCount: 18, status: "Scheduled", link: "https://meet.google.com/abc-defg-hij" },
  { id: "sess-2", title: "Cubic Grids and Kerning Margins", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", date: "2026-07-02", time: "01:30 PM", duration: "2 hours", studentCount: 12, status: "Scheduled", link: "https://meet.google.com/xyz-pdqr-lmn" }
];

const fallbackCertificates: Certificate[] = [
  { id: "cert-1", studentId: "stu-1", studentName: "Cody Fisher", courseId: "react-adv", courseTitle: "Advanced React & Architecture", gpa: 3.9, status: "Waiting for Admin Approval" },
  { id: "cert-2", studentId: "stu-2", studentName: "Esther Howard", courseId: "react-adv", courseTitle: "Advanced React & Architecture", gpa: 3.5, status: "Draft" }
];

interface AdminDashboardProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function AdminDashboard({ onLogout, onGoHome }: AdminDashboardProps) {
  // Sidebar expand state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "academic" | "lms" | "services" | "settings" | "security" | "inbox" | "homepage-management">("overview");
  const [activeSubTab, setActiveSubTab] = useState("all");

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("admin_profile");
    if (saved) return JSON.parse(saved);
    return {
      name: "Jaden Smith",
      email: "admin@roozzero.dev",
      phone: "+98 9123456789",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
      bio: "Super Administrator and Learning Management Architect. Orchestrating system-wide course allocations, credential signing, and academy security operations.",
      department: "LMS Administration",
      theme: "dark" as const,
      titlePrefix: "Mr.",
      specialization: "Super Admin"
    };
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem("admin_profile", JSON.stringify(profile));
  }, [profile]);

  // Global search query
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ category: string; title: string; tab: any; sub: string }[]>([]);

  // Toast / System alerting state
  const [alerts, setAlerts] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Core synchronized state loaded from localStorage keys (aligns with student/teacher)
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("teacher_courses");
    return saved ? JSON.parse(saved) : fallbackCourses;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("teacher_students");
    return saved ? JSON.parse(saved) : fallbackStudents;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem("teacher_sessions");
    return saved ? JSON.parse(saved) : fallbackSessions;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem("teacher_assignments");
    return saved ? JSON.parse(saved) : [
      { id: "ass-1", courseId: "react-adv", courseTitle: "Advanced React & Architecture", title: "Framer Motion Custom Canvas Engine", description: "Build an interactive, high-performance web canvas engine.", publishDate: "2026-06-01", dueDate: "2026-07-08", maxPoints: 100, status: "Published", submissions: [] },
      { id: "ass-2", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", title: "Typography Book Cover Layout", description: "Design a poster or book cover utilizing Swiss modernist layout constraints.", publishDate: "2026-06-05", dueDate: "2026-07-12", maxPoints: 100, status: "Published", submissions: [] }
    ];
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem("teacher_certificates");
    return saved ? JSON.parse(saved) : fallbackCertificates;
  });

  const [discussions, setDiscussions] = useState<DiscussionThread[]>(() => {
    const saved = localStorage.getItem("teacher_discussions");
    return saved ? JSON.parse(saved) : [
      { id: "disc-1", courseId: "react-adv", courseTitle: "Advanced React & Architecture", studentName: "Cody Fisher", title: "Understanding useTransition in React 19", text: "Is useTransition safe for fetching metadata?", time: "2026-06-29", status: "New", replies: [{ id: "rep-1", sender: "Cody Fisher", role: "Student", time: "2026-06-29", text: "Is useTransition safe for fetching metadata?" }] }
    ];
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem("teacher_resources");
    return saved ? JSON.parse(saved) : [
      { id: "res-1", title: "Cubic Bezier Animation Presets", courseId: "react-adv", courseTitle: "Advanced React & Architecture", fileType: "pdf", fileSize: "2.1 MB", uploadedAt: "2026-06-20", visibility: "Visible" }
    ];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem("teacher_announcements");
    return saved ? JSON.parse(saved) : [
      { id: "ann-1", title: "Academy Summer Break Schedule", description: "Academy classes will resume normal schedules starting July 10.", courseId: "all", courseTitle: "All Courses", audience: "Everyone", publishedAt: "2026-06-24", status: "Published" }
    ];
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem("teacher_calendar_events");
    return saved ? JSON.parse(saved) : [
      { id: "evt-1", title: "Standard Midterm Examination", type: "Exam", date: "2026-07-15", courseId: "react-adv", time: "10:00 AM" }
    ];
  });

  const [courseSeasons, setCourseSeasons] = useState<CourseSeason[]>(() => {
    const saved = localStorage.getItem("teacher_course_seasons");
    return saved ? JSON.parse(saved) : [
      { id: "season-1", name: "Summer 2026 Core Intake", courseId: "react-adv", courseTitle: "Advanced React & Architecture", startDate: "2026-06-01", endDate: "2026-08-31", maxCapacity: 25, registrationStatus: "Open", notes: "Core intake cohort.", status: "Active" },
      { id: "season-2", name: "Autumn 2026 Typography", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", startDate: "2026-09-01", endDate: "2026-11-30", maxCapacity: 20, registrationStatus: "Not Available", notes: "Awaiting approval.", status: "Pending Admin Approval" }
    ];
  });

  // Admin exclusive states
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem("admin_users");
    return saved ? JSON.parse(saved) : [
      { id: "usr-1", name: "Jaden Smith", email: "admin@roozzero.dev", phone: "+1 (555) 012-3456", role: "super-admin", status: "Active", lastLogin: "Just Now", joinedDate: "2026-01-01" },
      { id: "usr-2", name: "Cody Fisher", email: "cody.f@academy.local", phone: "+1 (555) 019-2834", role: "student", status: "Active", lastLogin: "3 hours ago", joinedDate: "2026-05-10" },
      { id: "usr-3", name: "Sarah Vance", email: "teacher@academy.local", phone: "+1 (555) 021-9876", role: "teacher", status: "Active", lastLogin: "Yesterday", joinedDate: "2026-02-15" }
    ];
  });

  const [courseRequests, setCourseRequests] = useState<CourseRequest[]>(() => {
    const saved = localStorage.getItem("admin_course_requests");
    return saved ? JSON.parse(saved) : [
      { id: "req-1", teacherId: "usr-3", teacherName: "Sarah Vance", type: "New Course Season", title: "Autumn 2026 Typography Season", details: "Filing request for Autumn intake. 20 seats limit.", status: "Pending", date: "2026-07-01" }
    ];
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem("admin_enrollments");
    return saved ? JSON.parse(saved) : [
      { id: "enr-1", studentId: "stu-1", studentName: "Cody Fisher", courseId: "react-adv", courseTitle: "Advanced React & Architecture", seasonId: "season-1", seasonName: "Summer 2026 Core Intake", enrollmentDate: "2026-05-10", paymentStatus: "Paid", courseStatus: "Enrolled" }
    ];
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem("admin_exams");
    return saved ? JSON.parse(saved) : [
      { id: "ex-1", title: "React State & Context Midterm", courseId: "react-adv", courseTitle: "Advanced React & Architecture", dueDate: "2026-07-15", maxPoints: 100, passRate: 94, avgScore: 82, status: "Published" }
    ];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("admin_activity_logs");
    return saved ? JSON.parse(saved) : [
      { id: "log-1", timestamp: "09:42 AM", username: "Jaden Smith", role: "super-admin", action: "Approved digital certificate for Cody Fisher", module: "Certificates", status: "Success" }
    ];
  });

  const [rolesPermissions, setRolesPermissions] = useState<RolePermission[]>(() => {
    const saved = localStorage.getItem("admin_roles_permissions");
    return saved ? JSON.parse(saved) : [
      { role: "super-admin", permissions: { certificateApproval: true, courseManagement: true, userManagement: true, systemSettings: true } },
      { role: "admin", permissions: { certificateApproval: true, courseManagement: true, userManagement: true, systemSettings: false } },
      { role: "teacher", permissions: { certificateApproval: false, courseManagement: false, userManagement: false, systemSettings: false } },
      { role: "student", permissions: { certificateApproval: false, courseManagement: false, userManagement: false, systemSettings: false } }
    ];
  });

  // Effect triggers to persist synchronized arrays
  useEffect(() => { localStorage.setItem("teacher_courses", JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem("teacher_students", JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem("teacher_sessions", JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem("teacher_assignments", JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem("teacher_certificates", JSON.stringify(certificates)); }, [certificates]);
  useEffect(() => { localStorage.setItem("teacher_discussions", JSON.stringify(discussions)); }, [discussions]);
  useEffect(() => { localStorage.setItem("teacher_resources", JSON.stringify(resources)); }, [resources]);
  useEffect(() => { localStorage.setItem("teacher_announcements", JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem("teacher_calendar_events", JSON.stringify(calendarEvents)); }, [calendarEvents]);
  useEffect(() => { localStorage.setItem("teacher_course_seasons", JSON.stringify(courseSeasons)); }, [courseSeasons]);

  useEffect(() => { localStorage.setItem("admin_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("admin_course_requests", JSON.stringify(courseRequests)); }, [courseRequests]);
  useEffect(() => { localStorage.setItem("admin_enrollments", JSON.stringify(enrollments)); }, [enrollments]);
  useEffect(() => { localStorage.setItem("admin_exams", JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem("admin_activity_logs", JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem("admin_roles_permissions", JSON.stringify(rolesPermissions)); }, [rolesPermissions]);

  // Handle Global Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results: any[] = [];
    const query = searchQuery.toLowerCase();

    // Search Students
    students.forEach(s => {
      if (s.name.toLowerCase().includes(query)) {
        results.push({ category: "Student", title: s.name, tab: "users", sub: "students" });
      }
    });
    // Search Courses
    courses.forEach(c => {
      if (c.title.toLowerCase().includes(query)) {
        results.push({ category: "Course", title: c.title, tab: "academic", sub: "catalog" });
      }
    });
    // Search Certificates
    certificates.forEach(cert => {
      if (cert.studentName.toLowerCase().includes(query)) {
        results.push({ category: "Certificate", title: `Cert: ${cert.studentName}`, tab: "lms", sub: "certificates" });
      }
    });

    setSearchResults(results.slice(0, 5));
  }, [searchQuery, students, courses, certificates]);

  const handleSearchResultClick = (res: any) => {
    setActiveTab(res.tab);
    setActiveSubTab(res.sub);
    setSearchQuery("");
  };

  const dispatchAlert = (msg: string) => {
    setAlerts(prev => [msg, ...prev]);
    // Log in Immutable Activity logs
    const newLog: ActivityLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      username: "System",
      role: "server",
      action: msg,
      module: "General",
      status: "Success"
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Operation callbacks
  const handleUpdateSessionStatus = (id: string, status: "Scheduled" | "Completed" | "Cancelled") => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    dispatchAlert(`Session ${id} status updated to ${status}.`);
  };

  const handleApproveRequest = (id: string) => {
    setCourseRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Approved" } : r));
    const req = courseRequests.find(r => r.id === id);
    if (req && req.type === "New Course Season") {
      // Auto-deploy season
      const newSeason: CourseSeason = {
        id: "season-" + Date.now(),
        name: req.title,
        courseId: "react-adv",
        courseTitle: "Advanced React & Architecture",
        startDate: "2026-09-01",
        endDate: "2026-11-30",
        maxCapacity: 20,
        registrationStatus: "Open",
        notes: req.details,
        status: "Active"
      };
      setCourseSeasons(prev => [newSeason, ...prev]);
    }
    dispatchAlert(`Approved Instructor Request: ${req?.title}`);
  };

  const handleRejectRequest = (id: string, notes?: string) => {
    setCourseRequests(prev => prev.map(r => r.id === id ? { ...r, status: notes?.startsWith("Revision") ? "Revision Needed" : "Rejected", notes } : r));
    dispatchAlert(`Rejected or returned request ${id}.`);
  };

  const handleApproveCertificate = (id: string) => {
    setCertificates(prev => prev.map(c => c.id === id ? { ...c, status: "Approved", issueDate: new Date().toISOString().split("T")[0] } : c));
    dispatchAlert(`Digital Certificate ${id} approved & published.`);
  };

  const handleRejectCertificate = (id: string, notes?: string) => {
    setCertificates(prev => prev.map(c => c.id === id ? { ...c, status: "Rejected", notes } : c));
    dispatchAlert(`Certificate ${id} rejected.`);
  };

  const handleAddUser = (user: Partial<AdminUser>) => {
    setUsers(prev => [...prev, {
      ...user,
      id: "usr-" + Date.now(),
      joinedDate: new Date().toISOString().split("T")[0],
      lastLogin: "Never"
    } as AdminUser]);
    dispatchAlert(`Created Academy User: ${user.name}`);
  };

  const handleUpdateUserStatus = (id: string, status: "Active" | "Suspended" | "Pending") => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    dispatchAlert(`Account ${id} set to ${status}.`);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    dispatchAlert(`Revoked credentials for user ID: ${id}`);
  };

  const handleAddCourse = (course: Partial<Course>) => {
    setCourses(prev => [course as Course, ...prev]);
    dispatchAlert(`Deployed Course to Catalog: ${course.title}`);
  };

  const handleUpdateCourse = (id: string, updated: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    dispatchAlert(`Updated course configurations for: ${updated.title}`);
  };

  const handleDuplicateCourse = (id: string) => {
    const orig = courses.find(c => c.id === id);
    if (orig) {
      setCourses(prev => [{ ...orig, id: "course-" + Date.now(), title: orig.title + " (Copy)", code: orig.code + "-C" }, ...prev]);
      dispatchAlert(`Duplicated course: ${orig.title}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030304] text-white font-sans flex overflow-hidden">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <aside 
        className="hidden md:flex flex-col w-64 bg-[#060609]/95 backdrop-blur-md border-r border-white/[0.05] h-screen sticky top-0 shrink-0 z-20 p-5 select-none"
      >
        {/* Administrator profile header in sidebar */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all duration-300 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <img
                src={profile.photo}
                alt={profile.name}
                className="h-11 w-11 rounded-full border border-white/10 object-cover"
              />
              <div className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-[#060609]" />
            </div>
            <div className="space-y-0.5 text-left">
              <h4 className="font-sans text-xs font-bold text-white tracking-tight leading-tight">
                {profile.titlePrefix ? `${profile.titlePrefix} ` : ""}{profile.name}
              </h4>
              <span className="block text-[9px] text-indigo-400 font-extrabold tracking-widest uppercase">
                Owner Account
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.05] cursor-pointer"
            title="Logout Account"
          >
            <LogOut size={14} />
          </button>
        </div>

        {/* SIDEBAR MENUS (Independently scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 select-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 mb-4 text-left">
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Dashboard", icon: LayoutDashboard, tab: "overview", sub: "all" },
              { id: "homepageManagement", label: "Home Page", icon: Globe, tab: "homepage-management", sub: "all" },
              { id: "inbox", label: "Inbox", icon: Mail, tab: "inbox", sub: "all" },
              { id: "users", label: "Users", icon: Users, tab: "users", sub: "all" },
              { id: "students", label: "Students", icon: GraduationCap, tab: "users", sub: "students" },
              { id: "teachers", label: "Teachers", icon: Users, tab: "users", sub: "teachers" },
              { id: "courses", label: "Courses", icon: BookOpen, tab: "academic", sub: "catalog" },
              { id: "courseSeasons", label: "Course Seasons", icon: Calendar, tab: "academic", sub: "seasons" },
              { id: "courseRequests", label: "Course Requests", icon: HelpCircle, tab: "academic", sub: "requests" },
              { id: "enrollments", label: "Enrollments", icon: Key, tab: "academic", sub: "enrollments" },
              { id: "assignments", label: "Assignments", icon: FileText, tab: "lms", sub: "assignments" },
              { id: "exams", label: "Exams", icon: Sliders, tab: "lms", sub: "exams" },
              { id: "certificates", label: "Certificates", icon: Award, tab: "lms", sub: "certificates" },
              { id: "discussions", label: "Discussions", icon: MessageSquare, tab: "lms", sub: "discussions" },
              { id: "resources", label: "Resources", icon: FolderOpen, tab: "lms", sub: "resources" },
              { id: "announcements", label: "Announcements", icon: Megaphone, tab: "services", sub: "announcements" },
              { id: "calendar", label: "Calendar", icon: Calendar, tab: "services", sub: "calendar" },
              { id: "analytics", label: "Reports & Analytics", icon: BarChart3, tab: "services", sub: "analytics" },
              { id: "permissions", label: "Roles & Permissions", icon: Shield, tab: "services", sub: "permissions" },
              { id: "logs", label: "Activity Logs", icon: Activity, tab: "services", sub: "logs" },
              { id: "systemSettings", label: "Settings", icon: Settings, tab: "settings", sub: "system" },
              { id: "security", label: "Security", icon: Shield, tab: "security", sub: "directory", isSecurity: true }
            ].map((menu) => {
              const isSec = menu.isSecurity;
              const active = isSec ? activeTab === "security" : (activeTab === menu.tab && activeSubTab === menu.sub);
              return (
                <button
                  key={menu.id}
                  onClick={() => {
                    setActiveTab(menu.tab as any);
                    setActiveSubTab(menu.sub);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold tracking-wide transition-all border cursor-pointer ${
                    active
                      ? isSec 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-inner"
                        : "bg-white/[0.04] text-white border-white/5 shadow-inner"
                      : "text-white/45 hover:text-white/80 hover:bg-white/[0.01] border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <menu.icon size={14} className={active ? isSec ? "text-emerald-400" : "text-indigo-400" : ""} />
                    <span>{menu.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 2. Main content viewport */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navigation Header */}
        <header className="h-16 shrink-0 border-b border-white/[0.04] bg-zinc-950/35 backdrop-blur-md px-6 flex justify-between items-center relative z-20">
          
          {/* Left AJAX typing search bar */}
          <div className="relative w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><Search size={14} /></span>
            <input 
              type="text" 
              placeholder="Search across students, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/[0.05] rounded-xl py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500 focus:bg-zinc-900 transition-all"
            />

            {/* AJAX Search dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-10 bg-[#0c0c10] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 text-xs text-left divide-y divide-white/[0.04]"
                >
                  {searchResults.map((res, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSearchResultClick(res)}
                      className="p-2 hover:bg-white/[0.02] cursor-pointer flex justify-between items-center transition-colors rounded-lg"
                    >
                      <div>
                        <span className="text-[8px] font-mono uppercase text-indigo-400 block">{res.category}</span>
                        <span className="text-white font-bold">{res.title}</span>
                      </div>
                      <ChevronRight size={11} className="text-white/30" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right quick profiles & Notifications dropdown */}
          <div className="flex items-center gap-4">
            
            <button 
              onClick={onGoHome}
              className="px-3 py-1 border border-white/10 hover:bg-white/5 rounded-xl text-[10px] text-white/70 font-black uppercase tracking-wider"
            >
              Back to Home
            </button>

            {/* Notifications feed bell */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotificationDropdown(!showNotificationDropdown); setUnreadCount(0); }}
                className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-white/60 hover:text-white transition-all relative"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full flex items-center justify-center text-[7px] text-black font-bold animate-bounce shadow-sm shadow-emerald-500/50">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown overlay */}
              <AnimatePresence>
                {showNotificationDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-10 w-80 bg-[#0c0c10] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-xs text-left space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                      <span className="font-extrabold text-white tracking-wide uppercase">System Notifications</span>
                      <button onClick={() => setAlerts([])} className="text-[9px] text-indigo-400">Clear</button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                      {alerts.length === 0 ? (
                        <p className="text-center text-white/30 py-6">No recent alerts dispatched.</p>
                      ) : (
                        alerts.map((alt, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.03] space-y-0.5">
                            <p className="text-white/80 leading-relaxed">{alt}</p>
                            <span className="text-[8px] text-white/30 block">Just Now</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2.5 text-left">
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} className="h-8 w-8 rounded-full border border-white/10 object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-500/25 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300">
                  JS
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-tight">{profile.name}</p>
                <p className="text-[9px] text-white/40">Super Administrator</p>
              </div>
            </div>

          </div>
        </header>

        {/* Scrollable primary body viewport */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* RENDERS TABS BASED ON orchestrating navigation state */}
              {activeTab === "overview" && (
                <OverviewTab 
                  students={students}
                  sessions={sessions}
                  courses={courses}
                  assignments={assignments}
                  certificates={certificates}
                  requests={courseRequests}
                  seasons={courseSeasons}
                  users={users}
                  onQuickAction={(tabId) => {
                    if (tabId === "announcements") {
                      setActiveTab("services");
                      setActiveSubTab("announcements");
                    } else if (tabId === "users") {
                      setActiveTab("users");
                      setActiveSubTab("all");
                    } else if (tabId === "courses") {
                      setActiveTab("academic");
                      setActiveSubTab("catalog");
                    } else if (tabId === "certificates") {
                      setActiveTab("lms");
                      setActiveSubTab("certificates");
                    } else if (tabId === "reports") {
                      setActiveTab("services");
                      setActiveSubTab("analytics");
                    } else if (tabId === "systemSettings") {
                      setActiveTab("settings");
                      setActiveSubTab("system");
                    }
                  }}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                  onApproveCertificate={handleApproveCertificate}
                  onRejectCertificate={handleRejectCertificate}
                  onUpdateSessionStatus={handleUpdateSessionStatus}
                />
              )}

              {activeTab === "users" && (
                <UsersTab 
                  users={users}
                  students={students}
                  courses={courses}
                  activeSubTab={activeSubTab}
                  onAddUser={handleAddUser}
                  onUpdateUserStatus={handleUpdateUserStatus}
                  onResetPassword={(id) => dispatchAlert(`Successfully dispatched a password rotation callback for credentials ID: ${id}. Initial password re-configured as Academy@123`)}
                  onDeleteUser={handleDeleteUser}
                  onAddStudent={(newStu) => setStudents(prev => [newStu as Student, ...prev])}
                />
              )}

              {activeTab === "academic" && (
                <AcademicTab 
                  courses={courses}
                  seasons={courseSeasons}
                  requests={courseRequests}
                  enrollments={enrollments}
                  students={students}
                  activeSubTab={activeSubTab}
                  onAddCourse={handleAddCourse}
                  onUpdateCourse={handleUpdateCourse}
                  onDeleteCourse={(id) => setCourses(prev => prev.filter(c => c.id !== id))}
                  onDuplicateCourse={handleDuplicateCourse}
                  onApproveSeason={(id) => setCourseSeasons(prev => prev.map(s => s.id === id ? { ...s, status: "Active", registrationStatus: "Open" } : s))}
                  onCancelSeason={(id) => setCourseSeasons(prev => prev.map(s => s.id === id ? { ...s, status: "Cancelled", registrationStatus: "Not Available" } : s))}
                  onUpdateEnrollmentPayment={(id, payStatus) => setEnrollments(prev => prev.map(e => e.id === id ? { ...e, paymentStatus: payStatus } : e))}
                  onUpdateEnrollmentStatus={(id, status) => setEnrollments(prev => prev.map(e => e.id === id ? { ...e, courseStatus: status } : e))}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                  onAddSeason={(ns) => setCourseSeasons(prev => [ns, ...prev])}
                />
              )}

              {activeTab === "lms" && (
                <LmsTab 
                  assignments={assignments}
                  exams={exams}
                  certificates={certificates}
                  discussions={discussions}
                  resources={resources}
                  activeSubTab={activeSubTab}
                  onAddExam={(exam) => setExams(prev => [exam, ...prev])}
                  onPublishExamResults={(id) => {
                    setExams(prev => prev.map(e => e.id === id ? { ...e, status: "Published", passRate: 92, avgScore: 78 } : e));
                    dispatchAlert(`Results for Examination ${id} published.`);
                  }}
                  onApproveCertificate={handleApproveCertificate}
                  onRejectCertificate={handleRejectCertificate}
                  onAddDiscussionReply={(tid, content) => {
                    setDiscussions(prev => prev.map(d => {
                      if (d.id === tid) {
                        return {
                          ...d,
                          replies: [...d.replies, {
                            id: "rep-" + Date.now(),
                            authorName: "Jaden Smith",
                            authorRole: "super-admin",
                            date: new Date().toISOString().split("T")[0],
                            content
                          }]
                        };
                      }
                      return d;
                    }));
                  }}
                  onCloseDiscussionThread={(tid) => {
                    dispatchAlert(`Discussion thread ${tid} set to resolved and archived.`);
                  }}
                  onAddResource={(res) => setResources(prev => [res, ...prev])}
                  onDeleteResource={(id) => setResources(prev => prev.filter(r => r.id !== id))}
                />
              )}

              {activeTab === "services" && (
                <ServicesTab 
                  announcements={announcements}
                  calendarEvents={calendarEvents}
                  logs={activityLogs}
                  roles={rolesPermissions}
                  activeSubTab={activeSubTab}
                  onAddAnnouncement={(ann) => setAnnouncements(prev => [ann, ...prev])}
                  onDeleteAnnouncement={(id) => setAnnouncements(prev => prev.filter(a => a.id !== id))}
                  onAddCalendarEvent={(evt) => setCalendarEvents(prev => [evt, ...prev])}
                  onUpdateRolePermissions={(roleName, permName, val) => {
                    setRolesPermissions(prev => prev.map(r => r.role === roleName ? {
                      ...r,
                      permissions: { ...r.permissions, [permName]: val }
                    } : r));
                  }}
                />
              )}

              {activeTab === "settings" && (
                <AdminSettingsTab 
                  profile={profile}
                  onSaveProfile={setProfile}
                  showCustomToast={(msg) => dispatchAlert(msg)}
                />
              )}

              {activeTab === "inbox" && (
                <InboxTab 
                  users={users}
                  students={students}
                  courses={courses}
                  courseSeasons={courseSeasons}
                  announcements={announcements}
                  onAddAnnouncement={(ann) => setAnnouncements(prev => [ann, ...prev])}
                  onDeleteAnnouncement={(id) => setAnnouncements(prev => prev.filter(a => a.id !== id))}
                  showCustomToast={(msg) => dispatchAlert(msg)}
                />
              )}

              {activeTab === "homepage-management" && (
                <HomepageManagementTab 
                  showCustomToast={(msg) => dispatchAlert(msg)}
                />
              )}

              {activeTab === "security" && (
                <SecurityTab 
                  users={users}
                  students={students}
                  showCustomToast={(msg) => dispatchAlert(msg)}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      {/* SECURE LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#08080c] border border-white/10 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl text-center space-y-5"
            >
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                <LogOut size={20} />
              </div>

              <div className="space-y-1.5 text-center">
                <h3 className="font-sans text-sm font-extrabold text-white">Secure Logout Confirmation</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Are you sure you want to securely end your Super Admin session? You will need to re-authenticate to regain system management panel access.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold select-none pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/[0.02] text-white tracking-wide transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white tracking-wide transition-all shadow-[0_4px_12px_rgba(220,38,38,0.25)] cursor-pointer"
                >
                  Secure Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
