import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, Sparkles, Check, User, Phone, AlertCircle, X } from "lucide-react";
import { authApi } from "../lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (role: "user" | "admin" | "teacher", user?: any) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Sign Up Form States
  const [signupName, setSignupName] = useState("");
  const [signupFamily, setSignupFamily] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // General States
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Prevent background scrolling when open
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

  // Handle Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({
        email: loginEmail,
        password: loginPassword,
        rememberMe
      });

      setIsLoading(false);
      setIsSuccess(true);
      const user = res.data.user;
      const role = user.roleName.toLowerCase() === "administrator" ? "admin" : user.roleName.toLowerCase();
      setSuccessMessage(`Welcome back, ${user.name}!`);

      if (onLoginSuccess) {
        onLoginSuccess(role as any, user);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Invalid credentials. Please verify your email and password.");
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!signupName || !signupEmail || !signupPassword) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${signupName} ${signupFamily}`.trim();
      const res = await authApi.register({
        name: fullName,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        phone: signupPhone
      });

      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Account created successfully!");
      if (onLoginSuccess) {
        onLoginSuccess("user", res.data.user);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Registration failed. Please check your details.");
    }
  };

  const handleGoogleLogin = () => {
    // Real OAuth redirection
    window.location.href = "/api/auth/google";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[#08080c]/95 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden text-white my-8"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all cursor-pointer z-20"
            aria-label="Close login modal"
          >
            <X size={16} />
          </button>

          {/* Background radial spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] pointer-events-none blur-[100px] bg-gradient-to-b from-emerald-500/[0.05] via-teal-500/[0.02] to-transparent rounded-full z-0" />

          <div className="relative z-10 space-y-5">
            {/* Logo/Brandmark and Header */}
            <div className="text-center space-y-2 pb-1">
              <div className="flex justify-center">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] font-serif text-xl font-bold text-white shadow-inner cursor-pointer hover:border-emerald-500/40 hover:text-emerald-400 transition-all duration-300"
                  onClick={onClose}
                  role="button"
                >
                  R
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="font-sans text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Let's Start
                </h2>
                <p className="font-sans text-xs text-white/40 tracking-wide font-normal">
                  {activeTab === "login" 
                    ? "Welcome back. Sign in to your premium workspace." 
                    : "Create an account to join the elite network."}
                </p>
              </div>
            </div>

            {/* TAB CONTROLS */}
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="auth-container"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Segmented control tabs */}
                  <div className="flex p-1 bg-[#050508] border border-white/[0.06] rounded-2xl relative select-none">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("login");
                        setErrorMessage("");
                      }}
                      className={`flex-1 relative py-2 text-xs font-sans font-extrabold tracking-[0.15em] uppercase transition-colors duration-300 ${
                        activeTab === "login" ? "text-emerald-400" : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {activeTab === "login" && (
                        <motion.div
                          layoutId="modal-active-tab-highlight"
                          className="absolute inset-0 bg-white/[0.04] border border-white/5 rounded-xl shadow-inner"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("signup");
                        setErrorMessage("");
                      }}
                      className={`flex-1 relative py-2 text-xs font-sans font-extrabold tracking-[0.15em] uppercase transition-colors duration-300 ${
                        activeTab === "signup" ? "text-emerald-400" : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {activeTab === "signup" && (
                        <motion.div
                          layoutId="modal-active-tab-highlight"
                          className="absolute inset-0 bg-white/[0.04] border border-white/5 rounded-xl shadow-inner"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">Sign Up</span>
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === "login" ? (
                      /* LOGIN FORM */
                      <motion.form
                        key="login-form"
                        onSubmit={handleLoginSubmit}
                        className="space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Error Alert Display */}
                        <AnimatePresence>
                          {errorMessage && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              className="flex items-start gap-3 p-3 rounded-2xl border border-red-500/20 bg-red-500/[0.04] text-red-300"
                            >
                              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                              <div className="text-left">
                                <p className="font-sans text-xs font-semibold leading-relaxed">
                                  {errorMessage}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Email input field */}
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="modal-login-email" className="block font-sans text-xs font-semibold text-white/80 tracking-wide">
                            Email address
                          </label>
                          <input
                            id="modal-login-email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={loginEmail}
                            onChange={(e) => {
                              setLoginEmail(e.target.value);
                              setErrorMessage("");
                            }}
                            className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                          />
                        </div>

                        {/* Password input field */}
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="modal-login-password" className="block font-sans text-xs font-semibold text-white/80 tracking-wide">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              id="modal-login-password"
                              type={showLoginPassword ? "text" : "password"}
                              required
                              placeholder="••••••••"
                              value={loginPassword}
                              onChange={(e) => {
                                setLoginPassword(e.target.value);
                                setErrorMessage("");
                              }}
                              className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-emerald-500 rounded-xl pl-4 pr-11 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors focus:outline-none p-1 rounded"
                            >
                              {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        {/* Remember Me & Forgot Password Row */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none group text-white/70 hover:text-white transition-colors">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 rounded border ${rememberMe ? 'bg-emerald-600 border-emerald-600' : 'bg-[#0a0a0f] border-white/10 group-hover:border-white/20'} transition-all flex items-center justify-center`}>
                                {rememberMe && <Check size={10} className="text-white stroke-[3px]" />}
                              </div>
                            </div>
                            <span className="font-sans font-normal text-xs">Remember me</span>
                          </label>

                          <a
                            href="#forgot-password"
                            onClick={(e) => e.preventDefault()}
                            className="font-sans text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Forgot password?
                          </a>
                        </div>

                        {/* Primary SIGN IN Button */}
                        <div className="pt-2">
                          <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="relative w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs sm:text-sm tracking-[0.15em] uppercase shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
                          >
                            {isLoading ? (
                              <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                            ) : (
                              <span>Sign in</span>
                            )}
                          </motion.button>
                        </div>

                        {/* Divider */}
                        <div className="relative flex py-1.5 items-center">
                          <div className="flex-grow border-t border-white/[0.06]"></div>
                          <span className="flex-shrink mx-4 font-sans text-[9px] font-bold tracking-widest text-white/30 uppercase">
                            Or continue with
                          </span>
                          <div className="flex-grow border-t border-white/[0.06]"></div>
                        </div>

                        {/* Social Login Button: Continue with Google */}
                        <motion.button
                          type="button"
                          onClick={handleGoogleLogin}
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-white/10 bg-[#0a0a0f] text-white/80 hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300 font-sans text-xs sm:text-sm font-semibold tracking-wide"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                          <span>Continue with Google</span>
                        </motion.button>
                      </motion.form>
                    ) : (
                      /* SIGN UP FORM */
                      <motion.form
                        key="signup-form"
                        onSubmit={handleSignUpSubmit}
                        className="space-y-3.5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Name & Family */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1 text-left">
                            <label htmlFor="modal-signup-name" className="block font-sans text-xs font-semibold text-white/80 tracking-wide">
                              Name
                            </label>
                            <input
                              id="modal-signup-name"
                              type="text"
                              required
                              placeholder="John"
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label htmlFor="modal-signup-family" className="block font-sans text-xs font-semibold text-white/80 tracking-wide">
                              Family
                            </label>
                            <input
                              id="modal-signup-family"
                              type="text"
                              required
                              placeholder="Doe"
                              value={signupFamily}
                              onChange={(e) => setSignupFamily(e.target.value)}
                              className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                            />
                          </div>
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1 text-left">
                            <label htmlFor="modal-signup-phone" className="block font-sans text-xs font-semibold text-white/80 tracking-wide">
                              Phone
                            </label>
                            <input
                              id="modal-signup-phone"
                              type="tel"
                              required
                              placeholder="+1 (555) 000-0000"
                              value={signupPhone}
                              onChange={(e) => setSignupPhone(e.target.value)}
                              className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label htmlFor="modal-signup-email" className="block font-sans text-xs font-semibold text-white/80 tracking-wide">
                              Email
                            </label>
                            <input
                              id="modal-signup-email"
                              type="email"
                              required
                              placeholder="john.doe@example.com"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                            />
                          </div>
                        </div>

                        {/* Password & Confirm Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1 text-left">
                            <label htmlFor="modal-signup-password" className="block font-sans text-xs font-semibold text-white/80 tracking-wide">
                              Password
                            </label>
                            <div className="relative">
                              <input
                                id="modal-signup-password"
                                type={showSignupPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-emerald-500 rounded-xl pl-4 pr-10 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSignupPassword(!showSignupPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors focus:outline-none p-1 rounded"
                              >
                                {showSignupPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-left">
                            <label htmlFor="modal-signup-confirm-password" className="block font-sans text-xs font-semibold text-white/80 tracking-wide">
                              Confirm
                            </label>
                            <div className="relative">
                              <input
                                id="modal-signup-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={signupConfirmPassword}
                                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-emerald-500 rounded-xl pl-4 pr-10 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors focus:outline-none p-1 rounded"
                              >
                                {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Create Account Button */}
                        <div className="pt-1.5">
                          <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="relative w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs tracking-[0.15em] uppercase shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
                          >
                            {isLoading ? (
                              <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                            ) : (
                              <span>Create Account</span>
                            )}
                          </motion.button>
                        </div>

                        {/* Divider */}
                        <div className="relative flex py-1 items-center">
                          <div className="flex-grow border-t border-white/[0.06]"></div>
                          <span className="flex-shrink mx-4 font-sans text-[9px] font-bold tracking-widest text-white/30 uppercase">
                            Or continue with
                          </span>
                          <div className="flex-grow border-t border-white/[0.06]"></div>
                        </div>

                        {/* Google Login for Sign up */}
                        <motion.button
                          type="button"
                          onClick={handleGoogleLogin}
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl border border-white/10 bg-[#0a0a0f] text-white/80 hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300 font-sans text-xs sm:text-sm font-semibold tracking-wide"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                          <span>Continue with Google</span>
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="login-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center justify-center space-y-4 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Check size={28} className="stroke-[2.5]" />
                  </div>
                  <h3 className="font-sans text-xl font-bold text-white">{successMessage}</h3>
                  <p className="font-sans text-xs text-white/40 max-w-xs leading-relaxed">
                    Welcome to your dashboard. Preparing workspace...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
