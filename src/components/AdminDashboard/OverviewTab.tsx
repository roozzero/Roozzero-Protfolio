import React from "react";
import { motion } from "motion/react";
import {
  Users, BookOpen, Calendar, Award, CheckCircle2, XCircle, ArrowRight,
  Clock, ShieldAlert, Sparkles, TrendingUp, AlertCircle, FileText
} from "lucide-react";
import { Course, Student, Session, Certificate, Assignment, CourseSeason } from "../../types/teacher";
import { CourseRequest, AdminUser } from "./types";

interface OverviewTabProps {
  courses: Course[];
  students: Student[];
  sessions: Session[];
  requests: CourseRequest[];
  certificates: Certificate[];
  assignments?: Assignment[];
  seasons?: CourseSeason[];
  users?: AdminUser[];
  onQuickAction?: (tabId: string) => void;
  onNavigateTab?: (tabId: string) => void;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string, notes?: string) => void;
  onApproveCertificate: (id: string) => void;
  onRejectCertificate: (id: string) => void;
  onUpdateSessionStatus: (id: string, status: string) => void;
}

export default function OverviewTab({
  courses,
  students,
  sessions,
  requests,
  certificates,
  assignments = [],
  seasons = [],
  users = [],
  onQuickAction,
  onNavigateTab,
  onApproveRequest,
  onRejectRequest,
  onApproveCertificate,
  onRejectCertificate,
  onUpdateSessionStatus,
}: OverviewTabProps) {
  const handleNav = (target: string) => {
    if (onQuickAction) {
      onQuickAction(target);
    } else if (onNavigateTab) {
      onNavigateTab(target);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const pendingCertificates = certificates.filter(
    (c) => c.status === "Waiting for Admin Approval" || c.status === "Pending"
  );
  const scheduledSessions = sessions.filter((s) => s.status === "Scheduled");

  const statCards = [
    { label: "Active Courses", value: courses.length, icon: BookOpen, actionId: "courses", color: "text-emerald-400" },
    { label: "Enrolled Students", value: students.length, icon: Users, actionId: "users", color: "text-emerald-300" },
    { label: "Live Sessions", value: scheduledSessions.length, icon: Calendar, actionId: "courses", color: "text-teal-400" },
    { label: "Pending Approvals", value: pendingRequests.length + pendingCertificates.length, icon: Award, actionId: "certificates", color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleNav(stat.actionId)}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer group backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-white/40 tracking-wider">
                  {stat.label}
                </span>
                <div className="p-2 rounded-xl bg-white/[0.03] group-hover:bg-emerald-500/10 transition-colors">
                  <Icon size={16} className={stat.color} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white font-sans">
                  {stat.value}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View <ArrowRight size={10} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Course/Season Requests */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pending Requests ({pendingRequests.length})
              </h3>
            </div>
            <button
              onClick={() => handleNav("courses")}
              className="text-[10px] text-white/50 hover:text-emerald-400 font-mono transition-colors"
            >
              View All
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-white/30 text-xs font-mono">
              No pending requests found. All clear!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{req.title}</p>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5 truncate">
                      {req.teacherName} · {req.type} · {req.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onApproveRequest(req.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 transition-all cursor-pointer"
                      title="Approve"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                      title="Reject"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Certificate Signatures */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Certificate Approvals ({pendingCertificates.length})
              </h3>
            </div>
            <button
              onClick={() => handleNav("certificates")}
              className="text-[10px] text-white/50 hover:text-emerald-400 font-mono transition-colors"
            >
              View All
            </button>
          </div>

          {pendingCertificates.length === 0 ? (
            <div className="py-8 text-center text-white/30 text-xs font-mono">
              No pending certificates for approval.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCertificates.slice(0, 4).map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{cert.studentName}</p>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5 truncate">
                      {cert.courseTitle} · GPA: {cert.gpa}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onApproveCertificate(cert.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 transition-all cursor-pointer"
                      title="Sign & Approve"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      onClick={() => onRejectCertificate(cert.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                      title="Reject"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Live Sessions */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Upcoming Live Classes &amp; Broadcasts
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Realtime Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sessions.slice(0, 3).map((sess) => (
            <div
              key={sess.id}
              className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-2 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {sess.status}
                </span>
                <span className="text-[10px] text-white/40 font-mono">{sess.date}</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{sess.title}</h4>
              <p className="text-[10px] text-white/50 font-mono truncate">{sess.courseTitle}</p>
              <div className="pt-2 flex items-center justify-between text-[10px] text-white/40 font-mono border-t border-white/[0.04]">
                <span>{sess.time} ({sess.duration})</span>
                <span>{sess.studentCount} Students</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
