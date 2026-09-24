import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, UserPlus, Search, Shield, Filter, MoreVertical, Key,
  Trash2, CheckCircle2, XCircle, Mail, Phone, Calendar, UserCheck
} from "lucide-react";
import { AdminUser } from "./types";
import { Student, Course } from "../../types/teacher";

interface UsersTabProps {
  users: AdminUser[];
  students: Student[];
  courses: Course[];
  activeSubTab?: string;
  onAddUser: (user: Partial<AdminUser>) => void;
  onUpdateUserStatus: (id: string, status: string) => void;
  onResetPassword: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onAddStudent: (student: Partial<Student>) => void;
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
}: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<"student" | "teacher" | "admin">("student");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newId = `usr-${Date.now()}`;
    onAddUser({
      id: newId,
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone || "+1 (555) 000-0000",
      role: newUserRole,
      status: "Active",
      joinedDate: new Date().toISOString().split("T")[0],
      lastLogin: "Never",
    });

    if (newUserRole === "student") {
      onAddStudent({
        id: `stu-${Date.now()}`,
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone || "+1 (555) 000-0000",
        courseId: courses[0]?.id || "react-adv",
        courseTitle: courses[0]?.title || "General Intake",
        progress: 0,
        attendance: 100,
        avgGrade: 100,
        status: "Active",
        joinedDate: new Date().toISOString().split("T")[0],
      });
    }

    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Roles</option>
            <option value="super-admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <UserPlus size={14} />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/40 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center font-mono">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-white/40 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        u.role === "super-admin"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : u.role === "admin"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : u.role === "teacher"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-white/60">
                    {u.phone}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() =>
                        onUpdateUserStatus(u.id, u.status === "Active" ? "Suspended" : "Active")
                      }
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                        u.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-white/40">
                    {u.joinedDate || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onResetPassword(u.id)}
                        className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-emerald-500/10 text-white/60 hover:text-emerald-400 border border-white/5 transition-all cursor-pointer"
                        title="Reset Credentials"
                      >
                        <Key size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-red-500/10 text-white/60 hover:text-red-400 border border-white/5 transition-all cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              <h3 className="text-base font-bold text-white">Create New User Account</h3>

              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="alex@academy.local"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1">
                    Account Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
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
