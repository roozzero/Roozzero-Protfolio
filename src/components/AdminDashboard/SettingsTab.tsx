import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  ClipboardList, 
  Palette, 
  Shield, 
  Camera, 
  Trash2, 
  RefreshCw, 
  Lock, 
  Mail, 
  Phone, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Moon, 
  Sun, 
  Monitor, 
  Key, 
  Settings,
  Clock,
  Check
} from "lucide-react";
import { adminApi } from "../../lib/api";

interface AdminSettingsTabProps {
  profile: {
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    photo?: string;
    avatarUrl?: string;
    bio?: string;
    department?: string;
    theme?: string;
    titlePrefix?: string;
    specialization?: string;
    [key: string]: any;
  };
  onSaveProfile: (profile: any) => void;
  showCustomToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function SettingsTab({
  profile,
  onSaveProfile,
  showCustomToast,
}: AdminSettingsTabProps) {
  const [settingsActiveTab, setSettingsActiveTab] = useState<"Account" | "Profile" | "Appearance" | "Security">("Account");

  // Split name into first and last name
  const nameParts = (profile.name || "").split(" ");
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.slice(1).join(" ") || "";

  // Account State
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [username, setUsername] = useState(profile.username || "admin");
  const [email, setEmail] = useState(profile.email || "admin@roozzero.info");
  const [phone, setPhone] = useState((profile.phone || "").replace(/^\+98\s?/, ""));
  const [accountSubmittedErrors, setAccountSubmittedErrors] = useState<Record<string, string>>({});
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Profile State
  const [profilePic, setProfilePic] = useState<string>(profile.photo || profile.avatarUrl || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [department, setDepartment] = useState(profile.department || "LMS Administration");
  const [specialization, setSpecialization] = useState(profile.specialization || "Super Admin");
  const [titlePrefix, setTitlePrefix] = useState(profile.titlePrefix || "Mr.");
  const [dragOver, setDragOver] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSavingProfileData, setIsSavingProfileData] = useState(false);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Appearance State
  const [theme, setTheme] = useState<"dark" | "light" | "system">((profile.theme as any) || "dark");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Synchronize incoming profile changes
  useEffect(() => {
    if (profile) {
      const parts = (profile.name || "").split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setUsername(profile.username || "admin");
      setEmail(profile.email || "admin@roozzero.info");
      setPhone((profile.phone || "").replace(/^\+98\s?/, ""));
      setProfilePic(profile.photo || profile.avatarUrl || "");
      setBio(profile.bio || "");
      setDepartment(profile.department || "LMS Administration");
      setSpecialization(profile.specialization || "Super Admin");
      setTitlePrefix(profile.titlePrefix || "Mr.");
    }
  }, [profile]);

  // Load login history for security tab
  useEffect(() => {
    if (settingsActiveTab === "Security") {
      setIsLoadingHistory(true);
      adminApi.getLoginHistory()
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setLoginHistory(res.data.slice(0, 5));
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingHistory(false));
    }
  }, [settingsActiveTab]);

  // Handle Photo Upload
  const handlePhotoUpload = async (file: File) => {
    setPhotoError(null);
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setPhotoError("Only JPG, PNG, and WEBP formats are supported.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image size must be less than 2 MB.");
      return;
    }

    setIsPhotoUploading(true);
    setPhotoUploadProgress(20);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setPhotoUploadProgress(60);
      const res = await adminApi.uploadAvatar(formData);
      setPhotoUploadProgress(100);

      if (res.success && res.data?.avatarUrl) {
        const uploadedUrl = res.data.avatarUrl;
        setProfilePic(uploadedUrl);
        onSaveProfile({
          ...profile,
          photo: uploadedUrl,
          avatarUrl: uploadedUrl
        });
        showCustomToast("Profile photo updated and saved to database!", "success");
      } else {
        setPhotoError("Failed to upload photo. Please try again.");
      }
    } catch (err: any) {
      setPhotoError(err.message || "Failed to upload photo.");
    } finally {
      setIsPhotoUploading(false);
      setPhotoUploadProgress(0);
    }
  };

  // Handle Photo Remove
  const handleRemovePhoto = async () => {
    try {
      await adminApi.removeAvatar();
      setProfilePic("");
      onSaveProfile({
        ...profile,
        photo: null,
        avatarUrl: null
      });
      showCustomToast("Profile photo removed successfully.", "info");
    } catch (err: any) {
      showCustomToast(err.message || "Failed to remove photo.", "warning");
    }
  };

  // Handle Account Info Save
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";
    if (!username.trim()) errors.username = "Username is required.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = "Valid email address is required.";

    if (Object.keys(errors).length > 0) {
      setAccountSubmittedErrors(errors);
      return;
    }

    setAccountSubmittedErrors({});
    setIsSavingAccount(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const formattedPhone = phone.trim() ? `+98 ${phone.trim()}` : "";

    try {
      const res = await adminApi.updateProfile({
        name: fullName,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: formattedPhone
      });

      if (res.success) {
        onSaveProfile({
          ...profile,
          name: fullName,
          username: username.trim(),
          email: email.trim().toLowerCase(),
          phone: formattedPhone
        });
        showCustomToast("Account credentials updated and stored in database!", "success");
      }
    } catch (err: any) {
      showCustomToast(err.message || "Failed to update account information.", "warning");
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Handle Profile Metadata Save
  const handleSaveProfileMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfileData(true);

    try {
      const res = await adminApi.updateProfile({
        bio: bio.trim(),
        department: department.trim(),
        specialization: specialization.trim(),
        titlePrefix: titlePrefix.trim()
      });

      if (res.success) {
        onSaveProfile({
          ...profile,
          bio: bio.trim(),
          department: department.trim(),
          specialization: specialization.trim(),
          titlePrefix: titlePrefix.trim()
        });
        showCustomToast("Public administrator metadata updated in database!", "success");
      }
    } catch (err: any) {
      showCustomToast(err.message || "Failed to update profile metadata.", "warning");
    } finally {
      setIsSavingProfileData(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await adminApi.changePassword(currentPassword, newPassword);
      if (res.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showCustomToast("Password successfully changed and secured in database!", "success");
      }
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 w-full font-sans text-left" dir="ltr">
      
      {/* Settings Header (Matching Student Dashboard design language) */}
      <div className="space-y-1.5 text-left pb-2">
        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">
          System Administration Hub
        </span>
        <h2 className="font-sans text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="text-indigo-400" size={24} />
          <span>Administrator Settings</span>
        </h2>
        <p className="text-xs text-white/40 max-w-2xl leading-relaxed">
          Manage your authoritative administrator credentials, upload profile display photos, customize dashboard visual ergonomics, and review system access logs.
        </p>
      </div>

      {/* Sub-tab Navigation (Pixel-perfect match with Student Panel) */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-[#040407]/80 py-3 border-b border-white/[0.04] overflow-x-auto scrollbar-none flex items-center gap-1.5 transition-all">
        {[
          { id: "Account" as const, label: "Account", icon: User },
          { id: "Profile" as const, label: "Profile", icon: ClipboardList },
          { id: "Appearance" as const, label: "Appearance", icon: Palette },
          { id: "Security" as const, label: "Security", icon: Shield }
        ].map((tab) => {
          const isActive = settingsActiveTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSettingsActiveTab(tab.id)}
              className="relative px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer flex items-center gap-2"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeAdminSettingsTabIndicator"
                  className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <TabIcon size={14} className={`relative z-10 ${isActive ? "text-white" : "text-white/40"}`} />
              <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-white" : "text-white/40 hover:text-white/80"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={settingsActiveTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >

          {/* 1. ACCOUNT TAB */}
          {settingsActiveTab === "Account" && (
            <div className="max-w-3xl mx-auto bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left font-sans">
              <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
              
              <div className="border-b border-white/[0.05] pb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-sans text-base font-black text-white">Administrator Account Identifiers</h3>
                  <p className="text-xs text-white/40">Update your primary administrative contact and sign-in handle</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-full border border-indigo-500/10 font-mono">
                  Master Authority
                </span>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-5">
                
                {/* First & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full bg-white/[0.01] hover:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                        accountSubmittedErrors.firstName 
                          ? "border-rose-500/40 focus:border-rose-500" 
                          : "border-white/10 focus:border-indigo-500/50"
                      }`}
                      placeholder="Roozbeh"
                    />
                    {accountSubmittedErrors.firstName && (
                      <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {accountSubmittedErrors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full bg-white/[0.01] hover:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                        accountSubmittedErrors.lastName 
                          ? "border-rose-500/40 focus:border-rose-500" 
                          : "border-white/10 focus:border-indigo-500/50"
                      }`}
                      placeholder="Tavakoli"
                    />
                    {accountSubmittedErrors.lastName && (
                      <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {accountSubmittedErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Username Field */}
                <div className="space-y-2 bg-[#0c0c14]/50 border border-white/[0.03] p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Username Handle</label>
                    <span className="text-[9px] font-mono text-indigo-400 font-bold">@{(username || "admin").toLowerCase()}</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                    placeholder="admin"
                  />
                  {accountSubmittedErrors.username && (
                    <p className="text-[10px] text-rose-400 font-sans mt-1">⚠️ {accountSubmittedErrors.username}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-white/[0.01] hover:bg-white/[0.02] border rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none transition-all ${
                      accountSubmittedErrors.email 
                        ? "border-rose-500/40 focus:border-rose-500" 
                        : "border-white/10 focus:border-indigo-500/50"
                    }`}
                    placeholder="admin@roozzero.info"
                  />
                  {accountSubmittedErrors.email && (
                    <p className="text-[10px] text-rose-400 font-sans mt-1 animate-fade-in">⚠️ {accountSubmittedErrors.email}</p>
                  )}
                </div>

                {/* Phone Number Group (+98 Iran fixed) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Phone Number</label>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center bg-[#0c0c14] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white/80 font-sans h-11 shrink-0 select-none">
                      🇮🇷 +98 (Iran)
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all h-11"
                      placeholder="9123456789"
                    />
                  </div>
                </div>

                {/* Action Save Button */}
                <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
                  <p className="text-[11px] text-white/30">Changes are committed directly to authoritative MySQL storage.</p>
                  <button
                    type="submit"
                    disabled={isSavingAccount}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>{isSavingAccount ? "Saving..." : "Save Account"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. PROFILE TAB (Avatar Drag & Drop, Canvas Crop, Public Details) */}
          {settingsActiveTab === "Profile" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left items-start animate-fade-in font-sans">
              
              {/* Profile Photo Card */}
              <div className="xl:col-span-1 bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                
                <div className="border-b border-white/[0.05] pb-4">
                  <h3 className="font-sans text-sm font-black text-white">Administrator Photo</h3>
                  <p className="text-[10px] text-white/40 mt-0.5">Customize your verified avatar image</p>
                </div>

                {/* Avatar Display */}
                <div className="flex flex-col items-center justify-center space-y-5">
                  <div className="relative group">
                    <div className="h-32 w-32 rounded-full border-2 border-white/10 overflow-hidden bg-zinc-950 flex items-center justify-center relative shadow-inner">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="Administrator Avatar"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-3xl font-black font-sans">
                          {firstName.slice(0, 1).toUpperCase() || "A"}{lastName.slice(0, 1).toUpperCase() || "D"}
                        </div>
                      )}

                      {isPhotoUploading && (
                        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center space-y-2 z-10">
                          <RefreshCw size={20} className="animate-spin text-indigo-400" />
                          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${photoUploadProgress}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-white/80 uppercase">Uploading {photoUploadProgress}%</span>
                        </div>
                      )}
                    </div>

                    {profilePic && !isPhotoUploading && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -bottom-1 -right-1 p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full border border-rose-600/30 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                        title="Remove Photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Drag & Drop Upload Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        handlePhotoUpload(file);
                      }
                    }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".jpg,.jpeg,.png,.webp";
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePhotoUpload(file);
                        }
                      };
                      input.click();
                    }}
                    className={`w-full border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer text-center space-y-1.5 select-none ${
                      dragOver
                        ? "border-indigo-500 bg-indigo-500/[0.04]"
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.01]"
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-white/60">
                      <Camera size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-sans text-[11px] font-bold text-white/80">Drag and drop photo here</p>
                      <p className="font-sans text-[9px] text-white/40">JPG, PNG, WEBP • Max 2 MB</p>
                    </div>
                  </div>

                  {photoError && (
                    <p className="text-[10px] text-rose-400 text-center font-sans font-bold leading-normal bg-rose-500/[0.04] border border-rose-500/10 px-3 py-1.5 rounded-xl w-full">
                      ⚠️ {photoError}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio & Department Settings Card */}
              <div className="xl:col-span-2 bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
                
                <div className="border-b border-white/[0.05] pb-4">
                  <h3 className="font-sans text-base font-black text-white">Administrator Profile Metadata</h3>
                  <p className="text-xs text-white/40">Customize your public credentials and role identification in the academy</p>
                </div>

                <form onSubmit={handleSaveProfileMetadata} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                        placeholder="LMS Administration"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Specialization</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                        placeholder="Super Admin"
                      />
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">
                        Biography &amp; Notes
                      </label>
                      <span className={`text-[10px] font-mono font-bold ${bio.length >= 300 ? "text-rose-400" : "text-white/40"}`}>
                        {bio.length} / 300
                      </span>
                    </div>
                    
                    <textarea
                      ref={bioTextareaRef}
                      rows={4}
                      maxLength={300}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Brief administrative profile overview..."
                      className="w-full bg-white/[0.01] hover:bg-white/[0.02] focus:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-sans resize-none"
                    />
                  </div>

                  {/* Preview Card */}
                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase block mb-2">DIRECTORY PREVIEW CARD</span>
                    <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full border border-white/10 bg-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                        {profilePic ? (
                          <img 
                            src={profilePic} 
                            alt="Avatar" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-indigo-400">
                            {firstName.slice(0, 1).toUpperCase() || "A"}{lastName.slice(0, 1).toUpperCase() || "D"}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-xs font-black text-white">{firstName} {lastName}</span>
                          <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold uppercase">{specialization || "Super Admin"}</span>
                        </div>
                        <span className="text-[9px] font-mono text-white/40 block">@{username.toLowerCase()} • {department}</span>
                        <p className="text-[10px] text-white/50 leading-relaxed italic">
                          "{bio || "No biography provided yet."}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t border-white/[0.04] flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfileData}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      <Save size={14} />
                      <span>{isSavingProfileData ? "Saving..." : "Save Profile Details"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 3. APPEARANCE TAB */}
          {settingsActiveTab === "Appearance" && (
            <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 max-w-3xl mx-auto space-y-6 text-left shadow-2xl relative overflow-hidden font-sans animate-fade-in">
              <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
              
              <div className="border-b border-white/[0.05] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">Theme Engine</span>
                  <h3 className="font-sans text-base font-black text-white">Administrator Interface Aesthetics</h3>
                  <p className="text-xs text-white/40">Adjust background color accents and light/dark density modes</p>
                </div>
                <span className="text-[10px] self-start sm:self-center font-bold uppercase text-white/40 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
                  Visual Preferences
                </span>
              </div>

              {/* Theme Selection */}
              <div className="space-y-4 pt-2">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Visual Theme Selector</span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "dark" as const, label: "Dark Mode", icon: Moon },
                    { id: "light" as const, label: "Light Mode", icon: Sun },
                    { id: "system" as const, label: "System Sync", icon: Monitor }
                  ].map((item) => {
                    const isSel = theme === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setTheme(item.id);
                          showCustomToast(`Theme set to ${item.label}`, "info");
                        }}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-2.5 p-4 rounded-2xl border text-center sm:text-left transition-all cursor-pointer ${
                          isSel
                            ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/10 text-white"
                            : "bg-white/[0.01] hover:bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white/80"
                        }`}
                      >
                        <Icon size={16} className={isSel ? "text-white" : "text-white/60"} />
                        <span className="text-xs font-bold font-sans">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Density Mode */}
              <div className="space-y-4 pt-4 border-t border-white/[0.04]">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Dashboard Layout Density</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "comfortable" as const, label: "Comfortable (Standard)" },
                    { id: "compact" as const, label: "Compact (High Information Density)" }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDensity(d.id);
                        showCustomToast(`Layout density set to ${d.label}`, "info");
                      }}
                      className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        density === d.id
                          ? "bg-white/[0.05] border-indigo-500/40 text-white"
                          : "bg-white/[0.01] border-white/[0.05] text-white/50 hover:text-white"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. SECURITY TAB (Password Change with verification, 2FA, Login History) */}
          {settingsActiveTab === "Security" && (
            <div className="max-w-3xl mx-auto bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left font-sans animate-fade-in">
              <div className="absolute -right-20 -top-20 w-44 h-44 bg-indigo-500/[0.02] rounded-full blur-3xl" />
              
              <div className="border-b border-white/[0.05] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-sans text-base font-black text-white">Administrator Credential Security</h3>
                  <p className="text-xs text-white/40">Update master administrator password and inspect access history</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
                  Bcrypt Protected
                </span>
              </div>

              {passwordError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 pr-10 font-mono"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 pr-10 font-mono"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-sans">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 pr-10 font-mono"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Key size={14} />
                    <span>{isChangingPassword ? "Updating Password..." : "Update Password"}</span>
                  </button>
                </div>
              </form>

              {/* Two-Factor Authentication Switch */}
              <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-sans text-xs font-bold text-white">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[11px] text-white/40">Require a one-time verification challenge on administrative sign-in</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextState = !twoFactorEnabled;
                    setTwoFactorEnabled(nextState);
                    showCustomToast(nextState ? "Two-Factor authentication policy enabled." : "Two-Factor authentication disabled.", "info");
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    twoFactorEnabled ? "bg-indigo-600" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Recent Access History */}
              <div className="pt-6 border-t border-white/[0.04] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-sans">
                    Recent Administrative Sessions
                  </span>
                  <span className="text-[9px] font-mono text-white/30">From MySQL Audit Logs</span>
                </div>

                <div className="space-y-2">
                  {isLoadingHistory ? (
                    <div className="p-4 text-center text-white/30 text-xs font-mono">Loading sessions...</div>
                  ) : loginHistory.length === 0 ? (
                    <div className="p-4 text-center text-white/30 text-xs font-mono rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                      No previous security events recorded.
                    </div>
                  ) : (
                    loginHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between text-xs font-sans"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${item.status === "Success" ? "bg-emerald-400" : "bg-rose-400"}`} />
                          <span className="text-white font-medium">{item.user_agent || "Web Browser"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/40 font-mono text-[11px]">
                          <span>{item.ip_address || "127.0.0.1"}</span>
                          <span>•</span>
                          <span>{item.attempt_time ? new Date(item.attempt_time).toLocaleDateString() : "Recent"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
