import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Edit2, Trash2, Check, X, Shield, BookOpen, Clock, Users, Award, 
  Copy, CheckCircle2, AlertTriangle, Layers, Calendar, Search, RefreshCw,
  Globe, Eye, EyeOff, ArrowLeft, UserPlus, UserMinus, Sparkles, Filter,
  Crop, Upload, ExternalLink, ListChecks, DollarSign, CheckCircle, Video, AlertCircle
} from "lucide-react";
import { CourseRequest, Enrollment, AdminUser } from "./AdminDashboard/types";
import { Course, Student } from "../types/teacher";
import { adminApi, teacherApi } from "../lib/api";
import ImageCropperModal from "./common/ImageCropperModal";
import CourseSyllabusModal, { SyllabusItem } from "./common/CourseSyllabusModal";
import DeleteConfirmModal from "./common/DeleteConfirmModal";

interface AcademicTabProps {
  courses: any[];
  seasons?: any[];
  requests?: any[];
  enrollments?: any[];
  students?: any[];
  users?: AdminUser[];
  sessions?: any[];
  activeSubTab?: string;
  onAddCourse: (course: any) => Promise<any> | void;
  onUpdateCourse: (id: string, course: any) => Promise<any> | void;
  onDeleteCourse: (id: string) => Promise<any> | void;
  onDuplicateCourse?: (id: string) => void;
  onApproveSeason?: (id: string) => void;
  onCancelSeason?: (id: string) => void;
  onUpdateEnrollmentPayment?: (id: string, payStatus: "Paid" | "Pending" | "Unpaid") => void;
  onUpdateEnrollmentStatus?: (id: string, status: "Enrolled" | "Completed" | "Dropped") => void;
  onApproveRequest?: (id: string) => void;
  onRejectRequest?: (id: string, notes?: string) => void;
  onAddSeason?: (season: any) => void;
  onReloadData?: () => void;
  showCustomToast?: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function AcademicTab({
  courses,
  seasons = [],
  requests = [],
  enrollments = [],
  students = [],
  users = [],
  sessions = [],
  activeSubTab,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onUpdateEnrollmentPayment,
  onUpdateEnrollmentStatus,
  onApproveRequest,
  onRejectRequest,
  onReloadData,
  showCustomToast
}: AcademicTabProps) {
  const [subTab, setSubTab] = useState<"catalog" | "sessions" | "requests" | "enrollments">("catalog");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [sessionCourseFilter, setSessionCourseFilter] = useState("all");

  useEffect(() => {
    if (activeSubTab && ["catalog", "sessions", "requests", "enrollments"].includes(activeSubTab)) {
      setSubTab(activeSubTab as any);
      setSelectedCourseId(null);
    }
  }, [activeSubTab]);

  // Teachers list derived from registered users
  const teachersList = users.filter((u) => {
    const rId = Number(u.roleId ?? (u as any).role_id);
    const rName = (u.roleName || u.role || "").toLowerCase();
    return rId === 2 || rName === "teacher" || rName === "instructor";
  });

  // Selected Course for deep management (students, syllabus, sessions workspace)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseDetailData, setCourseDetailData] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [courseWorkspaceTab, setCourseWorkspaceTab] = useState<"overview" | "students" | "syllabus" | "sessions">("overview");

  // Load course full details when selected
  const loadSelectedCourseDetail = async (courseId: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await adminApi.getCourseDetail(courseId);
      if (res.success && res.data) {
        setCourseDetailData(res.data);
      }
    } catch (err) {
      console.error("Failed to load course details", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadSelectedCourseDetail(selectedCourseId);
    } else {
      setCourseDetailData(null);
    }
  }, [selectedCourseId]);

  // Add / Edit Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseModalAlert, setCourseModalAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [courseForm, setCourseForm] = useState<{
    title: string;
    code: string;
    teacherId: string;
    categoryId: number;
    price: string | number;
    sessionsCount: number;
    description: string;
    shortDescription: string;
    status: string;
    image: string;
    startDate: string;
    endDate: string;
    isPublished: boolean;
    syllabus: SyllabusItem[];
  }>({
    title: "",
    code: "",
    teacherId: "",
    categoryId: 1,
    price: "$199",
    sessionsCount: 12,
    description: "",
    shortDescription: "",
    status: "Active",
    image: "",
    startDate: "",
    endDate: "",
    isPublished: false,
    syllabus: []
  });
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

  // Inline Syllabus Module Builder inside Course Modal
  const [inlineModTitle, setInlineModTitle] = useState("");
  const [inlineModDuration, setInlineModDuration] = useState("4 hours");
  const [inlineModDesc, setInlineModDesc] = useState("");

  // Image Cropper Modal State
  const [showCropperModal, setShowCropperModal] = useState(false);

  // Form Syllabus Modal State (when adding/editing a course inside modal)
  const [showFormSyllabusModal, setShowFormSyllabusModal] = useState(false);

  // Syllabus Modal State (from Course Card)
  const [syllabusTargetCourse, setSyllabusTargetCourse] = useState<{
    id: string;
    title: string;
    syllabus: SyllabusItem[];
  } | null>(null);

  // Admin Session Modal State (Create / Edit Session)
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionModalAlert, setSessionModalAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    courseId: "",
    title: "",
    date: "",
    time: "18:00",
    duration: "2 hours",
    link: "",
    status: "Scheduled"
  });

  // Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: "course" | "student" | "request" | "session";
    id: string;
    name: string;
    studentId?: string;
  }>({
    isOpen: false,
    type: "course",
    id: "",
    name: ""
  });
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Toggle publish state loading tracking
  const [publishingCourseId, setPublishingCourseId] = useState<string | null>(null);

  // Add student to course modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [isLoadingAvailableStudents, setIsLoadingAvailableStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [enrollingStudentId, setEnrollingStudentId] = useState<string | null>(null);
  const [studentModalAlert, setStudentModalAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Open Add Course Modal
  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseModalAlert(null);
    setInlineModTitle("");
    setInlineModDuration("4 hours");
    setInlineModDesc("");
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 90);

    setCourseForm({
      title: "",
      code: `CRS-${Math.floor(100 + Math.random() * 900)}`,
      teacherId: teachersList[0]?.id || "",
      categoryId: 1,
      price: "$199",
      sessionsCount: 16,
      description: "",
      shortDescription: "",
      status: "Active",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
      startDate: today.toISOString().split("T")[0],
      endDate: futureDate.toISOString().split("T")[0],
      isPublished: true,
      syllabus: []
    });
    setShowCourseModal(true);
  };

  // Open Edit Course Modal (Supports Admin-created and Teacher-created/requested courses)
  const handleOpenEditCourse = (course: any) => {
    setEditingCourseId(course.id);
    setCourseModalAlert(null);
    setInlineModTitle("");
    setInlineModDuration("4 hours");
    setInlineModDesc("");
    const isPub = Boolean(course.isPublished || course.status === "Published" || course.is_published);
    let existingSyl: SyllabusItem[] = [];
    if (Array.isArray(course.syllabusJson)) {
      existingSyl = course.syllabusJson;
    } else if (Array.isArray(course.syllabus)) {
      existingSyl = course.syllabus;
    } else if (typeof course.syllabus_json === "string") {
      try {
        existingSyl = JSON.parse(course.syllabus_json);
      } catch {}
    }
    setCourseForm({
      title: course.title || course.courseName || "",
      code: course.code || "",
      teacherId: course.teacherId || course.teacher_id || "",
      categoryId: course.categoryId || course.category_id || 1,
      price: course.price || "$0",
      sessionsCount: course.sessionsCount || course.sessions_count || 12,
      description: course.description || "",
      shortDescription: course.shortDescription || course.short_description || "",
      status: course.status || "Active",
      image: course.image || course.courseImage || "",
      startDate: course.startDate || course.start_date ? String(course.startDate || course.start_date).split("T")[0] : "",
      endDate: course.endDate || course.end_date ? String(course.endDate || course.end_date).split("T")[0] : "",
      isPublished: isPub,
      syllabus: existingSyl
    });
    setShowCourseModal(true);
  };

  const handleAddInlineSyllabusModule = () => {
    if (!inlineModTitle.trim()) {
      setCourseModalAlert({ type: "error", text: "Please enter a Module Title before clicking Add Module." });
      return;
    }
    const newMod: SyllabusItem = {
      id: `mod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: inlineModTitle.trim(),
      duration: inlineModDuration.trim() || "4 hours",
      description: inlineModDesc.trim(),
      lessonsCount: 4,
      topics: []
    };
    setCourseForm((prev) => ({
      ...prev,
      syllabus: [...prev.syllabus, newMod]
    }));
    setInlineModTitle("");
    setInlineModDuration("4 hours");
    setInlineModDesc("");
    setCourseModalAlert({ type: "success", text: `Added module "${newMod.title}" (${courseForm.syllabus.length + 1} total).` });
  };

  const handleRemoveInlineSyllabusModule = (idx: number) => {
    setCourseForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== idx)
    }));
  };

  // Save Course (Create or Update with AJAX & Database sync)
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseModalAlert(null);

    if (!courseForm.title.trim()) {
      setCourseModalAlert({ type: "error", text: "Course title is required." });
      showCustomToast?.("Course title is required.", "warning");
      return;
    }

    // Auto-include any pending inline module that the user typed but didn't click "+ Add Module" on
    let finalSyllabus = [...courseForm.syllabus];
    if (inlineModTitle.trim()) {
      finalSyllabus.push({
        id: `mod-${Date.now()}`,
        title: inlineModTitle.trim(),
        duration: inlineModDuration.trim() || "4 hours",
        description: inlineModDesc.trim(),
        lessonsCount: 4,
        topics: []
      });
      setInlineModTitle("");
      setInlineModDesc("");
    }

    if (finalSyllabus.length === 0) {
      setCourseModalAlert({
        type: "error",
        text: "At least one Syllabus Module is required before creating a course. Please add a module in the Syllabus section below."
      });
      showCustomToast?.("Please add at least one syllabus module before creating the course.", "warning");
      return;
    }

    setIsSubmittingCourse(true);
    try {
      const payload = {
        title: courseForm.title.trim(),
        code: courseForm.code.trim(),
        teacherId: courseForm.teacherId || null,
        categoryId: Number(courseForm.categoryId),
        price: typeof courseForm.price === "number" ? `$${courseForm.price}` : courseForm.price,
        sessionsCount: Number(courseForm.sessionsCount),
        description: courseForm.description,
        shortDescription: courseForm.shortDescription || courseForm.description,
        status: courseForm.isPublished ? "Published" : courseForm.status,
        image: courseForm.image,
        startDate: courseForm.startDate || null,
        endDate: courseForm.endDate || null,
        isPublished: courseForm.isPublished,
        syllabusJson: finalSyllabus,
        syllabus: finalSyllabus
      };

      if (editingCourseId) {
        await onUpdateCourse(editingCourseId, payload);
        showCustomToast?.(`Course "${payload.title}" updated in database.`, "success");
      } else {
        await onAddCourse(payload);
        showCustomToast?.(`Course "${payload.title}" created in database successfully.`, "success");
      }

      setShowCourseModal(false);
      window.dispatchEvent(new Event("courses_updated"));
      if (onReloadData) onReloadData();
    } catch (err: any) {
      console.error("Failed to save course:", err);
      setCourseModalAlert({
        type: "error",
        text: err?.message || "Failed to save course to database. Please verify all fields."
      });
      showCustomToast?.(err.message || "Failed to save course.", "warning");
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  // Quick Toggle Publish State to Landing Page
  const handleTogglePublish = async (course: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentPub = Boolean(course.isPublished || course.status === "Published" || course.is_published);
    const targetPub = !currentPub;
    setPublishingCourseId(course.id);

    try {
      const res = await adminApi.togglePublishCourse(course.id, targetPub);
      if (res.success) {
        onUpdateCourse(course.id, {
          isPublished: targetPub,
          status: targetPub ? "Published" : "Active"
        });
        window.dispatchEvent(new CustomEvent("courses_updated"));
        showCustomToast?.(
          targetPub
            ? `Course "${course.title}" is now Published on Landing Page.`
            : `Course "${course.title}" set to Draft (hidden from Landing Page).`,
          "success"
        );
        if (onReloadData) onReloadData();
      }
    } catch (err: any) {
      console.error("Failed to toggle publish status:", err);
      showCustomToast?.("Failed to update publish state.", "warning");
    } finally {
      setPublishingCourseId(null);
    }
  };

  // Open Syllabus Modal for a Course
  const handleOpenSyllabusModal = (course: any, e: React.MouseEvent) => {
    e.stopPropagation();
    let initialSyllabus: SyllabusItem[] = [];
    if (Array.isArray(course.syllabusJson)) {
      initialSyllabus = course.syllabusJson;
    } else if (Array.isArray(course.syllabus)) {
      initialSyllabus = course.syllabus;
    }
    setSyllabusTargetCourse({
      id: course.id,
      title: course.title || course.courseName || "Course Syllabus",
      syllabus: initialSyllabus
    });
  };

  // Save Syllabus result from modal
  const handleSyllabusSaved = (newSyllabus: SyllabusItem[]) => {
    if (!syllabusTargetCourse) return;
    if (selectedCourseId === syllabusTargetCourse.id) {
      loadSelectedCourseDetail(syllabusTargetCourse.id);
    }
    setSyllabusTargetCourse(null);
    window.dispatchEvent(new CustomEvent("courses_updated"));
    if (onReloadData) onReloadData();
  };

  // Admin Session Handlers
  const handleOpenAddSession = (defaultCourseId?: string) => {
    setEditingSessionId(null);
    setSessionModalAlert(null);
    const today = new Date().toISOString().split("T")[0];
    setSessionForm({
      courseId: defaultCourseId || selectedCourseId || courses[0]?.id || "",
      title: "",
      date: today,
      time: "18:00",
      duration: "2 hours",
      link: "https://meet.google.com/new",
      status: "Scheduled"
    });
    setShowSessionModal(true);
  };

  const handleOpenEditSession = (sess: any) => {
    setEditingSessionId(sess.id);
    setSessionModalAlert(null);
    setSessionForm({
      courseId: sess.courseId || sess.course_id || "",
      title: sess.title || "",
      date: sess.date ? String(sess.date).split("T")[0] : "",
      time: sess.time || "18:00",
      duration: sess.duration || "2 hours",
      link: sess.link || "",
      status: sess.status || "Scheduled"
    });
    setShowSessionModal(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSessionModalAlert(null);
    if (!sessionForm.courseId) {
      setSessionModalAlert({ type: "error", text: "Please select a course for this session." });
      return;
    }
    if (!sessionForm.title.trim() || !sessionForm.date || !sessionForm.time) {
      setSessionModalAlert({ type: "error", text: "Session title, date, and time are required." });
      return;
    }

    setIsSavingSession(true);
    try {
      if (editingSessionId) {
        await teacherApi.updateSession(editingSessionId, {
          title: sessionForm.title.trim(),
          date: sessionForm.date,
          time: sessionForm.time,
          duration: sessionForm.duration,
          link: sessionForm.link,
          status: sessionForm.status
        });
        showCustomToast?.(`Session "${sessionForm.title}" updated in database.`, "success");
      } else {
        await teacherApi.createSession(sessionForm.courseId, {
          title: sessionForm.title.trim(),
          date: sessionForm.date,
          time: sessionForm.time,
          duration: sessionForm.duration,
          link: sessionForm.link,
          status: sessionForm.status
        });
        showCustomToast?.(`Session "${sessionForm.title}" scheduled in database.`, "success");
      }
      setShowSessionModal(false);
      if (selectedCourseId) loadSelectedCourseDetail(selectedCourseId);
      if (onReloadData) onReloadData();
    } catch (err: any) {
      setSessionModalAlert({ type: "error", text: err?.message || "Failed to save session." });
    } finally {
      setIsSavingSession(false);
    }
  };

  // Delete Action with 2nd Confirmation
  const handleRequestDeleteCourse = (course: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModalState({
      isOpen: true,
      type: "course",
      id: course.id,
      name: course.title || course.courseName || course.id
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeletingItem(true);
    try {
      if (deleteModalState.type === "course") {
        await onDeleteCourse(deleteModalState.id);
        showCustomToast?.(`Course "${deleteModalState.name}" removed from database.`, "success");
        if (selectedCourseId === deleteModalState.id) {
          setSelectedCourseId(null);
        }
      } else if (deleteModalState.type === "student" && deleteModalState.studentId) {
        await adminApi.removeStudentFromCourse(deleteModalState.id, deleteModalState.studentId);
        showCustomToast?.(`Student removed from course roster.`, "success");
        if (selectedCourseId) loadSelectedCourseDetail(selectedCourseId);
      } else if (deleteModalState.type === "request") {
        if (onRejectRequest) onRejectRequest(deleteModalState.id, "Rejected by administrator");
        showCustomToast?.(`Course proposal rejected.`, "info");
      } else if (deleteModalState.type === "session") {
        await teacherApi.deleteSession(deleteModalState.id);
        showCustomToast?.(`Session "${deleteModalState.name}" deleted from database.`, "success");
        if (selectedCourseId) loadSelectedCourseDetail(selectedCourseId);
      }
      setDeleteModalState({ isOpen: false, type: "course", id: "", name: "" });
      if (onReloadData) onReloadData();
    } catch (err: any) {
      console.error("Failed to delete item:", err);
      showCustomToast?.(err.message || "Failed to delete item.", "warning");
    } finally {
      setIsDeletingItem(false);
    }
  };

  // Approve & Publish Teacher Proposal
  const handleApproveTeacherProposal = async (reqId: string, courseId: string, title: string) => {
    try {
      const res = await adminApi.approveCourseProposal(courseId, true);
      if (res.success) {
        window.dispatchEvent(new CustomEvent("courses_updated"));
        showCustomToast?.(`Course proposal "${title}" approved and published to landing page!`, "success");
        if (onApproveRequest) onApproveRequest(reqId);
        if (onReloadData) onReloadData();
      }
    } catch (err: any) {
      console.error("Failed to approve course proposal:", err);
      showCustomToast?.("Failed to approve course proposal.", "warning");
    }
  };

  // Student Enrollment handlers
  const handleOpenAddStudent = async () => {
    if (!selectedCourseId) return;
    setStudentModalAlert(null);
    setShowAddStudentModal(true);
    setIsLoadingAvailableStudents(true);
    try {
      const res = await adminApi.getAvailableStudents(selectedCourseId);
      if (res.success && Array.isArray(res.data)) {
        setAvailableStudents(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load available students", err);
      setStudentModalAlert({ type: "error", text: err?.message || "Failed to load available students." });
    } finally {
      setIsLoadingAvailableStudents(false);
    }
  };

  const handleEnrollStudent = async (studentId: string) => {
    if (!selectedCourseId) return;
    setEnrollingStudentId(studentId);
    setStudentModalAlert(null);
    try {
      const res = await adminApi.enrollStudent(selectedCourseId, studentId);
      if (res.success) {
        setAvailableStudents((prev) => prev.filter((s) => s.id !== studentId));
        await loadSelectedCourseDetail(selectedCourseId);
        setStudentModalAlert({ type: "success", text: "Student enrolled into course successfully!" });
        showCustomToast?.("Student enrolled into course successfully.", "success");
        if (onReloadData) onReloadData();
      }
    } catch (err: any) {
      console.error("Failed to enroll student", err);
      setStudentModalAlert({ type: "error", text: err?.message || "Failed to enroll student." });
      showCustomToast?.(err.message || "Failed to enroll student.", "warning");
    } finally {
      setEnrollingStudentId(null);
    }
  };

  const handleRemoveStudentClick = (studentId: string, studentName: string) => {
    if (!selectedCourseId) return;
    setDeleteModalState({
      isOpen: true,
      type: "student",
      id: selectedCourseId,
      studentId,
      name: studentName
    });
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) =>
    (c.title || c.courseName || "").toLowerCase().includes(catalogSearch.toLowerCase()) ||
    (c.code || "").toLowerCase().includes(catalogSearch.toLowerCase()) ||
    (c.instructor || c.teacherName || "").toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courseDetailData;
  const currentCourseSessions = courseDetailData?.sessions?.length
    ? courseDetailData.sessions
    : sessions.filter((s: any) => s.courseId === selectedCourseId);

  return (
    <div className="space-y-6 text-left">
      {/* If Course Workspace is Open */}
      {selectedCourseId && currentCourse ? (
        <div className="space-y-6 animate-fade-in">
          {/* Top Breadcrumb & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#08080c] border border-white/[0.06] backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCourseId(null)}
                className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
              >
                <ArrowLeft size={14} />
                <span>Back to Catalog</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    {currentCourse.code}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      currentCourse.isPublished || currentCourse.status === "Published"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/[0.04] text-white/50 border border-white/10"
                    }`}
                  >
                    {currentCourse.isPublished || currentCourse.status === "Published" ? "Published" : (currentCourse.status || "Draft")}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  {currentCourse.title || currentCourse.courseName}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => loadSelectedCourseDetail(selectedCourseId)}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                title="Refresh Course Data"
              >
                <RefreshCw size={14} className={isLoadingDetail ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => handleOpenAddSession(selectedCourseId)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar size={13} />
                <span>+ Schedule Session</span>
              </button>
              <button
                onClick={(e) => handleOpenSyllabusModal(currentCourse, e)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Layers size={13} className="text-indigo-400" />
                <span>Manage Syllabus</span>
              </button>
              <button
                onClick={() => handleOpenEditCourse(currentCourse)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Course Settings</span>
              </button>
            </div>
          </div>

          {/* Course Workspace Sub-Tabs */}
          <div className="flex border-b border-white/[0.05] gap-4 sm:gap-8 text-xs overflow-x-auto scrollbar-none">
            {[
              { id: "overview" as const, label: "Course & Instructor", icon: BookOpen },
              { id: "students" as const, label: `Enrolled Students (${courseDetailData?.students?.length ?? currentCourse.studentsCount ?? 0})`, icon: Users },
              { id: "syllabus" as const, label: `Syllabus Curriculum (${(courseDetailData?.syllabus || currentCourse.syllabusJson || currentCourse.syllabus || []).length})`, icon: Layers },
              { id: "sessions" as const, label: `Class Sessions (${currentCourseSessions.length})`, icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = courseWorkspaceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCourseWorkspaceTab(tab.id)}
                  className={`pb-3 font-bold tracking-wide uppercase transition-all relative flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive ? "text-indigo-400" : "text-white/40 hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="courseWorkspaceTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & INSTRUCTOR */}
          {courseWorkspaceTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-3xl bg-[#08080c] border border-white/[0.06] space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.04] pb-3">
                    <BookOpen size={16} className="text-indigo-400" />
                    <span>Course Curriculum Description</span>
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap font-sans">
                    {courseDetailData?.description || currentCourse.description || "No detailed syllabus description specified for this course yet."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/[0.04] text-xs">
                    <div>
                      <span className="text-[10px] text-white/40 block font-mono uppercase">Sessions Total:</span>
                      <span className="font-bold text-white font-mono mt-0.5 block">{currentCourse.sessionsCount || 12} Lessons</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block font-mono uppercase">Enrolled Students:</span>
                      <span className="font-bold text-emerald-400 font-mono mt-0.5 block">
                        {courseDetailData?.students?.length ?? currentCourse.studentsCount ?? 0} Students
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block font-mono uppercase">Start Date:</span>
                      <span className="font-bold text-white font-mono mt-0.5 block">
                        {currentCourse.startDate || currentCourse.start_date || "Not Set"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block font-mono uppercase">End Date:</span>
                      <span className="font-bold text-white font-mono mt-0.5 block">
                        {currentCourse.endDate || currentCourse.end_date || "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Instructor & Publishing Card */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#08080c] border border-white/[0.06] space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.04] pb-3">
                    <Award size={16} className="text-indigo-400" />
                    <span>Assigned Instructor</span>
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
                      {((currentCourse.teacherName || currentCourse.instructor || "UN")).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{currentCourse.teacherName || currentCourse.instructor || "Unassigned"}</h4>
                      <p className="text-xs text-white/40 font-mono">{currentCourse.teacherEmail || "Assigned Faculty"}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-xs text-white/60">Landing Page Publishing</span>
                    <button
                      type="button"
                      onClick={(e) => handleTogglePublish(currentCourse, e)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        currentCourse.isPublished || currentCourse.status === "Published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {currentCourse.isPublished || currentCourse.status === "Published" ? "Published (Live)" : "Draft (Hidden)"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENROLLED STUDENTS */}
          {courseWorkspaceTab === "students" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Course Student Roster</h3>
                  <p className="text-[10px] text-white/40">Registered students currently enrolled and progressing in this course.</p>
                </div>

                <button
                  onClick={handleOpenAddStudent}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                >
                  <UserPlus size={14} />
                  <span>Enroll Student into Course</span>
                </button>
              </div>

              {/* Enrolled Students Table */}
              <div className="rounded-3xl border border-white/[0.06] bg-[#08080c] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/[0.02] border-b border-white/[0.05] text-white/40 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Phone Number</th>
                        <th className="py-3 px-4">Enrollment Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {(!courseDetailData?.students || courseDetailData.students.length === 0) ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-white/30 font-mono text-xs">
                            No students currently enrolled in this course. Click &ldquo;Enroll Student into Course&rdquo; to register students.
                          </td>
                        </tr>
                      ) : (
                        courseDetailData.students.map((st: any) => (
                          <tr key={st.student_id || st.enrollment_id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-[10px] shrink-0">
                                  {(st.student_name || "ST").substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-bold text-white">{st.student_name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-white/60">{st.student_email}</td>
                            <td className="py-3 px-4 font-mono text-white/40">{st.student_phone || "—"}</td>
                            <td className="py-3 px-4 font-mono text-white/40">
                              {st.joined_date ? new Date(st.joined_date).toLocaleDateString() : "Active"}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                {st.enrollment_status || "Enrolled"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleRemoveStudentClick(st.student_id, st.student_name)}
                                className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black text-[11px] font-bold border border-red-500/25 transition-all cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                <UserMinus size={11} />
                                <span>Remove</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYLLABUS & MODULES */}
          {courseWorkspaceTab === "syllabus" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Curriculum Modules & Lessons</h3>
                  <p className="text-[10px] text-white/40">Manage lectures, lessons, and topics for {currentCourse.title}.</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleOpenSyllabusModal(currentCourse, e)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Layers size={14} />
                  <span>Open Syllabus Manager</span>
                </button>
              </div>

              {((courseDetailData?.syllabus || currentCourse.syllabusJson || currentCourse.syllabus || []).length === 0) ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] text-zinc-400 space-y-2">
                  <Layers size={24} className="mx-auto text-zinc-600" />
                  <p className="text-xs">No syllabus modules defined yet. Click &ldquo;Open Syllabus Manager&rdquo; to add modules.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(courseDetailData?.syllabus || currentCourse.syllabusJson || currentCourse.syllabus || []).map((mod: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#08080c] border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-white">{mod.title}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">{mod.duration || "4 hrs"}</span>
                      </div>
                      {mod.description && <p className="text-[11px] text-zinc-400">{mod.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLASS SESSIONS FOR THIS COURSE */}
          {courseWorkspaceTab === "sessions" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Course Live Class Sessions</h3>
                  <p className="text-[10px] text-white/40">View and manage all sessions scheduled by the instructor or administrator for this course.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddSession(selectedCourseId)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Schedule New Session</span>
                </button>
              </div>

              {currentCourseSessions.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] text-zinc-400 space-y-2">
                  <Calendar size={24} className="mx-auto text-zinc-600" />
                  <p className="text-xs">No class sessions scheduled for this course yet.</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-white/[0.06] bg-[#08080c] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-white/[0.02] border-b border-white/[0.05] text-white/40 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Session Title</th>
                          <th className="py-3 px-4">Instructor</th>
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Duration</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Class Link</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {currentCourseSessions.map((sess: any) => (
                          <tr key={sess.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white">{sess.title}</td>
                            <td className="py-3.5 px-4 text-white/70">{sess.teacherName || currentCourse.teacherName || "Instructor"}</td>
                            <td className="py-3.5 px-4 font-mono text-indigo-300">{sess.date} &bull; {sess.time}</td>
                            <td className="py-3.5 px-4 font-mono text-white/50">{sess.duration || "2 hours"}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                sess.status === "Completed"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : sess.status === "Cancelled"
                                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                  : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                              }`}>
                                {sess.status || "Scheduled"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {sess.link ? (
                                <a
                                  href={sess.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold"
                                >
                                  <Video size={11} />
                                  <span>Join Class</span>
                                </a>
                              ) : (
                                <span className="text-white/30 font-mono text-[10px]">No link</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSession(sess)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
                                  title="Edit Session"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteModalState({ isOpen: true, type: "session", id: sess.id, name: sess.title })}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                  title="Delete Session"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Regular Catalog View */
        <>
          {/* Sub tabs switcher */}
          <div className="flex border-b border-white/[0.05] gap-6 text-xs overflow-x-auto scrollbar-none">
            {[
              { id: "catalog", label: `Curriculum Catalog (${courses.length})` },
              { id: "sessions", label: `Class Sessions (${sessions.length})` },
              { id: "requests", label: `Instructor Proposals (${requests.length})` },
              { id: "enrollments", label: `Student Registrations (${enrollments.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`pb-3 font-extrabold tracking-wider uppercase transition-all relative cursor-pointer shrink-0 ${
                  subTab === tab.id 
                    ? "text-indigo-400" 
                    : "text-white/40 hover:text-white"
                }`}
              >
                {tab.label}
                {subTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-400" />
                )}
              </button>
            ))}
          </div>

          {/* RENDER SUB-TAB: CURRICULUM CATALOG */}
          {subTab === "catalog" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Course Catalog Management</h3>
                  <p className="text-[10px] text-white/40">Create courses with required syllabus modules, assign instructors, and toggle landing page publishing.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search courses by name or code..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button 
                    onClick={handleOpenAddCourse}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
                  >
                    <Plus size={14} />
                    <span>Create Course</span>
                  </button>
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01] text-zinc-400 space-y-3">
                  <BookOpen size={32} className="mx-auto text-zinc-600" />
                  <h4 className="text-sm font-bold text-white">No Courses Found in Catalog</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Click &ldquo;Create Course&rdquo; above to deploy a new course directly into the database.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => {
                    const isPub = Boolean(course.isPublished || course.status === "Published" || course.is_published);
                    const isTeacherProposal = Boolean(course.requestedBy || course.approvalStatus === "Pending");
                    const courseSessionsCount = sessions.filter((s: any) => s.courseId === course.id).length;

                    return (
                      <div 
                        key={course.id}
                        className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 hover:border-white/10 transition-all flex flex-col justify-between group relative"
                      >
                        <div className="space-y-3">
                          {/* Course Cover Image Banner */}
                          <div className="relative aspect-[16/10] w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden">
                            <img 
                              src={course.image || course.courseImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop"} 
                              alt={course.title || course.courseName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Code Badge */}
                            <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-mono text-indigo-300 font-bold border border-white/10">
                              {course.code}
                            </span>

                            {/* Publish / Landing Badge Button */}
                            <button
                              type="button"
                              onClick={(e) => handleTogglePublish(course, e)}
                              disabled={publishingCourseId === course.id}
                              className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
                                isPub
                                  ? "bg-emerald-500/90 hover:bg-emerald-400 text-black border-emerald-400/50"
                                  : "bg-black/80 hover:bg-black text-zinc-400 hover:text-white border-white/20"
                              }`}
                              title={isPub ? "Click to Unpublish from Landing Page" : "Click to Publish to Landing Page"}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isPub ? "bg-black" : "bg-zinc-500"}`} />
                              <span>{isPub ? "Published" : "Draft"}</span>
                            </button>

                            {/* Teacher Proposal indicator badge if applicable */}
                            {isTeacherProposal && (
                              <span className="absolute bottom-3 left-3 bg-amber-500/90 text-black px-2 py-0.5 rounded-md text-[9px] font-bold font-mono">
                                Teacher Proposal
                              </span>
                            )}
                          </div>

                          <div className="text-left space-y-1">
                            <h4 className="font-extrabold text-sm text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                              {course.title || course.courseName}
                            </h4>
                            <p className="text-[11px] text-zinc-400 line-clamp-2">
                              {course.shortDescription || course.description || "No description provided."}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-white/40 font-mono pt-1">
                              <span className="flex items-center gap-1">
                                <Users size={11} /> {course.studentsCount || 0} Students
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {courseSessionsCount} Sessions
                              </span>
                              <span className="font-bold text-white">
                                {course.price || "Free"}
                              </span>
                            </div>

                            {/* Dates display if available */}
                            {(course.startDate || course.endDate) && (
                              <div className="text-[9px] font-mono text-zinc-500 pt-0.5 flex items-center gap-1">
                                <Clock size={10} />
                                <span>{course.startDate || "TBD"} &rarr; {course.endDate || "TBD"}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            {/* Manage Syllabus Button on Card */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenSyllabusModal(course, e)}
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/30 text-white/80 hover:text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              title="Add, edit, or remove syllabus modules"
                            >
                              <Layers size={12} className="text-indigo-400" />
                              <span>Syllabus ({(course.syllabusJson || course.syllabus || []).length})</span>
                            </button>

                            {/* Edit Course Settings Button */}
                            <button 
                              onClick={() => handleOpenEditCourse(course)}
                              className="p-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                              title="Edit Course Parameters"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete Course with 2nd Confirmation */}
                            <button 
                              onClick={(e) => handleRequestDeleteCourse(course, e)}
                              className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black transition-all cursor-pointer"
                              title="Permanently Delete Course from Database"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Button to Enter and Deep Manage Course */}
                          <button
                            onClick={() => {
                              setSelectedCourseId(course.id);
                              setCourseWorkspaceTab("overview");
                            }}
                            className="w-full py-2 bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-transparent rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Users size={13} />
                            <span>Manage Course, Students & Sessions</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* RENDER SUB-TAB: CLASS SESSIONS (ALL INSTRUCTOR & ADMIN SESSIONS) */}
          {subTab === "sessions" && (
            <div className="space-y-5 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Academy Class Sessions</h3>
                  <p className="text-[10px] text-white/40">
                    All live class sessions defined by instructors and administrators across every course.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={sessionCourseFilter}
                    onChange={(e) => setSessionCourseFilter(e.target.value)}
                    className="bg-[#08080c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Courses ({sessions.length})</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title || c.courseName}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleOpenAddSession(sessionCourseFilter !== "all" ? sessionCourseFilter : undefined)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Schedule Session</span>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/[0.06] bg-[#08080c] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/[0.02] border-b border-white/[0.05] text-white/40 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Course</th>
                        <th className="py-3.5 px-4">Session Topic</th>
                        <th className="py-3.5 px-4">Instructor</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Duration</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Live Link</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {sessions
                        .filter((s: any) => sessionCourseFilter === "all" || s.courseId === sessionCourseFilter)
                        .map((sess: any) => (
                          <tr key={sess.id} className="hover:bg-white/[0.015] transition-colors">
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCourseId(sess.courseId);
                                  setCourseWorkspaceTab("sessions");
                                }}
                                className="font-bold text-indigo-400 hover:text-indigo-300 text-left cursor-pointer"
                              >
                                {sess.courseTitle || "Course"}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white">{sess.title}</td>
                            <td className="py-3.5 px-4 text-white/70">{sess.teacherName || "Instructor"}</td>
                            <td className="py-3.5 px-4 font-mono text-white/80">{sess.date} &bull; {sess.time}</td>
                            <td className="py-3.5 px-4 font-mono text-white/50">{sess.duration || "2 hours"}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                sess.status === "Completed"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : sess.status === "Cancelled"
                                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                  : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                              }`}>
                                {sess.status || "Scheduled"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {sess.link ? (
                                <a
                                  href={sess.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold"
                                >
                                  <Video size={11} />
                                  <span>Join Class</span>
                                </a>
                              ) : (
                                <span className="text-white/30 font-mono text-[10px]">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSession(sess)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
                                  title="Edit Session"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteModalState({ isOpen: true, type: "session", id: sess.id, name: sess.title })}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                  title="Delete Session"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {sessions.filter((s: any) => sessionCourseFilter === "all" || s.courseId === sessionCourseFilter).length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-white/35 font-mono text-xs">
                            No class sessions found. When instructors schedule sessions, they appear here automatically.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* RENDER SUB-TAB: INSTRUCTOR REQUESTS & PROPOSALS */}
          {subTab === "requests" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Teacher Course Proposals & Requests</h3>
                <p className="text-[10px] text-white/40">Review, modify, and publish course proposals submitted by faculty instructors.</p>
              </div>

              {requests.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] text-zinc-400 text-xs font-mono">
                  No pending course proposals from faculty members.
                </div>
              ) : (
                <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#08080c] overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.05] text-white/30 uppercase tracking-widest text-[9px] font-black">
                        <th className="pb-3">Course / Proposal</th>
                        <th className="pb-3">Instructor</th>
                        <th className="pb-3">Syllabus</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {requests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="py-3.5">
                            <span className="font-bold text-white block">{req.title || req.proposedTitle || req.courseName}</span>
                            <span className="font-mono text-[10px] text-zinc-500">{req.code || req.courseId || "PROPOSAL"}</span>
                          </td>
                          <td className="py-3.5 font-bold text-white/80">{req.teacherName || req.instructor || "Instructor"}</td>
                          <td className="py-3.5 font-mono text-indigo-300">
                            {(req.syllabusJson || req.syllabus || []).length} Modules
                          </td>
                          <td className="py-3.5 font-bold text-white">{req.price || "Free"}</td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {req.approvalStatus || req.status || "Pending"}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCourse(req)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold border border-white/10 cursor-pointer"
                              title="Edit proposal details"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveTeacherProposal(req.id, req.courseId || req.id, req.title || req.courseName)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-[10px] cursor-pointer"
                            >
                              Approve & Publish
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteModalState({
                                  isOpen: true,
                                  type: "request",
                                  id: req.id,
                                  name: req.title || "Proposal"
                                });
                              }}
                              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black font-bold rounded-lg text-[10px] border border-red-500/20 cursor-pointer"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RENDER SUB-TAB: STUDENT REGISTRATIONS */}
          {subTab === "enrollments" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Student Course Enrollments</h3>
                <p className="text-[10px] text-white/40">Audit active academy enrollments, payment standing, and progression across courses.</p>
              </div>

              <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#08080c] overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-white/30 uppercase tracking-widest text-[9px] font-black">
                      <th className="pb-3">Student Name</th>
                      <th className="pb-3">Enrolled Course</th>
                      <th className="pb-3">Tuition Payment</th>
                      <th className="pb-3 text-center">Progress</th>
                      <th className="pb-3">Joined Date</th>
                      <th className="pb-3 text-right">Academic Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {enrollments.map((en: any) => (
                      <tr key={en.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-3.5 font-bold text-white">{en.studentName || en.student_name}</td>
                        <td className="py-3.5 font-mono text-indigo-400 text-[10px]">{en.courseTitle || en.course_title}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${
                            en.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {en.paymentStatus || "Paid"}
                          </span>
                        </td>
                        <td className="py-3.5 text-center font-mono">{en.progress || 0}%</td>
                        <td className="py-3.5 font-mono text-[10px] text-white/40">{en.joinedDate || "Recent"}</td>
                        <td className="py-3.5 text-right font-bold text-white/70">{en.status || "Enrolled"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE & EDIT COURSE MODAL */}
      <AnimatePresence>
        {showCourseModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-3xl bg-[#0d0d12] border border-white/10 rounded-3xl p-6 text-left space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingCourseId ? "Edit Course Configurations & Syllabus" : "Create New Course & Syllabus"}
                    </h3>
                    <p className="text-[11px] text-zinc-400">Persisted immediately to database and synchronized with Landing Page</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {courseModalAlert && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  courseModalAlert.type === "error"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{courseModalAlert.text}</span>
                  </div>
                  <button type="button" onClick={() => setCourseModalAlert(null)} className="text-white/40 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              )}

              <form onSubmit={handleCourseSubmit} className="space-y-4 text-xs">
                {/* Title & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Course Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Full-Stack Reactive Web Architecture"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Course Code</label>
                    <input 
                      type="text" 
                      placeholder="CRS-101"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Teacher & Category & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Instructor</label>
                    <select
                      value={courseForm.teacherId}
                      onChange={(e) => setCourseForm({ ...courseForm, teacherId: e.target.value })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Unassigned</option>
                      {teachersList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Category</label>
                    <select
                      value={courseForm.categoryId}
                      onChange={(e) => setCourseForm({ ...courseForm, categoryId: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1">Web Development</option>
                      <option value="2">Cybersecurity</option>
                      <option value="3">CMS & Architecture</option>
                      <option value="4">UI/UX & Design Systems</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Price</label>
                    <input
                      type="text"
                      placeholder="$199 or Free"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Start Date, End Date, Sessions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Start Date *</label>
                    <input
                      type="date"
                      value={courseForm.startDate}
                      onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">End Date *</label>
                    <input
                      type="date"
                      value={courseForm.endDate}
                      onChange={(e) => setCourseForm({ ...courseForm, endDate: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Total Sessions</label>
                    <input
                      type="number"
                      min="1"
                      value={courseForm.sessionsCount}
                      onChange={(e) => setCourseForm({ ...courseForm, sessionsCount: parseInt(e.target.value, 10) || 12 })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Publish to Landing Switch */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Globe size={14} className="text-emerald-400" />
                      <span>Publish on Academy Landing Page</span>
                    </h4>
                    <p className="text-[10px] text-zinc-400">
                      When enabled, this course and its syllabus are displayed immediately on the public landing page.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={courseForm.isPublished}
                      onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Description & Overview</label>
                  <textarea
                    rows={2}
                    placeholder="Provide curriculum scope, learning objectives, and prerequisites..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                  />
                </div>

                {/* INLINE COURSE SYLLABUS BUILDER (REQUIRED) */}
                <div className="p-4 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/25 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Layers size={14} className="text-indigo-400" />
                        <span>Course Syllabus Modules * ({courseForm.syllabus.length} Added)</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400">
                        Add at least one syllabus module below before creating the course.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFormSyllabusModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 text-[11px] font-bold cursor-pointer shrink-0"
                    >
                      Advanced Syllabus Editor
                    </button>
                  </div>

                  {/* Quick Add Module Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Module Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Module 1: Architecture & Setup"
                        value={inlineModTitle}
                        onChange={(e) => setInlineModTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddInlineSyllabusModule();
                          }
                        }}
                        className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Module Summary</label>
                      <input
                        type="text"
                        placeholder="Core topics covered..."
                        value={inlineModDesc}
                        onChange={(e) => setInlineModDesc(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddInlineSyllabusModule();
                          }
                        }}
                        className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-3 flex gap-1.5">
                      <input
                        type="text"
                        placeholder="4 hrs"
                        value={inlineModDuration}
                        onChange={(e) => setInlineModDuration(e.target.value)}
                        className="w-16 bg-zinc-900 border border-white/15 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddInlineSyllabusModule}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-indigo-600/20"
                      >
                        <Plus size={13} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Added Modules List */}
                  {courseForm.syllabus.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 pt-1">
                      {courseForm.syllabus.map((mod, idx) => (
                        <div
                          key={mod.id || idx}
                          className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="h-5 w-5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{mod.title}</p>
                              {mod.description && (
                                <p className="text-[10px] text-zinc-400 truncate">{mod.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-zinc-400">{mod.duration || "4 hrs"}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveInlineSyllabusModule(idx)}
                              className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-300/80 font-mono">
                      * No modules added yet. Enter a Module Title above and click &ldquo;+ Add&rdquo;.
                    </p>
                  )}
                </div>

                {/* Cover Image with Upload & Cropper */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <label className="text-[10px] text-white/50 uppercase font-mono font-bold block">
                    Course Artwork & Cover Photo
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {courseForm.image ? (
                      <div className="relative aspect-[16/10] w-36 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
                        <img
                          src={courseForm.image}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] w-36 rounded-xl border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center text-zinc-500 text-[10px] shrink-0">
                        No image
                      </div>
                    )}

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCropperModal(true)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Crop size={14} />
                          <span>Upload & Crop Image</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Or enter direct image URL..."
                        value={courseForm.image}
                        onChange={(e) => setCourseForm({ ...courseForm, image: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCourseModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmittingCourse}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>{isSubmittingCourse ? "Saving to Database..." : (editingCourseId ? "Save Modifications to Database" : "Create Course & Save Syllabus")}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORM SYLLABUS MODAL (Opened from inside Create/Edit Course Modal) */}
      <CourseSyllabusModal
        isOpen={showFormSyllabusModal}
        courseId="draft"
        courseTitle={courseForm.title || "New Course"}
        initialSyllabus={courseForm.syllabus}
        onSaveSyllabus={(updated) => {
          setCourseForm((prev) => ({ ...prev, syllabus: updated }));
          setShowFormSyllabusModal(false);
        }}
        onClose={() => setShowFormSyllabusModal(false)}
        showCustomToast={showCustomToast}
      />

      {/* SCHEDULE / EDIT SESSION MODAL */}
      <AnimatePresence>
        {showSessionModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[#0d0d12] border border-white/10 rounded-3xl p-6 text-left space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingSessionId ? "Edit Class Session" : "Schedule New Class Session"}
                    </h3>
                    <p className="text-[11px] text-zinc-400">Synchronized across Admin, Instructor, and Student portals</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowSessionModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              {sessionModalAlert && (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                  sessionModalAlert.type === "error"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{sessionModalAlert.text}</span>
                  </div>
                  <button type="button" onClick={() => setSessionModalAlert(null)} className="text-white/40 hover:text-white">
                    <X size={13} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
                {!editingSessionId && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Target Course *</label>
                    <select
                      value={sessionForm.courseId}
                      onChange={(e) => setSessionForm({ ...sessionForm, courseId: e.target.value })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title || c.courseName} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Session Title / Topic *</label>
                  <input
                    type="text"
                    placeholder="e.g. Session 1: Architecture & Live Coding"
                    value={sessionForm.title}
                    onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Date *</label>
                    <input
                      type="date"
                      value={sessionForm.date}
                      onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Time *</label>
                    <input
                      type="time"
                      value={sessionForm.time}
                      onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Duration</label>
                    <input
                      type="text"
                      placeholder="2 hours"
                      value={sessionForm.duration}
                      onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Live Classroom Link (Meet / Zoom)</label>
                    <input
                      type="text"
                      placeholder="https://meet.google.com/..."
                      value={sessionForm.link}
                      onChange={(e) => setSessionForm({ ...sessionForm, link: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-mono font-bold">Status</label>
                    <select
                      value={sessionForm.status}
                      onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowSessionModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSession}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>{isSavingSession ? "Saving..." : (editingSessionId ? "Save Changes" : "Schedule Session")}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMAGE CROPPER MODAL */}
      <ImageCropperModal
        isOpen={showCropperModal}
        initialImageUrl={courseForm.image}
        aspectRatio="16:9"
        onCropComplete={(croppedDataUrl) => {
          setCourseForm((prev) => ({ ...prev, image: croppedDataUrl }));
          showCustomToast?.("Image cropped and attached.", "success");
        }}
        onClose={() => setShowCropperModal(false)}
      />

      {/* COURSE SYLLABUS MODAL */}
      {syllabusTargetCourse && (
        <CourseSyllabusModal
          isOpen={true}
          courseId={syllabusTargetCourse.id}
          courseTitle={syllabusTargetCourse.title}
          initialSyllabus={syllabusTargetCourse.syllabus}
          onSaveSyllabus={handleSyllabusSaved}
          onClose={() => setSyllabusTargetCourse(null)}
          showCustomToast={showCustomToast}
        />
      )}

      {/* UNIVERSAL DELETE SECOND CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title={
          deleteModalState.type === "course"
            ? "Permanently Delete Course"
            : deleteModalState.type === "student"
            ? "Remove Student from Course"
            : deleteModalState.type === "session"
            ? "Permanently Delete Class Session"
            : "Reject Teacher Proposal"
        }
        itemName={deleteModalState.name}
        message="This action will delete the record from the database. Are you sure you want to proceed?"
        isDeleting={isDeletingItem}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalState({ isOpen: false, type: "course", id: "", name: "" })}
      />

      {/* ENROLL STUDENT MODAL */}
      <AnimatePresence>
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d0d12] border border-white/10 rounded-3xl p-6 text-left space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserPlus size={16} className="text-emerald-400" />
                    <span>Enroll Student into {currentCourse?.title || currentCourse?.courseName}</span>
                  </h3>
                  <p className="text-[10px] text-white/40">Select a registered student who is not yet enrolled in this course.</p>
                </div>
                <button onClick={() => setShowAddStudentModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              {studentModalAlert && (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                  studentModalAlert.type === "error"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{studentModalAlert.text}</span>
                  </div>
                  <button type="button" onClick={() => setStudentModalAlert(null)} className="text-white/40 hover:text-white">
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Search Available Students */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Available Students List */}
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] pr-1">
                {isLoadingAvailableStudents ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="animate-spin text-emerald-400" size={20} />
                    <span className="text-xs text-white/40">Searching academy roster...</span>
                  </div>
                ) : (() => {
                  const filtered = availableStudents.filter(s =>
                    (s.name && s.name.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
                    (s.email && s.email.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center text-white/40 text-xs">
                        No available students found to enroll.
                      </div>
                    );
                  }

                  return filtered.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                          {(s.name || "ST").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{s.name}</h4>
                          <p className="text-[10px] text-white/40 font-mono truncate">{s.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEnrollStudent(s.id)}
                        disabled={enrollingStudentId === s.id}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {enrollingStudentId === s.id ? (
                          <RefreshCw className="animate-spin" size={12} />
                        ) : (
                          <UserPlus size={12} />
                        )}
                        <span>Enroll</span>
                      </button>
                    </div>
                  ));
                })()}
              </div>

              <div className="pt-2 border-t border-white/[0.05] flex justify-end">
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-white/60 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
