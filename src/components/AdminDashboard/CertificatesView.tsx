import React, { useState } from "react";
import { Award, CheckCircle2, XCircle, Search, Filter, ShieldCheck, Clock, Check } from "lucide-react";
import { Certificate } from "../../types/teacher";

interface CertificatesViewProps {
  certificates: Certificate[];
  onApproveCertificate: (id: string) => void;
  onRejectCertificate: (id: string) => void;
}

export default function CertificatesView({
  certificates,
  onApproveCertificate,
  onRejectCertificate,
}: CertificatesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const approvedCount = certificates.filter(c => c.status === "Approved").length;
  const pendingCount = certificates.filter(c => c.status !== "Approved").length;

  const filteredCerts = certificates.filter((cert) => {
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchName = cert.studentName && cert.studentName.toLowerCase().includes(term);
      const matchCourse = cert.courseTitle && cert.courseTitle.toLowerCase().includes(term);
      if (!matchName && !matchCourse) return false;
    }

    if (statusFilter !== "all") {
      if (statusFilter === "approved" && cert.status !== "Approved") return false;
      if (statusFilter === "pending" && cert.status === "Approved") return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            <span>Certificates Management</span>
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Review, sign, verify, and approve academic graduation certificates for enrolled students
          </p>
        </div>

        {/* Stats summary badges */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-white/40">Total</span>
            <span className="text-xs font-bold text-white">{certificates.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-emerald-400">Approved</span>
            <span className="text-xs font-bold text-emerald-300">{approvedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-amber-400">Pending Review</span>
            <span className="text-xs font-bold text-amber-300">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or course..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-[#0c0d12] border border-white/10 rounded-xl px-3 py-1.5 shadow-sm">
            <Filter size={12} className="text-white/40" />
            <span className="text-[10px] text-white/50 font-mono uppercase">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0c0d12] text-xs text-white focus:outline-none cursor-pointer border-none pr-2"
            >
              <option value="all">All Certificates ({certificates.length})</option>
              <option value="approved">Approved ({approvedCount})</option>
              <option value="pending">Pending Review ({pendingCount})</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-white/40 font-mono">
          Showing: <span className="text-white font-bold">{filteredCerts.length}</span> certificates
        </div>
      </div>

      {/* Certificates Cards Grid */}
      {filteredCerts.length === 0 ? (
        <div className="p-12 text-center bg-white/[0.015] border border-dashed border-white/10 rounded-3xl space-y-3">
          <Award className="mx-auto text-white/20" size={36} />
          <p className="text-xs text-white/40">
            {certificates.length === 0
              ? "No certificates have been issued or requested yet."
              : "No certificates match your search and filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCerts.map((cert) => {
            const isApproved = cert.status === "Approved";
            return (
              <div
                key={cert.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                  isApproved
                    ? "bg-[#090b10] border-emerald-500/20 hover:border-emerald-500/40"
                    : "bg-[#0a0a0e] border-amber-500/20 hover:border-amber-500/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isApproved
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        <Award size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{cert.studentName}</h4>
                        <p className="text-xs text-white/50 font-mono mt-0.5">{cert.courseTitle}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isApproved
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {cert.status || "Pending"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center text-white/50">
                      <span>Academic GPA:</span>
                      <span className="text-white font-bold">{cert.gpa || "3.85"}</span>
                    </div>
                    {cert.issueDate && (
                      <div className="flex justify-between items-center text-white/50">
                        <span>Issued On:</span>
                        <span className="text-white/80">{cert.issueDate}</span>
                      </div>
                    )}
                    {cert.verificationCode && (
                      <div className="flex justify-between items-center text-white/50">
                        <span>Verification ID:</span>
                        <span className="text-amber-400/90 font-mono text-[10px]">{cert.verificationCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
                  {!isApproved ? (
                    <>
                      <button
                        onClick={() => onApproveCertificate(cert.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        <ShieldCheck size={14} />
                        <span>Approve & Sign</span>
                      </button>
                      <button
                        onClick={() => onRejectCertificate(cert.id)}
                        className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-sans text-xs font-bold border border-red-500/20 transition-all cursor-pointer"
                        title="Reject Certificate Request"
                      >
                        <XCircle size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs font-mono text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Check size={14} />
                        Verified & Signed
                      </span>
                      <button
                        onClick={() => onRejectCertificate(cert.id)}
                        className="text-[10px] text-white/30 hover:text-red-400 transition-colors"
                      >
                        Revoke
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
