import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import Logo from "./Logo";

interface AuthWallProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

type AuthMode = "login" | "register";

export default function AuthWall({ onLoginSuccess }: AuthWallProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Load last-used Gmail for auto-fill on mount
  useEffect(() => {
    const savedGmail = localStorage.getItem("nomi_last_gmail");
    if (savedGmail) {
      setEmail(savedGmail);
    }
  }, []);

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
    // Keep email if autofilled/entered, reset password and name
    setPassword("");
    if (newMode === "register") {
      setName("");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate email has "@"
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("Full Name is required.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" 
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Please try again.");
      }

      // Save email for next auto-fill
      localStorage.setItem("nomi_last_gmail", email.trim());

      setSuccess(data.message || "Success! Redirecting...");

      // Store general user session (valid for 2 days on backend side, stored here locally too)
      if (data.session) {
        localStorage.setItem("nomi_user_session", JSON.stringify({
          user: data.user,
          token: data.session
        }));
      }

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(data.user);
      }, 1200);

    } catch (err: any) {
      setError(err.message || "An error occurred. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center p-4 relative overflow-hidden selection:bg-purple-100 selection:text-purple-900 font-sans">
      
      {/* Decorative gradient accents (Subtle, professional) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00A86B]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#7C3AED]/10 blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-white border border-slate-150/80 p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10"
      >
        {/* NOMI COMPUTERS Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="scale-110 mb-3.5 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-[22px] font-black tracking-tight text-slate-900 flex items-center justify-center gap-1">
            NOMI <span className="text-[#00A86B]">COMPUTERS</span>
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            {mode === "login" ? "Sign In to Your Workspace" : "Create New User Account"}
          </p>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs font-bold shadow-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs font-bold shadow-sm"
            >
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {/* Full Name (Only on register mode) */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#7C3AED] focus:bg-white rounded-xl text-sm font-semibold placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Gmail Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider pl-1">Gmail Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Gmail"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#00A86B] focus:bg-white rounded-xl text-sm font-semibold placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-emerald-50 text-slate-800"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#7C3AED] focus:bg-white rounded-xl text-sm font-semibold placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-slate-800"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00A86B] to-[#7C3AED] hover:opacity-95 text-white font-black text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-6 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin stroke-[3px]" />
            ) : (
              <>
                <span className="uppercase tracking-wider">{mode === "login" ? "LOGIN" : "REGISTER"}</span>
                <ArrowRight className="h-4 w-4 stroke-[3.5px]" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switch Footer Link */}
        <div className="mt-8 pt-5 border-t border-slate-100 text-center">
          {mode === "login" ? (
            <p className="text-xs font-bold text-slate-500">
              New user?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("register")}
                className="text-[#7C3AED] hover:text-[#00A86B] hover:underline font-extrabold cursor-pointer transition-colors"
              >
                Register
              </button>
            </p>
          ) : (
            <p className="text-xs font-bold text-slate-500">
              Already user?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
                className="text-[#00A86B] hover:text-[#7C3AED] hover:underline font-extrabold cursor-pointer transition-colors"
              >
                Login
              </button>
            </p>
          )}
        </div>

      </motion.div>
    </div>
  );
}
