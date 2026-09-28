import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, Sparkles, User, Mail, Phone, BookOpen,
  Calendar, Award, ShieldCheck, ArrowRight, CheckCircle2
} from "lucide-react";
import { coursesApi, authApi } from "../lib/api";

export interface CourseRegistrationData {
  id: string;
  courseId: string;
  courseName: string;
  price: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  experienceLevel: string;
  notes?: string;
  registeredAt: string;
  status: "Pending" | "Confirmed";
}

interface CourseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    courseName: string;
    instructor?: string;
    price?: string;
    sessions?: number | string;
    shortDescription?: string;
    description?: string;
  } | null;
  onEnrollSuccess?: (registration: CourseRegistrationData) => void;
}

export default function CourseRegistrationModal({
  isOpen,
  onClose,
  course,
  onEnrollSuccess,
}: CourseRegistrationModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-fill student info if user is already authenticated
  useEffect(() => {
    if (isOpen && course) {
      setIsSuccess(false);
      setErrorMsg("");
      authApi.getMe()
        .then((res) => {
          if (res.success && res.data?.user) {
            const u = res.data.user;
            if (u.name) setName(u.name);
            if (u.email) setEmail(u.email);
            if (u.phone) setPhone(u.phone);
          }
        })
        .catch(() => {
          // Unauthenticated visitor
        });
    }
  }, [isOpen, course]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !course) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please fill in all required fields (Name, Email, and Phone).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await coursesApi.registerCourse(course.id, {
        studentName: name.trim(),
        studentEmail: email.trim(),
        studentPhone: phone.trim(),
        experienceLevel,
        notes: notes.trim()
      });

      const registration: CourseRegistrationData = {
        id: res.data?.registrationId || `reg-${Date.now()}`,
        courseId: course.id,
        courseName: course.courseName,
        price: course.price || "$149",
        studentName: name.trim(),
        studentEmail: email.trim(),
        studentPhone: phone.trim(),
        experienceLevel,
        notes: notes.trim(),
        registeredAt: new Date().toISOString(),
        status: "Confirmed",
      };

      setIsSubmitting(false);
      setIsSuccess(true);

      if (onEnrollSuccess) {
        onEnrollSuccess(registration);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || "Failed to submit course registration. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c0d12] p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.85)] z-10 my-auto text-white overflow-hidden"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors cursor-pointer border border-white/5"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {!isSuccess ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-wider uppercase mb-3">
                  <Sparkles size={11} className="animate-pulse" />
                  <span>Direct Course Registration</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {course.courseName}
                </h3>
                <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">
                  {course.shortDescription || course.description || "Complete registration to reserve your place in this masterclass"}
                </p>
              </div>

              {/* Course Quick Highlights Banner */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-white/80">Tuition:</span>
                  <span className="text-emerald-400 font-bold font-sans text-sm">
                    {course.price || "$149"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                  <Calendar size={13} className="text-emerald-400" />
                  <span>{course.sessions || 12} Interactive Sessions</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-sans">
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Name */}
                  <div>
                    <label className="text-[11px] font-mono text-white/70 block mb-1">
                      Full Name <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                      <User size={14} className="absolute left-3 top-3 text-white/30" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[11px] font-mono text-white/70 block mb-1">
                      Phone Number <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                      <Phone size={14} className="absolute left-3 top-3 text-white/30" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[11px] font-mono text-white/70 block mb-1">
                    Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <Mail size={14} className="absolute left-3 top-3 text-white/30" />
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="text-[11px] font-mono text-white/70 block mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-[#13141a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="Beginner">Beginner (Basic fundamentals)</option>
                    <option value="Intermediate">Intermediate (Hands-on experience)</option>
                    <option value="Advanced">Advanced (Production developer)</option>
                  </select>
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="text-[11px] font-mono text-white/70 block mb-1">
                    Questions or Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific questions about prerequisites or curriculum..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                </div>

                {/* Perks Checklist */}
                <div className="pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-[11px] text-white/60">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Lifetime Video Access
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Verified Certificate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Project Code Reviews
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Private Q&A Channel
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Confirm Enrollment</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Check size={32} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Enrollment Confirmed!</h3>
                <p className="text-xs text-white/60 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Details for <span className="text-emerald-400 font-bold">{course.courseName}</span> have been sent to your email and phone.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-left text-xs font-mono max-w-sm mx-auto space-y-2">
                <div className="flex justify-between text-white/50">
                  <span>Student:</span>
                  <span className="text-white">{name}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Enrollment Status:</span>
                  <span className="text-emerald-400">Confirmed (Active)</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Sessions:</span>
                  <span className="text-white">{course.sessions || 12} Sessions</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
