"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Zap } from "lucide-react";

const questTypeIcons: Record<string, string> = {
  study: "📚",
  fitness: "💪",
  habit: "✅",
  social: "👥",
};

const questTypeColors: Record<string, string> = {
  study: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
  fitness: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
  habit: "from-green-500/20 to-teal-500/10 border-green-500/30",
  social: "from-pink-500/20 to-rose-500/10 border-pink-500/30",
};

export default function QuestsScreen() {
  const { dailyQuests, completeQuest, generateDailyQuests, user, setCameraVerification } = useAppStore();

  const completedCount = dailyQuests.filter((q) => q.completed).length;
  const totalXP = dailyQuests.reduce((a, q) => a + (q.completed ? q.xpReward : 0), 0);
  const totalCoins = dailyQuests.reduce((a, q) => a + (q.completed ? q.coinReward : 0), 0);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white mb-1">⚡ Daily Quests</h2>
          <p className="text-sm text-gray-400">{completedCount}/{dailyQuests.length} completed today</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={generateDailyQuests}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/8 border border-white/10 text-gray-400"
        >
          🔄 Refresh
        </motion.button>
      </div>

      {/* Progress Overview */}
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))", border: "1px solid rgba(139,92,246,0.3)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent animate-shimmer" />
        <div className="relative z-10">
          <div className="flex justify-between mb-3">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Today&apos;s Rewards</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Zap size={14} className="text-yellow-400" />
                  <span className="font-bold text-yellow-300">{totalXP} XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-sm">🪙</span>
                  <span className="font-bold text-yellow-300">{totalCoins}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-0.5">Completion</div>
              <div className="text-2xl font-black text-gradient">
                {Math.round((completedCount / dailyQuests.length) * 100)}%
              </div>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(completedCount / dailyQuests.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="xp-bar h-full"
            />
          </div>
        </div>
      </div>

      {/* Quest List */}
      <div className="space-y-3">
        {dailyQuests.map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl p-4 bg-gradient-to-br border ${questTypeColors[quest.type]} ${quest.completed ? "opacity-60" : ""}`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                {questTypeIcons[quest.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold text-sm ${quest.completed ? "line-through text-gray-500" : "text-white"}`}>
                    {quest.title}
                  </h3>
                  {quest.completed && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold shrink-0">
                      Done ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2">{quest.description}</p>

                {/* Progress bar */}
                {quest.target > 1 && (
                  <div className="mb-2">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(quest.progress / quest.target) * 100}%`,
                          background: quest.type === "study" ? "#3b82f6" : quest.type === "fitness" ? "#8b5cf6" : "#10b981",
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {quest.progress}/{quest.target}
                    </p>
                  </div>
                )}

                {/* Rewards & Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-yellow-400">+{quest.xpReward} XP</span>
                    <span className="text-xs text-yellow-300">🪙 {quest.coinReward}</span>
                  </div>
                  {!quest.completed && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCameraVerification(true, `Quest: ${quest.title}`, () => {
                          completeQuest(quest.id);
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg gradient-purple text-white text-xs font-bold"
                    >
                      Complete
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* All-done banner */}
      {completedCount === dailyQuests.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-6 text-center"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))", border: "1px solid rgba(16,185,129,0.4)" }}
        >
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="font-black text-lg text-green-400 mb-1">Quest Master!</h3>
          <p className="text-sm text-gray-400">You completed all daily quests. Come back tomorrow for more!</p>
        </motion.div>
      )}
    </div>
  );
}
