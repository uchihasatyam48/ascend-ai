"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { ChevronRight, Sparkles, Target, Clock, Moon, User } from "lucide-react";

const steps = [
  { id: 0, title: "Personal Info", icon: User },
  { id: 1, title: "Your Goals", icon: Target },
  { id: 2, title: "Your Schedule", icon: Clock },
  { id: 3, title: "AI Roadmap", icon: Sparkles },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user, updateUser } = useAppStore();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    fitnessGoal: "",
    studyGoal: "",
    availableTime: "2",
    sleepSchedule: "11pm-7am",
    targetDeadline: "6 months",
  });

  const updateField = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleComplete = () => {
    updateUser({
      ...formData,
      age: parseInt(formData.age) || 20,
      height: parseInt(formData.height) || 170,
      weight: parseInt(formData.weight) || 70,
      availableTime: parseInt(formData.availableTime) || 2,
      onboardingComplete: true,
    });
    onComplete();
  };

  const fitnessGoals = [
    { id: "fat_loss", label: "Fat Loss", emoji: "🔥" },
    { id: "muscle_gain", label: "Muscle Gain", emoji: "💪" },
    { id: "general_fitness", label: "General Fitness", emoji: "⚡" },
    { id: "flexibility", label: "Flexibility", emoji: "🧘" },
    { id: "endurance", label: "Endurance", emoji: "🏃" },
    { id: "strength", label: "Strength", emoji: "🏋️" },
  ];

  const studyGoals = [
    { id: "exams", label: "Exam Prep", emoji: "📝" },
    { id: "skills", label: "New Skills", emoji: "🎯" },
    { id: "coding", label: "Coding", emoji: "💻" },
    { id: "languages", label: "Languages", emoji: "🌍" },
    { id: "business", label: "Business", emoji: "📊" },
    { id: "creative", label: "Creative Arts", emoji: "🎨" },
  ];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block font-medium">Age</label>
                <input
                  type="number"
                  placeholder="22"
                  value={formData.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  className="text-center text-lg font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block font-medium">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block font-medium">Height (cm)</label>
                <input
                  type="number"
                  placeholder="175"
                  value={formData.height}
                  onChange={(e) => updateField("height", e.target.value)}
                  className="text-center text-lg font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block font-medium">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={formData.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  className="text-center text-lg font-bold"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium uppercase tracking-wide">
                🏋️ Fitness Goal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {fitnessGoals.map((g) => (
                  <motion.button
                    key={g.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateField("fitnessGoal", g.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      formData.fitnessGoal === g.id
                        ? "border-purple-500 bg-purple-500/20 text-purple-300"
                        : "border-white/10 bg-white/5 text-gray-400"
                    }`}
                  >
                    <div className="text-2xl mb-1">{g.emoji}</div>
                    <div className="text-[10px] font-semibold">{g.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium uppercase tracking-wide">
                📚 Study Goal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {studyGoals.map((g) => (
                  <motion.button
                    key={g.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateField("studyGoal", g.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      formData.studyGoal === g.id
                        ? "border-blue-500 bg-blue-500/20 text-blue-300"
                        : "border-white/10 bg-white/5 text-gray-400"
                    }`}
                  >
                    <div className="text-2xl mb-1">{g.emoji}</div>
                    <div className="text-[10px] font-semibold">{g.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">
                ⏰ Daily Available Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["1", "2", "3", "4+"].map((t) => (
                  <motion.button
                    key={t}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateField("availableTime", t.replace("+", ""))}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      formData.availableTime === t.replace("+", "")
                        ? "border-green-500 bg-green-500/20 text-green-300"
                        : "border-white/10 bg-white/5 text-gray-400"
                    }`}
                  >
                    {t}h
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">
                🌙 Sleep Schedule
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["10pm-6am", "11pm-7am", "12am-8am", "1am-9am"].map((s) => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateField("sleepSchedule", s)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.sleepSchedule === s
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                        : "border-white/10 bg-white/5 text-gray-400"
                    }`}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">
                🎯 Target Deadline
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["1 month", "3 months", "6 months", "1 year", "2 years", "Ongoing"].map((d) => (
                  <motion.button
                    key={d}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateField("targetDeadline", d)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      formData.targetDeadline === d
                        ? "border-yellow-500 bg-yellow-500/20 text-yellow-300"
                        : "border-white/10 bg-white/5 text-gray-400"
                    }`}
                  >
                    {d}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4 animate-float inline-block">🤖</div>
              <h3 className="text-lg font-bold text-gradient mb-2">
                Your AI Roadmap is Ready!
              </h3>
              <p className="text-sm text-gray-400">
                Based on your profile, here&apos;s your personalized plan:
              </p>
            </motion.div>

            <div className="space-y-3">
              {[
                {
                  icon: "🏋️",
                  title: "Fitness Plan",
                  desc: `Personalized ${formData.fitnessGoal?.replace("_", " ") || "fitness"} program with progressive overload`,
                  color: "from-purple-500/20 to-blue-500/20",
                  border: "border-purple-500/30",
                },
                {
                  icon: "📚",
                  title: "Study Schedule",
                  desc: `${formData.availableTime}h daily sessions with Pomodoro technique for ${formData.studyGoal || "your goals"}`,
                  color: "from-blue-500/20 to-cyan-500/20",
                  border: "border-blue-500/30",
                },
                {
                  icon: "🔥",
                  title: "Habit Stack",
                  desc: `Morning routine optimized for your ${formData.sleepSchedule || "11pm-7am"} schedule`,
                  color: "from-orange-500/20 to-red-500/20",
                  border: "border-orange-500/30",
                },
                {
                  icon: "📅",
                  title: "Timeline",
                  desc: `Achieve your goals in ${formData.targetDeadline || "6 months"} with weekly milestones`,
                  color: "from-green-500/20 to-teal-500/20",
                  border: "border-green-500/30",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r ${item.color} border ${item.border}`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-white mb-0.5">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-3">
            {steps.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s.id
                      ? "gradient-purple text-white"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  {step > s.id ? "✓" : s.id + 1}
                </div>
                <span className={`text-[9px] font-medium ${step >= s.id ? "text-purple-400" : "text-gray-600"}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/5 rounded-full">
            <motion.div
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              className="h-full xp-bar"
            />
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-6 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-1 text-gradient">
                {steps[step].title}
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                {step === 0 && "Tell us about yourself to personalize your experience"}
                {step === 1 && "What do you want to achieve? Pick all that apply"}
                {step === 2 && "Help us schedule your perfect day"}
                {step === 3 && "Your AI coach has analyzed your profile"}
              </p>

              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (step < steps.length - 1) setStep(step + 1);
                else handleComplete();
              }}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {step === steps.length - 1 ? (
                <>
                  <Sparkles size={16} />
                  Begin My Journey
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
