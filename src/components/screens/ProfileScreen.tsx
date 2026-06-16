"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { getLevelTitle, getXPForNextLevel } from "@/lib/utils";
import { LogOut, Sun, Moon } from "lucide-react";

const rarityColors: Record<string, string> = {
  common: "text-gray-400 border-gray-600",
  rare: "text-blue-400 border-blue-600",
  epic: "text-purple-400 border-purple-600",
  legendary: "text-yellow-400 border-yellow-600",
};

const rarityGlow: Record<string, string> = {
  common: "",
  rare: "shadow-blue-500/20",
  epic: "shadow-purple-500/20",
  legendary: "shadow-yellow-500/30",
};

export default function ProfileScreen() {
  const { user, achievements, logout, updateUser } = useAppStore();

  if (!user) return null;

  const xpForNext = getXPForNextLevel(user.level);
  const xpPercent = Math.min((user.xp / xpForNext) * 100, 100);
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const lockedAchievements = achievements.filter((a) => !a.unlockedAt);

  const toggleTheme = () => {
    const newTheme = user.theme === "dark" ? "light" : "dark";
    updateUser({ theme: newTheme });
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Profile Hero */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))", border: "1px solid rgba(139,92,246,0.3)" }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl gradient-purple flex items-center justify-center text-3xl font-black text-white shadow-2xl animate-pulse-glow">
              {user.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-yellow-500 flex items-center justify-center text-xs font-black text-black">
              {user.level}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-white">{user.name}</h2>
            <p className="text-sm text-purple-300 font-semibold">{getLevelTitle(user.level)}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-orange-400">🔥 {user.streak} day streak</span>
              <span className="text-xs text-yellow-300">🪙 {user.coins}</span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="relative z-10 mt-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Level {user.level} → {user.level + 1}</span>
            <span className="text-purple-300">{user.xp}/{xpForNext} XP</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="xp-bar h-full" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Level", value: user.level, icon: "⭐" },
          { label: "Streak", value: `${user.streak}d`, icon: "🔥" },
          { label: "Coins", value: user.coins, icon: "🪙" },
          { label: "Badges", value: unlockedAchievements.length, icon: "🏅" },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-sm font-black text-white">{s.value}</div>
            <div className="text-[9px] text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Body Stats */}
      <div className="card p-4 space-y-3">
        <h3 className="font-bold text-sm text-white">Body Stats</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Age", value: `${user.age}y` },
            { label: "Height", value: `${user.height}cm` },
            { label: "Weight", value: `${user.weight}kg` },
          ].map((s) => (
            <div key={s.label} className="text-center py-2 rounded-xl bg-white/5">
              <div className="text-lg font-black text-white">{s.value || "—"}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Achievements</h3>
          <span className="text-xs text-gray-400">{unlockedAchievements.length}/{achievements.length}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`flex flex-col items-center p-3 rounded-2xl border shadow-lg ${
                a.unlockedAt
                  ? `${rarityColors[a.rarity]} bg-white/5 ${rarityGlow[a.rarity]}`
                  : "border-white/8 bg-white/3 opacity-40"
              }`}
            >
              <div className="text-2xl mb-1">{a.unlockedAt ? a.icon : "🔒"}</div>
              <div className="text-[9px] font-bold text-center text-white leading-tight">{a.title}</div>
              <div className={`text-[8px] capitalize mt-0.5 ${a.unlockedAt ? rarityColors[a.rarity].split(" ")[0] : "text-gray-600"}`}>
                {a.rarity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="card p-4 space-y-1">
        <h3 className="font-bold text-sm text-white mb-3">Settings</h3>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            {user.theme === "dark" ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-yellow-400" />}
            <span className="text-sm text-white">{user.theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
          </div>
          <div className="w-10 h-6 rounded-full bg-purple-500/30 border border-purple-500/40 relative">
            <div className={`absolute top-0.5 w-5 h-5 rounded-full gradient-purple shadow transition-all ${user.theme === "dark" ? "left-0.5" : "left-4"}`} />
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-all text-red-400"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
}
