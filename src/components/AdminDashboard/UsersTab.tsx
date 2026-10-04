import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, UserPlus, Search, Shield, Filter, Key,
  Trash2, CheckCircle2, XCircle, Mail, Phone, Calendar, UserCheck, UserCog, AlertCircle, ArrowLeftRight, RotateCcw
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
  onUpdateUserRole: (id: string, newRole: "User" | "Student" | "Teacher" | "Administrator") => Promise<void>;
  isLoading?: boolean;
}

// Resilient role extractor that handles any backend representation
export const getUserRoleKey = (u: any): "admin" | "teacher" | "student" | "user" => {
  if (!u) return "user";
  const rId = Number(u.roleId ?? u.role_id);
  if (rId === 1) return "admin";
  if (rId === 2) return "teacher";
  if (rId === 3) return "student";
  if (rId === 4) return "user";

  const rawRole = (u.roleName || u.role_name || u.role || "").toString().toLowerCase().trim();
  if (rawRole === "administrator" || rawRole === "admin" || rawRole === "super-admin" || rawRole === "owner") {
    return "admin";
  }
  if (rawRole === "teacher" || rawRole === "instructor" || rawRole === "professor") {
    return "teacher";
  }
  if (rawRole === "student" || rawRole === "learner") {
    return "student";
  }
  return "user";
};

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
  // Navigation tabs within Users section:
  // "all" = All Users
  // "students" = ONLY Students
  // "teachers" = ONLY Teachers
  // "normal" = ONLY Standard Users
  // "admins" = ONLY Administrators
  const [userTab, setUserTab] = useState<"all" | "students" | "teachers" | "normal" | "admins">(() => {
    if (activeSubTab === "students") return "students";
    if (activeSubTab === "teachers") return "teachers";
    return "all";
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync tab with external activeSubTab prop when changed
  useEffect(() => {
    if (activeSubTab === "students") {
      setUserTab("students");
    } else if (activeSubTab === "teachers") {
      setUserTab("teachers");
    } else if (activeSubTab === "all") {
      setUserTab("all");
    }
  }, [activeSubTab]);

  // Role Change Modal state
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUser | null>(null);
  const [targetRole, setTargetRole] = useState<"User" | "Student" | "Teacher" | "Administrator">("Student");
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<"User" | "Student" | "Teacher">("User");

  // Tab counts
  const totalCount = users.length;
  const studentsCount = users.filter((u) => getUserRoleKey(u) === "student").length;
  const teachersCount = users.filter((u) => getUserRoleKey(u) === "teacher").length;
  const normalCount = users.filter((u) => getUserRoleKey(u) === "user").length;
  const adminsCount = users.filter((u) => getUserRoleKey(u) === "admin").length;

  // Filtered users matching active tab, search term, role filter, and status filter
  const filteredUsers = users.filter((u) => {
    const roleKey = getUserRoleKey(u);

    // 1. Primary Tab Filtering:
    // If on "students" tab, strictly only students
    if (userTab === "students" && roleKey !== "student") return false;
    // If on "teachers" tab, strictly only teachers
    if (userTab === "teachers" && roleKey !== "teacher") return false;
    // If on "normal" tab, strictly only normal users
    if (userTab === "normal" && roleKey !== "user") return false;
    // If on "admins" tab, strictly only admins
    if (userTab === "admins" && roleKey !== "admin") return false;
    // If on "all" tab, all users pass this tab check!

    // 2. Secondary Dropdown Role Filter (if selected while on "all" tab)
    if (roleFilter !== "all") {
      if (roleFilter === "student" && roleKey !== "student") return false;
      if (roleFilter === "teacher" && roleKey !== "teacher") return false;
      if (roleFilter === "user" && roleKey !== "user") return false;
      if (roleFilter === "admin" && roleKey !== "admin") return false;
    }

    // 3. Search term filtering (name, email, username, phone)
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchName = u.name && u.name.toLowerCase().includes(term);
      const matchEmail = u.email && u.email.toLowerCase().includes(term);
      const matchUsername = u.username && u.username.toLowerCase().includes(term);
      const matchPhone = u.phone && u.phone.toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchUsername && !matchPhone) {
        return false;
      }
    }

    // 4. Status filtering
    if (statusFilter !== "all") {
      const userStatus = (u.status || "Active").toLowerCase();
      if (userStatus !== statusFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const handleTabChange = (tabId: "all" | "students" | "teachers" | "normal" | "admins") => {
    setUserTab(tabId);
    // Reset dropdown role filter so it aligns with tab
    setRoleFilter("all");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const getRoleBadge = (u: AdminUser) => {
    const roleKey = getUserRoleKey(u);
    if (roleKey === "admin") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1 w-fit">
          <Shield size={10} />
          Administrator
        </span>
      );
    }
    if (roleKey === "teacher") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
          <UserCog size={10} />
          Teacher
        </span>
      );
    }
    if (roleKey === "student") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
          <UserCheck size={10} />
          Student
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1 w-fit">
        <Users size={10} />
        User
      </span>
    );
  };

  const openRoleModal = (u: AdminUser) => {
    setSelectedUserForRole(u);
    setRoleError(null);
    const roleKey = getUserRoleKey(u);
    if (roleKey === "teacher") {
      setTargetRole("Student");
    } else if (roleKey === "student") {
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
      setRoleError(err.message || "Failed to update user role.");
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    if (onAddUser) {
      onAddUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        phone: newUserPhone.trim() || "",
        role: newUserRole.toLowerCase(),
        status: "Active",
      });
    }

    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setShowAddModal(false);
  };

  const hasActiveFilters = searchTerm !== "" || roleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-6 text-left">
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Users className="text-emerald-400" size={20} />
            <span>User Management</span>
          </h2>
          <p className="text-xs text-white/50 mt-1">
            View, search, filter and manage registered academy accounts and access roles
          </p>
        </div>

        {onAddUser && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Tabs: All Users | Students | Teachers | Normal Users | Administrators */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
        {[
          { id: "all" as const, label: "All Users", count: totalCount, icon: Users },
          { id: "students" as const, label: "Students", count: studentsCount, icon: UserCheck },
          { id: "teachers" as const, label: "Teachers", count: teachersCount, icon: UserCog },
          { id: "normal" as const, label: "Normal Users", count: normalCount, icon: Users },
          { id: "admins" as const, label: "Administrators", count: adminsCount, icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = userTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md"
                  : "text-white/50 hover:text-white hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <Icon size={14} className={isActive ? "text-emerald-400" : ""} />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? "bg-emerald-500/25 text-emerald-300" : "bg-white/10 text-white/40"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Enhanced Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#08090d] border border-white/[0.06] space-y-3">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, username..."
              className="w-full bg-[#030304] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Role Filter (enabled on 'all' tab) */}
            {userTab === "all" && (
              <div className="flex items-center gap-1.5 bg-[#030304] border border-white/10 rounded-xl px-3 py-1.5 shadow-sm">
                <Shield size={12} className="text-white/40" />
                <span className="text-[10px] text-white/40 font-mono uppercase">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-[#030304] text-xs text-white focus:outline-none cursor-pointer border-none pr-1"
                >
                  <option value="all">All Roles ({totalCount})</option>
                  <option value="student">Students ({studentsCount})</option>
                  <option value="teacher">Teachers ({teachersCount})</option>
                  <option value="user">Normal Users ({normalCount})</option>
                  <option value="admin">Administrators ({adminsCount})</option>
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-[#030304] border border-white/10 rounded-xl px-3 py-1.5 shadow-sm">
              <Filter size={12} className="text-white/40" />
              <span className="text-[10px] text-white/40 font-mono uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#030304] text-xs text-white focus:outline-none cursor-pointer border-none pr-1"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-colors cursor-pointer"
                title="Clear all active filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter results status indicator */}
        <div className="flex items-center justify-between text-xs text-white/40 font-mono pt-2 border-t border-white/[0.03]">
          <div>
            Showing: <span className="text-white font-bold">{filteredUsers.length}</span> of {
              userTab === "students" ? studentsCount : userTab === "teachers" ? teachersCount : userTab === "normal" ? normalCount : userTab === "admins" ? adminsCount : totalCount
            } accounts
            {userTab === "students" && (
              <span className="ml-2 text-emerald-400 font-semibold">(Filter: Enrolled Students Only)</span>
            )}
            {userTab === "teachers" && (
              <span className="ml-2 text-amber-400 font-semibold">(Filter: Assigned Teachers Only)</span>
            )}
          </div>

          {isLoading && (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Syncing from database...
            </span>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/40 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/30 text-xs font-mono">
                    {users.length === 0
                      ? "No users registered yet."
                      : userTab === "students"
                      ? "No student accounts found."
                      : userTab === "teachers"
                      ? "No teacher accounts found."
                      : userTab === "normal"
                      ? "No normal user accounts found."
                      : userTab === "admins"
                      ? "No administrator accounts found."
                      : "No users match your criteria."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleKey = getUserRoleKey(u);
                  const isMasterAdmin = u.id === "admin-1" || roleKey === "admin";

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center font-mono shrink-0 ${
                            roleKey === "admin"
                              ? "bg-purple-500/10 border border-purple-500/25 text-purple-400"
                              : roleKey === "teacher"
                              ? "bg-amber-500/10 border border-amber-500/25 text-amber-400"
                              : roleKey === "student"
                              ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                              : "bg-blue-500/10 border border-blue-500/25 text-blue-400"
                          }`}>
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
                            title="Toggle user account status"
                          >
                            {u.status || "Active"}
                          </button>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                              u.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {u.status || "Active"}
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
                              Protected
                            </span>
                          ) : (
                            <button
                              onClick={() => openRoleModal(u)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/25 transition-all cursor-pointer font-sans text-[11px] font-bold"
                              title="Change user role"
                            >
                              <ArrowLeftRight size={12} />
                              <span>Change Role</span>
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
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowLeftRight size={18} className="text-emerald-400" />
                  <span>Change User Role</span>
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
                  <span className="text-white/40">User:</span>
                  <span className="text-white font-bold">{selectedUserForRole.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40">Email:</span>
                  <span className="text-white font-mono text-[11px]">{selectedUserForRole.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-white/[0.03]">
                  <span className="text-white/40">Current Role:</span>
                  <span className="text-emerald-400 font-bold capitalize">
                    {selectedUserForRole.roleName || selectedUserForRole.role}
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
                    Select New Role:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["User", "Student", "Teacher", "Administrator"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTargetRole(r)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          targetRole === r
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm"
                            : "bg-white/[0.02] text-white/50 border-white/5 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForRole(null)}
                    disabled={isSavingRole}
                    className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRole}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isSavingRole ? "Updating..." : "Save Role Change"}
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
              className="w-full max-w-md bg-[#090a0d] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-emerald-400" />
                  <span>Add New Account</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Full Name</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Email Address</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Phone (Optional)</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1.5 font-bold">Initial Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-[#121318] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="User">Standard User</option>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                  </select>
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
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-md shadow-emerald-500/20"
                  >
                    Create Account
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
