import React, { useState } from "react";
import { Sliders, Plus, Search, Filter, CheckCircle2, Calendar, FileText, XCircle, Award } from "lucide-react";
import { Exam } from "./types";
import { Course } from "../../types/teacher";

interface ExamsViewProps {
  exams: Exam[];
  courses: Course[];
  onAddExam: (exam: Exam) => void;
  onPublishExamResults: (id: string) => void;
}

export default function ExamsView({
  exams,
  courses,
  onAddExam,
  onPublishExamResults,
}: ExamsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New exam form
  const [examTitle, setExamTitle] = useState("");
  const [examCourseId, setExamCourseId] = useState(courses[0]?.id || "react-adv");
  const [examDueDate, setExamDueDate] = useState("2026-07-20");
  const [examMaxPoints, setExamMaxPoints] = useState(100);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    const matchedCourse = courses.find(c => c.id === examCourseId);

    onAddExam({
      id: `ex-${Date.now()}`,
      title: examTitle.trim(),
      courseId: examCourseId,
      courseTitle: matchedCourse?.title || "Academy Course",
      dueDate: examDueDate,
      maxPoints: Number(examMaxPoints) || 100,
      status: "Published",
      passRate: 0,
      avgScore: 0,
    });

    setExamTitle("");
    setShowAddModal(false);
  };

  const filteredExams = exams.filter((ex) => {
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchTitle = ex.title && ex.title.toLowerCase().includes(term);
      const matchCourse = ex.courseTitle && ex.courseTitle.toLowerCase().includes(term);
      if (!matchTitle && !matchCourse) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Sliders className="text-indigo-400" size={20} />
            <span>Examinations &amp; Testing</span>
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Manage course quizzes, midterms, final examinations, and score publication
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-sans text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Exam</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exams by title or course..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="text-xs text-white/40 font-mono">
          Showing: <span className="text-white font-bold">{filteredExams.length}</span> exams
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="p-12 text-center bg-white/[0.015] border border-dashed border-white/10 rounded-3xl space-y-3">
          <Sliders className="mx-auto text-white/20" size={36} />
          <p className="text-xs text-white/40">
            {exams.length === 0
              ? "No examinations have been scheduled yet. Click 'Create Exam' to set up a new test."
              : "No examinations match your search query."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="p-5 rounded-2xl bg-[#090a0e] border border-white/[0.06] hover:border-indigo-500/30 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-white/60">
                    Due: {exam.dueDate || "Flexible"}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    exam.status === "Published"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {exam.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{exam.title}</h4>
                <p className="text-xs text-white/50 font-mono">{exam.courseTitle}</p>

                <div className="pt-3 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-xs font-mono text-center">
                  <div className="p-2 rounded-xl bg-white/[0.02]">
                    <span className="text-[9px] text-white/40 block">Max Score</span>
                    <span className="font-bold text-white">{exam.maxPoints || 100}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02]">
                    <span className="text-[9px] text-white/40 block">Pass Rate</span>
                    <span className="font-bold text-emerald-400">{exam.passRate || 0}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02]">
                    <span className="text-[9px] text-white/40 block">Average</span>
                    <span className="font-bold text-indigo-400">{exam.avgScore || 0}</span>
                  </div>
                </div>
              </div>

              {exam.status !== "Published" ? (
                <button
                  onClick={() => onPublishExamResults(exam.id)}
                  className="w-full py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white text-xs font-bold font-sans transition-all cursor-pointer border border-indigo-500/20"
                >
                  Publish Results
                </button>
              ) : (
                <div className="text-[10px] font-mono text-white/40 text-center pt-2 border-t border-white/[0.03]">
                  Results visible to enrolled students
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#090a0e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders size={18} className="text-indigo-400" />
                <span>Create New Examination</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-white/70 block mb-1.5 font-bold">Exam Title</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Midterm Comprehensive Exam"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1.5 font-bold">Associated Course</label>
                <select
                  value={examCourseId}
                  onChange={(e) => setExamCourseId(e.target.value)}
                  className="w-full bg-[#121318] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  {courses.length === 0 ? (
                    <option value="react-adv">General Academy Curriculum</option>
                  ) : (
                    courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Due / Examination Date</label>
                  <input
                    type="date"
                    value={examDueDate}
                    onChange={(e) => setExamDueDate(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Maximum Points</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={examMaxPoints}
                    onChange={(e) => setExamMaxPoints(Number(e.target.value))}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all shadow-md shadow-indigo-500/20"
                >
                  Publish Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
