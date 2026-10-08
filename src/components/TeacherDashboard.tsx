import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, BookOpen, Users, Calendar, Award, MessageSquare,
  FolderOpen, Settings, LogOut, Home, CheckCircle2, Clock, Plus,
  Search, Filter, Bell, ChevronRight, FileText, Check, X, Shield,
  Sparkles, Send, Trash2, Edit3, Save, ExternalLink, HelpCircle,
  Menu, User, Upload, ArrowRight, Eye, EyeOff, AlertCircle, Mail,
  ArrowLeft, Camera, Lock, Palette, Moon, Sun, Monitor, RefreshCw,
  ClipboardList, Key, Folder
} from "lucide-react";
import { Course, Student, Session, Assignment, DiscussionThread, Resource } from "../types/teacher";
import { teacherApi, authApi } from "../lib/api";

interface TeacherDashboardProps {
  currentUser?: any;
  onLogout: () => void;
  onGoHome: () => void;
}

export default function TeacherDashboard({ currentUser, onLogout, onGoHome }: TeacherDashboardProps) {
  // Navigation tabs - exact existing tabs preserved
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "students" | "sessions" | "assignments" | "discussions" | "messages" | "resources" | "settings"
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
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [teacherReplyText, setTeacherReplyText] = useState("");
  const [isSendingTeacherReply, setIsSendingTeacherReply] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
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
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // =========================================================================
  // Settings Hub States (matching Student Settings identical architecture)
  // =========================================================================
  const [settingsActiveTab, setSettingsActiveTab] = useState<"Account" | "Profile" | "Appearance" | "Security">("Account");
  
  // Account tab states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSubmittedErrors, setAccountSubmittedErrors] = useState<Record<string, string>>({});

  // Profile tab states
  const [draftProfilePic, setDraftProfilePic] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [department, setDepartment] = useState("");
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSavingProfileTab, setIsSavingProfileTab] = useState(false);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Appearance tab states
  const [draftTheme, setDraftTheme] = useState<"dark" | "light" | "system">("dark");

  // Security tab states
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [secCurrentPassword, setSecCurrentPassword] = useState("");
  const [secNewPassword, setSecNewPassword] = useState("");
  const [secConfirmPassword, setSecConfirmPassword] = useState("");
  const [secShowCurrent, setSecShowCurrent] = useState(false);
  const [secShowNew, setSecShowNew] = useState(false);
  const [secShowConfirm, setSecShowConfirm] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Synchronize profile data into settings states
  const syncProfileState = (u: any) => {
    if (!u) return;
    setProfile(u);
    const parts = (u.name || "").trim().split(" ");
    setFirstName(u.firstName || parts[0] || "");
    setLastName(u.lastName || parts.slice(1).join(" ") || "");
    setUsername(u.username || "");
    setEmailAddress(u.email || "");
    setPhoneNumber((u.phone || "").replace(/\D/g, ""));
    setDraftBio(u.bio || "");
    setSpecialization(u.specialization || "");
    setDepartment(u.department || "");
    setDraftProfilePic(u.avatarUrl || u.avatar_url || u.photo || "");
  };

  // Load authoritative teacher profile
  useEffect(() => {
    let isMounted = true;
    authApi.getMe()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.user) {
          syncProfileState(res.data.user);
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
      const [dashRes, cRes, sRes, sessRes, aRes, dRes, rRes, msgRes] = await Promise.all([
        teacherApi.getDashboard().catch(() => ({ success: false, data: null })),
        teacherApi.getCourses().catch(() => ({ success: false, data: [] })),
        teacherApi.getStudents().catch(() => ({ success: false, data: [] })),
        teacherApi.getSessions().catch(() => ({ success: false, data: [] })),
        teacherApi.getAssignments().catch(() => ({ success: false, data: [] })),
        teacherApi.getDiscussions().catch(() => ({ success: false, data: [] })),
        teacherApi.getResources().catch(() => ({ success: false, data: [] })),
        teacherApi.getMessages().catch(() => ({ success: false, data: [] }))
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
      if (msgRes.success && Array.isArray(msgRes.data)) {
        setMessages(msgRes.data);
        if (msgRes.data.length > 0 && !selectedMessageId) {
          setSelectedMessageId(msgRes.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load teacher data from backend API", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  const handleSendTeacherReply = async (msgId: string) => {
    if (!teacherReplyText.trim()) return;
    setIsSendingTeacherReply(true);
    try {
      await teacherApi.replyMessage(msgId, teacherReplyText.trim());
      showToast("Reply sent safely and stored in database.", "success");
      setTeacherReplyText("");
      const mRes = await teacherApi.getMessages();
      if (mRes.success && Array.isArray(mRes.data)) {
        setMessages(mRes.data);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to send reply.", "error");
    } finally {
      setIsSendingTeacherReply(false);
    }
  };

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
        prev.map((d) => {
          if (d.id === threadId) {
            return {
              ...d,
              status: "Replied",
              replies: [...(d.replies || []), newReply]
            };
          }
          return d;
        })
      );

      setReplyInputs((prev) => ({ ...prev, [threadId]: "" }));
      showToast("Reply posted successfully.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to reply.", "error");
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
      if (res.success && res.data) {
        setSessions((prev) => [res.data, ...prev]);
        setShowCreateSessionModal(false);
        setNewSessionData({
          courseId: courses[0]?.id || "",
          title: "",
          date: "",
          time: "",
          duration: "1.5 hours",
          link: ""
        });
        showToast("Live session scheduled successfully.", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to schedule session.", "error");
    }
  };

  // Delete session handler
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await teacherApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showToast("Session cancelled and removed.", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to cancel session.", "error");
    }
  };

  // Create assignment handler
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentData.courseId || !newAssignmentData.title || !newAssignmentData.dueDate) {
      showToast("Please fill in all required assignment fields.", "error");
      return;
    }

    try {
      const res = await teacherApi.createAssignment(newAssignmentData.courseId, newAssignmentData);
      if (res.success && res.data) {
        setAssignments((prev) => [res.data, ...prev]);
        setShowCreateAssignmentModal(false);
        setNewAssignmentData({
          courseId: courses[0]?.id || "",
          title: "",
          description: "",
          dueDate: "",
          maxPoints: 100
        });
        showToast("Assignment published successfully.", "success");
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
      await teacherApi.gradeSubmission(
        gradingSubmission.submissionId,
        gradingSubmission.grade,
        gradingSubmission.feedback
      );

      setAssignments((prev) =>
        prev.map((a) => {
          if (!a.submissions) return a;
          const updatedSubs = a.submissions.map((sub) => {
            if (sub.id === gradingSubmission.submissionId) {
              return {
                ...sub,
                grade: gradingSubmission.grade,
                feedback: gradingSubmission.feedback
              };
            }
            return sub;
          });
          return { ...a, submissions: updatedSubs };
        })
      );

      setGradingSubmission(null);
      showToast("Grade and feedback recorded.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save grade.", "error");
    }
  };

  // =========================================================================
  // Settings Handlers (matching Student Dashboard architecture exactly)
  // =========================================================================

  // Handle Account Form Save
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";
    if (!emailAddress.trim() || !emailAddress.includes("@")) errors.email = "Valid email is required.";
    if (!phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";

    if (Object.keys(errors).length > 0) {
      setAccountSubmittedErrors(errors);
      showToast("Please fix the validation errors.", "error");
      return;
    }
    setAccountSubmittedErrors({});
    setIsSavingAccount(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await teacherApi.updateProfile({
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: emailAddress.trim(),
        phone: phoneNumber.trim()
      });

      if (res.success) {
        showToast("Account settings saved successfully!", "success");
        setProfile((prev: any) => ({
          ...prev,
          name: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          email: emailAddress.trim(),
          phone: phoneNumber.trim()
        }));
      } else {
        showToast((res as any).error?.message || "Failed to save account settings.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save account settings.", "error");
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Handle Avatar Image Upload
  const handleUploadAvatarFile = async (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image size must be less than 2 MB.");
      return;
    }
    setPhotoError(null);
    setIsPhotoUploading(true);
    setPhotoUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      setPhotoUploadProgress(65);
      const res = await teacherApi.uploadAvatar(formData);
      setPhotoUploadProgress(100);

      if (res.success && res.data?.avatarUrl) {
        const url = res.data.avatarUrl;
        setDraftProfilePic(url);
        setProfile((prev: any) => ({ ...prev, avatarUrl: url }));
        showToast("Profile photo uploaded successfully!", "success");
      } else {
        setPhotoError("Failed to upload profile photo.");
      }
    } catch (err: any) {
      setPhotoError(err.message || "Upload failed.");
    } finally {
      setIsPhotoUploading(false);
    }
  };

  // Handle Avatar Removal
  const handleRemoveAvatar = async () => {
    try {
      await teacherApi.removeAvatar();
      setDraftProfilePic("");
      setProfile((prev: any) => ({ ...prev, avatarUrl: "" }));
      showToast("Profile photo removed.", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to remove avatar.", "error");
    }
  };

  // Handle Public Profile Details Save (Bio, Specialization, Department)
  const handleSaveProfileMetadata = async () => {
    setIsSavingProfileTab(true);
    try {
      const res = await teacherApi.updateProfile({
        bio: draftBio.trim(),
        specialization: specialization.trim(),
        department: department.trim()
      });

      if (res.success) {
        setProfile((prev: any) => ({
          ...prev,
          bio: draftBio.trim(),
          specialization: specialization.trim(),
          department: department.trim()
        }));
        showToast("Public profile updated successfully!", "success");
      } else {
        showToast("Failed to update public profile.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update public profile.", "error");
    } finally {
      setIsSavingProfileTab(false);
    }
  };

  // Handle Password / Credential Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGoogleAccount) {
      showToast("Google Workspace managed accounts use Google SSO.", "info");
      return;
    }
    if (!secCurrentPassword) {
      showToast("Current password is required.", "error");
      return;
    }
    if (secNewPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }
    if (secNewPassword !== secConfirmPassword) {
      showToast("New password confirmation does not match.", "error");
      return;
    }

    setIsSavingSecurity(true);
    try {
      const res = await teacherApi.changePassword(secCurrentPassword, secNewPassword);
      if (res.success) {
        showToast("Password updated successfully!", "success");
        setSecCurrentPassword("");
        setSecNewPassword("");
        setSecConfirmPassword("");
      } else {
        showToast((res as any).error?.message || "Failed to update password.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update password.", "error");
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // Teacher display identity
  const teacherDisplayName = (profile?.name && profile.name.trim().length > 0) ? profile.name.trim() : "Instructor";
  const teacherAvatarInitial = teacherDisplayName.charAt(0).toUpperCase();

  // Sidebar navigation menu items (matching student sidebar style cleanly)
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen, badge: courses.length },
    { id: "students", label: "Students", icon: Users, badge: students.length },
    { id: "sessions", label: "Live Sessions", icon: Calendar, badge: sessions.length },
    { id: "assignments", label: "Assignments", icon: FileText, badge: assignments.length },
    { id: "discussions", label: "Discussions", icon: MessageSquare, badge: discussions.filter(d => d.status !== "Replied").length },
    { id: "messages", label: "Messages & Inbox", icon: Mail, badge: messages.filter(m => !m.read).length },
    { id: "resources", label: "Resources", icon: FolderOpen, badge: resources.length },
    { id: "settings", label: "Settings", icon: Settings },
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

  // Current formatted date matching student dashboard topbar
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className={`min-h-screen w-full bg-[#030304] text-white flex relative overflow-hidden font-sans ${draftTheme === "light" ? "theme-light text-slate-900" : ""}`}>
      {/* Background Glowing Ambient Backdrops - identical to Student Dashboard */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[300px] pointer-events-none blur-[150px] bg-gradient-to-tr from-indigo-500/[0.02] to-cyan-500/[0.02] rounded-full z-0" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] pointer-events-none blur-[150px] bg-gradient-to-tr from-[#10b981]/[0.02] to-emerald-600/[0.015] rounded-full z-0" />

      {/* Toast Alert Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl border text-xs font-bold shadow-2xl flex items-center gap-2 ${
              toastMsg.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : toastMsg.type === "info"
                ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                : "bg-red-500/15 border-red-500/30 text-red-400"
            }`}
          >
            {toastMsg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. DESKTOP SIDEBAR NAVIGATION PANEL (100% matched with Student Dashboard) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#060609]/95 backdrop-blur-md border-r border-white/[0.05] h-screen sticky top-0 shrink-0 z-20 p-5 justify-between">
        <div className="space-y-6">
          {/* Instructor Profile Details Header at top of sidebar */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab("settings")}
                className="relative group focus:outline-none cursor-pointer"
                title="Profile & Settings"
              >
                <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 p-[1.5px] flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105">
                  <div className="h-full w-full rounded-full bg-[#0d0d12] flex items-center justify-center overflow-hidden">
                    {draftProfilePic || profile?.avatarUrl ? (
                      <img src={draftProfilePic || profile?.avatarUrl} alt={teacherDisplayName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-white">{teacherAvatarInitial}</span>
                    )}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border border-[#060609] shadow-sm animate-pulse" />
              </button>
              
              <div className="flex flex-col text-left">
                <span className="font-sans text-xs font-semibold text-white/90 leading-tight block truncate max-w-[110px]" title={teacherDisplayName}>
                  {teacherDisplayName}
                </span>
                <span className="font-sans text-[9px] text-emerald-400 font-bold tracking-wider uppercase leading-none mt-1">
                  Instructor
                </span>
              </div>
            </div>
            
            {/* Quick logout trigger icon */}
            <button 
              onClick={onLogout}
              className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.05] cursor-pointer"
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
                      className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-indigo-500 to-emerald-400 rounded-r-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <IconComp size={15} className={`${isActive ? "text-indigo-400" : "opacity-70"}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {"badge" in item && typeof item.badge === "number" && item.badge > 0 ? (
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
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white/40 hover:text-white/80 hover:bg-white/[0.02] transition-all cursor-pointer"
            >
              <ArrowLeft size={13} className="opacity-70" />
              <span>Back to Landing</span>
            </button>
          </div>
        </div>

        {/* BOTTOM SIDEBAR AREA - Branding Card identical to Student Panel */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent text-left relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 h-10 w-10 pointer-events-none blur-xl bg-indigo-500/20 rounded-full" />
            <span className="font-sans text-xs font-black text-white block mb-1 uppercase tracking-wider">ROOZZERO</span>
            <p className="font-sans text-[10px] text-white/35 leading-relaxed font-normal">
              Premium client academic environment. Optimized layout.
            </p>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER (Exact matching style) */}
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

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 p-[1.5px] flex items-center justify-center">
                      <div className="h-full w-full rounded-full bg-[#0d0d12] flex items-center justify-center overflow-hidden">
                        {draftProfilePic || profile?.avatarUrl ? (
                          <img src={draftProfilePic || profile?.avatarUrl} alt={teacherDisplayName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white">{teacherAvatarInitial}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-sans text-xs font-bold text-white leading-tight block truncate max-w-[120px]">{teacherDisplayName}</span>
                      <span className="font-sans text-[9px] text-emerald-400 font-bold tracking-wider uppercase leading-none mt-0.5">Instructor</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/[0.04] transition-all"
                  >
                    <LogOut size={14} />
                  </button>
                </div>

                <div className="space-y-1">
                  {sidebarItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold ${
                          isActive ? "text-white bg-white/[0.08]" : "text-white/60 hover:text-white"
                        }`}
                      >
                        <IconComp size={15} className={`${isActive ? "text-indigo-400" : "opacity-70"}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {"badge" in item && typeof item.badge === "number" && item.badge > 0 ? (
                          <span className="bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.03]">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onGoHome();
                  }}
                  className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold text-white/40 hover:text-white/80 hover:bg-white/[0.02] transition-all"
                >
                  <ArrowLeft size={13} className="opacity-70" />
                  <span>Back to Landing</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN PRIMARY CONTENT VIEWPORT */}
      <main className="flex-1 min-h-screen overflow-y-auto pb-16 relative z-10 flex flex-col">
        {/* TOPBAR HEADER - Matched identically with Student Dashboard */}
        <header className="sticky top-0 z-30 w-full border-b border-white/[0.05] bg-[#060609]/90 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.04] transition-all shrink-0"
              title="Open Navigation Menu"
            >
              <Menu size={16} />
            </button>
            <div className="flex flex-col text-left">
              <span className="font-sans text-[11px] font-normal text-white/40 tracking-wider uppercase font-mono leading-none">
                {formattedDate}
              </span>
              <h1 className="font-sans text-base sm:text-lg font-extrabold text-white tracking-tight leading-none mt-1">
                Hello, {teacherDisplayName.split(" ")[0]}
              </h1>
            </div>
          </div>

          {/* Search container */}
          <div className="flex-1 max-w-md relative mx-1 sm:mx-3">
            <div className="relative group">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search courses, students, messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-full pl-9 pr-9 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/30 focus:bg-white/[0.04] focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
              />
            </div>
          </div>

          {/* Topbar Right - Actions & Profile Avatar */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={onGoHome}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs text-white/70 hover:text-white font-bold transition-all cursor-pointer"
            >
              <Home size={13} />
              <span>Landing</span>
            </button>

            <div 
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
              title="Instructor Profile Settings"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 p-[1.5px] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <div className="h-full w-full rounded-full bg-[#0d0d12] flex items-center justify-center overflow-hidden">
                  {draftProfilePic || profile?.avatarUrl ? (
                    <img src={draftProfilePic || profile?.avatarUrl} alt={teacherDisplayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">{teacherAvatarInitial}</span>
                  )}
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-tight truncate max-w-[120px]">{teacherDisplayName}</p>
                <p className="text-[9px] text-white/40">Faculty Portal</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin text-left">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome banner matching student style */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-emerald-500/5 to-cyan-500/10 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-indigo-400 font-bold">
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
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 transition-all cursor-pointer backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">My Courses</span>
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{courses.length}</span>
                    <span className="text-[10px] text-indigo-400 font-bold">View Courses</span>
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
                    <span className="text-[10px] text-emerald-400 font-bold">View Roster</span>
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
                    <span className="text-[10px] text-cyan-400 font-bold">Session Schedule</span>
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
                    <span className="text-[10px] text-indigo-400 font-bold">Review & Grade</span>
                  </div>
                </div>
              </div>

              {/* Quick Action & Courses Snapshot */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Courses Snapshot */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-400" />
                      <span>Active Teaching Courses</span>
                    </h3>
                    <button onClick={() => setActiveTab("courses")} className="text-xs text-indigo-400 hover:underline">
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
                            <span className="text-[10px] font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 font-bold">{c.code}</span>
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
                            <span className="text-[9px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 font-bold">{sess.status}</span>
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
                      className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
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
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
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
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student or course..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
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
                    <table className="w-full text-left text-xs text-white/80">
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
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold">
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
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
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold">
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
                                    <span className="text-indigo-400 text-[10px] font-mono font-bold">Pending Review</span>
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
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold ${
                            disc.status === "Replied"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}
                        >
                          {disc.status === "Replied" ? "Answered" : "Pending Reply"}
                        </span>
                      </div>

                      <p className="text-xs text-white/80 bg-black/40 p-3 rounded-xl border border-white/[0.04] leading-relaxed">
                        {disc.text}
                      </p>

                      {disc.replies && disc.replies.length > 0 && (
                        <div className="space-y-2 pl-4 border-l-2 border-indigo-500/30">
                          {disc.replies.map((rep) => (
                            <div key={rep.id} className="text-xs">
                              <span className="text-indigo-400 font-mono text-[10px] font-bold">
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
                          className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                        />
                        <button
                          onClick={() => handleAddReply(disc.id)}
                          disabled={isSubmittingReply === disc.id}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
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

          {/* TAB 7: MESSAGES & INBOX */}
          {activeTab === "messages" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mail list */}
              <div className="lg:col-span-1 bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-base font-extrabold text-white">Instructor Messages</h3>
                  <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {messages.filter(m => !m.read).length} Unread
                  </span>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="text"
                    placeholder="Search messages..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/40 transition-all font-sans"
                  />
                </div>
                <div className="space-y-2">
                  {(() => {
                    const filtered = messages.filter(m => 
                      (m.subject && m.subject.toLowerCase().includes(messageSearch.toLowerCase())) ||
                      (m.from && m.from.toLowerCase().includes(messageSearch.toLowerCase())) ||
                      (m.body && m.body.toLowerCase().includes(messageSearch.toLowerCase()))
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-white/30 text-xs font-sans">
                          No messages in instructor inbox.
                        </div>
                      );
                    }
                    return filtered.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessageId(msg.id);
                          setMessages(messages.map(m => m.id === msg.id ? { ...m, read: true } : m));
                          teacherApi.markMessageRead(msg.id).catch(() => {});
                        }}
                        className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                          selectedMessageId === msg.id
                            ? "bg-white/[0.04] border-indigo-500/30"
                            : "bg-transparent border-transparent hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-sans text-xs font-bold text-white block truncate max-w-[130px]">{msg.from}</span>
                          <span className="font-mono text-[9px] text-white/40">{msg.date}</span>
                        </div>
                        <span className={`font-sans text-xs block truncate ${msg.read ? "text-white/60 font-normal" : "text-white font-bold"}`}>
                          {msg.subject}
                        </span>
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {/* Message Details */}
              <div className="lg:col-span-2 bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 space-y-6 text-left">
                {(() => {
                  const currentMsg = messages.find(m => m.id === selectedMessageId) || messages[0];
                  if (!currentMsg) return <div className="text-white/40 text-sm text-left">No message selected.</div>;
                  return (
                    <>
                      <div className="border-b border-white/[0.05] pb-4 space-y-2 text-left animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs text-white/40">From: <strong className="text-white">{currentMsg.from}</strong></span>
                          <span className="font-mono text-[10px] text-white/40">{currentMsg.date}</span>
                        </div>
                        <h2 className="font-sans text-lg font-black text-white leading-tight">{currentMsg.subject}</h2>
                      </div>
                      <div className="bg-white/[0.01] border border-white/[0.03] p-5 rounded-2xl min-h-[160px] text-left animate-fade-in">
                        <p className="font-sans text-xs text-white/80 leading-relaxed whitespace-pre-line">{currentMsg.body || currentMsg.content}</p>
                      </div>

                      {/* Attachments rendering */}
                      {currentMsg.attachments && currentMsg.attachments.length > 0 && (
                        <div className="pt-4 border-t border-white/[0.05] space-y-2.5 mt-4 text-left animate-fade-in">
                          <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block font-bold">Attachments ({currentMsg.attachments.length})</span>
                          <div className="flex flex-wrap gap-2.5">
                            {currentMsg.attachments.map((att: any, i: number) => (
                              <button
                                type="button"
                                key={i}
                                onClick={() => showToast(`Downloading "${att.name}"...`)}
                                className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-sans transition-colors bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 cursor-pointer"
                              >
                                <FileText size={13} className="text-indigo-400" />
                                <span className="underline font-medium">{att.name}</span>
                                {att.size && <span className="text-[10px] text-white/30 font-mono font-normal">({att.size})</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reply to Sender form */}
                      <div className="pt-4 border-t border-white/[0.05] space-y-2.5 mt-4 text-left animate-fade-in">
                        <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block font-bold">
                          Direct Reply to Academy
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={teacherReplyText}
                            onChange={(e) => setTeacherReplyText(e.target.value)}
                            placeholder="Type your response to the sender..."
                            className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && teacherReplyText.trim()) {
                                handleSendTeacherReply(currentMsg.id);
                              }
                            }}
                          />
                          <button
                            type="button"
                            disabled={isSendingTeacherReply || !teacherReplyText.trim()}
                            onClick={() => handleSendTeacherReply(currentMsg.id)}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                          >
                            <Send size={13} />
                            <span>{isSendingTeacherReply ? "Sending..." : "Reply"}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 8: RESOURCES */}
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
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
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

          {/* ========================================================================= */}
          {/* TAB 9: SETTINGS - 100% IDENTICAL TO STUDENT DASHBOARD SETTINGS SECTION    */}
          {/* ========================================================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in pb-10 w-full font-sans">
              
              {/* Settings Header */}
              <div className="space-y-1.5 text-left pb-2">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">
                  Academic Portal Workspace
                </span>
                <h2 className="font-sans text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Settings className="text-indigo-400" size={24} />
                  <span>Portal Settings</span>
                </h2>
                <p className="text-xs text-white/40 max-w-2xl leading-relaxed">
                  Redesigned dashboard settings hub. Manage your secure instructor account, edit your academy profile metadata, configure portal aesthetics, and review sign-in activity.
                </p>
              </div>

              {/* Sub-tab Navigation - Identical to Student Dashboard */}
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
                          layoutId="activeTeacherSettingsTabIndicator"
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
                  
                  {/* SUBTAB 1: ACCOUNT */}
                  {settingsActiveTab === "Account" && (
                    <div className="max-w-3xl mx-auto bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left font-sans">
                      <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                      
                      <div className="border-b border-white/[0.05] pb-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-sans text-base font-black text-white">Instructor Account Information</h3>
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
                              placeholder="Instructor"
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
                              placeholder="Name"
                            />
                            {accountSubmittedErrors.lastName && (
                              <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {accountSubmittedErrors.lastName}</p>
                            )}
                          </div>
                        </div>

                        {/* Username Field */}
                        <div className="space-y-2 bg-[#0c0c14]/50 border border-white/[0.03] p-4 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Username handle</label>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
                              Editable
                            </span>
                          </div>

                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                            className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
                            placeholder="instructor_handle"
                          />
                        </div>

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
                            placeholder="instructor@academy.edu"
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

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-white/[0.04] flex items-center justify-end">
                          <button
                            type="submit"
                            disabled={isSavingAccount}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Save size={14} />
                            <span>{isSavingAccount ? "Saving..." : "Save Changes"}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* SUBTAB 2: PROFILE */}
                  {settingsActiveTab === "Profile" && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left items-start animate-fade-in font-sans">
                      {/* Profile Photo Card */}
                      <div className="xl:col-span-1 bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                        
                        <div className="border-b border-white/[0.05] pb-4">
                          <h3 className="font-sans text-sm font-black text-white">Profile Photo</h3>
                          <p className="text-[10px] text-white/40 mt-0.5">Customize your instructor profile card image</p>
                        </div>

                        {/* Avatar Display */}
                        <div className="flex flex-col items-center justify-center space-y-5">
                          <div className="relative group">
                            <div className="h-32 w-32 rounded-full border-2 border-white/10 overflow-hidden bg-zinc-950 flex items-center justify-center relative shadow-inner">
                              {draftProfilePic ? (
                                <img
                                  src={draftProfilePic}
                                  alt="Profile Preview"
                                  className="h-full w-full object-cover transition-transform duration-300"
                                />
                              ) : (
                                <div className="h-full w-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-3xl font-black font-sans">
                                  {teacherAvatarInitial}
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
                                onClick={handleRemoveAvatar}
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
                              if (file) handleUploadAvatarFile(file);
                            }}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ".jpg,.jpeg,.png,.webp";
                              input.onchange = (e: any) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadAvatarFile(file);
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

                      {/* Bio & Department Card */}
                      <div className="xl:col-span-2 bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                        
                        <div className="border-b border-white/[0.05] pb-4">
                          <h3 className="font-sans text-base font-black text-white">Public Profile Settings</h3>
                          <p className="text-xs text-white/40">Customize how your public bio and credentials appear in the faculty directory</p>
                        </div>

                        <div className="space-y-5">
                          {/* Specialization / Department */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                                Specialization
                              </label>
                              <input
                                type="text"
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                placeholder="e.g. Full-Stack Web Development & DevOps"
                                className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                                Department / Faculty
                              </label>
                              <input
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="e.g. Computer Science & Software Engineering"
                                className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
                              />
                            </div>
                          </div>

                          {/* Biography Textarea */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                                Biography & Experience
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
                              onChange={(e) => setDraftBio(e.target.value)}
                              placeholder="Brief academic biography and teaching philosophy..."
                              className="w-full bg-white/[0.01] hover:bg-white/[0.02] focus:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-sans resize-none"
                            />
                          </div>

                          {/* Directory Preview Card */}
                          <div className="pt-2 border-t border-white/[0.04]">
                            <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase block mb-2">DIRECTORY PREVIEW CARD</span>
                            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-start gap-4">
                              <div className="h-12 w-12 rounded-full border border-white/10 bg-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                                {draftProfilePic ? (
                                  <img 
                                    src={draftProfilePic} 
                                    alt="Avatar" 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-indigo-400">
                                    {teacherAvatarInitial}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className="font-sans text-xs font-black text-white block">{teacherDisplayName}</span>
                                <span className="text-[9px] font-mono text-indigo-400 block uppercase font-bold">
                                  {specialization || "Academy Instructor"}
                                </span>
                                <p className="text-[10px] text-white/50 leading-relaxed italic">
                                  "{draftBio || "No biography provided yet."}"
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Save Button */}
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={handleSaveProfileMetadata}
                              disabled={isSavingProfileTab}
                              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Save size={14} />
                              <span>{isSavingProfileTab ? "Saving..." : "Save Profile Details"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: APPEARANCE */}
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

                      {/* Theme Selection - Modern Horizontal Row identical to student */}
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

                  {/* SUBTAB 4: SECURITY */}
                  {settingsActiveTab === "Security" && (
                    <div className="max-w-3xl mx-auto bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left font-sans animate-fade-in">
                      <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                      
                      <div className="border-b border-white/[0.05] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-sans text-base font-black text-white">Credential Change</h3>
                          <p className="text-xs text-white/40">Secure your instructor profile with a complex master password</p>
                        </div>
                        
                        {/* Authentication Switcher */}
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
                            Google SSO
                          </button>
                        </div>
                      </div>

                      {isGoogleAccount ? (
                        <div className="p-6 rounded-2xl bg-white/[0.015] border border-white/[0.04] text-center space-y-3">
                          <Shield size={32} className="mx-auto text-indigo-400" />
                          <h4 className="text-sm font-bold text-white">Managed via Google SSO</h4>
                          <p className="text-xs text-white/40 max-w-sm mx-auto">
                            Your instructor account credentials are authenticate-managed via OAuth 2.0. Password rotations must occur directly through your Google account security portal.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSavePassword} className="space-y-4">
                          {/* Current Password */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={secShowCurrent ? "text" : "password"}
                                required
                                value={secCurrentPassword}
                                onChange={(e) => setSecCurrentPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 pr-10 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setSecShowCurrent(!secShowCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                              >
                                {secShowCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>

                          {/* New Password & Confirm Password in 2 cols */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                                New Password
                              </label>
                              <div className="relative">
                                <input
                                  type={secShowNew ? "text" : "password"}
                                  required
                                  value={secNewPassword}
                                  onChange={(e) => setSecNewPassword(e.target.value)}
                                  placeholder="••••••••••••"
                                  className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 pr-10 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => setSecShowNew(!secShowNew)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                >
                                  {secShowNew ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                                Confirm New Password
                              </label>
                              <div className="relative">
                                <input
                                  type={secShowConfirm ? "text" : "password"}
                                  required
                                  value={secConfirmPassword}
                                  onChange={(e) => setSecConfirmPassword(e.target.value)}
                                  placeholder="••••••••••••"
                                  className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 pr-10 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => setSecShowConfirm(!secShowConfirm)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                >
                                  {secShowConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="pt-4 border-t border-white/[0.04] flex justify-end">
                            <button
                              type="submit"
                              disabled={isSavingSecurity}
                              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Key size={14} />
                              <span>{isSavingSecurity ? "Updating..." : "Update Password"}</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

            </div>
          )}

        </div>
      </main>

      {/* CREATE SESSION MODAL */}
      <AnimatePresence>
        {showCreateSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-left font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar size={16} className="text-cyan-400" />
                  <span>Schedule New Live Session</span>
                </h3>
                <button onClick={() => setShowCreateSessionModal(false)} className="text-white/40 hover:text-white cursor-pointer">
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
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-left font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" />
                  <span>Create Assignment</span>
                </h3>
                <button onClick={() => setShowCreateAssignmentModal(false)} className="text-white/40 hover:text-white cursor-pointer">
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
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-left font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award size={16} className="text-emerald-400" />
                  <span>Grade & Feedback</span>
                </h3>
                <button onClick={() => setGradingSubmission(null)} className="text-white/40 hover:text-white cursor-pointer">
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
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer"
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
