import React, { useState, useEffect } from "react";
import { Award, CheckCircle2, XCircle, Search, Filter, ShieldCheck, Check, RefreshCw, Mail, BookOpen, GraduationCap } from "lucide-react";
import { Certificate } from "../../types/teacher";
import { adminApi } from "../../lib/api";

export interface EligibleCertificateCandidate {
  enrollmentId: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseCode?: string;
  finalGrade: number;
  completionStatus: string;
  progress: number;
  certificateId: string | null;
  certificateStatus: string;
  certificateNumber: string | null;
  verificationCode: string | null;
  issueDate: string | null;
}

interface CertificatesViewProps {
  certificates: Certificate[];
  eligibleCandidates?: EligibleCertificateCandidate[];
  onApproveCertificate: (id: string) => Promise<void> | void;
  onRejectCertificate: (id: string) => Promise<void> | void;
  onIssueCertificate?: (studentId: string, courseId: string) => Promise<void> | void;
  onReloadCertificates?: () => Promise<void> | void;
}

export default function CertificatesView({
  certificates,
  eligibleCandidates: propEligibleCandidates,
  onApproveCertificate,
  onRejectCertificate,
  onIssueCertificate,
  onReloadCertificates,
}: CertificatesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eligibleStudents, setEligibleStudents] = useState<EligibleCertificateCandidate[]>(propEligibleCandidates || []);
  const [isLoadingEligible, setIsLoadingEligible] = useState(false);
  const [issuingKey, setIssuingKey] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadEligibleCandidates = async () => {
    setIsLoadingEligible(true);
    try {
      const res = await adminApi.getEligibleCertificates();
      if (res.success && Array.isArray(res.data)) {
        // Enforce strict client-side guard matching backend rule: Completed AND finalGrade > 75
        const valid = res.data.filter(
          (item: any) =>
            String(item.completionStatus) === "Completed" &&
            Number(item.finalGrade) > 75
        );
        setEligibleStudents(valid);
      }
    } catch {
      // Keep current list on error
    } finally {
      setIsLoadingEligible(false);
    }
  };

  useEffect(() => {
    if (propEligibleCandidates && propEligibleCandidates.length > 0) {
      setEligibleStudents(
        propEligibleCandidates.filter(
          (item) => String(item.completionStatus) === "Completed" && Number(item.finalGrade) > 75
        )
      );
    }
    loadEligibleCandidates();
  }, [propEligibleCandidates, certificates.length]);

  const handleIssue = async (candidate: EligibleCertificateCandidate) => {
    const key = `${candidate.studentId}-${candidate.courseId}`;
    setIssuingKey(key);
    setFeedbackBanner(null);
    try {
      if (onIssueCertificate) {
        await onIssueCertificate(candidate.studentId, candidate.courseId);
      } else {
        const res = await adminApi.issueCertificate(candidate.studentId, candidate.courseId);
        if (!res.success) {
          throw new Error((res as any)?.error?.message || "Failed to issue certificate.");
        }
      }
      setFeedbackBanner({
        type: "success",
        text: `Certificate issued for ${candidate.studentName} (${candidate.courseTitle}).`
      });
      await loadEligibleCandidates();
      if (onReloadCertificates) {
        await onReloadCertificates();
      }
    } catch (err: any) {
      setFeedbackBanner({
        type: "error",
        text: err?.message || "Failed to issue certificate."
      });
    } finally {
      setIssuingKey(null);
    }
  };

  const handleApproveExisting = async (certId: string, studentName?: string) => {
    setIssuingKey(certId);
    setFeedbackBanner(null);
    try {
      await onApproveCertificate(certId);
      setFeedbackBanner({
        type: "success",
        text: `Certificate ${studentName ? `for ${studentName} ` : ""}approved and signed.`
      });
      await loadEligibleCandidates();
      if (onReloadCertificates) {
        await onReloadCertificates();
      }
    } catch (err: any) {
      setFeedbackBanner({
        type: "error",
        text: err?.message || "Failed to approve certificate."
      });
    } finally {
      setIssuingKey(null);
    }
  };

  const approvedCount = certificates.filter(c => c.status === "Approved").length;
  const pendingCount = certificates.filter(c => c.status !== "Approved").length;

  const filteredEligible = eligibleStudents.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const matchName = item.studentName?.toLowerCase().includes(term);
    const matchEmail = item.studentEmail?.toLowerCase().includes(term);
    const matchCourse = item.courseTitle?.toLowerCase().includes(term);
    return Boolean(matchName || matchEmail || matchCourse);
  });

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
            <span>Certificates Management &amp; Eligibility</span>
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Identify eligible graduates (completed course with final grade &gt; 75), issue verified certificates, and manage the credential registry
          </p>
        </div>

        {/* Stats summary badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-indigo-300">Eligible Students</span>
            <span className="text-xs font-bold text-indigo-200">{eligibleStudents.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-white/40">Total Issued</span>
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

      {feedbackBanner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            feedbackBanner.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{feedbackBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-white/40 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

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
              placeholder="Search by student name, email, or course..."
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

        <button
          type="button"
          onClick={loadEligibleCandidates}
          className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-xs text-white/70 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <RefreshCw size={12} className={isLoadingEligible ? "animate-spin text-amber-400" : ""} />
          <span>Refresh Eligibility</span>
        </button>
      </div>

      {/* SECTION 1: Eligible Students for Certificate Issuance */}
      <div className="rounded-3xl border border-white/[0.06] bg-[#08080c] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-400" />
              <span>Eligible Students for Certificate Issuance</span>
            </h3>
            <p className="text-[11px] text-white/45 mt-0.5">
              Students enrolled in a course who have completed the course (<code className="text-emerald-300">Completed</code>) with a final grade strictly greater than 75 (<code className="text-amber-300">&gt; 75</code>).
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full self-start sm:self-center">
            {filteredEligible.length} Eligible Candidate{filteredEligible.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoadingEligible && filteredEligible.length === 0 ? (
          <div className="py-10 text-center text-white/40 text-xs font-mono flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin text-amber-400" />
            <span>Evaluating student course completion and final grades...</span>
          </div>
        ) : filteredEligible.length === 0 ? (
          <div className="py-10 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl space-y-2">
            <GraduationCap className="mx-auto text-white/20" size={28} />
            <p className="text-xs font-bold text-white/70">No Eligible Students Found</p>
            <p className="text-[11px] text-white/40 max-w-md mx-auto">
              Only students who have completed their enrolled course (<span className="text-white/60">Completed</span>) with a final grade strictly greater than <span className="text-white/60">75</span> appear in this list.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/40 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student Full Name</th>
                  <th className="py-3 px-4">Student Email</th>
                  <th className="py-3 px-4">Course Name</th>
                  <th className="py-3 px-4 text-center">Final Grade</th>
                  <th className="py-3 px-4 text-center">Completion Status</th>
                  <th className="py-3 px-4 text-center">Certificate Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredEligible.map((item) => {
                  const rowKey = `${item.studentId}-${item.courseId}`;
                  const isIssued = item.certificateStatus === "Approved";
                  const isPendingCert = Boolean(item.certificateId) && item.certificateStatus !== "Approved";
                  const isBusy = issuingKey === rowKey || (item.certificateId && issuingKey === item.certificateId);

                  return (
                    <tr key={rowKey} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{item.studentName}</td>
                      <td className="py-3.5 px-4 font-mono text-white/60">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={11} className="text-white/30" />
                          {item.studentEmail || "Not provided"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                          <BookOpen size={12} className="text-indigo-400 shrink-0" />
                          <span>{item.courseTitle}</span>
                        </div>
                        {item.courseCode && (
                          <span className="text-[10px] font-mono text-white/35">{item.courseCode}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 font-mono font-extrabold text-emerald-300 text-xs">
                          {item.finalGrade} / 100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {item.completionStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isIssued ? (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                              <Check size={10} /> Issued
                            </span>
                            {item.certificateNumber && (
                              <div className="text-[9px] font-mono text-amber-400/80">{item.certificateNumber}</div>
                            )}
                          </div>
                        ) : isPendingCert ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {item.certificateStatus}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/[0.04] text-white/60 border border-white/10">
                            Ready to Issue
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isIssued ? (
                          <span className="text-[11px] font-mono text-emerald-400 inline-flex items-center gap-1 justify-end">
                            <ShieldCheck size={13} />
                            <span>Issued {item.issueDate ? `(${item.issueDate})` : ""}</span>
                          </span>
                        ) : isPendingCert && item.certificateId ? (
                          <button
                            type="button"
                            disabled={Boolean(isBusy)}
                            onClick={() => handleApproveExisting(item.certificateId!, item.studentName)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <ShieldCheck size={13} />
                            <span>{isBusy ? "Approving..." : "Approve & Issue"}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={Boolean(isBusy)}
                            onClick={() => handleIssue(item)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/15 cursor-pointer disabled:opacity-50"
                          >
                            <Award size={13} />
                            <span>{isBusy ? "Issuing..." : "Issue Certificate"}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Issued & Requested Certificates Registry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Issued &amp; Requested Certificates Registry
          </h3>
          <div className="text-xs text-white/40 font-mono">
            Showing: <span className="text-white font-bold">{filteredCerts.length}</span> certificates
          </div>
        </div>

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
            {filteredCerts.map((cert: any) => {
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
                          {cert.studentEmail && (
                            <p className="text-[10px] text-white/40 font-mono">{cert.studentEmail}</p>
                          )}
                          <p className="text-xs text-indigo-300 font-mono mt-0.5">{cert.courseTitle}</p>
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
                      {cert.finalGrade !== null && cert.finalGrade !== undefined && (
                        <div className="flex justify-between items-center text-white/50">
                          <span>Final Course Grade:</span>
                          <span className="text-emerald-400 font-bold">{cert.finalGrade} / 100</span>
                        </div>
                      )}
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
                      {(cert.certificateNumber || cert.verificationCode) && (
                        <div className="flex justify-between items-center text-white/50">
                          <span>Certificate ID:</span>
                          <span className="text-amber-400/90 font-mono text-[10px]">
                            {cert.certificateNumber || cert.verificationCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
                    {!isApproved ? (
                      <>
                        <button
                          onClick={() => handleApproveExisting(cert.id, cert.studentName)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          <ShieldCheck size={14} />
                          <span>Approve &amp; Sign</span>
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
                          Verified &amp; Signed
                        </span>
                        <button
                          onClick={() => onRejectCertificate(cert.id)}
                          className="text-[10px] text-white/30 hover:text-red-400 transition-colors cursor-pointer"
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
    </div>
  );
}
