import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Award, MessageSquare, FolderOpen, Sliders, CheckCircle2,
  XCircle, Plus, Trash2, Send, Download, ExternalLink, Filter
} from "lucide-react";
import { Assignment, Certificate, DiscussionThread, Resource } from "../types/teacher";
import { Exam } from "./AdminDashboard/types";

interface LmsTabProps {
  assignments: Assignment[];
  exams: Exam[];
  certificates: Certificate[];
  discussions: DiscussionThread[];
  resources: Resource[];
  activeSubTab?: string;
  onAddExam: (exam: Exam) => void;
  onPublishExamResults: (id: string) => void;
  onApproveCertificate: (id: string) => void;
  onRejectCertificate: (id: string) => void;
  onAddDiscussionReply: (threadId: string, content: string) => void;
  onCloseDiscussionThread: (threadId: string) => void;
  onAddResource: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
}

export default function LmsTab({
  assignments,
  exams,
  certificates,
  discussions,
  resources,
  activeSubTab = "all",
  onAddExam,
  onPublishExamResults,
  onApproveCertificate,
  onRejectCertificate,
  onAddDiscussionReply,
  onCloseDiscussionThread,
  onAddResource,
  onDeleteResource,
}: LmsTabProps) {
  const [currentSection, setCurrentSection] = useState<"certificates" | "exams" | "assignments" | "discussions" | "resources">(
    activeSubTab === "exams" ? "exams" : "certificates"
  );

  // New Exam state
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examCourse, setExamCourse] = useState("react-adv");
  const [examDueDate, setExamDueDate] = useState("2026-07-20");
  const [examMaxPoints, setExamMaxPoints] = useState(100);

  // New Resource state
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState("pdf");

  // Reply content state
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;
    onAddExam({
      id: `ex-${Date.now()}`,
      title: examTitle,
      courseId: examCourse,
      courseTitle: examCourse === "react-adv" ? "Advanced React & Architecture" : "Swiss Typography & Editorial Layout",
      dueDate: examDueDate,
      maxPoints: examMaxPoints,
      status: "Published",
      passRate: 0,
      avgScore: 0,
    });
    setExamTitle("");
    setShowAddExamModal(false);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim()) return;
    onAddResource({
      id: `res-${Date.now()}`,
      title: resourceTitle,
      courseId: "react-adv",
      courseTitle: "Advanced React & Architecture",
      fileType: resourceType,
      fileSize: "3.5 MB",
      uploadedAt: new Date().toISOString().split("T")[0],
      visibility: "Visible",
    });
    setResourceTitle("");
    setShowAddResourceModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
        {[
          { id: "certificates", label: "Certificates", count: certificates.length, icon: Award },
          { id: "exams", label: "Examinations", count: exams.length, icon: Sliders },
          { id: "assignments", label: "Assignments", count: assignments.length, icon: FileText },
          { id: "discussions", label: "Discussions", count: discussions.length, icon: MessageSquare },
          { id: "resources", label: "Library Resources", count: resources.length, icon: FolderOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-white/50 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/40"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Certificates Section */}
      {currentSection === "certificates" && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Graduation &amp; Accredited Certificates
            </h3>
            <span className="text-xs font-mono text-white/40">Total: {certificates.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-3 hover:border-emerald-500/20 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{cert.studentName}</h4>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">{cert.courseTitle}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      cert.status === "Approved"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-white/50 pt-2 border-t border-white/[0.04]">
                  <span>GPA: <strong className="text-white">{cert.gpa}</strong></span>
                  <div className="flex items-center gap-1.5">
                    {cert.status !== "Approved" && (
                      <button
                        onClick={() => onApproveCertificate(cert.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-sans text-xs font-bold transition-all cursor-pointer"
                      >
                        Approve &amp; Sign
                      </button>
                    )}
                    <button
                      onClick={() => onRejectCertificate(cert.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer"
                      title="Reject Certificate"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exams Section */}
      {currentSection === "exams" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Examination Schedules &amp; Scores
            </h3>
            <button
              onClick={() => setShowAddExamModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Exam</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/5 text-white/60">
                    Due: {exam.dueDate}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">{exam.status}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{exam.title}</h4>
                <p className="text-xs text-white/50 font-mono">{exam.courseTitle}</p>

                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-white/60">
                  <span>Pass Rate: {exam.passRate || 0}%</span>
                  <span>Avg: {exam.avgScore || 0} pts</span>
                </div>

                {exam.status !== "Published" && (
                  <button
                    onClick={() => onPublishExamResults(exam.id)}
                    className="w-full py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black text-xs font-bold font-sans transition-all cursor-pointer"
                  >
                    Publish Results
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignments Section */}
      {currentSection === "assignments" && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Coursework &amp; Project Assignments
            </h3>
            <span className="text-xs font-mono text-white/40">{assignments.length} Projects</span>
          </div>

          <div className="space-y-3">
            {assignments.map((ass) => (
              <div
                key={ass.id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      {ass.status}
                    </span>
                    <h4 className="text-xs font-bold text-white">{ass.title}</h4>
                  </div>
                  <p className="text-xs text-white/40 font-mono">
                    {ass.courseTitle} · Due {ass.dueDate} · {ass.maxPoints} Points
                  </p>
                  <p className="text-xs text-white/70">{ass.description}</p>
                </div>
                <div className="text-right font-mono text-xs text-white/50 shrink-0">
                  Submissions: {ass.submissions?.length || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discussions Section */}
      {currentSection === "discussions" && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Student QA &amp; Interactive Forum
            </h3>
            <span className="text-xs font-mono text-white/40">{discussions.length} Threads</span>
          </div>

          <div className="space-y-4">
            {discussions.map((disc) => (
              <div
                key={disc.id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{disc.title}</h4>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      By {disc.studentName} · {disc.courseTitle} · {disc.time}
                    </p>
                  </div>
                  <button
                    onClick={() => onCloseDiscussionThread(disc.id)}
                    className="text-[10px] font-mono text-white/40 hover:text-emerald-400 transition-colors"
                  >
                    Archive Thread
                  </button>
                </div>

                <p className="text-xs text-white/80 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  {disc.text}
                </p>

                {/* Existing Replies */}
                {disc.replies && disc.replies.length > 0 && (
                  <div className="space-y-2 pl-4 border-l-2 border-emerald-500/20">
                    {disc.replies.map((rep) => (
                      <div key={rep.id} className="text-xs space-y-1">
                        <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400">
                          <span>{rep.sender || rep.authorName}</span>
                          <span className="text-white/30">({rep.role || rep.authorRole})</span>
                        </div>
                        <p className="text-white/70">{rep.text || rep.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={replyContent[disc.id] || ""}
                    onChange={(e) =>
                      setReplyContent((prev) => ({ ...prev, [disc.id]: e.target.value }))
                    }
                    placeholder="Write an administrative reply..."
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => {
                      const text = replyContent[disc.id];
                      if (!text?.trim()) return;
                      onAddDiscussionReply(disc.id, text);
                      setReplyContent((prev) => ({ ...prev, [disc.id]: "" }));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources Section */}
      {currentSection === "resources" && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Curriculum Documents &amp; Assets
            </h3>
            <button
              onClick={() => setShowAddResourceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Resource</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.04] flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                    {res.fileType} · {res.fileSize}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1">{res.title}</h4>
                  <p className="text-[10px] text-white/40 font-mono">{res.courseTitle}</p>
                </div>
                <button
                  onClick={() => onDeleteResource(res.id)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-red-400 transition-colors"
                  title="Remove Asset"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      <AnimatePresence>
        {showAddExamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-sm font-bold text-white">Create Examination Assessment</h3>
              <form onSubmit={handleCreateExam} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="e.g. Modern Architecture Comprehensive Final"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={examDueDate}
                    onChange={(e) => setExamDueDate(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddExamModal(false)}
                    className="px-4 py-2 text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl"
                  >
                    Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Resource Modal */}
      <AnimatePresence>
        {showAddResourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-sm font-bold text-white">Upload Curriculum Asset</h3>
              <form onSubmit={handleCreateResource} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    placeholder="e.g. Design Pattern Cheatsheet"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">File Type</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="zip">Source Archive (ZIP)</option>
                    <option value="video">Recorded Video</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddResourceModal(false)}
                    className="px-4 py-2 text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl"
                  >
                    Upload Asset
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
