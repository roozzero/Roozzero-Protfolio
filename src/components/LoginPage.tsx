import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, Check, User, Phone, AlertCircle } from "lucide-react";

interface LoginPageProps {
  onBack?: () => void;
  onLoginSuccess?: (role: "user" | "admin" | "teacher") => void;
}

export default function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (loginEmail && loginPassword) {
      setIsLoading(true);
      // Simulate realistic login experience with 1-2 seconds loading
      setTimeout(() => {
        const trimmedEmail = loginEmail.trim().toLowerCase();
        if (trimmedEmail === "user@roozzero.dev" && loginPassword === "Roozzero@123") {
          setIsLoading(false);
          setSuccessMessage("Successfully Authenticated");
          setIsSuccess(true);
          if (onLoginSuccess) {
            onLoginSuccess("user");
          }
          setTimeout(() => {
            if (onBack) onBack();
          }, 1500);
        } else if (trimmedEmail === "teacher@academy.local" && loginPassword === "Teacher@123") {
          setIsLoading(false);
          setSuccessMessage("Teacher Workspace Authorized");
          setIsSuccess(true);
          if (onLoginSuccess) {
            onLoginSuccess("teacher");
          }
          setTimeout(() => {
            if (onBack) onBack();
          }, 1500);
        } else if (trimmedEmail === "admin@roozzero.dev" && loginPassword === "Admin123!") {
          setIsLoading(false);
          setSuccessMessage("Admin Access Granted");
          setIsSuccess(true);
          if (onLoginSuccess) {
            onLoginSuccess("admin");
          }
          setTimeout(() => {
            if (onBack) onBack();
          }, 1500);
        } else {
          setIsLoading(false);
          setErrorMessage("Invalid email or password. Please use the development demo credentials.");
        }
      }, 1200);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      signupName &&
      signupFamily &&
      signupPhone &&
      signupEmail &&
      signupPassword &&
      signupConfirmPassword
    ) {
      if (signupPassword !== signupConfirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      setIsLoading(true);
      // Simulate premium sign up transition
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage("Account Created Successfully");
        setIsSuccess(true);
        if (onLoginSuccess) {
          onLoginSuccess("user");
        }
        setTimeout(() => {
          if (onBack) onBack();
        }, 1500);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030304] relative flex flex-col items-center justify-center px-4 py-16 overflow-hidden text-white">
      {/* Background radial spotlights to match premium aesthetic */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none blur-[180px] bg-gradient-to-tr from-emerald-500/[0.04] via-emerald-600/[0.02] to-teal-500/[0.02] rounded-full z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[300px] pointer-events-none blur-[150px] bg-gradient-to-tr from-[#10b981]/[0.03] to-emerald-800/[0.02] rounded-full z-0" />

      {/* Decorative Back to Website button floating in top-left */}
      <div className="absolute top-6 left-6 z-20">
        <motion.button
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white/70 hover:text-white transition-all font-sans text-[10px] font-semibold tracking-widest uppercase"
        >
          <ArrowLeft size={12} />
          <span>Back to Home</span>
        </motion.button>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto space-y-6">
        
        {/* HEADER: Centered Logo and Heading with Premium Animations */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            {/* The elegant capital R brandmark matching the navbar */}
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] font-serif text-2xl font-bold text-white shadow-inner cursor-pointer hover:border-white/20 transition-all duration-300"
              onClick={onBack}
              role="button"
            >
              R
            </div>
          </motion.div>

          <div className="space-y-1.5">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-3xl sm:text-4xl font-black text-white tracking-tight"
            >
              Let's Start
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-xs sm:text-sm text-white/40 tracking-wide font-normal"
            >
              {activeTab === "login" 
                ? "Welcome back. Sign in to your premium workspace." 
                : "Create an account to join the elite network."}
            </motion.p>
          </div>
        </div>

        {/* AUTHENTICATION CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-[#08080c]/90 backdrop-blur-md border border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:border-white/[0.09] transition-all duration-500"
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="auth-container"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Segmented control tabs */}
                <div className="flex p-1 bg-[#050508] border border-white/[0.06] rounded-2xl relative select-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 relative py-2.5 text-xs font-sans font-extrabold tracking-[0.15em] uppercase transition-colors duration-300 ${
                      activeTab === "login" ? "text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {activeTab === "login" && (
                      <motion.div
                        layoutId="active-tab-highlight"
                        className="absolute inset-0 bg-white/[0.04] border border-white/5 rounded-xl shadow-inner"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className={`flex-1 relative py-2.5 text-xs font-sans font-extrabold tracking-[0.15em] uppercase transition-colors duration-300 ${
                      activeTab === "signup" ? "text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {activeTab === "signup" && (
                      <motion.div
                        layoutId="active-tab-highlight"
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
                      className="space-y-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Demo User Info Helper Badge */}
                      <div className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] transition-all duration-300 text-left space-y-2.5">
                        <div className="flex items-center gap-1.5 border-b border-white/[0.03] pb-1.5">
                          <Sparkles size={12} className="text-emerald-400 animate-pulse" />
                          <span className="font-sans text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                            Development Demo Accounts
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-white/60 font-semibold">User Account</span>
                            <span className="text-[9px] text-white/30 font-mono mt-0.5">user@roozzero.dev / Roozzero@123</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginEmail("user@roozzero.dev");
                              setLoginPassword("Roozzero@123");
                              setErrorMessage("");
                            }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-all underline decoration-dotted self-start sm:self-center cursor-pointer"
                          >
                            Auto-fill User
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/[0.03] pt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-indigo-400 font-semibold">Teacher Account</span>
                            <span className="text-[9px] text-white/30 font-mono mt-0.5">teacher@academy.local / Teacher@123</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginEmail("teacher@academy.local");
                              setLoginPassword("Teacher@123");
                              setErrorMessage("");
                            }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-all underline decoration-dotted self-start sm:self-center cursor-pointer"
                          >
                            Auto-fill Teacher
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/[0.03] pt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-indigo-400 font-semibold">Admin Account</span>
                            <span className="text-[9px] text-white/30 font-mono mt-0.5">admin@roozzero.dev / Admin123!</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginEmail("admin@roozzero.dev");
                              setLoginPassword("Admin123!");
                              setErrorMessage("");
                            }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-all underline decoration-dotted self-start sm:self-center cursor-pointer"
                          >
                            Auto-fill Admin
                          </button>
                        </div>
                      </div>

                      {/* Error Alert Display */}
                      <AnimatePresence>
                        {errorMessage && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="flex items-start gap-3 p-3.5 rounded-2xl border border-red-500/20 bg-red-500/[0.04] text-red-300"
                          >
                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                            <div className="text-left">
                              <p className="font-sans text-xs font-semibold leading-relaxed">
                                {errorMessage}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Email input field */}
                      <div className="space-y-2 text-left">
                        <label htmlFor="login-email" className="block font-sans text-xs sm:text-sm font-semibold text-white/80 tracking-wide">
                          Email address
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            setErrorMessage("");
                          }}
                          className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                        />
                      </div>

                      {/* Password input field */}
                      <div className="space-y-2 text-left">
                        <label htmlFor="login-password" className="block font-sans text-xs sm:text-sm font-semibold text-white/80 tracking-wide">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => {
                              setLoginPassword(e.target.value);
                              setErrorMessage("");
                            }}
                            className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors focus:outline-none p-1 rounded"
                          >
                            {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me & Forgot Password Row */}
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none group text-white/70 hover:text-white transition-colors">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-4.5 h-4.5 rounded border ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-[#0a0a0f] border-white/10 group-hover:border-white/20'} transition-all flex items-center justify-center`}>
                              {rememberMe && <Check size={11} className="text-white stroke-[3px]" />}
                            </div>
                          </div>
                          <span className="font-sans font-normal text-xs sm:text-sm">Remember me</span>
                        </label>

                        <a
                          href="#forgot-password"
                          onClick={(e) => e.preventDefault()}
                          className="font-sans text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
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
                          className="relative w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs sm:text-sm tracking-[0.15em] uppercase shadow-[0_4px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.4)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
                        >
                          {isLoading ? (
                            <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                          ) : (
                            <span>Sign in</span>
                          )}
                        </motion.button>
                      </div>

                      {/* Divider */}
                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/[0.06]"></div>
                        <span className="flex-shrink mx-4 font-sans text-[10px] font-bold tracking-widest text-white/30 uppercase">
                          Or continue with
                        </span>
                        <div className="flex-grow border-t border-white/[0.06]"></div>
                      </div>

                      {/* Social Login Button: Continue with Google */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 bg-[#0a0a0f] text-white/80 hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300 font-sans text-xs sm:text-sm font-semibold tracking-wide"
                      >
                        {/* Google SVG G-logo */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
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
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Name & Family input fields (2-Column Grid on bigger screens, stack on mobile) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="signup-name" className="block font-sans text-xs sm:text-sm font-semibold text-white/80 tracking-wide">
                            Name
                          </label>
                          <input
                            id="signup-name"
                            type="text"
                            required
                            placeholder="John"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="signup-family" className="block font-sans text-xs sm:text-sm font-semibold text-white/80 tracking-wide">
                            Family
                          </label>
                          <input
                            id="signup-family"
                            type="text"
                            required
                            placeholder="Doe"
                            value={signupFamily}
                            onChange={(e) => setSignupFamily(e.target.value)}
                            className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                          />
                        </div>
                      </div>

                      {/* Phone & Email input fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="signup-phone" className="block font-sans text-xs sm:text-sm font-semibold text-white/80 tracking-wide">
                            Phone
                          </label>
                          <input
                            id="signup-phone"
                            type="tel"
                            required
                            placeholder="+1 (555) 000-0000"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="signup-email" className="block font-sans text-xs sm:text-sm font-semibold text-white/80 tracking-wide">
                            Email
                          </label>
                          <input
                            id="signup-email"
                            type="email"
                            required
                            placeholder="john.doe@example.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                          />
                        </div>
                      </div>

                      {/* Password & Confirm Password input fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="signup-password" className="block font-sans text-xs sm:text-sm font-semibold text-white/80 tracking-wide">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              id="signup-password"
                              type={showSignupPassword ? "text" : "password"}
                              required
                              placeholder="••••••••"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors focus:outline-none p-1 rounded"
                            >
                              {showSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="signup-confirm-password" className="block font-sans text-xs sm:text-sm font-semibold text-white/80 tracking-wide">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              id="signup-confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              placeholder="••••••••"
                              value={signupConfirmPassword}
                              onChange={(e) => setSignupConfirmPassword(e.target.value)}
                              className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-sans font-normal"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors focus:outline-none p-1 rounded"
                            >
                              {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Create Account Button */}
                      <div className="pt-2">
                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="relative w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs sm:text-sm tracking-[0.15em] uppercase shadow-[0_4px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.4)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
                        >
                          {isLoading ? (
                            <div className="h-4 w-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                          ) : (
                            <span>Create Account</span>
                          )}
                        </motion.button>
                      </div>

                      {/* Divider */}
                      <div className="relative flex py-1.5 items-center">
                        <div className="flex-grow border-t border-white/[0.06]"></div>
                        <span className="flex-shrink mx-4 font-sans text-[10px] font-bold tracking-widest text-white/30 uppercase">
                          Or continue with
                        </span>
                        <div className="flex-grow border-t border-white/[0.06]"></div>
                      </div>

                      {/* Social Login Button: Continue with Google */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-white/10 bg-[#0a0a0f] text-white/80 hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300 font-sans text-xs sm:text-sm font-semibold tracking-wide"
                      >
                        {/* Google SVG G-logo */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
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
                  Welcome to the workspace. Redirecting you back to the showcase dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
