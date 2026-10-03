import React, { useState } from "react";
import {
  User, Shield, Lock, Key, Edit3, Save, CheckCircle2, AlertCircle,
  LogOut, Home, Sparkles, BookOpen, Clock, Mail, Phone, Calendar
} from "lucide-react";
import { authApi } from "../lib/api";

interface NormalUserDashboardProps {
  currentUser?: any;
  onLogout: () => void;
  onGoHome: () => void;
  onProfileUpdated?: (updated: any) => void;
}

export default function NormalUserDashboard({
  currentUser,
  onLogout,
  onGoHome,
  onProfileUpdated
}: NormalUserDashboardProps) {
  const [profile, setProfile] = useState<any>(currentUser || null);
  const [activeTab, setActiveTab] = useState<"overview" | "edit-profile" | "security">("overview");

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editPhone, setEditPhone] = useState(currentUser?.phone || "");
  const [editBio, setEditBio] = useState(currentUser?.bio || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);
    setIsSavingProfile(true);

    try {
      const res = await authApi.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        bio: editBio.trim()
      });

      if (res.success && res.data?.user) {
        const updated = res.data.user;
        setProfile(updated);
        setProfileSuccessMsg("Profile information updated successfully.");
        if (onProfileUpdated) {
          onProfileUpdated(updated);
        }
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      } else {
        setProfileErrorMsg("Failed to update profile information.");
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || "Failed to communicate with the server.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (newPassword.length < 6) {
      setPasswordErrorMsg("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("Password confirmation does not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccessMsg("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccessMsg(null), 4000);
      } else {
        setPasswordErrorMsg(data?.error?.message || "Current password is incorrect.");
      }
    } catch (err: any) {
      setPasswordErrorMsg(err.message || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const displayName = profile?.name || "Standard User";
  const userInitial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#030304] text-white font-sans selection:bg-emerald-500 selection:text-black text-left" dir="ltr">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#060609]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{displayName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold">
                  Standard User
                </span>
              </div>
              <p className="text-[11px] text-white/40 font-mono mt-0.5">{profile?.email || ""}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white text-xs border border-white/5 transition-colors cursor-pointer"
            >
              <Home size={14} />
              <span>Back to Home</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/20 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome & Role Explanation Notice */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-emerald-400 font-bold">
              <Sparkles size={13} />
              <span>Active Account Portal</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Welcome to your account, {displayName}
            </h1>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed max-w-3xl pt-1">
              Your account is currently registered as a <strong className="text-blue-400">Standard User</strong>.
              Educational modules such as active course enrollments, interactive quizzes, assignments, and certificates are reserved for <strong className="text-emerald-400">Student</strong> and <strong className="text-amber-400">Teacher</strong> roles.
              Upon enrollment approval and role assignment by academy administrators, the full LMS features will appear in your portal.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-white/[0.08] text-white border border-white/10 shadow-sm"
                : "text-white/40 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <User size={14} />
            <span>Profile Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("edit-profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "edit-profile"
                ? "bg-white/[0.08] text-white border border-white/10 shadow-sm"
                : "text-white/40 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-white/[0.08] text-white border border-white/10 shadow-sm"
                : "text-white/40 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Key size={14} />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Tab 1: Account Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Identity Card */}
            <div className="md:col-span-1 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-2xl text-emerald-400 mx-auto">
                {userInitial}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{displayName}</h3>
                <p className="text-xs text-white/40 font-mono mt-0.5">@{profile?.username || "user"}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/40">System Role:</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                    Standard User
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40">Account Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {profile?.status || "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fields List */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Shield size={16} className="text-emerald-400" />
                <span>Registered Account Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-white/40 block">Full Name</span>
                  <span className="text-white font-bold block">{displayName}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-white/40 block">Email Address</span>
                  <span className="text-white font-mono text-[11px] block">{profile?.email || "-"}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-white/40 block">Phone Number</span>
                  <span className="text-white font-mono text-[11px] block">{profile?.phone || "Not provided"}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-white/40 block">Account Identifier</span>
                  <span className="text-white/60 font-mono text-[10px] block">{profile?.id || "-"}</span>
                </div>
              </div>

              {profile?.bio && (
                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1 text-xs">
                  <span className="text-[11px] text-white/40 block">About / Biography</span>
                  <p className="text-white/80 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              <div className="pt-3">
                <button
                  onClick={() => setActiveTab("edit-profile")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20 transition-all cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Edit Profile Form */}
        {activeTab === "edit-profile" && (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md max-w-2xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <Edit3 size={16} className="text-emerald-400" />
              <span>Update Profile Information</span>
            </h3>

            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-white/70 block mb-1.5 font-bold">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1.5 font-bold">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 font-mono"
                  placeholder="+1 555-0199"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1.5 font-bold">Biography (Brief Summary)</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                  placeholder="Tell us a little about your background and interests..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSavingProfile ? "Saving Changes..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === "security" && (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md max-w-xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <Key size={16} className="text-indigo-400" />
              <span>Change Account Password</span>
            </h3>

            {passwordSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="text-white/70 block mb-1.5 font-bold">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1.5 font-bold">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1.5 font-bold">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Key size={14} />
                  <span>{isChangingPassword ? "Updating Password..." : "Change Password"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
