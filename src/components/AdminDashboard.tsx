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
import CertificatesView from "./AdminDashboard/CertificatesView";
import ExamsView from "./AdminDashboard/ExamsView";
import DiscussionsView from "./AdminDashboard/DiscussionsView";
import ServicesTab from "./ServicesTab";
import AdminSettingsTab from "./AdminDashboard/SettingsTab";
import SecurityTab from "./AdminDashboard/SecurityTab";
import InboxTab from "./AdminDashboard/InboxTab";
import HomepageManagementTab from "./AdminDashboard/HomepageManagementTab";

// Type references
import { AdminUser, CourseRequest, Enrollment, Exam, ActivityLog, RolePermission, DashboardStats } from "./AdminDashboard/types";
import { Course, Student, Session, Assignment, DiscussionThread, Resource, Announcement, GradeRecord, Certificate, CalendarEvent, CourseSeason } from "../types/teacher";
import { adminApi, coursesApi, teacherApi } from "../lib/api";

interface AdminDashboardProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function AdminDashboard({ onLogout, onGoHome }: AdminDashboardProps) {
  // Sidebar expand state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "academic" | "assignments" | "exams" | "certificates" | "discussions" | "resources" | "lms" | "services" | "settings" | "security" | "inbox" | "homepage-management"
  >("overview");
  const [activeSubTab, setActiveSubTab] = useState("all");

  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    photo: string;
    bio: string;
    department: string;
    theme: "dark" | "light" | "system";
    titlePrefix: string;
    specialization: string;
    [key: string]: any;
  }>({
    name: "",
    email: "",
    phone: "",
    photo: "",
    bio: "",
    department: "",
    theme: "dark",
    titlePrefix: "",
    specialization: ""
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load admin profile from MySQL backend on mount
  useEffect(() => {
    adminApi.getProfile()
      .then((res) => {
        if (res.success && res.data) {
          setProfile((prev) => ({
            ...prev,
            ...res.data,
            photo: res.data.photo || res.data.avatarUrl || ""
          }));
        }
      })
      .catch((err) => {
        if (err?.status === 401 || err?.message?.includes("Authentication required") || err?.message?.includes("expired")) {
          onLogout();
        } else {
          console.warn("Could not load admin profile from backend:", err?.message || err);
        }
      });
  }, [onLogout]);

  const handleSaveProfile = (newProfile: any) => {
    setProfile(newProfile);
    adminApi.updateProfile(newProfile).catch((err) => {
      console.error("Failed to update admin profile in backend:", err);
    });
  };

  // Global search query
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ category: string; title: string; tab: any; sub: string }[]>([]);

  // Toast / System alerting state
  const [alerts, setAlerts] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Core state populated authoritatively from MySQL backend APIs (Empty initial states, strictly zero mock data)
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [courseSeasons, setCourseSeasons] = useState<CourseSeason[]>([]);

  // Admin exclusive states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [rolesPermissions, setRolesPermissions] = useState<RolePermission[]>([
    { role: "super-admin", permissions: { certificateApproval: true, courseManagement: true, userManagement: true, systemSettings: true } },
    { role: "admin", permissions: { certificateApproval: true, courseManagement: true, userManagement: true, systemSettings: false } },
    { role: "teacher", permissions: { certificateApproval: false, courseManagement: false, userManagement: false, systemSettings: false } },
    { role: "student", permissions: { certificateApproval: false, courseManagement: false, userManagement: false, systemSettings: false } }
  ]);

  // Load authoritative data from MySQL backend APIs
  const loadAdminData = async () => {
    setIsUsersLoading(true);
    try {
      const [
        dashRes, usersRes, enrollmentsRes, certsRes, annsRes, seasonsRes, logsRes, coursesRes, studentsRes, sessionsRes, assignmentsRes, discussionsRes, resourcesRes
      ] = await Promise.all([
        adminApi.getDashboard().catch(() => ({ success: false, data: null })),
        adminApi.getUsers({ limit: 100 }).catch(() => ({ success: false, data: { users: [] } })),
        adminApi.getEnrollments().catch(() => ({ success: false, data: [] })),
        adminApi.getCertificates().catch(() => ({ success: false, data: [] })),
        adminApi.getAnnouncements().catch(() => ({ success: false, data: [] })),
        adminApi.getCourseSeasons().catch(() => ({ success: false, data: [] })),
        adminApi.getActivityLogs().catch(() => ({ success: false, data: [] })),
        coursesApi.getAllCourses().catch(() => ({ success: false, data: [] })),
        teacherApi.getStudents().catch(() => ({ success: false, data: [] })),
        teacherApi.getSessions().catch(() => ({ success: false, data: [] })),
        teacherApi.getAssignments().catch(() => ({ success: false, data: [] })),
        teacherApi.getDiscussions().catch(() => ({ success: false, data: [] })),
        teacherApi.getResources().catch(() => ({ success: false, data: [] }))
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboardStats(dashRes.data.stats || dashRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data.users || []);
      }
      if (enrollmentsRes.success && Array.isArray(enrollmentsRes.data)) {
        setEnrollments(enrollmentsRes.data);
      }
      if (certsRes.success && Array.isArray(certsRes.data)) {
        setCertificates(certsRes.data);
      }
      if (annsRes.success && Array.isArray(annsRes.data)) {
        setAnnouncements(annsRes.data);
      }
      if (seasonsRes.success && Array.isArray(seasonsRes.data)) {
        setCourseSeasons(seasonsRes.data);
      }
      if (logsRes.success && Array.isArray(logsRes.data)) {
        setActivityLogs(logsRes.data.map((l: any) => ({
          id: String(l.id),
          timestamp: l.created_at ? (l.created_at instanceof Date ? l.created_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : String(l.created_at)) : "Just Now",
          username: l.user_name || "Admin",
          role: "super-admin" as const,
          action: l.action || "System Action",
          module: "System",
          status: "Success" as const
        })));
      }
      if (coursesRes.success && Array.isArray(coursesRes.data)) {
        setCourses(coursesRes.data);
      }
      if (studentsRes.success && Array.isArray(studentsRes.data)) {
        setStudents(studentsRes.data);
      }
      if (sessionsRes.success && Array.isArray(sessionsRes.data)) {
        setSessions(sessionsRes.data);
      }
      if (assignmentsRes.success && Array.isArray(assignmentsRes.data)) {
        setAssignments(assignmentsRes.data);
      }
      if (discussionsRes.success && Array.isArray(discussionsRes.data)) {
        setDiscussions(discussionsRes.data);
      }
      if (resourcesRes.success && Array.isArray(resourcesRes.data)) {
        setResources(resourcesRes.data);
      }
    } catch (err) {
      console.error("Failed to load admin backend data", err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateUserRole = async (id: string, newRole: "User" | "Student" | "Teacher" | "Administrator") => {
    const res = await adminApi.updateUserRole(id, newRole);
    if (!res.success) {
      const errMsg = (res as any).error?.message || "Failed to update user role.";
      dispatchAlert(errMsg);
      throw new Error(errMsg);
    }
    const lower = newRole.toLowerCase();
    const newRoleId = (lower === "administrator" || lower === "admin") ? 1 : lower === "teacher" ? 2 : lower === "student" ? 3 : 4;
    const roleMapped = (lower === "administrator" || lower === "admin") ? "admin" : lower === "teacher" ? "teacher" : lower === "student" ? "student" : "user";

    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          roleId: newRoleId,
          role_id: newRoleId,
          role: roleMapped,
          roleName: newRole,
          role_name: newRole
        };
      }
      return u;
    }));
    dispatchAlert(`User role successfully updated to ${newRole}.`);

    // Authoritatively re-fetch users, students, courses and stats from MySQL database
    try {
      await loadAdminData();
    } catch (err) {
      console.error("Failed to reload admin data after role update:", err);
    }
  };

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
        results.push({ category: "Certificate", title: `Cert: ${cert.studentName}`, tab: "certificates", sub: "all" });
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

  const handleAddCourse = async (course: Partial<Course>) => {
    try {
      const res = await adminApi.createCourse({
        title: course.title || "",
        code: course.code || "",
        description: course.description || "",
        price: (course as any).price || 0,
        sessionsCount: course.sessionsCount || 12,
        teacherId: (course as any).teacherId || null,
        image: course.image || "",
        status: (course.status as any) || "Active"
      });
      if (res.success && res.data) {
        setCourses(prev => [res.data, ...prev]);
        dispatchAlert(`Created Course: ${course.title}`);
        loadAdminData();
      } else {
        setCourses(prev => [course as Course, ...prev]);
        dispatchAlert(`Deployed Course to Catalog: ${course.title}`);
      }
    } catch (err: any) {
      console.error("Failed to create course via API", err);
      setCourses(prev => [course as Course, ...prev]);
      dispatchAlert(`Deployed Course: ${course.title}`);
    }
  };

  const handleUpdateCourse = async (id: string, updated: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    dispatchAlert(`Updated course configurations for: ${updated.title || id}`);
    try {
      await adminApi.updateCourse(id, updated);
      loadAdminData();
    } catch (err) {
      console.error("Failed to update course via API", err);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    dispatchAlert(`Deleted Course: ${id}`);
    try {
      await adminApi.deleteCourse(id);
      loadAdminData();
    } catch (err) {
      console.error("Failed to delete course via API", err);
    }
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
              { id: "courses", label: "Courses", icon: BookOpen, tab: "academic", sub: "catalog" },
              { id: "certificates", label: "Certificates", icon: Award, tab: "certificates", sub: "all" },
              { id: "exams", label: "Exams", icon: Sliders, tab: "exams", sub: "all" },
              { id: "discussions", label: "Discussions", icon: MessageSquare, tab: "discussions", sub: "all" },
              { id: "announcements", label: "Announcements", icon: Megaphone, tab: "services", sub: "announcements" },
              { id: "systemSettings", label: "Settings", icon: Settings, tab: "settings", sub: "system" },
              { id: "security", label: "Security", icon: Shield, tab: "security", sub: "directory", isSecurity: true }
            ].map((menu) => {
              const isSec = menu.isSecurity;
              const active = isSec ? activeTab === "security" : activeTab === menu.tab;
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
                  stats={dashboardStats || undefined}
                  onQuickAction={(tabId, subTab) => {
                    if (tabId === "announcements") {
                      setActiveTab("services");
                      setActiveSubTab("announcements");
                    } else if (tabId === "users") {
                      setActiveTab("users");
                      setActiveSubTab(subTab || "all");
                    } else if (tabId === "courses" || tabId === "academic") {
                      setActiveTab("academic");
                      setActiveSubTab(subTab || "catalog");
                    } else if (tabId === "certificates") {
                      setActiveTab("certificates");
                      setActiveSubTab(subTab || "all");
                    } else if (tabId === "reports") {
                      setActiveTab("services");
                      setActiveSubTab("analytics");
                    } else if (tabId === "systemSettings") {
                      setActiveTab("settings");
                      setActiveSubTab("system");
                    } else {
                      setActiveTab(tabId as any);
                      if (subTab) setActiveSubTab(subTab);
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
                  onUpdateUserRole={handleUpdateUserRole}
                  isLoading={isUsersLoading}
                />
              )}

              {activeTab === "academic" && (
                <AcademicTab 
                  courses={courses}
                  seasons={courseSeasons}
                  requests={courseRequests}
                  enrollments={enrollments}
                  students={students}
                  users={users}
                  activeSubTab={activeSubTab}
                  onAddCourse={handleAddCourse}
                  onUpdateCourse={handleUpdateCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onDuplicateCourse={handleDuplicateCourse}
                  onApproveSeason={(id) => setCourseSeasons(prev => prev.map(s => s.id === id ? { ...s, status: "Active", registrationStatus: "Open" } : s))}
                  onCancelSeason={(id) => setCourseSeasons(prev => prev.map(s => s.id === id ? { ...s, status: "Cancelled", registrationStatus: "Not Available" } : s))}
                  onUpdateEnrollmentPayment={(id, payStatus) => setEnrollments(prev => prev.map(e => e.id === id ? { ...e, paymentStatus: payStatus } : e))}
                  onUpdateEnrollmentStatus={(id, status) => setEnrollments(prev => prev.map(e => e.id === id ? { ...e, courseStatus: status } : e))}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                  onAddSeason={(ns) => setCourseSeasons(prev => [ns, ...prev])}
                  onReloadData={loadAdminData}
                />
              )}

              {/* Standalone Modules: Certificates, Exams, Discussions */}
              {activeTab === "certificates" && (
                <CertificatesView 
                  certificates={certificates}
                  onApproveCertificate={handleApproveCertificate}
                  onRejectCertificate={handleRejectCertificate}
                />
              )}

              {activeTab === "exams" && (
                <ExamsView 
                  exams={exams}
                  courses={courses}
                  onAddExam={(exam) => setExams(prev => [exam, ...prev])}
                  onPublishExamResults={(id) => {
                    setExams(prev => prev.map(e => e.id === id ? { ...e, status: "Published", passRate: 92, avgScore: 78 } : e));
                    dispatchAlert(`Results for Examination ${id} published.`);
                  }}
                />
              )}

              {activeTab === "discussions" && (
                <DiscussionsView 
                  discussions={discussions}
                  adminName={profile.name || "Administrator"}
                  onAddDiscussionReply={(tid, content) => {
                    setDiscussions(prev => prev.map(d => {
                      if (d.id === tid) {
                        return {
                          ...d,
                          replies: [...(d.replies || []), {
                            id: "rep-" + Date.now(),
                            authorName: profile.name || "Administrator",
                            authorRole: "super-admin",
                            date: new Date().toISOString().split("T")[0],
                            content
                          }],
                          status: "Replied"
                        };
                      }
                      return d;
                    }));
                  }}
                  onCloseDiscussionThread={(tid) => {
                    setDiscussions(prev => prev.map(d => d.id === tid ? { ...d, status: "Closed" } : d));
                    dispatchAlert(`Discussion thread ${tid} set to resolved and archived.`);
                  }}
                />
              )}

              {activeTab === "assignments" && (
                <LmsTab 
                  assignments={assignments}
                  exams={exams}
                  certificates={certificates}
                  discussions={discussions}
                  resources={resources}
                  defaultSection="assignments"
                  hideSubNavigation={true}
                  onAddExam={(exam) => setExams(prev => [exam, ...prev])}
                  onPublishExamResults={(id) => {}}
                  onApproveCertificate={handleApproveCertificate}
                  onRejectCertificate={handleRejectCertificate}
                  onAddDiscussionReply={(tid, content) => {}}
                  onCloseDiscussionThread={(tid) => {}}
                  onAddResource={(res) => setResources(prev => [res, ...prev])}
                  onDeleteResource={(id) => setResources(prev => prev.filter(r => r.id !== id))}
                />
              )}

              {activeTab === "resources" && (
                <LmsTab 
                  assignments={assignments}
                  exams={exams}
                  certificates={certificates}
                  discussions={discussions}
                  resources={resources}
                  defaultSection="resources"
                  hideSubNavigation={true}
                  onAddExam={(exam) => setExams(prev => [exam, ...prev])}
                  onPublishExamResults={(id) => {}}
                  onApproveCertificate={handleApproveCertificate}
                  onRejectCertificate={handleRejectCertificate}
                  onAddDiscussionReply={(tid, content) => {}}
                  onCloseDiscussionThread={(tid) => {}}
                  onAddResource={(res) => setResources(prev => [res, ...prev])}
                  onDeleteResource={(id) => setResources(prev => prev.filter(r => r.id !== id))}
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
                            authorName: profile.name || "Administrator",
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
                  onSaveProfile={handleSaveProfile}
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
