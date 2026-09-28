import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, Shield, Save, Key, Camera } from "lucide-react";

interface AdminSettingsTabProps {
  profile: {
    name: string;
    email: string;
    phone: string;
    photo?: string;
    bio?: string;
    department?: string;
    theme?: string;
    titlePrefix?: string;
    specialization?: string;
    [key: string]: any;
  };
  onSaveProfile: (profile: any) => void;
  showCustomToast: (msg: string) => void;
}

export default function SettingsTab({
  profile,
  onSaveProfile,
  showCustomToast,
}: AdminSettingsTabProps) {
  const [formData, setFormData] = useState({ ...profile });

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    showCustomToast("Admin profile updated successfully.");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
          Administrator Profile &amp; Preferences
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar and Info Header */}
          <div className="flex items-center gap-5 pb-5 border-b border-white/[0.04]">
            <div className="relative">
              <img
                src={formData.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-black rounded-lg">
                <Camera size={12} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{formData.name}</h4>
              <p className="text-xs font-mono text-emerald-400">{formData.specialization || "Super Admin"}</p>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">{formData.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-white/50 block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/50 block mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/50 block mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/50 block mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-white/50 block mb-1">Bio &amp; Notes</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
