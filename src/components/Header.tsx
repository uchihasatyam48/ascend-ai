"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { getLevelTitle, getXPForNextLevel } from "@/lib/utils";
import { Bell } from "lucide-react";

export default function Header() {
  const { user, setActiveTab } = useAppStore();

  if (!user) return null;

  const xpForNext = getXPForNextLevel(user.level);
  const xpPercent = Math.min((user.xp / xpForNext) * 100, 100);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 glass-strong px-4 pt-4 pb-3"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("profile")}
            className="relative cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center text-lg font-bold text-white animate-pulse-glow">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[var(--bg-primary)]" />
          </motion.div>

          {/* Level & name */}
          <div>
            <p className="text-xs text-gray-400 font-medium">
              Lv.{user.level} · {getLevelTitle(user.level)}
            </p>
            <p className="text-sm font-bold leading-tight text-gradient">
              {user.name.split(" ")[0]}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Coins */}
          <div className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-yellow-400 text-sm">🪙</span>
            <span className="text-xs font-bold text-yellow-300">{user.coins}</span>
          </div>

          {/* Streak */}
          <div className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-orange-400 text-sm">🔥</span>
            <span className="text-xs font-bold text-orange-300">{user.streak}</span>
          </div>

          {/* Notification bell */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 glass rounded-full flex items-center justify-center relative"
          >
            <Bell size={16} className="text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
          </motion.button>
        </div>
      </div>

      {/* XP bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-500 font-medium">
            XP Progress
          </span>
          <span className="text-[10px] text-purple-400 font-semibold">
            {user.xp.toLocaleString()} / {xpForNext.toLocaleString()} XP
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="xp-bar h-full"
          />
        </div>
      </div>
    </motion.header>
  );
}
