import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, Key, Lock, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { AdminUser } from "./types";
import { Student } from "../../types/teacher";

interface SecurityTabProps {
  users: AdminUser[];
  students: Student[];
  showCustomToast: (msg: string) => void;
}

export default function SecurityTab({
  users,
  students,
  showCustomToast,
}: SecurityTabProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [enforcePasswordPolicy, setEnforcePasswordPolicy] = useState(true);

  const handleSaveSecurity = () => {
    showCustomToast("Security policies updated successfully.");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            System Security &amp; Access Controls
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Configure authentication thresholds, session expiration rules, and credentials policies.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-white/[0.04]">
          {/* 2FA */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</h4>
              <p className="text-[11px] text-white/40 font-mono">Require authenticator codes for all administrator logins</p>
            </div>
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
            />
          </div>

          {/* Session Timeout */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-xs font-bold text-white">Idle Session Timeout</h4>
              <p className="text-[11px] text-white/40 font-mono">Automatically log out inactive administrator sessions</p>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="120">2 Hours</option>
            </select>
          </div>

          {/* Password Policy */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-xs font-bold text-white">Strict Password Complexity</h4>
              <p className="text-[11px] text-white/40 font-mono">Enforce minimum 10 characters with numbers and special symbols</p>
            </div>
            <input
              type="checkbox"
              checked={enforcePasswordPolicy}
              onChange={(e) => setEnforcePasswordPolicy(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/[0.04]">
          <button
            onClick={handleSaveSecurity}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Shield size={14} />
            <span>Apply Security Rules</span>
          </button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          <p className="text-[10px] font-mono text-white/40 uppercase">Total User Accounts</p>
          <p className="text-2xl font-bold text-white mt-1">{users.length + students.length}</p>
          <span className="text-[10px] text-emerald-400 font-mono">All encrypted</span>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          <p className="text-[10px] font-mono text-white/40 uppercase">Failed Login Attempts</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">0</p>
          <span className="text-[10px] text-white/40 font-mono">Past 24 hours</span>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          <p className="text-[10px] font-mono text-white/40 uppercase">Firewall Status</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">Active</p>
          <span className="text-[10px] text-white/40 font-mono">TLS 1.3 / Strict CORS</span>
        </div>
      </div>
    </div>
  );
}
