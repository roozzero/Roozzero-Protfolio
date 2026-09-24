import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Users, Calendar, Award, MessageSquare, FolderOpen,
  LogOut, Home, CheckCircle2, Clock, Plus, Search, Filter,
  Bell, ChevronRight, FileText, Check, X, Shield, Sparkles, Send
} from "lucide-react";
import { Course, Student, Session, Assignment, DiscussionThread, Resource } from "../types/teacher";

interface TeacherDashboardProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function TeacherDashboard({ onLogout, onGoHome }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "students" | "sessions" | "assignments" | "discussions" | "resources">("courses");

  // Synchronized state with fallback values
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("teacher_courses");
    return saved ? JSON.parse(saved) : [
      { id: "react-adv", title: "Advanced React & Architecture", code: "REACT-401", studentsCount: 28, sessionsCount: 16, progress: 75, status: "Active" },
      { id: "swiss-typo", title: "Swiss Typography & Editorial Layout", code: "SWISS-102", studentsCount: 16, sessionsCount: 10, progress: 40, status: "Active" }
    ];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("teacher_students");
    return saved ? JSON.parse(saved) : [
      { id: "stu-1", name: "Courtney Henry", email: "courtney.henry@academy.local", phone: "+1 (555) 234-5678", courseId: "react-adv", courseTitle: "Advanced React & Architecture", progress: 88, attendance: 95, avgGrade: 92, status: "Active", joinedDate: "2026-04-10" },
      { id: "stu-2", name: "Cody Fisher", email: "cody.f@academy.local", phone: "+1 (555) 019-2834", courseId: "react-adv", courseTitle: "Advanced React & Architecture", progress: 75, attendance: 90, avgGrade: 85, status: "Active", joinedDate: "2026-04-12" }
    ];
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem("teacher_sessions");
    return saved ? JSON.parse(saved) : [
      { id: "sess-1", courseId: "react-adv", courseTitle: "Advanced React & Architecture", title: "State Machines & Architectural Flow", date: "2026-07-02", time: "10:00 AM", duration: "2 hours", link: "https://meet.google.com/abc-defg-hij", status: "Scheduled", studentCount: 28 }
    ];
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem("teacher_assignments");
    return saved ? JSON.parse(saved) : [
      { id: "asg-1", courseId: "react-adv", courseTitle: "Advanced React & Architecture", title: "Custom Reactive State Engine", description: "Build an optimized atomic reactive state library.", publishDate: "2026-06-25", dueDate: "2026-07-10", maxPoints: 100, status: "Published", submissions: [] }
    ];
  });

  const [discussions, setDiscussions] = useState<DiscussionThread[]>(() => {
    const saved = localStorage.getItem("teacher_discussions");
    return saved ? JSON.parse(saved) : [
      { id: "disc-1", courseId: "react-adv", courseTitle: "Advanced React & Architecture", studentName: "Courtney Henry", title: "Concurrent Mode Question", text: "How does lane prioritization work in transitions?", time: "10:05 AM", status: "New", replies: [] }
    ];
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem("teacher_resources");
    return saved ? JSON.parse(saved) : [
      { id: "res-1", title: "Lecture Notes & Fiber Reconciliation Specs", courseId: "react-adv", courseTitle: "Advanced React & Architecture", fileType: "pdf", fileSize: "4.2 MB", uploadedAt: "2026-06-15" }
    ];
  });

  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const handleAddReply = (threadId: string) => {
    const text = replyInputs[threadId];
    if (!text?.trim()) return;

    const newReply = {
      id: `rep-${Date.now()}`,
      sender: "Sarah Vance",
      role: "Instructor",
      time: "Just Now",
      text: text.trim(),
    };

    const updated = discussions.map((d) =>
      d.id === threadId ? { ...d, status: "Replied", replies: [...(d.replies || []), newReply] } : d
    );
    setDiscussions(updated);
    localStorage.setItem("teacher_discussions", JSON.stringify(updated));
    setReplyInputs((prev) => ({ ...prev, [threadId]: "" }));
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-white selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07080a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono">
              T
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Instructor Console
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Faculty
                </span>
              </h1>
              <p className="text-[10px] text-white/40 font-mono">Prof. Sarah Vance · Advanced Systems</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white text-xs font-mono border border-white/5 transition-colors cursor-pointer"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-mono border border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          {[
            { id: "courses", label: "My Courses", count: courses.length, icon: BookOpen },
            { id: "students", label: "Students", count: students.length, icon: Users },
            { id: "sessions", label: "Live Classes", count: sessions.length, icon: Calendar },
            { id: "assignments", label: "Assignments", count: assignments.length, icon: FileText },
            { id: "discussions", label: "Student Q&A", count: discussions.length, icon: MessageSquare },
            { id: "resources", label: "Course Materials", count: resources.length, icon: FolderOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
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

        {/* Tab 1: Courses */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {course.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2">{course.title}</h3>
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
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-white/40 pt-4 border-t border-white/[0.04]">
                  <span>{course.studentsCount} Active Students</span>
                  <span>{course.sessionsCount} Sessions Total</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Students */}
        {activeTab === "students" && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/40 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Enrolled Course</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Avg Grade</th>
                    <th className="py-3 px-4">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">{stu.name}</p>
                        <p className="text-[10px] text-white/40 font-mono">{stu.email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-white/70">{stu.courseTitle}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">{stu.attendance}%</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">{stu.avgGrade} / 100</td>
                      <td className="py-3 px-4 font-mono text-white/60">{stu.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Sessions */}
        {activeTab === "sessions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    {sess.status}
                  </span>
                  <span className="text-xs font-mono text-white/40">{sess.date}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{sess.title}</h4>
                <p className="text-xs text-white/50 font-mono">{sess.courseTitle}</p>
                <div className="flex items-center justify-between text-xs font-mono text-white/40 pt-2 border-t border-white/[0.04]">
                  <span>{sess.time} ({sess.duration})</span>
                  <span>{sess.studentCount} Students</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Assignments */}
        {activeTab === "assignments" && (
          <div className="space-y-4">
            {assignments.map((ass) => (
              <div
                key={ass.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    Due: {ass.dueDate}
                  </span>
                  <span className="text-xs font-mono text-white/40">{ass.maxPoints} Points</span>
                </div>
                <h4 className="text-sm font-bold text-white">{ass.title}</h4>
                <p className="text-xs text-white/70">{ass.description}</p>
                <p className="text-[10px] text-white/40 font-mono pt-2 border-t border-white/[0.04]">
                  Course: {ass.courseTitle}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Discussions */}
        {activeTab === "discussions" && (
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
                      From {disc.studentName} · {disc.time}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${
                      disc.status === "Replied"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {disc.status}
                  </span>
                </div>

                <p className="text-xs text-white/80 bg-black/40 p-3 rounded-xl border border-white/[0.04]">
                  {disc.text}
                </p>

                {disc.replies && disc.replies.length > 0 && (
                  <div className="space-y-2 pl-4 border-l-2 border-emerald-500/30">
                    {disc.replies.map((rep) => (
                      <div key={rep.id} className="text-xs">
                        <span className="text-emerald-400 font-mono text-[10px] font-bold">
                          {rep.sender} ({rep.role}):
                        </span>
                        <p className="text-white/70 mt-0.5">{rep.text}</p>
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
                    placeholder="Type an instructor response..."
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => handleAddReply(disc.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Answer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Resources */}
        {activeTab === "resources" && (
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
                  Uploaded {res.uploadedAt}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
