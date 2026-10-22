import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Megaphone, Activity, Clock, Plus, Trash2, Search, Filter, RefreshCw,
  Bell, Shield, BookOpen, UserCheck, CheckCircle2, AlertTriangle, Layers,
  Calendar, ArrowUpRight
} from "lucide-react";
import { adminApi } from "../../lib/api";
import DeleteConfirmModal from "../common/DeleteConfirmModal";

interface AcademyFeedTabProps {
  courses: any[];
  showCustomToast?: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function AcademyFeedTab({
  courses,
  showCustomToast
}: AcademyFeedTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"all" | "announcements" | "events">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Announcement Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCourseId, setNewCourseId] = useState("");
  const [newAudience, setNewAudience] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFeedData = async () => {
    setIsLoading(true);
    try {
      const [annRes, logRes] = await Promise.all([
        adminApi.getAnnouncements().catch(() => ({ success: false, data: [] })),
        adminApi.getActivityLogs().catch(() => ({ success: false, data: [] }))
      ]);

      if (annRes.success && Array.isArray(annRes.data)) {
        setAnnouncements(annRes.data);
      }
      if (logRes.success && Array.isArray(logRes.data)) {
        setActivityLogs(logRes.data);
      }
    } catch (err) {
      console.error("Failed to load feed data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showCustomToast?.("Title and description are required", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminApi.createAnnouncement({
        title: newTitle.trim(),
        description: newDescription.trim(),
        courseId: newCourseId || null,
        audience: newAudience,
        status: "Published"
      });

      if (res.success) {
        showCustomToast?.("Announcement broadcasted successfully", "success");
        setShowCreateModal(false);
        setNewTitle("");
        setNewDescription("");
        setNewCourseId("");
        fetchFeedData();
      }
    } catch (err: any) {
      console.error("Failed to create announcement:", err);
      showCustomToast?.(err.message || "Failed to create announcement", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await adminApi.deleteAnnouncement(deleteTarget.id);
      if (res.success) {
        setAnnouncements((prev) => prev.filter((a) => String(a.id) !== String(deleteTarget.id)));
        showCustomToast?.("Announcement removed from database", "success");
      }
    } catch (err: any) {
      console.error("Failed to delete announcement:", err);
      showCustomToast?.("Failed to delete announcement", "warning");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Filtered lists
  const filteredAnnouncements = announcements.filter((a) =>
    (a.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = activityLogs.filter((l) =>
    (l.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.details || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.user_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c0d14] via-[#090a0f] to-[#07070b] border border-white/[0.06] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Feed & Notifications
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Megaphone size={22} className="text-indigo-400" />
            <span>Academy Announcements & Events</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Real-time activity logs, academic notifications, and system broadcast events across Roozzero Academy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchFeedData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs"
            title="Refresh Feed"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-indigo-400" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <Plus size={14} />
            <span>Broadcast Announcement</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Sub-tabs */}
        <div className="flex p-1 rounded-xl bg-white/[0.02] border border-white/[0.05] w-fit">
          <button
            onClick={() => setActiveSubTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "all"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All Activity ({announcements.length + activityLogs.length})
          </button>
          <button
            onClick={() => setActiveSubTab("announcements")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "announcements"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Announcements ({announcements.length})
          </button>
          <button
            onClick={() => setActiveSubTab("events")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "events"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Live Events & Logs ({activityLogs.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search feed, actions, logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Announcements Section */}
      {(activeSubTab === "all" || activeSubTab === "announcements") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-2">
              <Megaphone size={14} />
              <span>Official Broadcast Announcements ({filteredAnnouncements.length})</span>
            </h3>
          </div>

          {filteredAnnouncements.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10 text-zinc-500 text-xs">
              No announcements found. Click &ldquo;Broadcast Announcement&rdquo; to publish news to students and faculty.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-5 rounded-2xl bg-[#090a0f] border border-white/[0.06] hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {ann.audience || "All Academy"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: String(ann.id), title: ann.title })}
                        className="p-1 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Announcement"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">{ann.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{ann.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                    </span>
                    <span>{ann.courseTitle || "Global"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Logs & Live Events Section */}
      {(activeSubTab === "all" || activeSubTab === "events") && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
              <Activity size={14} />
              <span>Live Academy Activity & Audit Trail ({filteredLogs.length})</span>
            </h3>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10 text-zinc-500 text-xs">
              No activity logs recorded yet.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-[#090a0f] divide-y divide-white/[0.04] overflow-hidden">
              {filteredLogs.map((log) => {
                const isCourse = (log.action || "").includes("Course") || (log.action || "").includes("Syllabus");
                const isRole = (log.action || "").includes("Role") || (log.action || "").includes("User");
                const isPublish = (log.action || "").includes("Publish");

                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-white/[0.01] transition-colors flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isPublish
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isCourse
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : isRole
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-white/5 text-zinc-400 border border-white/10"
                        }`}
                      >
                        {isPublish ? (
                          <ArrowUpRight size={14} />
                        ) : isCourse ? (
                          <BookOpen size={14} />
                        ) : isRole ? (
                          <UserCheck size={14} />
                        ) : (
                          <Activity size={14} />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white tracking-tight">{log.action}</span>
                          {log.user_name && (
                            <span className="text-[10px] text-zinc-400 font-mono">&bull; by {log.user_name}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-normal">{log.details || "Activity performed"}</p>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-zinc-500 shrink-0 flex items-center gap-1.5">
                      <Clock size={10} />
                      <span>
                        {log.created_at
                          ? new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                            " - " +
                            new Date(log.created_at).toLocaleDateString([], { month: "short", day: "numeric" })
                          : "Recent"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0b0b10] border border-white/10 rounded-2xl p-6 shadow-2xl text-white text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <Megaphone size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Broadcast New Announcement</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm Evaluation Schedules Released"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Target Audience</label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Academy (Students & Faculty)</option>
                    <option value="Students">Students Only</option>
                    <option value="Teachers">Faculty / Instructors Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Specific Course (Optional)</label>
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Global Broadcast (All Courses)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title || c.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Announcement announcement details and guidelines..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Megaphone size={14} />
                    <span>{isSubmitting ? "Broadcasting..." : "Broadcast Announcement"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Announcement"
        itemName={deleteTarget?.title}
        message="Are you sure you want to permanently delete this broadcast announcement from the database?"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
