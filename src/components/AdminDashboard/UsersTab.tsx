import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, UserPlus, Search, Shield, Filter, Key,
  Trash2, CheckCircle2, XCircle, Mail, Phone, Calendar, UserCheck, UserCog, AlertCircle, ArrowLeftRight
} from "lucide-react";
import { AdminUser } from "./types";
import { Student, Course } from "../../types/teacher";

interface UsersTabProps {
  users: AdminUser[];
  students: Student[];
  courses: Course[];
  activeSubTab?: string;
  onAddUser?: (user: Partial<AdminUser>) => void;
  onUpdateUserStatus?: (id: string, status: string) => void;
  onResetPassword?: (id: string) => void;
  onDeleteUser?: (id: string) => void;
  onAddStudent?: (student: Partial<Student>) => void;
  onUpdateUserRole: (id: string, newRole: "User" | "Student" | "Teacher") => Promise<void>;
  isLoading?: boolean;
}

export default function UsersTab({
  users,
  students,
  courses,
  activeSubTab,
  onAddUser,
  onUpdateUserStatus,
  onResetPassword,
  onDeleteUser,
  onAddStudent,
  onUpdateUserRole,
  isLoading = false,
}: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Role Change Modal state
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUser | null>(null);
  const [targetRole, setTargetRole] = useState<"User" | "Student" | "Teacher">("Student");
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<"User" | "Student" | "Teacher">("User");

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term));

    let matchesRole = true;
    if (roleFilter !== "all") {
      const lower = (u.roleName || u.role || "").toLowerCase();
      if (roleFilter === "admin") {
        matchesRole = lower === "administrator" || lower === "admin" || lower === "super-admin";
      } else if (roleFilter === "teacher") {
        matchesRole = lower === "teacher";
      } else if (roleFilter === "student") {
        matchesRole = lower === "student";
      } else if (roleFilter === "user") {
        matchesRole = lower === "user" || lower === "normal";
      }
    }

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (u: AdminUser) => {
    const rawRole = (u.roleName || u.role || "").toLowerCase();
    if (rawRole === "administrator" || rawRole === "admin" || rawRole === "super-admin") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1 w-fit">
          <Shield size={10} />
          مدیر کل (Admin)
        </span>
      );
    }
    if (rawRole === "teacher") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
          <UserCog size={10} />
          استاد (Teacher)
        </span>
      );
    }
    if (rawRole === "student") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
          <UserCheck size={10} />
          دانشجو (Student)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1 w-fit">
        <Users size={10} />
        کاربر عادی (User)
      </span>
    );
  };

  const getRolePersianName = (roleStr: string) => {
    const lower = (roleStr || "").toLowerCase();
    if (lower === "administrator" || lower === "admin" || lower === "super-admin") return "مدیر کل";
    if (lower === "teacher") return "استاد";
    if (lower === "student") return "دانشجو";
    return "کاربر عادی";
  };

  const openRoleModal = (u: AdminUser) => {
    setSelectedUserForRole(u);
    setRoleError(null);
    const lower = (u.roleName || u.role || "").toLowerCase();
    if (lower === "teacher") {
      setTargetRole("Student");
    } else if (lower === "student") {
      setTargetRole("Teacher");
    } else {
      setTargetRole("Student");
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;

    setIsSavingRole(true);
    setRoleError(null);
    try {
      await onUpdateUserRole(selectedUserForRole.id, targetRole);
      setSelectedUserForRole(null);
    } catch (err: any) {
      setRoleError(err.message || "تغییر نقش کاربر انجام نشد.");
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    if (onAddUser) {
      onAddUser({
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone || "",
        role: newUserRole.toLowerCase(),
        status: "Active",
      });
    }

    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section with Persian title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Users className="text-emerald-400" size={20} />
            <span>مدیریت کاربران (User Management)</span>
          </h2>
          <p className="text-xs text-white/50 mt-1">
            مشاهده، جستجو و مدیریت نقش‌های کاربران ثبت‌نام‌شده در سامانه آکادمی
          </p>
        </div>

        {onAddUser && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <UserPlus size={14} />
            <span>افزودن کاربر</span>
          </button>
        )}
      </div>

      {/* Control Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو بر اساس نام، ایمیل، نام کاربری..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all">همه نقش‌ها (All)</option>
            <option value="user">کاربران عادی (Normal Users)</option>
            <option value="student">دانشجویان (Students)</option>
            <option value="teacher">اساتید (Teachers)</option>
            <option value="admin">مدیران (Administrators)</option>
          </select>
        </div>

        <div className="text-xs text-white/40 font-mono">
          تعداد کل: <span className="text-white font-bold">{filteredUsers.length}</span> کاربر
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/40 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">کاربر (User)</th>
                <th className="py-3 px-4">ایمیل (Email)</th>
                <th className="py-3 px-4">نقش (Role)</th>
                <th className="py-3 px-4">شماره تماس (Phone)</th>
                <th className="py-3 px-4">وضعیت (Status)</th>
                <th className="py-3 px-4">تاریخ ثبت‌نام (Joined)</th>
                <th className="py-3 px-4 text-right">عملیات (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/30 text-xs font-mono">
                    {users.length === 0
                      ? "هنوز کاربری ثبت‌نام نکرده است."
                      : roleFilter === "student"
                      ? "هنوز دانشجویی ثبت نشده است."
                      : roleFilter === "teacher"
                      ? "هنوز استادی ثبت نشده است."
                      : roleFilter === "user"
                      ? "هیچ کاربر عادی یافت نشد."
                      : "کاربری با این مشخصات یافت نشد."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isMasterAdmin =
                    u.id === "admin-1" ||
                    (u.roleName || u.role || "").toLowerCase() === "administrator" ||
                    (u.roleName || u.role || "").toLowerCase() === "super-admin";

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center font-mono shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{u.name}</p>
                            {u.username && (
                              <p className="text-[10px] text-white/40 font-mono truncate">@{u.username}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-white/70">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(u)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-white/60">
                        {u.phone || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {onUpdateUserStatus && !isMasterAdmin ? (
                          <button
                            onClick={() =>
                              onUpdateUserStatus(u.id, u.status === "Active" ? "Suspended" : "Active")
                            }
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                              u.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                            title="تغییر وضعیت حساب"
                          >
                            {u.status === "Active" ? "فعال" : "معلق"}
                          </button>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                              u.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {u.status === "Active" ? "فعال" : "معلق"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-white/40">
                        {u.joinedDate || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isMasterAdmin ? (
                            <span className="text-[10px] text-purple-400/80 font-mono px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                              محافظت‌شده
                            </span>
                          ) : (
                            <button
                              onClick={() => openRoleModal(u)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/25 transition-all cursor-pointer font-sans text-[11px] font-bold"
                              title="تغییر نقش کاربر"
                            >
                              <ArrowLeftRight size={12} />
                              <span>تغییر نقش</span>
                            </button>
                          )}

                          {onResetPassword && !isMasterAdmin && (
                            <button
                              onClick={() => onResetPassword(u.id)}
                              className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-emerald-500/10 text-white/60 hover:text-emerald-400 border border-white/5 transition-all cursor-pointer"
                              title="Reset Password"
                            >
                              <Key size={13} />
                            </button>
                          )}

                          {onDeleteUser && !isMasterAdmin && (
                            <button
                              onClick={() => onDeleteUser(u.id)}
                              className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-red-500/10 text-white/60 hover:text-red-400 border border-white/5 transition-all cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      <AnimatePresence>
        {selectedUserForRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowLeftRight size={18} className="text-emerald-400" />
                  <span>تغییر نقش کاربر</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedUserForRole(null)}
                  className="text-white/40 hover:text-white"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* User summary */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">نام کاربر:</span>
                  <span className="text-white font-bold">{selectedUserForRole.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">ایمیل:</span>
                  <span className="text-white font-mono text-[11px]">{selectedUserForRole.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-white/[0.03]">
                  <span className="text-white/40">نقش فعلی:</span>
                  <span className="text-emerald-400 font-bold">
                    {getRolePersianName(selectedUserForRole.roleName || selectedUserForRole.role)}
                  </span>
                </div>
              </div>

              {roleError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{roleError}</span>
                </div>
              )}

              <form onSubmit={handleSaveRole} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/70 block mb-2">
                    انتخاب نقش جدید:
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as any)}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="User" className="bg-[#121318] text-white">کاربر عادی (User)</option>
                    <option value="Student" className="bg-[#121318] text-white">دانشجو (Student)</option>
                    <option value="Teacher" className="bg-[#121318] text-white">استاد (Teacher)</option>
                  </select>
                  <p className="text-[10px] text-white/40 mt-1.5 leading-relaxed">
                    توجه: ارتقا به نقش مدیر کل (Administrator) فقط از طریق پیکربندی امن سرور امکان‌پذیر است.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForRole(null)}
                    disabled={isSavingRole}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRole}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingRole ? (
                      <span>در حال ذخیره...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>ذخیره تغییرات</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl"
            >
              <h3 className="text-base font-bold text-white">افزودن کاربر جدید</h3>

              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="مثال: روژان طاهری"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    ایمیل
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    شماره تماس
                  </label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    نقش اولیه
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="User">کاربر عادی (User)</option>
                    <option value="Student">دانشجو (Student)</option>
                    <option value="Teacher">استاد (Teacher)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    ایجاد کاربر
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
