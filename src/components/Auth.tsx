"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

interface AuthProps {
  onComplete: () => void;
}

const backgroundOrbs = [
  { width: "250px", height: "300px", left: "10%", top: "20%", bg: "hsl(260, 70%, 60%)" },
  { width: "320px", height: "320px", left: "50%", top: "10%", bg: "hsl(290, 70%, 60%)" },
  { width: "200px", height: "200px", left: "70%", top: "60%", bg: "hsl(320, 70%, 60%)" },
  { width: "280px", height: "280px", left: "20%", top: "80%", bg: "hsl(350, 70%, 60%)" },
  { width: "300px", height: "250px", left: "80%", top: "30%", bg: "hsl(280, 70%, 60%)" },
];

export default function Auth({ onComplete }: AuthProps) {
  const { setUser } = useAppStore();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth
    await new Promise((r) => setTimeout(r, 1200));

    const newUser = {
      id: `user_${Date.now()}`,
      name: formData.name || formData.email.split("@")[0],
      email: formData.email,
      age: 0,
      gender: "male",
      height: 0,
      weight: 0,
      fitnessGoal: "",
      studyGoal: "",
      availableTime: 2,
      sleepSchedule: "11pm-7am",
      targetDeadline: "6 months",
      level: 1,
      xp: 0,
      coins: 500,
      streak: 0,
      joinedAt: new Date().toISOString(),
      onboardingComplete: false,
      theme: "dark" as const,
    };

    setUser(newUser);
    setLoading(false);
    onComplete();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const googleUser = {
      id: `user_google_${Date.now()}`,
      name: "Alex Johnson",
      email: "alex@gmail.com",
      age: 0,
      gender: "male",
      height: 0,
      weight: 0,
      fitnessGoal: "",
      studyGoal: "",
      availableTime: 2,
      sleepSchedule: "11pm-7am",
      targetDeadline: "6 months",
      level: 1,
      xp: 0,
      coins: 500,
      streak: 0,
      joinedAt: new Date().toISOString(),
      onboardingComplete: false,
      theme: "dark" as const,
    };

    setUser(googleUser);
    setLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        {backgroundOrbs.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl opacity-10"
            style={{
              width: orb.width,
              height: orb.height,
              left: orb.left,
              top: orb.top,
              background: orb.bg,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-3xl gradient-ascend flex items-center justify-center text-3xl shadow-2xl animate-pulse-glow"
          >
            ⚡
          </motion.div>
          <h1 className="text-3xl font-black text-gradient mb-1">Ascend AI</h1>
          <p className="text-sm text-gray-400">Level up your real life character</p>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-3xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl">
            {["login", "signup"].map((m) => (
              <motion.button
                key={m}
                onClick={() => setMode(m as "login" | "signup")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  mode === m
                    ? "gradient-purple text-white shadow-lg"
                    : "text-gray-400"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {m}
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <label className="text-xs text-gray-400 font-medium block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  required={mode === "signup"}
                />
              </motion.div>
            )}

            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, password: e.target.value }))
                    }
                    required
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </button>
            )}

            {mode === "forgot" && (
              <p className="text-xs text-gray-400">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "forgot" ? "Send Reset Link" : mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </motion.button>

          {/* Back to login */}
          {mode === "forgot" && (
            <button
              onClick={() => setMode("login")}
              className="w-full text-center text-xs text-purple-400 mt-4"
            >
              ← Back to Login
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
