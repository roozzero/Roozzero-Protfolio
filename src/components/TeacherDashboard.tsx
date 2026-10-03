import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, BookOpen, Users, Calendar, Award, MessageSquare,
  FolderOpen, Settings, LogOut, Home, CheckCircle2, Clock, Plus,
  Search, Filter, Bell, ChevronRight, FileText, Check, X, Shield,
  Sparkles, Send, Trash2, Edit3, Save, ExternalLink, HelpCircle,
  Menu, User, Upload, ArrowRight, Eye, AlertCircle
} from "lucide-react";
import { Course, Student, Session, Assignment, DiscussionThread, Resource } from "../types/teacher";
import { teacherApi, authApi } from "../lib/api";

interface TeacherDashboardProps {
  currentUser?: any;
  onLogout: () => void;
  onGoHome: () => void;
}

export default function TeacherDashboard({ currentUser, onLogout, onGoHome }: TeacherDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "students" | "sessions" | "assignments" | "discussions" | "resources" | "settings"
  >("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authenticated Teacher Profile State
  const [profile, setProfile] = useState<any>(currentUser || null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(!currentUser);

  // Teacher Data from authoritative MySQL Backend
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Discussion reply inputs
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [isSubmittingReply, setIsSubmittingReply] = useState<string | null>(null);

  // Modals
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    courseId: "",
    title: "",
    date: "",
    time: "",
    duration: "1.5 hours",
    link: ""
  });

  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [newAssignmentData, setNewAssignmentData] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    maxPoints: 100
  });

  const [gradingSubmission, setGradingSubmission] = useState<{
    submissionId: string;
    studentName: string;
    assignmentTitle: string;
    grade: number;
    feedback: string;
  } | null>(null);

  // Alert/Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Teacher Profile State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Load authoritative teacher profile
  useEffect(() => {
    let isMounted = true;
    authApi.getMe()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.user) {
          const u = res.data.user;
          setProfile(u);
          setEditName(u.name || "");
          setEditPhone(u.phone || "");
          setEditSpecialization(u.specialization || "");
          setEditBio(u.bio || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load teacher profile:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingProfile(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Load all teacher modules from backend
  const loadTeacherData = async () => {
    setIsLoadingData(true);
    try {
      const [dashRes, cRes, sRes, sessRes, aRes, dRes, rRes] = await Promise.all([
        teacherApi.getDashboard().catch(() => ({ success: false, data: null })),
        teacherApi.getCourses().catch(() => ({ success: false, data: [] })),
        teacherApi.getStudents().catch(() => ({ success: false, data: [] })),
        teacherApi.getSessions().catch(() => ({ success: false, data: [] })),
        teacherApi.getAssignments().catch(() => ({ success: false, data: [] })),
        teacherApi.getDiscussions().catch(() => ({ success: false, data: [] })),
        teacherApi.getResources().catch(() => ({ success: false, data: [] }))
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboardStats(dashRes.data);
      }
      if (cRes.success && Array.isArray(cRes.data)) {
        setCourses(cRes.data);
        if (cRes.data.length > 0) {
          setNewSessionData((prev) => ({ ...prev, courseId: prev.courseId || cRes.data[0].id }));
          setNewAssignmentData((prev) => ({ ...prev, courseId: prev.courseId || cRes.data[0].id }));
        }
      }
      if (sRes.success && Array.isArray(sRes.data)) setStudents(sRes.data);
      if (sessRes.success && Array.isArray(sessRes.data)) setSessions(sessRes.data);
      if (aRes.success && Array.isArray(aRes.data)) setAssignments(aRes.data);
      if (dRes.success && Array.isArray(dRes.data)) setDiscussions(dRes.data);
      if (rRes.success && Array.isArray(rRes.data)) setResources(rRes.data);
    } catch (err) {
      console.error("Failed to load teacher data from backend API", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  // Discussion reply handler
  const handleAddReply = async (threadId: string) => {
    const text = replyInputs[threadId];
    if (!text?.trim()) return;

    setIsSubmittingReply(threadId);
    try {
      const res = await teacherApi.replyDiscussion(threadId, text.trim());
      const newReply = res.data || {
        id: `rep-${Date.now()}`,
        sender: profile?.name || "Instructor",
        role: "Instructor",
        time: "Just Now",
        text: text.trim()
      };

      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === threadId
            ? { ...d, status: "Replied", replies: [...(d.replies || []), newReply] }
            : d
        )
      );
      setReplyInputs((prev) => ({ ...prev, [threadId]: "" }));
      showToast("Your reply was submitted successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to send reply.", "error");
    } finally {
      setIsSubmittingReply(null);
    }
  };

  // Create session handler
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionData.courseId || !newSessionData.title || !newSessionData.date) {
      showToast("Please fill in all required session fields.", "error");
      return;
    }

    try {
      const res = await teacherApi.createSession(newSessionData.courseId, newSessionData);
      if (res.success) {
        showToast("Online session scheduled successfully.");
        setShowCreateSessionModal(false);
        setNewSessionData({
          courseId: courses[0]?.id || "",
          title: "",
          date: "",
          time: "",
          duration: "1.5 hours",
          link: ""
        });
        loadTeacherData();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to schedule session.", "error");
    }
  };

  // Delete session handler
  const handleDeleteSession = async (id: string) => {
    try {
      await teacherApi.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      showToast("Session deleted successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to delete session.", "error");
    }
  };

  // Create assignment handler
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentData.courseId || !newAssignmentData.title || !newAssignmentData.dueDate) {
      showToast("Please complete all required fields.", "error");
      return;
    }

    try {
      const res = await teacherApi.createAssignment(newAssignmentData.courseId, newAssignmentData);
      if (res.success) {
        showToast("New assignment created successfully.");
        setShowCreateAssignmentModal(false);
        setNewAssignmentData({
          courseId: courses[0]?.id || "",
          title: "",
          description: "",
          dueDate: "",
          maxPoints: 100
        });
        loadTeacherData();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create assignment.", "error");
    }
  };

  // Grade submission handler
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      const res = await teacherApi.gradeSubmission(
        gradingSubmission.submissionId,
        gradingSubmission.grade,
        gradingSubmission.feedback
      );
      if (res.success) {
        showToast("Grade and feedback saved successfully.");
        setGradingSubmission(null);
        loadTeacherData();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to record grade.", "error");
    }
  };

  // Update teacher profile handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await authApi.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        specialization: editSpecialization.trim(),
        bio: editBio.trim()
      });
      if (res.success && res.data?.user) {
        setProfile(res.data.user);
        showToast("Profile settings saved successfully.");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Teacher display identity: neutral fallback "Instructor" if name is missing (zero fake personal names!)
  const teacherDisplayName = (profile?.name && profile.name.trim().length > 0) ? profile.name.trim() : "Instructor";
  const teacherAvatarInitial = teacherDisplayName.charAt(0).toUpperCase();

  // Sidebar navigation menu items
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen, badge: courses.length },
    { id: "students", label: "Students", icon: Users, badge: students.length },
    { id: "sessions", label: "Live Sessions", icon: Calendar, badge: sessions.length },
    { id: "assignments", label: "Assignments", icon: FileText, badge: assignments.length },
    { id: "discussions", label: "Discussions", icon: MessageSquare, badge: discussions.filter(d => d.status !== "Replied").length },
    { id: "resources", label: "Resources", icon: FolderOpen, badge: resources.length },
    { id: "settings", label: "Account Settings", icon: Settings },
  ] as const;

  // Filtered students by search
  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.courseTitle && s.courseTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen w-full bg-[#030304] text-white flex relative overflow-hidden font-sans" dir="ltr">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl border text-xs font-bold shadow-2xl flex items-center gap-2 ${
              toastMsg.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/15 border-red-500/30 text-red-400"
            }`}
          >
            {toastMsg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. DESKTOP SIDEBAR NAVIGATION (Matching Student Dashboard design language) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#060609]/95 backdrop-blur-md border-l border-white/[0.05] h-screen sticky top-0 shrink-0 z-20 p-5 justify-between">
        <div className="space-y-6">
          {/* Teacher Profile Summary Header */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-amber-500 via-emerald-400 to-indigo-500 p-[1.5px] flex items-center justify-center shadow-md shrink-0">
                <div className="h-full w-full rounded-full bg-[#0d0d12] flex items-center justify-center overflow-hidden">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={teacherDisplayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-amber-400">{teacherAvatarInitial}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col text-right min-w-0">
                <span className="font-sans text-xs font-bold text-white leading-tight block truncate max-w-[110px]" title={teacherDisplayName}>
                  {teacherDisplayName}
                </span>
                <span className="font-sans text-[9px] text-amber-400 font-bold tracking-wider uppercase leading-none mt-1">
                  Academy Instructor
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.05] cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <span className="px-2 text-[9px] font-bold text-white/30 tracking-widest uppercase block mb-3">
              Instructor Menu
            </span>

            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl font-sans text-xs font-semibold relative transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "text-white bg-white/[0.04] border border-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-teacher-sidebar-pill"
                      className="absolute right-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-amber-400 to-emerald-400 rounded-l-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <IconComp size={15} className={`${isActive ? "text-amber-400" : "opacity-70"}`} />
                  <span className="flex-1 text-right">{item.label}</span>
                  {"badge" in item && typeof item.badge === "number" && item.badge > 0 ? (
                    <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Go Home Button */}
          <div className="pt-2 border-t border-white/[0.03]">
            <button
              onClick={onGoHome}
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white/40 hover:text-white/80 hover:bg-white/[0.02] transition-all cursor-pointer"
            >
              <Home size={14} className="opacity-70" />
              <span>Academy Home</span>
            </button>
          </div>
        </div>

        {/* Bottom Sidebar Branding */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent text-right relative overflow-hidden select-none">
            <span className="font-sans text-xs font-black text-white block mb-1 uppercase tracking-wider">
              ROOZZERO ACADEMY
            </span>
            <p className="font-sans text-[10px] text-white/35 leading-relaxed font-normal">
              Comprehensive Learning Management & Instructor Portal.
            </p>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[#060609] border-l border-white/10 p-5 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[10px] font-black tracking-widest text-white/40 uppercase">Instructor Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg border border-white/10 bg-white/[0.02] text-white/60 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400">
                    {teacherAvatarInitial}
                  </div>
                  <div>
                    <span className="font-sans text-xs font-bold text-white block truncate max-w-[140px]">{teacherDisplayName}</span>
                    <span className="font-sans text-[9px] text-amber-400 font-bold uppercase block">Instructor</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold ${
                        activeTab === item.id ? "text-white bg-white/[0.08]" : "text-white/60 hover:text-white"
                      }`}
                    >
                      <item.icon size={15} />
                      <span className="flex-1 text-right">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 w-full p-3 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT VIEWPORT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-16 shrink-0 border-b border-white/[0.04] bg-[#060609]/90 backdrop-blur-md px-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white/60 hover:text-white"
            >
              <Menu size={16} />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{sidebarItems.find(t => t.id === activeTab)?.label || "Instructor Dashboard"}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Faculty
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs text-white/70 hover:text-white font-bold transition-all cursor-pointer"
            >
              <Home size={13} />
              <span>Home</span>
            </button>

            <div className="flex items-center gap-2 text-right">
              <div className="h-8 w-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-400">
                {teacherAvatarInitial}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold leading-tight truncate max-w-[120px]">{teacherDisplayName}</p>
                <p className="text-[9px] text-white/40 font-mono">Academy Instructor</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-indigo-500/10 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-amber-400 font-bold">
                    <Sparkles size={13} />
                    <span>Instructor Portal</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    Welcome back, {teacherDisplayName}
                  </h1>
                  <p className="text-xs md:text-sm text-white/70 leading-relaxed max-w-2xl">
                    Teaching management system for monitoring student progress, scheduling online sessions, and grading coursework.
                  </p>
                </div>
              </div>

              {/* Statistics Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab("courses")}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 transition-all cursor-pointer backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">My Courses</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{courses.length}</span>
                    <span className="text-[10px] text-amber-400">View Courses</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("students")}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Active Students</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{students.length}</span>
                    <span className="text-[10px] text-emerald-400">View Roster</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("sessions")}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 transition-all cursor-pointer backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Live Sessions</span>
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Calendar size={16} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{sessions.length}</span>
                    <span className="text-[10px] text-cyan-400">Session Schedule</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("assignments")}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 transition-all cursor-pointer backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Assignments</span>
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <FileText size={16} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{assignments.length}</span>
                    <span className="text-[10px] text-indigo-400">Review & Grade</span>
                  </div>
                </div>
              </div>

              {/* Quick Action & Courses Snapshot */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Courses Snapshot */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen size={16} className="text-amber-400" />
                      <span>Active Teaching Courses</span>
                    </h3>
                    <button onClick={() => setActiveTab("courses")} className="text-xs text-amber-400 hover:underline">
                      View All
                    </button>
                  </div>

                  {courses.length === 0 ? (
                    <p className="text-center py-8 text-xs text-white/30 font-mono">
                      No courses have been assigned to your account yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {courses.slice(0, 3).map((c) => (
                        <div key={c.id} className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">{c.code}</span>
                            <h4 className="text-xs font-bold text-white mt-1">{c.title}</h4>
                          </div>
                          <div className="text-left font-mono text-xs text-white/60">
                            <span>{c.studentsCount} Students</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Live Sessions Snapshot */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar size={16} className="text-cyan-400" />
                      <span>Upcoming Live Sessions</span>
                    </h3>
                    <button onClick={() => setActiveTab("sessions")} className="text-xs text-cyan-400 hover:underline">
                      Full Schedule
                    </button>
                  </div>

                  {sessions.length === 0 ? (
                    <p className="text-center py-8 text-xs text-white/30 font-mono">
                      No live sessions scheduled.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.slice(0, 3).map((sess) => (
                        <div key={sess.id} className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10">{sess.status}</span>
                            <h4 className="text-xs font-bold text-white mt-1">{sess.title}</h4>
                            <p className="text-[10px] text-white/40 font-mono">{sess.courseTitle}</p>
                          </div>
                          <div className="text-left font-mono text-xs text-white/60">
                            <span className="block">{sess.date}</span>
                            <span className="text-[10px] text-white/40 block">{sess.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY COURSES */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">My Teaching Courses</h3>
                  <p className="text-xs text-white/40 mt-0.5">Comprehensive roster of courses assigned to your instruction</p>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white/40 text-xs font-mono">
                  No courses have been assigned to your account yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {course.code}
                          </span>
                          <h4 className="text-base font-bold text-white mt-2">{course.title}</h4>
                        </div>
                        <span className="text-xs font-mono text-emerald-400">{course.status}</span>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-mono text-white/50">
                          <span>Curriculum Progress</span>
                          <span className="text-white">{course.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-white/40 pt-4 border-t border-white/[0.04]">
                        <span>{course.studentsCount} Students</span>
                        <span>{course.sessionsCount} Total Sessions</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDENTS */}
          {activeTab === "students" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Course Students</h3>
                  <p className="text-xs text-white/40 mt-0.5">Monitor academic standing, attendance rates, and progress</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student or course..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white/40 text-xs font-mono">
                  {students.length === 0 ? "No students enrolled in your courses yet." : "No students match your search criteria."}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs text-white/80">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/40 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Enrolled Course</th>
                          <th className="py-3 px-4">Attendance</th>
                          <th className="py-3 px-4">Avg Score</th>
                          <th className="py-3 px-4">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredStudents.map((stu) => (
                          <tr key={stu.id} className="hover:bg-white/[0.015] transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-white">{stu.name}</p>
                              <p className="text-[10px] text-white/40 font-mono">{stu.email}</p>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-white/70">{stu.courseTitle}</td>
                            <td className="py-3.5 px-4 font-mono text-emerald-400">{stu.attendance}%</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-white">{stu.avgGrade} / 100</td>
                            <td className="py-3.5 px-4 font-mono text-white/60">{stu.progress}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SESSIONS */}
          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Live Classroom Sessions</h3>
                  <p className="text-xs text-white/40 mt-0.5">Schedule and manage online webinars and interactive lectures</p>
                </div>
                <button
                  onClick={() => setShowCreateSessionModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Schedule Session</span>
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white/40 text-xs font-mono">
                  No live sessions scheduled.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                          {sess.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-white/40">{sess.date}</span>
                          <button
                            onClick={() => handleDeleteSession(sess.id)}
                            className="text-white/30 hover:text-red-400 transition-colors p-1 cursor-pointer"
                            title="Delete Session"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white">{sess.title}</h4>
                      <p className="text-xs text-white/50 font-mono">{sess.courseTitle}</p>

                      <div className="flex items-center justify-between text-xs font-mono text-white/40 pt-2 border-t border-white/[0.04]">
                        <span>Time: {sess.time} ({sess.duration})</span>
                        {sess.link ? (
                          <a
                            href={sess.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <span>Classroom Link</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span>{sess.studentCount || 0} Students</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ASSIGNMENTS & GRADING */}
          {activeTab === "assignments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Assignments & Grading</h3>
                  <p className="text-xs text-white/40 mt-0.5">Create coursework, review student submissions, and assign grades</p>
                </div>
                <button
                  onClick={() => setShowCreateAssignmentModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create Assignment</span>
                </button>
              </div>

              {assignments.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white/40 text-xs font-mono">
                  No assignments created yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((ass) => (
                    <div
                      key={ass.id}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                              Due Date: {ass.dueDate}
                            </span>
                            <span className="text-[10px] text-white/40 font-mono">{ass.courseTitle}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1.5">{ass.title}</h4>
                          <p className="text-xs text-white/70 mt-1 leading-relaxed">{ass.description}</p>
                        </div>
                        <span className="text-xs font-mono text-white/40">{ass.maxPoints} Pts</span>
                      </div>

                      {/* Submissions Section */}
                      {ass.submissions && ass.submissions.length > 0 && (
                        <div className="pt-3 border-t border-white/[0.04] space-y-2">
                          <span className="text-xs font-bold text-white/70 block">
                            Student Submissions ({ass.submissions.length}):
                          </span>
                          <div className="space-y-2">
                            {ass.submissions.map((sub) => (
                              <div
                                key={sub.id}
                                className="p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-white block">{sub.studentName}</span>
                                  <span className="text-[10px] text-white/40 font-mono block">Submitted on: {sub.submittedAt}</span>
                                  {sub.githubUrl && (
                                    <a
                                      href={sub.githubUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-cyan-400 hover:underline text-[10px] font-mono flex items-center gap-1 mt-0.5"
                                    >
                                      <span>View Repository</span>
                                      <ExternalLink size={9} />
                                    </a>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {sub.grade !== null && sub.grade !== undefined ? (
                                    <span className="font-mono text-emerald-400 font-bold text-xs">
                                      Grade: {sub.grade} / {ass.maxPoints}
                                    </span>
                                  ) : (
                                    <span className="text-amber-400 text-[10px] font-mono">Pending Review</span>
                                  )}

                                  <button
                                    onClick={() =>
                                      setGradingSubmission({
                                        submissionId: sub.id,
                                        studentName: sub.studentName,
                                        assignmentTitle: ass.title,
                                        grade: sub.grade || 0,
                                        feedback: sub.feedback || ""
                                      })
                                    }
                                    className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                                  >
                                    Grade
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DISCUSSIONS */}
          {activeTab === "discussions" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Student QA & Inquiries</h3>
                <p className="text-xs text-white/40 mt-0.5">Answer student inquiries and provide academic guidance</p>
              </div>

              {discussions.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white/40 text-xs font-mono">
                  No student questions recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {discussions.map((disc) => (
                    <div
                      key={disc.id}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{disc.title}</h4>
                          <p className="text-[10px] text-white/40 font-mono mt-0.5">
                            By {disc.studentName} · {disc.courseTitle} · {disc.time}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                            disc.status === "Replied"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {disc.status === "Replied" ? "Answered" : "Pending Reply"}
                        </span>
                      </div>

                      <p className="text-xs text-white/80 bg-black/40 p-3 rounded-xl border border-white/[0.04] leading-relaxed">
                        {disc.text}
                      </p>

                      {disc.replies && disc.replies.length > 0 && (
                        <div className="space-y-2 pr-4 border-r-2 border-emerald-500/30">
                          {disc.replies.map((rep) => (
                            <div key={rep.id} className="text-xs">
                              <span className="text-emerald-400 font-mono text-[10px] font-bold">
                                {rep.sender || rep.authorName || "Instructor"}:
                              </span>
                              <p className="text-white/70 mt-0.5">{rep.text || rep.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={replyInputs[disc.id] || ""}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({ ...prev, [disc.id]: e.target.value }))
                          }
                          placeholder="Write instructor answer..."
                          className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                        />
                        <button
                          onClick={() => handleAddReply(disc.id)}
                          disabled={isSubmittingReply === disc.id}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send size={12} />
                          <span>{isSubmittingReply === disc.id ? "Sending..." : "Send Reply"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Course Resources & Files</h3>
                <p className="text-xs text-white/40 mt-0.5">Curriculum documents, sample code, and presentation slides</p>
              </div>

              {resources.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white/40 text-xs font-mono">
                  No learning resources uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-2"
                    >
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {res.fileType} · {res.fileSize}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1">{res.title}</h4>
                      <p className="text-[10px] text-white/40 font-mono">{res.courseTitle}</p>
                      <p className="text-[10px] text-white/30 font-mono pt-2 border-t border-white/[0.04]">
                        Uploaded on {res.uploadedAt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SETTINGS / PROFILE */}
          {activeTab === "settings" && (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md max-w-2xl space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Settings size={16} className="text-amber-400" />
                <span>Instructor Profile Settings</span>
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Specialization / Field</label>
                  <input
                    type="text"
                    value={editSpecialization}
                    onChange={(e) => setEditSpecialization(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                    placeholder="e.g. Software Engineering & Distributed Systems"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 font-mono"
                    placeholder="09123456789"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Biography & Academic Background</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{isSavingProfile ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* CREATE SESSION MODAL */}
      <AnimatePresence>
        {showCreateSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="ltr">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-right"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar size={16} className="text-cyan-400" />
                  <span>Schedule New Live Session</span>
                </h3>
                <button onClick={() => setShowCreateSessionModal(false)} className="text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
                <div>
                  <label className="text-white/70 block mb-1">Associated Course</label>
                  <select
                    value={newSessionData.courseId}
                    onChange={(e) => setNewSessionData({ ...newSessionData, courseId: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#121318]">
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Session Title</label>
                  <input
                    type="text"
                    value={newSessionData.title}
                    onChange={(e) => setNewSessionData({ ...newSessionData, title: e.target.value })}
                    placeholder="e.g. React Architecture & Custom Hooks Deep Dive"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-white/70 block mb-1">Date</label>
                    <input
                      type="date"
                      value={newSessionData.date}
                      onChange={(e) => setNewSessionData({ ...newSessionData, date: e.target.value })}
                      required
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 block mb-1">Scheduled Time</label>
                    <input
                      type="time"
                      value={newSessionData.time}
                      onChange={(e) => setNewSessionData({ ...newSessionData, time: e.target.value })}
                      required
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Session URL (Google Meet, Zoom, etc.)</label>
                  <input
                    type="url"
                    value={newSessionData.link}
                    onChange={(e) => setNewSessionData({ ...newSessionData, link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => setShowCreateSessionModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
                  >
                    Save Session
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE ASSIGNMENT MODAL */}
      <AnimatePresence>
        {showCreateAssignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="ltr">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-right"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-amber-400" />
                  <span>Create Assignment</span>
                </h3>
                <button onClick={() => setShowCreateAssignmentModal(false)} className="text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
                <div>
                  <label className="text-white/70 block mb-1">Associated Course</label>
                  <select
                    value={newAssignmentData.courseId}
                    onChange={(e) => setNewAssignmentData({ ...newAssignmentData, courseId: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#121318]">
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Assignment Title</label>
                  <input
                    type="text"
                    value={newAssignmentData.title}
                    onChange={(e) => setNewAssignmentData({ ...newAssignmentData, title: e.target.value })}
                    placeholder="e.g. Full-Stack State Management Project"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Assignment Instructions</label>
                  <textarea
                    value={newAssignmentData.description}
                    onChange={(e) => setNewAssignmentData({ ...newAssignmentData, description: e.target.value })}
                    rows={3}
                    placeholder="Detailed project guidelines and rubric..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-white/70 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newAssignmentData.dueDate}
                      onChange={(e) => setNewAssignmentData({ ...newAssignmentData, dueDate: e.target.value })}
                      required
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 block mb-1">Maximum Score</label>
                    <input
                      type="number"
                      value={newAssignmentData.maxPoints}
                      onChange={(e) => setNewAssignmentData({ ...newAssignmentData, maxPoints: Number(e.target.value) })}
                      min={1}
                      max={100}
                      required
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => setShowCreateAssignmentModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                  >
                    Create Assignment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GRADING SUBMISSION MODAL */}
      <AnimatePresence>
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="ltr">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-right"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award size={16} className="text-emerald-400" />
                  <span>Grade & Feedback</span>
                </h3>
                <button onClick={() => setGradingSubmission(null)} className="text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs space-y-1">
                <p className="text-white/60">
                  Student: <span className="text-white font-bold">{gradingSubmission.studentName}</span>
                </p>
                <p className="text-white/60">
                  Assignment: <span className="text-white">{gradingSubmission.assignmentTitle}</span>
                </p>
              </div>

              <form onSubmit={handleSaveGrade} className="space-y-3 text-xs">
                <div>
                  <label className="text-white/70 block mb-1">Grade Assigned (out of 100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={gradingSubmission.grade}
                    onChange={(e) =>
                      setGradingSubmission({
                        ...gradingSubmission,
                        grade: Number(e.target.value)
                      })
                    }
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Instructor Feedback</label>
                  <textarea
                    rows={3}
                    value={gradingSubmission.feedback}
                    onChange={(e) =>
                      setGradingSubmission({
                        ...gradingSubmission,
                        feedback: e.target.value
                      })
                    }
                    placeholder="Constructive feedback, highlights, and improvements..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                  >
                    Save Grade
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
