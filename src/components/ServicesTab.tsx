import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Megaphone, Calendar, Activity, Shield, Plus, Trash2, CheckCircle2,
  Clock, AlertCircle, Info, Lock
} from "lucide-react";
import { Announcement, CalendarEvent } from "../types/teacher";
import { ActivityLog, RolePermission } from "./AdminDashboard/types";

interface ServicesTabProps {
  announcements: Announcement[];
  calendarEvents: CalendarEvent[];
  logs: ActivityLog[];
  roles: RolePermission[];
  activeSubTab?: string;
  onAddAnnouncement: (ann: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onAddCalendarEvent: (evt: CalendarEvent) => void;
  onUpdateRolePermissions: (roleName: string, permName: string, val: boolean) => void;
}

export default function ServicesTab({
  announcements,
  calendarEvents,
  logs,
  roles,
  activeSubTab = "announcements",
  onAddAnnouncement,
  onDeleteAnnouncement,
  onAddCalendarEvent,
  onUpdateRolePermissions,
}: ServicesTabProps) {
  const [currentSection, setCurrentSection] = useState<"announcements" | "calendar" | "logs" | "roles">(
    "announcements"
  );

  // New announcement modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");
  const [annAudience, setAnnAudience] = useState("Everyone");

  // New calendar event modal
  const [showCalModal, setShowCalModal] = useState(false);
  const [calTitle, setCalTitle] = useState("");
  const [calDate, setCalDate] = useState("2026-07-25");
  const [calTime, setCalTime] = useState("10:00 AM");
  const [calType, setCalType] = useState("Meeting");

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) return;
    onAddAnnouncement({
      id: `ann-${Date.now()}`,
      title: annTitle,
      description: annDesc,
      courseId: "all",
      courseTitle: "All Academy",
      audience: annAudience,
      publishedAt: new Date().toISOString().split("T")[0],
      status: "Published",
    });
    setAnnTitle("");
    setAnnDesc("");
    setShowAnnModal(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle.trim()) return;
    onAddCalendarEvent({
      id: `evt-${Date.now()}`,
      title: calTitle,
      date: calDate,
      time: calTime,
      type: calType,
      courseId: "react-adv",
    });
    setCalTitle("");
    setShowCalModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
        {[
          { id: "announcements", label: "Broadcast Announcements", count: announcements.length, icon: Megaphone },
          { id: "calendar", label: "Academic Calendar", count: calendarEvents.length, icon: Calendar },
          { id: "logs", label: "Audit & System Logs", count: logs.length, icon: Activity },
          { id: "roles", label: "RBAC Security Matrix", count: roles.length, icon: Shield },
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
            </button>
          );
        })}
      </div>

      {/* Announcements */}
      {currentSection === "announcements" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Broadcasts &amp; Academy Notices
            </h3>
            <button
              onClick={() => setShowAnnModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
            >
              <Plus size={14} />
              <span>Post Announcement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    Audience: {ann.audience}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 font-mono">{ann.publishedAt}</span>
                    <button
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      className="text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                <p className="text-xs text-white/70 leading-relaxed">{ann.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      {currentSection === "calendar" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Calendar Timetable &amp; Key Deadlines
            </h3>
            <button
              onClick={() => setShowCalModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
            >
              <Plus size={14} />
              <span>Schedule Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {calendarEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    {evt.type}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">{evt.time}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                <p className="text-[10px] text-white/50 font-mono">Date: {evt.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {currentSection === "logs" && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Realtime System Activity Audit
          </h3>

          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white/40 text-[10px]">{log.timestamp}</span>
                  <span className="text-emerald-400 font-bold">{log.username}</span>
                  <span className="text-white/80">{log.action}</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-white/50">
                  {log.module}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles & Permissions Matrix */}
      {currentSection === "roles" && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Role-Based Access Control (RBAC) Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/[0.06] text-white/40">
                <tr>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-center">Certificates</th>
                  <th className="py-2.5 px-3 text-center">Courses</th>
                  <th className="py-2.5 px-3 text-center">User Management</th>
                  <th className="py-2.5 px-3 text-center">System Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {roles.map((r) => (
                  <tr key={r.role}>
                    <td className="py-3 px-3 font-bold uppercase text-white">{r.role}</td>
                    {(["certificateApproval", "courseManagement", "userManagement", "systemSettings"] as const).map((perm) => (
                      <td key={perm} className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!r.permissions[perm]}
                          onChange={(e) => onUpdateRolePermissions(r.role, perm, e.target.checked)}
                          className="accent-emerald-500 rounded cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ann Modal */}
      <AnimatePresence>
        {showAnnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-sm font-bold text-white">New Broadcast Announcement</h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. Schedule Update"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Message Content</label>
                  <textarea
                    rows={3}
                    required
                    value={annDesc}
                    onChange={(e) => setAnnDesc(e.target.value)}
                    placeholder="Enter broadcast details..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAnnModal(false)}
                    className="px-4 py-2 text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl"
                  >
                    Broadcast
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cal Modal */}
      <AnimatePresence>
        {showCalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-sm font-bold text-white">Schedule Calendar Event</h3>
              <form onSubmit={handleCreateEvent} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={calTitle}
                    onChange={(e) => setCalTitle(e.target.value)}
                    placeholder="e.g. Masterclass Lecture"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/50 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={calDate}
                      onChange={(e) => setCalDate(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 block mb-1">Time</label>
                    <input
                      type="text"
                      required
                      value={calTime}
                      onChange={(e) => setCalTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCalModal(false)}
                    className="px-4 py-2 text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl"
                  >
                    Schedule
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
