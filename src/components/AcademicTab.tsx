import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Plus, Edit2, Trash2, Check, X, Shield, BookOpen, Clock, Users, Award, 
  HelpCircle, Copy, CheckCircle2, AlertTriangle, MessageSquare, ListFilter, RotateCw
} from "lucide-react";
import { CourseRequest, Enrollment } from "./AdminDashboard/types";
import { Course, CourseSeason, Student } from "../types/teacher";

interface AcademicTabProps {
  courses: Course[];
  seasons: CourseSeason[];
  requests: CourseRequest[];
  enrollments: Enrollment[];
  students: Student[];
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
}

export default function AcademicTab({
  courses,
  seasons,
  requests,
  enrollments,
  students,
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
  onAddSeason
}: AcademicTabProps) {
  const [subTab, setSubTab] = useState<"catalog" | "seasons" | "requests" | "enrollments">("catalog");

  React.useEffect(() => {
    if (activeSubTab && ["catalog", "seasons", "requests", "enrollments"].includes(activeSubTab)) {
      setSubTab(activeSubTab as any);
    }
  }, [activeSubTab]);
  
  // Modals / forms states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    title: "",
    code: "",
    studentsCount: 0,
    sessionsCount: 12,
    progress: 0,
    status: "Active",
    image: ""
  });

  const [explainModal, setExplainModal] = useState<{ id: string; type: "request" | "season"; reject: boolean } | null>(null);
  const [explainNotes, setExplainNotes] = useState("");

  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: "",
      code: "",
      studentsCount: 0,
      sessionsCount: 12,
      progress: 0,
      status: "Active",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300&auto=format&fit=crop"
    });
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (c: Course) => {
    setEditingCourseId(c.id);
    setCourseForm(c);
    setShowCourseModal(true);
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.code) return;

    if (editingCourseId) {
      onUpdateCourse(editingCourseId, courseForm);
    } else {
      onAddCourse({
        ...courseForm,
        id: "course-" + Date.now()
      });
    }
    setShowCourseModal(false);
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
        // Return for revision
        onRejectRequest(explainModal.id, "Revision Required: " + explainNotes);
      }
    }
    setExplainModal(null);
  };

  return (
    <div className="space-y-6">
      
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
            className={`pb-3 font-extrabold tracking-wider uppercase transition-all relative ${
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
          <div className="flex justify-between items-center text-left">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Course Catalog Management</h3>
              <p className="text-[10px] text-white/40">Deploy, duplicate, and configure courses for the academy roster.</p>
            </div>
            <button 
              onClick={handleOpenAddCourse}
              className="px-4 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Create Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="bg-zinc-950/40 border border-white/[0.04] rounded-3xl p-5 hover:border-white/[0.08] transition-all flex flex-col justify-between group relative"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[16/10] w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden">
                    <img 
                      src={course.image || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300&auto=format&fit=crop"} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-mono text-indigo-300 font-bold border border-white/5">
                      {course.code}
                    </span>
                  </div>

                  <div className="text-left space-y-1">
                    <h4 className="font-extrabold text-sm text-white group-hover:text-indigo-400 transition-colors">{course.title}</h4>
                    <div className="flex items-center gap-4 text-[10px] text-white/40">
                      <span className="flex items-center gap-1"><Users size={11} /> {course.studentsCount} Students</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {course.sessionsCount} Sessions</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.04] flex justify-between items-center">
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
                      className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
                      title="Duplicate Course"
                    >
                      <Copy size={11} />
                    </button>
                    <button 
                      onClick={() => handleOpenEditCourse(course)}
                      className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                      title="Edit Details"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button 
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-black transition-all"
                      title="Delete Course"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
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

          <div className="p-6 rounded-3xl border border-white/[0.06] bg-zinc-950/60 backdrop-blur-md overflow-x-auto">
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
                    <td className="py-4">
                      <p className="font-extrabold text-white">{season.name}</p>
                      <p className="text-[9px] font-mono text-white/30 truncate max-w-[200px]">{season.notes}</p>
                    </td>
                    <td className="py-4 text-indigo-300 font-bold">
                      {season.courseTitle}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border ${
                        season.registrationStatus === "Open"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}>
                        {season.registrationStatus}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        season.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : season.status === "Pending Admin Approval"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}>
                        {season.status}
                      </span>
                    </td>
                    <td className="py-4 text-center font-mono font-bold text-white/80">
                      {season.maxCapacity} Seats
                    </td>
                    <td className="py-4 font-mono text-[9px] text-white/40">
                      {season.startDate} to {season.endDate}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {season.status === "Pending Admin Approval" && (
                          <button 
                            onClick={() => onApproveSeason(season.id)}
                            className="px-2 py-1 rounded bg-emerald-500 text-black text-[9px] font-bold tracking-wider uppercase hover:bg-emerald-400"
                          >
                            Approve Batch
                          </button>
                        )}
                        {season.status !== "Cancelled" && (
                          <button 
                            onClick={() => onCancelSeason(season.id)}
                            className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold hover:bg-rose-500 hover:text-black transition-all"
                            title="Cancel Batch"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
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
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Instructor Requests Feed</h3>
            <p className="text-[10px] text-white/40">Audit resource claims, season filings, and syllabus modifications from active teachers.</p>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-10 bg-zinc-950/60 rounded-3xl text-white/40 text-xs">
                All instructor requests processed!
              </div>
            ) : (
              requests.map((req) => (
                <div 
                  key={req.id}
                  className={`p-5 rounded-3xl border border-white/[0.05] bg-zinc-950/60 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                    req.status === "Pending" ? "border-l-4 border-l-amber-500" : ""
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        req.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : req.status === "Rejected"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-[10px] font-mono bg-white/[0.03] px-2 py-0.5 rounded text-white/60">{req.type}</span>
                      <span className="text-[9px] font-mono text-white/30">{req.date}</span>
                    </div>

                    <h4 className="text-xs font-black text-white">{req.title}</h4>
                    <p className="text-[10px] text-white/50 leading-relaxed max-w-2xl">{req.details}</p>
                    <p className="text-[9px] font-bold text-white/30">Filer: <span className="text-indigo-300 font-bold">{req.teacherName}</span></p>
                    
                    {req.notes && (
                      <div className="p-3 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-[9px] leading-relaxed text-amber-300 font-mono">
                        Notes: {req.notes}
                      </div>
                    )}
                  </div>

                  {req.status === "Pending" && (
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => onApproveRequest(req.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black text-[10px] font-black tracking-wider uppercase hover:bg-emerald-400 transition-all"
                      >
                        Approve Request
                      </button>
                      <button 
                        onClick={() => handleOpenExplain(req.id, "request", true)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black tracking-wider uppercase hover:bg-rose-500 hover:text-black transition-all"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleOpenExplain(req.id, "request", false)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-wider uppercase hover:bg-amber-400 hover:text-black transition-all"
                      >
                        Revision Need
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RENDER SUB-TAB: STUDENT REGISTRATIONS */}
      {subTab === "enrollments" && (
        <div className="space-y-4 text-left">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">LMS Enrollment Logs</h3>
            <p className="text-[10px] text-white/40">Oversee active students course registrations, payment audits, and seasonal program transfers.</p>
          </div>

          <div className="p-6 rounded-3xl border border-white/[0.06] bg-zinc-950/60 backdrop-blur-md overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.05] text-white/30 uppercase tracking-widest text-[9px] font-black">
                  <th className="pb-3 font-black">Student Name</th>
                  <th className="pb-3 font-black">Enrolled Class Course</th>
                  <th className="pb-3 font-black">Assigned Batch (Season)</th>
                  <th className="pb-3 font-black">Registration Date</th>
                  <th className="pb-3 font-black text-center">Payment Status</th>
                  <th className="pb-3 font-black text-center">Course Status</th>
                  <th className="pb-3 text-right font-black">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-white/[0.01] transition-all">
                    <td className="py-4 font-extrabold text-white">
                      {enr.studentName}
                    </td>
                    <td className="py-4 text-white/80">
                      {enr.courseTitle}
                    </td>
                    <td className="py-4 text-indigo-300 font-mono text-[10px]">
                      {enr.seasonName}
                    </td>
                    <td className="py-4 font-mono text-[10px] text-white/40">
                      {enr.enrollmentDate}
                    </td>
                    <td className="py-4 text-center">
                      <button
                        onClick={() => {
                          const nextPayMap: Record<string, "Paid" | "Pending" | "Unpaid"> = {
                            Paid: "Pending",
                            Pending: "Unpaid",
                            Unpaid: "Paid"
                          };
                          onUpdateEnrollmentPayment(enr.id, nextPayMap[enr.paymentStatus]);
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border cursor-pointer hover:scale-105 transition-transform ${
                          enr.paymentStatus === "Paid"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : enr.paymentStatus === "Pending"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                      >
                        {enr.paymentStatus}
                      </button>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        enr.courseStatus === "Enrolled"
                          ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                          : enr.courseStatus === "Completed"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                      }`}>
                        {enr.courseStatus}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => {
                            onUpdateEnrollmentStatus(enr.id, enr.courseStatus === "Completed" ? "Enrolled" : "Completed");
                          }}
                          className="px-2 py-1 rounded bg-white/[0.02] border border-white/[0.04] text-white/50 hover:text-white text-[9px] font-bold"
                        >
                          Toggle Status
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

      {/* Slide-over Modal: Create or Edit Course */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#0d0d12] border border-white/10 rounded-3xl p-6 text-left space-y-4"
          >
            <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                {editingCourseId ? "Edit Course Parameters" : "Publish New Academy Course"}
              </h3>
              <button onClick={() => setShowCourseModal(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
            </div>

            <form onSubmit={handleCourseSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Course Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Advanced React & Architecture"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Course Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="CS-402"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Sessions Count</label>
                  <input 
                    type="number" 
                    placeholder="12"
                    value={courseForm.sessionsCount}
                    onChange={(e) => setCourseForm({ ...courseForm, sessionsCount: parseInt(e.target.value) || 12 })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Intake Status</label>
                  <select
                    value={courseForm.status}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Course Cover Thumbnail URL</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/photo-..."
                  value={courseForm.image}
                  onChange={(e) => setCourseForm({ ...courseForm, image: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500 font-mono text-[10px]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-black font-bold tracking-wider uppercase hover:bg-indigo-400 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>{editingCourseId ? "Save Modifications" : "Deploy Course Draft"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-400 text-black text-xs font-bold tracking-wider uppercase rounded-xl"
              >
                File Audit Notes
              </button>
              <button 
                onClick={() => setExplainModal(null)}
                className="flex-1 py-2 bg-white/[0.04] border border-white/10 text-white/60 text-xs font-bold uppercase rounded-xl hover:text-white"
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
