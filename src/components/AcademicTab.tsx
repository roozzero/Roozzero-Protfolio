import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Edit2, Trash2, Check, X, Shield, BookOpen, Clock, Users, Award, 
  HelpCircle, Copy, CheckCircle2, AlertTriangle, MessageSquare, ListFilter, RotateCw,
  ArrowLeft, UserPlus, UserMinus, UserCheck, Layers, FileText, Calendar, Search, RefreshCw, ExternalLink
} from "lucide-react";
import { CourseRequest, Enrollment, AdminUser } from "./AdminDashboard/types";
import { Course, CourseSeason, Student } from "../types/teacher";
import { adminApi } from "../lib/api";

interface AcademicTabProps {
  courses: Course[];
  seasons: CourseSeason[];
  requests: CourseRequest[];
  enrollments: Enrollment[];
  students: Student[];
  users?: AdminUser[];
  activeSubTab?: string;
  onAddCourse: (course: Partial<Course>) => void;
  onUpdateCourse: (id: string, course: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onDuplicateCourse: (id: string) => void;
  onApproveSeason: (id: string) => void;
  onCancelSeason: (id: string) => void;
  onUpdateEnrollmentPayment: (id: string, payStatus: "Paid" | "Pending" | "Unpaid") => void;
  onUpdateEnrollmentStatus: (id: string, status: "Enrolled" | "Completed" | "Dropped") => void;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string, notes?: string) => void;
  onAddSeason: (season: CourseSeason) => void;
  onReloadData?: () => void;
}

export default function AcademicTab({
  courses,
  seasons,
  requests,
  enrollments,
  students,
  users = [],
  activeSubTab,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onApproveSeason,
  onCancelSeason,
  onUpdateEnrollmentPayment,
  onUpdateEnrollmentStatus,
  onApproveRequest,
  onRejectRequest,
  onAddSeason,
  onReloadData
}: AcademicTabProps) {
  const [subTab, setSubTab] = useState<"catalog" | "seasons" | "requests" | "enrollments">("catalog");

  useEffect(() => {
    if (activeSubTab && ["catalog", "seasons", "requests", "enrollments"].includes(activeSubTab)) {
      setSubTab(activeSubTab as any);
    }
  }, [activeSubTab]);

  // Teachers list derived from registered users
  const teachersList = users.filter((u) => {
    const rId = Number(u.roleId ?? (u as any).role_id);
    const rName = (u.roleName || u.role || "").toLowerCase();
    return rId === 2 || rName === "teacher" || rName === "instructor";
  });

  // Selected Course for deep management
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseDetailData, setCourseDetailData] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [courseWorkspaceTab, setCourseWorkspaceTab] = useState<"overview" | "students" | "syllabus" | "seasons">("overview");

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

  // Modals / forms states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<{
    title: string;
    code: string;
    teacherId: string;
    price: number;
    sessionsCount: number;
    description: string;
    status: "Active" | "Inactive";
    image: string;
  }>({
    title: "",
    code: "",
    teacherId: "",
    price: 0,
    sessionsCount: 12,
    description: "",
    status: "Active",
    image: ""
  });

  // Teacher assignment state inside course workspace
  const [selectedTeacherToAssign, setSelectedTeacherToAssign] = useState("");
  const [isAssigningTeacher, setIsAssigningTeacher] = useState(false);

  // Add student to course modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [isLoadingAvailableStudents, setIsLoadingAvailableStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [enrollingStudentId, setEnrollingStudentId] = useState<string | null>(null);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);

  // Syllabus Lessons modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    duration: "45 mins",
    lessonOrder: 1,
    description: "",
    isPreview: false
  });
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  // Explanation Modal for Request Rejection/Revision
  const [explainModal, setExplainModal] = useState<{ id: string; type: "request" | "season"; reject: boolean } | null>(null);
  const [explainNotes, setExplainNotes] = useState("");

  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: "",
      code: "",
      teacherId: teachersList[0]?.id || "",
      price: 0,
      sessionsCount: 12,
      description: "",
      status: "Active",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400&auto=format&fit=crop"
    });
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (c: Course) => {
    setEditingCourseId(c.id);
    setCourseForm({
      title: c.title || "",
      code: c.code || "",
      teacherId: (c as any).teacherId || (c as any).teacher_id || "",
      price: (c as any).price || 0,
      sessionsCount: c.sessionsCount || 12,
      description: (c as any).description || "",
      status: (c.status as any) || "Active",
      image: c.image || ""
    });
    setShowCourseModal(true);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim() || !courseForm.code.trim()) return;

    if (editingCourseId) {
      await onUpdateCourse(editingCourseId, courseForm);
      if (selectedCourseId === editingCourseId) {
        loadSelectedCourseDetail(editingCourseId);
      }
    } else {
      await onAddCourse(courseForm);
    }
    setShowCourseModal(false);
  };

  // Assign teacher to course
  const handleAssignTeacher = async () => {
    if (!selectedCourseId) return;
    setIsAssigningTeacher(true);
    try {
      await adminApi.assignCourseTeacher(selectedCourseId, selectedTeacherToAssign || null);
      await loadSelectedCourseDetail(selectedCourseId);
      if (onReloadData) onReloadData();
    } catch (err) {
      console.error("Failed to assign teacher", err);
    } finally {
      setIsAssigningTeacher(false);
    }
  };

  // Open modal to add student to course
  const handleOpenAddStudent = async () => {
    if (!selectedCourseId) return;
    setShowAddStudentModal(true);
    setIsLoadingAvailableStudents(true);
    setStudentSearchTerm("");
    try {
      const res = await adminApi.getCourseAvailableStudents(selectedCourseId);
      if (res.success && Array.isArray(res.data)) {
        setAvailableStudents(res.data);
      } else {
        setAvailableStudents([]);
      }
    } catch (err) {
      console.error("Failed to fetch available students", err);
      setAvailableStudents([]);
    } finally {
      setIsLoadingAvailableStudents(false);
    }
  };

  // Enroll student into course
  const handleEnrollStudent = async (studentId: string) => {
    if (!selectedCourseId) return;
    setEnrollingStudentId(studentId);
    try {
      const res = await adminApi.enrollStudentInCourse(selectedCourseId, studentId);
      if (res.success) {
        setAvailableStudents(prev => prev.filter(s => s.id !== studentId));
        await loadSelectedCourseDetail(selectedCourseId);
        if (onReloadData) onReloadData();
      }
    } catch (err) {
      console.error("Failed to enroll student", err);
    } finally {
      setEnrollingStudentId(null);
    }
  };

  // Remove student from course
  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedCourseId) return;
    setRemovingStudentId(studentId);
    try {
      const res = await adminApi.removeStudentFromCourse(selectedCourseId, studentId);
      if (res.success) {
        await loadSelectedCourseDetail(selectedCourseId);
        if (onReloadData) onReloadData();
      }
    } catch (err) {
      console.error("Failed to remove student from course", err);
    } finally {
      setRemovingStudentId(null);
    }
  };

  // Open Lesson Modal
  const handleOpenAddLesson = () => {
    const nextOrder = (courseDetailData?.lessons?.length || 0) + 1;
    setEditingLessonId(null);
    setLessonForm({
      title: "",
      duration: "45 mins",
      lessonOrder: nextOrder,
      description: "",
      isPreview: false
    });
    setShowLessonModal(true);
  };

  const handleOpenEditLesson = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title || "",
      duration: lesson.duration || "45 mins",
      lessonOrder: lesson.lesson_order || lesson.lessonOrder || 1,
      description: lesson.description || "",
      isPreview: Boolean(lesson.is_preview || lesson.isPreview)
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !lessonForm.title.trim()) return;
    setIsSavingLesson(true);
    try {
      if (editingLessonId) {
        await adminApi.updateLesson(selectedCourseId, editingLessonId, lessonForm);
      } else {
        await adminApi.createLesson(selectedCourseId, lessonForm);
      }
      setShowLessonModal(false);
      await loadSelectedCourseDetail(selectedCourseId);
    } catch (err) {
      console.error("Failed to save lesson", err);
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourseId) return;
    setDeletingLessonId(lessonId);
    try {
      await adminApi.deleteLesson(selectedCourseId, lessonId);
      await loadSelectedCourseDetail(selectedCourseId);
    } catch (err) {
      console.error("Failed to delete lesson", err);
    } finally {
      setDeletingLessonId(null);
    }
  };

  const handleOpenExplain = (id: string, type: "request" | "season", reject: boolean) => {
    setExplainModal({ id, type, reject });
    setExplainNotes("");
  };

  const handleExplainSubmit = () => {
    if (!explainModal) return;
    if (explainModal.type === "request") {
      if (explainModal.reject) {
        onRejectRequest(explainModal.id, explainNotes);
      } else {
        onRejectRequest(explainModal.id, "Revision Required: " + explainNotes);
      }
    }
    setExplainModal(null);
  };

  // If viewing a single course in deep management mode
  const currentCourse = courses.find(c => c.id === selectedCourseId) || courseDetailData;

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
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    currentCourse.status === "Active"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/[0.04] text-white/50 border border-white/10"
                  }`}>
                    {currentCourse.status || "Active"}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  {currentCourse.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadSelectedCourseDetail(selectedCourseId)}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                title="Refresh Course Data"
              >
                <RefreshCw size={14} className={isLoadingDetail ? "animate-spin" : ""} />
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
              { id: "syllabus" as const, label: `Syllabus Curriculum (${courseDetailData?.lessons?.length ?? 0})`, icon: Layers },
              { id: "seasons" as const, label: `Cohorts & Batches (${courseDetailData?.seasons?.length ?? 0})`, icon: Calendar },
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
              {/* Left Column: Course Metadata */}
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
                        {courseDetailData?.students?.length ?? currentCourse.studentsCount ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block font-mono uppercase">Tuition Fee:</span>
                      <span className="font-bold text-white font-mono mt-0.5 block">
                        {(currentCourse as any).price > 0 ? `$${(currentCourse as any).price}` : "Free Enrolled"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block font-mono uppercase">Category:</span>
                      <span className="font-bold text-indigo-300 mt-0.5 block">
                        {courseDetailData?.category_name || "Computer Science"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Instructor Assignment */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 rounded-3xl bg-[#08080c] border border-white/[0.06] space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.04] pb-3">
                    <Award size={16} className="text-amber-400" />
                    <span>Assigned Course Instructor</span>
                  </h3>

                  {courseDetailData?.teacher_name || (currentCourse as any).teacherName ? (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-sm shrink-0 overflow-hidden">
                        {courseDetailData?.teacher_avatar ? (
                          <img src={courseDetailData.teacher_avatar} alt="Teacher" className="h-full w-full object-cover" />
                        ) : (
                          (courseDetailData?.teacher_name || "IN").substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {courseDetailData?.teacher_name || (currentCourse as any).teacherName}
                        </h4>
                        <p className="text-[10px] text-white/40 font-mono truncate">
                          {courseDetailData?.teacher_email || "Instructor"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-white/10 text-center py-6">
                      <p className="text-xs text-white/40">No instructor currently assigned to this course.</p>
                    </div>
                  )}

                  {/* Instructor selection form */}
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] text-white/40 uppercase font-mono block font-bold">
                      Reassign / Change Instructor:
                    </label>
                    <select
                      value={selectedTeacherToAssign || courseDetailData?.teacher_id || (currentCourse as any).teacherId || ""}
                      onChange={(e) => setSelectedTeacherToAssign(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="">-- No Instructor (Unassigned) --</option>
                      {teachersList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.email})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleAssignTeacher}
                      disabled={isAssigningTeacher}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isAssigningTeacher ? (
                        <>
                          <RefreshCw className="animate-spin" size={13} />
                          <span>Updating Instructor...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Save Instructor Assignment</span>
                        </>
                      )}
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
                  <p className="text-[10px] text-white/40">Manage students enrolled in this curriculum with instant AJAX add/remove actions.</p>
                </div>

                <button
                  onClick={handleOpenAddStudent}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
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
                            No students currently enrolled in this course. Click "Enroll Student into Course" to register students.
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
                                onClick={() => handleRemoveStudent(st.student_id)}
                                disabled={removingStudentId === st.student_id}
                                className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black text-[11px] font-bold border border-red-500/25 transition-all cursor-pointer flex items-center gap-1 ml-auto disabled:opacity-40"
                              >
                                {removingStudentId === st.student_id ? (
                                  <RefreshCw className="animate-spin" size={11} />
                                ) : (
                                  <UserMinus size={11} />
                                )}
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

          {/* TAB 3: SYLLABUS & LESSONS */}
          {courseWorkspaceTab === "syllabus" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Course Syllabus & Curriculum Topics</h3>
                  <p className="text-[10px] text-white/40">Define modules, learning objectives, and durations for this course syllabus.</p>
                </div>

                <button
                  onClick={handleOpenAddLesson}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                >
                  <Plus size={14} />
                  <span>Add Syllabus Topic</span>
                </button>
              </div>

              {(!courseDetailData?.lessons || courseDetailData.lessons.length === 0) ? (
                <div className="py-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01] space-y-3">
                  <div className="h-12 w-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-white/30">
                    <Layers size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Syllabus Lessons Configured</h4>
                  <p className="text-xs text-white/40 max-w-sm mx-auto">
                    Define the course breakdown by adding topics, lessons, and expected session durations.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {courseDetailData.lessons.map((lesson: any, index: number) => (
                    <div
                      key={lesson.id}
                      className="p-4 rounded-2xl bg-[#08080c] border border-white/[0.06] hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="h-7 w-7 rounded-xl bg-white/[0.03] border border-white/10 text-white/60 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {lesson.lesson_order || index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{lesson.title}</h4>
                            {lesson.is_preview ? (
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                Free Preview
                              </span>
                            ) : null}
                          </div>
                          {lesson.description && (
                            <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed font-sans max-w-xl">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-[10px] font-mono text-white/40 flex items-center gap-1">
                          <Clock size={11} />
                          {lesson.duration || "45 mins"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditLesson(lesson)}
                            className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-white/60 hover:text-white border border-white/5 transition-colors cursor-pointer"
                            title="Edit Lesson"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            disabled={deletingLessonId === lesson.id}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/25 transition-colors cursor-pointer disabled:opacity-40"
                            title="Delete Lesson"
                          >
                            {deletingLessonId === lesson.id ? (
                              <RefreshCw className="animate-spin" size={12} />
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COHORTS & SEASONS */}
          {courseWorkspaceTab === "seasons" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Course Batches & Enrollment Cohorts</h3>
                  <p className="text-[10px] text-white/40">Batches currently configured for {currentCourse.title}.</p>
                </div>
              </div>

              {(!courseDetailData?.seasons || courseDetailData.seasons.length === 0) ? (
                <div className="py-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                  <p className="text-xs text-white/40">No batches or intake seasons configured for this course yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseDetailData.seasons.map((season: any) => (
                    <div key={season.id} className="p-4 rounded-2xl bg-[#08080c] border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{season.name}</h4>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {season.status || "Active"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-white/40 font-mono">
                        <span>Capacity: {season.max_capacity || 20}</span>
                        <span>Start: {season.start_date || "TBD"}</span>
                        <span>End: {season.end_date || "TBD"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Regular Academic Tabs Catalog View */
        <>
          {/* Sub tabs switcher */}
          <div className="flex border-b border-white/[0.05] gap-6 text-xs">
            {[
              { id: "catalog", label: "Curriculum Catalog" },
              { id: "seasons", label: "Course Seasons (Batches)" },
              { id: "requests", label: "Instructor Requests" },
              { id: "enrollments", label: "Student Registrations" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`pb-3 font-extrabold tracking-wider uppercase transition-all relative cursor-pointer ${
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
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Course Catalog Management</h3>
                  <p className="text-[10px] text-white/40">Create new courses, assign instructors, manage enrolled students and course syllabi.</p>
                </div>
                <button 
                  onClick={handleOpenAddCourse}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-center"
                >
                  <Plus size={14} />
                  <span>Create Course</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div 
                    key={course.id}
                    className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-5 hover:border-white/10 transition-all flex flex-col justify-between group relative"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[16/10] w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden">
                        <img 
                          src={course.image || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400&auto=format&fit=crop"} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-mono text-indigo-300 font-bold border border-white/5">
                          {course.code}
                        </span>
                      </div>

                      <div className="text-left space-y-1">
                        <h4 className="font-extrabold text-sm text-white group-hover:text-indigo-400 transition-colors">
                          {course.title}
                        </h4>
                        <div className="flex items-center gap-4 text-[10px] text-white/40 font-mono">
                          <span className="flex items-center gap-1"><Users size={11} /> {course.studentsCount} Students</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {course.sessionsCount} Sessions</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          course.status === "Active" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}>
                          {course.status}
                        </span>

                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => onDuplicateCourse(course.id)}
                            className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
                            title="Duplicate Course"
                          >
                            <Copy size={11} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditCourse(course)}
                            className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button 
                            onClick={() => onDeleteCourse(course.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-black transition-all cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Button to Enter and Manage Course */}
                      <button
                        onClick={() => setSelectedCourseId(course.id)}
                        className="w-full py-2 bg-white/[0.03] hover:bg-indigo-600 hover:text-white text-white/80 border border-white/10 hover:border-transparent rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Layers size={13} />
                        <span>Manage Course & Students</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RENDER SUB-TAB: COURSE SEASONS (BATCHES) */}
          {subTab === "seasons" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Active Batches & Seasons</h3>
                <p className="text-[10px] text-white/40">Track and manage student intake cohorts, timelines, and registration flags.</p>
              </div>

              <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#08080c] overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-white/30 uppercase tracking-widest text-[9px] font-black">
                      <th className="pb-3 font-black">Season Name</th>
                      <th className="pb-3 font-black">Linked Course</th>
                      <th className="pb-3 font-black">Registration flag</th>
                      <th className="pb-3 font-black text-center">Intake Status</th>
                      <th className="pb-3 font-black text-center">Intake Capacity</th>
                      <th className="pb-3 font-black">Date Ranges</th>
                      <th className="pb-3 text-right font-black">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {seasons.map((season) => (
                      <tr key={season.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-3.5 font-bold text-white">{season.name}</td>
                        <td className="py-3.5 font-mono text-[10px] text-indigo-400">{season.courseTitle}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${
                            season.registrationStatus === "Open" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/[0.02] text-white/40"
                          }`}>
                            {season.registrationStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-center font-bold text-white/70">{season.status}</td>
                        <td className="py-3.5 text-center font-mono text-white/50">{season.maxCapacity} Seats</td>
                        <td className="py-3.5 font-mono text-[10px] text-white/40">{season.startDate} to {season.endDate}</td>
                        <td className="py-3.5 text-right space-x-2">
                          {season.status === "Pending" ? (
                            <button 
                              onClick={() => onApproveSeason(season.id)}
                              className="px-2 py-1 bg-emerald-500 text-black font-bold rounded-lg text-[10px]"
                            >
                              Approve Season
                            </button>
                          ) : (
                            <button 
                              onClick={() => onCancelSeason(season.id)}
                              className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold rounded-lg text-[10px]"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RENDER SUB-TAB: INSTRUCTOR REQUESTS */}
          {subTab === "requests" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Instructor Modification Requests</h3>
                <p className="text-[10px] text-white/40">Audit teacher proposals for course updates, session deployments, or score revisions.</p>
              </div>

              <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#08080c] overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-white/30 uppercase tracking-widest text-[9px] font-black">
                      <th className="pb-3 font-black">Request ID</th>
                      <th className="pb-3 font-black">Teacher Name</th>
                      <th className="pb-3 font-black">Request Type</th>
                      <th className="pb-3 font-black">Context & Details</th>
                      <th className="pb-3 font-black">Request Date</th>
                      <th className="pb-3 font-black text-center">Status</th>
                      <th className="pb-3 text-right font-black">Audit Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-3.5 font-mono text-[10px] text-white/40">{req.id}</td>
                        <td className="py-3.5 font-bold text-white">{req.teacherName}</td>
                        <td className="py-3.5 font-bold text-indigo-400">{req.type}</td>
                        <td className="py-3.5 text-white/70 max-w-xs truncate">{req.details}</td>
                        <td className="py-3.5 font-mono text-[10px] text-white/40">{req.date}</td>
                        <td className="py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            req.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            req.status === "Rejected" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          {req.status === "Pending" && (
                            <>
                              <button 
                                onClick={() => onApproveRequest(req.id)}
                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-[10px]"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleOpenExplain(req.id, "request", false)}
                                className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold rounded-lg text-[10px]"
                              >
                                Revision
                              </button>
                              <button 
                                onClick={() => handleOpenExplain(req.id, "request", true)}
                                className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold rounded-lg text-[10px]"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RENDER SUB-TAB: STUDENT REGISTRATIONS */}
          {subTab === "enrollments" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Student Registrations & Financial Flags</h3>
                <p className="text-[10px] text-white/40">Audit payments, enrollment status, and participation compliance across courses.</p>
              </div>

              <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#08080c] overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-white/30 uppercase tracking-widest text-[9px] font-black">
                      <th className="pb-3 font-black">Student Name</th>
                      <th className="pb-3 font-black">Registered Course</th>
                      <th className="pb-3 font-black">Tuition Status</th>
                      <th className="pb-3 font-black">Course Participation</th>
                      <th className="pb-3 font-black">Registration Date</th>
                      <th className="pb-3 text-right font-black">Update State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {enrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-3.5 font-bold text-white">{enr.studentName}</td>
                        <td className="py-3.5 font-bold text-indigo-400">{enr.courseTitle}</td>
                        <td className="py-3.5">
                          <select 
                            value={enr.paymentStatus}
                            onChange={(e) => onUpdateEnrollmentPayment(enr.id, e.target.value as any)}
                            className="bg-zinc-900 border border-white/10 rounded-lg text-[10px] py-1 px-2 text-white"
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Unpaid">Unpaid</option>
                          </select>
                        </td>
                        <td className="py-3.5">
                          <select 
                            value={enr.courseStatus}
                            onChange={(e) => onUpdateEnrollmentStatus(enr.id, e.target.value as any)}
                            className="bg-zinc-900 border border-white/10 rounded-lg text-[10px] py-1 px-2 text-white"
                          >
                            <option value="Enrolled">Enrolled</option>
                            <option value="Completed">Completed</option>
                            <option value="Dropped">Dropped</option>
                          </select>
                        </td>
                        <td className="py-3.5 font-mono text-[10px] text-white/40">{enr.enrollmentDate || (enr as any).registrationDate || "Recent"}</td>
                        <td className="py-3.5 text-right font-mono text-[10px] text-emerald-400">
                          Live Sync
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      <AnimatePresence>
        {showCourseModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d0d12] border border-white/10 rounded-3xl p-6 text-left space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {editingCourseId ? "Edit Course Parameters" : "Create New Academy Course"}
                </h3>
                <button 
                  onClick={() => setShowCourseModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCourseSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Course Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Advanced System Architecture"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Course Code</label>
                    <input 
                      type="text" 
                      required
                      placeholder="CS-501"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Teacher Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Assigned Instructor / Professor</label>
                  <select
                    value={courseForm.teacherId}
                    onChange={(e) => setCourseForm({ ...courseForm, teacherId: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- No Instructor (Unassigned) --</option>
                    {teachersList.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Sessions Count</label>
                    <input 
                      type="number" 
                      value={courseForm.sessionsCount}
                      onChange={(e) => setCourseForm({ ...courseForm, sessionsCount: parseInt(e.target.value) || 12 })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Price ($USD)</label>
                    <input 
                      type="number" 
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Status</label>
                    <select
                      value={courseForm.status}
                      onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Description & Syllabus Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Provide overview of curriculum, prerequisites, and learning outcomes..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Cover Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/photo-..."
                    value={courseForm.image}
                    onChange={(e) => setCourseForm({ ...courseForm, image: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    <CheckCircle2 size={14} />
                    <span>{editingCourseId ? "Save Modifications" : "Deploy Course to Catalog"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCourseModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    <span>Enroll Student into {currentCourse?.title}</span>
                  </h3>
                  <p className="text-[10px] text-white/40">Select a registered student who is not yet enrolled in this course.</p>
                </div>
                <button onClick={() => setShowAddStudentModal(false)} className="text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>

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
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-white/60 hover:text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT SYLLABUS LESSON MODAL */}
      <AnimatePresence>
        {showLessonModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d0d12] border border-white/10 rounded-3xl p-6 text-left space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={16} className="text-indigo-400" />
                  <span>{editingLessonId ? "Edit Syllabus Topic" : "Add Syllabus Lesson / Topic"}</span>
                </h3>
                <button onClick={() => setShowLessonModal(false)} className="text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
                <div>
                  <label className="text-white/60 block mb-1 font-bold">Topic / Lesson Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asynchronous Micro-task Queues & Event Loop"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 block mb-1 font-bold">Estimated Duration</label>
                    <input
                      type="text"
                      placeholder="45 mins"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 block mb-1 font-bold">Lesson Order / Index</label>
                    <input
                      type="number"
                      min={1}
                      value={lessonForm.lessonOrder}
                      onChange={(e) => setLessonForm({ ...lessonForm, lessonOrder: parseInt(e.target.value) || 1 })}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 block mb-1 font-bold">Key Objectives & Syllabus Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Summary of topics covered, code examples, and review material..."
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={lessonForm.isPreview}
                    onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-0"
                  />
                  <span className="text-white/80 font-bold">Allow Free Preview without enrollment</span>
                </label>

                <div className="pt-2 border-t border-white/[0.05] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLessonModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] text-white/60 hover:text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingLesson}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    {isSavingLesson ? (
                      <>
                        <RefreshCw className="animate-spin" size={13} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Save Lesson</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Explanations Modal (Reasoning for rejections/revision returns) */}
      {explainModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#0d0d12] border border-white/10 rounded-3xl p-6 text-left space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              {explainModal.reject ? "Provide rejection reasoning" : "Draft Revision request details"}
            </h3>
            
            <div className="space-y-1 text-xs">
              <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Audit explanation notes</label>
              <textarea 
                rows={3}
                placeholder="Details of what the teacher needs to fix or why this request is denied..."
                value={explainNotes}
                onChange={(e) => setExplainNotes(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleExplainSubmit}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-400 text-black text-xs font-bold tracking-wider uppercase rounded-xl cursor-pointer"
              >
                File Audit Notes
              </button>
              <button 
                onClick={() => setExplainModal(null)}
                className="flex-1 py-2 bg-white/[0.04] border border-white/10 text-white/60 text-xs font-bold uppercase rounded-xl hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
