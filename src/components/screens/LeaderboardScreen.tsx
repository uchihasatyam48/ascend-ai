"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { getLevelTitle } from "@/lib/utils";

export default function LeaderboardScreen() {
  const { leaderboard, user } = useAppStore();

  const myEntry = {
    id: user?.id || "me",
    name: user?.name || "You",
    avatar: "⚡",
    level: user?.level || 1,
    xp: user?.xp || 0,
    streak: user?.streak || 0,
    rank: leaderboard.length + 1,
  };

  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const rankBg = ["from-yellow-500/15 to-amber-500/10 border-yellow-500/30", "from-gray-500/15 to-slate-500/10 border-gray-500/30", "from-amber-700/15 to-amber-600/10 border-amber-600/30"];

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h2 className="text-xl font-black text-white mb-1">🏆 Leaderboard</h2>
        <p className="text-sm text-gray-400">Global XP rankings this week</p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-2">
        {/* 2nd */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl font-black text-gray-300">🥈</div>
          <div className="w-16 h-20 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-b from-gray-500/20 to-gray-600/10 border border-gray-500/30">
            <div className="text-2xl mb-0.5">😎</div>
            <div className="text-[10px] font-bold text-white text-center px-1 truncate w-full">{leaderboard[1]?.name.split(" ")[0]}</div>
            <div className="text-[9px] text-gray-400">Lv.{leaderboard[1]?.level}</div>
          </div>
          <div className="text-xs font-bold text-gray-300">#2</div>
        </div>
        {/* 1st */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl font-black text-yellow-400 animate-float">🥇</div>
          <div className="w-20 h-24 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-b from-yellow-500/25 to-amber-500/10 border border-yellow-500/40">
            <div className="text-3xl mb-0.5">🦁</div>
            <div className="text-[11px] font-bold text-white text-center px-1 truncate w-full">{leaderboard[0]?.name.split(" ")[0]}</div>
            <div className="text-[10px] text-yellow-400">Lv.{leaderboard[0]?.level}</div>
          </div>
          <div className="text-sm font-black text-yellow-400">#1</div>
        </div>
        {/* 3rd */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl font-black text-amber-600">🥉</div>
          <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-b from-amber-700/20 to-amber-600/10 border border-amber-600/30">
            <div className="text-2xl mb-0.5">🔥</div>
            <div className="text-[10px] font-bold text-white text-center px-1 truncate w-full">{leaderboard[2]?.name.split(" ")[0]}</div>
            <div className="text-[9px] text-amber-500">Lv.{leaderboard[2]?.level}</div>
          </div>
          <div className="text-xs font-bold text-amber-600">#3</div>
        </div>
      </div>

      {/* Full rankings list */}
      <div className="space-y-2">
        <h3 className="text-xs text-gray-400 uppercase tracking-wide font-semibold">All Rankings</h3>
        {leaderboard.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border bg-gradient-to-r ${i < 3 ? rankBg[i] : "border-white/8 bg-white/3"}`}
          >
            <div className={`text-lg font-black w-6 text-center ${i < 3 ? rankColors[i] : "text-gray-500"}`}>
              {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i + 1}`}
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">
              {entry.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">{entry.name}</p>
              <p className="text-xs text-gray-500">Lv.{entry.level} · {getLevelTitle(entry.level)} · 🔥{entry.streak}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-purple-400">{entry.xp.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500">XP</div>
            </div>
          </motion.div>
        ))}

        {/* My position */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-purple-500/40 bg-purple-500/10">
          <div className="text-sm font-black text-purple-400 w-6 text-center">#{myEntry.rank}</div>
          <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center text-white font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-white">{user?.name} (You)</p>
            <p className="text-xs text-gray-500">Lv.{myEntry.level} · 🔥{myEntry.streak}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-purple-400">{myEntry.xp.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500">XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
