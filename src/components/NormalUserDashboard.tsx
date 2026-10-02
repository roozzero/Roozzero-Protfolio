import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Mail, Phone, Shield, ArrowRight, LogOut, Home, 
  Settings, Key, CheckCircle2, AlertCircle, Edit3, Save, X, Sparkles, Clock
} from "lucide-react";
import { authApi } from "../lib/api";

interface NormalUserDashboardProps {
  currentUser?: any;
  onLogout: () => void;
  onGoHome: () => void;
  onProfileUpdated?: (updatedUser: any) => void;
}

export default function NormalUserDashboard({
  currentUser,
  onLogout,
  onGoHome,
  onProfileUpdated
}: NormalUserDashboardProps) {
  const [profile, setProfile] = useState<any>(currentUser || null);
  const [isLoading, setIsLoading] = useState(!currentUser);
  const [activeTab, setActiveTab] = useState<"overview" | "edit-profile" | "security">("overview");

  // Edit profile form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Load real authenticated user data on mount
  useEffect(() => {
    let isMounted = true;
    authApi.getMe()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.user) {
          const u = res.data.user;
          setProfile(u);
          setEditName(u.name || "");
          setEditPhone(u.phone || "");
          setEditBio(u.bio || "");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user profile:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

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
        setProfileSuccessMsg("اطلاعات حساب کاربری با موفقیت به‌روزرسانی شد.");
        if (onProfileUpdated) {
          onProfileUpdated(updated);
        }
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      } else {
        setProfileErrorMsg("خطا در ذخیره‌سازی اطلاعات حساب.");
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || "خطا در برقراری ارتباط با سرور.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (newPassword.length < 6) {
      setPasswordErrorMsg("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("تکرار رمز عبور جدید مطابقت ندارد.");
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
        setPasswordSuccessMsg("رمز عبور با موفقیت تغییر یافت.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccessMsg(null), 4000);
      } else {
        setPasswordErrorMsg(data?.error?.message || "رمز عبور فعلی نادرست است.");
      }
    } catch (err: any) {
      setPasswordErrorMsg(err.message || "خطا در تغییر رمز عبور.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const displayName = profile?.name || "کاربر گرامی";
  const userInitial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#030304] text-white font-sans selection:bg-emerald-500 selection:text-black" dir="rtl">
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
                  کاربر عادی
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
              <span>صفحه اصلی</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/20 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome & Role Explanation Notice */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-emerald-400 font-bold">
              <Sparkles size={13} />
              <span>حساب کاربری فعال</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              به حساب کاربری خود خوش آمدید، {displayName}
            </h1>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed max-w-3xl pt-1">
              حساب شما در حال حاضر به‌عنوان <strong className="text-blue-400">کاربر عادی</strong> فعال است.
              بخش‌های آموزشی از قبیل دوره‌ها، تمرین‌ها، نمرات و گواهینامه‌ها مختص نقش‌های <strong className="text-emerald-400">دانشجو</strong> و <strong className="text-amber-400">استاد</strong> می‌باشند.
              به محض تایید و ارتقای حساب شما توسط مدیر آکادمی، دسترسی‌های آموزشی مربوطه در داشبورد شما فعال خواهند شد.
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
            <span>مشخصات حساب</span>
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
            <span>ویرایش مشخصات</span>
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
            <span>امنیت و رمز عبور</span>
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

              <div className="pt-3 border-t border-white/[0.04] space-y-2 text-xs text-right">
                <div className="flex justify-between items-center">
                  <span className="text-white/40">نقش سیستم:</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                    کاربر عادی (User)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40">وضعیت حساب:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {profile?.status === "Active" ? "فعال" : profile?.status || "فعال"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fields List */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Shield size={16} className="text-emerald-400" />
                <span>اطلاعات ثبت‌شده در آکادمی</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-white/40 block">نام و نام خانوادگی</span>
                  <span className="text-white font-bold block">{displayName}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-white/40 block">آدرس ایمیل</span>
                  <span className="text-white font-mono text-[11px] block">{profile?.email || "-"}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-white/40 block">شماره تلفن همراه</span>
                  <span className="text-white font-mono text-[11px] block">{profile?.phone || "ثبت نشده"}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-white/40 block">شناسه کاربری</span>
                  <span className="text-white/60 font-mono text-[10px] block">{profile?.id || "-"}</span>
                </div>
              </div>

              {profile?.bio && (
                <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1 text-xs">
                  <span className="text-[11px] text-white/40 block">درباره کاربر</span>
                  <p className="text-white/80 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              <div className="pt-3">
                <button
                  onClick={() => setActiveTab("edit-profile")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20 transition-all cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>ویرایش مشخصات</span>
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
              <span>ویرایش مشخصات فردی</span>
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
                <label className="text-white/70 block mb-1.5 font-bold">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  placeholder="مثال: علی رضایی"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1.5 font-bold">شماره تماس (اختیاری)</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 font-mono"
                  placeholder="09123456789"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1.5 font-bold">درباره کاربر (بیوگرافی مختصر)</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                  placeholder="توضیحات مختصر در مورد خودتان..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSavingProfile ? "در حال ذخیره..." : "ذخیره تغییرات"}</span>
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
              <span>تغییر رمز عبور حساب</span>
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
                <label className="text-white/70 block mb-1.5 font-bold">رمز عبور فعلی</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                  placeholder="رمز عبور فعلی خود را وارد کنید"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1.5 font-bold">رمز عبور جدید</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                  placeholder="حداقل ۶ کاراکتر"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1.5 font-bold">تکرار رمز عبور جدید</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                  placeholder="تکرار رمز عبور جدید را وارد کنید"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Key size={14} />
                  <span>{isChangingPassword ? "در حال ثبت..." : "تغییر رمز عبور"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
