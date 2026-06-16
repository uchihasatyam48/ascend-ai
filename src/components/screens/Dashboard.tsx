"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { getLevelTitle, getXPForNextLevel, formatNumber } from "@/lib/utils";
import {
  Flame,
  Zap,
  BookOpen,
  Dumbbell,
  CheckSquare,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user, habits, dailyQuests, workouts, studySessions, setActiveTab } = useAppStore();

  if (!user) return null;

  const xpForNext = getXPForNextLevel(user.level);
  const xpPercent = Math.min((user.xp / xpForNext) * 100, 100);
  const completedHabits = habits.filter((h) => h.completedToday).length;
  const completedQuests = dailyQuests.filter((q) => q.completed).length;
  const todayStudyHours = studySessions
    .filter((s) => s.date === new Date().toDateString())
    .reduce((acc, s) => acc + s.duration / 60, 0);

  const stats = [
    {
      label: "Level",
      value: user.level,
      icon: "⭐",
      sub: getLevelTitle(user.level),
      color: "from-purple-500/20 to-purple-600/10",
      border: "border-purple-500/30",
      textColor: "text-purple-400",
    },
    {
      label: "Streak",
      value: `${user.streak}d`,
      icon: "🔥",
      sub: "days active",
      color: "from-orange-500/20 to-red-500/10",
      border: "border-orange-500/30",
      textColor: "text-orange-400",
    },
    {
      label: "Habits",
      value: `${completedHabits}/${habits.length}`,
      icon: "✅",
      sub: "completed",
      color: "from-green-500/20 to-teal-500/10",
      border: "border-green-500/30",
      textColor: "text-green-400",
    },
    {
      label: "Study",
      value: `${todayStudyHours.toFixed(1)}h`,
      icon: "📚",
      sub: "today",
      color: "from-blue-500/20 to-cyan-500/10",
      border: "border-blue-500/30",
      textColor: "text-blue-400",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 py-4 space-y-4"
    >
      {/* Hero Card - Level up banner */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-3xl overflow-hidden p-5 shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(59,130,246,0.2) 50%, rgba(6,182,212,0.15) 100%)",
          border: "1px solid rgba(139,92,246,0.3)",
        }}
      >
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-purple-300 font-semibold uppercase tracking-widest mb-1">
                Good morning 👋
              </p>
              <h2 className="text-2xl font-black text-white leading-tight">
                {user.name.split(" ")[0]}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Level {user.level} · {getLevelTitle(user.level)}
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-gradient">{user.level}</div>
              <div className="text-xs text-gray-400">Current Level</div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">XP Progress</span>
              <span className="text-purple-300 font-semibold">
                {formatNumber(user.xp)} / {formatNumber(xpForNext)} XP
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="xp-bar h-full"
              />
            </div>
            <p className="text-xs text-gray-500">
              {formatNumber(xpForNext - user.xp)} XP to Level {user.level + 1}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl p-4 bg-gradient-to-br ${stat.color} border ${stat.border}`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-medium ${stat.textColor}`}>{stat.label}</span>
            </div>
            <div className={`text-2xl font-black ${stat.textColor}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Daily Quests Preview */}
      <motion.div variants={itemVariants} className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            <h3 className="font-bold text-sm">Daily Quests</h3>
          </div>
          <button
            onClick={() => setActiveTab("quests")}
            className="text-xs text-purple-400 flex items-center gap-1 font-medium"
          >
            View All <ChevronRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {dailyQuests.slice(0, 3).map((quest) => (
            <div
              key={quest.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                quest.completed
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-white/8 bg-white/3"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  quest.type === "study"
                    ? "bg-blue-500/20"
                    : quest.type === "fitness"
                    ? "bg-purple-500/20"
                    : "bg-orange-500/20"
                }`}
              >
                {quest.type === "study" ? "📚" : quest.type === "fitness" ? "💪" : "⚡"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold truncate ${
                    quest.completed ? "line-through text-gray-500" : "text-white"
                  }`}
                >
                  {quest.title}
                </p>
                <p className="text-[10px] text-gray-500">{quest.description}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-yellow-400">+{quest.xpReward}</div>
                <div className="text-[10px] text-gray-500">XP</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Today's Focus */}
      <motion.div variants={itemVariants} className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-green-400" />
          <h3 className="font-bold text-sm">Today&apos;s Progress</h3>
        </div>

        <div className="space-y-3">
          {[
            {
              label: "Habits",
              value: completedHabits,
              max: habits.length,
              color: "#10b981",
              icon: "✅",
            },
            {
              label: "Quests",
              value: completedQuests,
              max: dailyQuests.length,
              color: "#8b5cf6",
              icon: "⚡",
            },
            {
              label: "Study Hours",
              value: Math.min(todayStudyHours, user.availableTime),
              max: user.availableTime,
              color: "#3b82f6",
              icon: "📚",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>{item.icon}</span>
                  {item.label}
                </div>
                <span className="text-xs font-semibold text-white">
                  {typeof item.value === "number" && item.value % 1 !== 0
                    ? item.value.toFixed(1)
                    : item.value}/{item.max}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="font-bold text-sm mb-3 text-gray-400 uppercase tracking-wide">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Start Workout", icon: "🏋️", tab: "fitness", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30" },
            { label: "Study Session", icon: "⏱️", tab: "study", color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30" },
            { label: "Log Habits", icon: "✅", tab: "habits", color: "from-green-500/20 to-green-600/10", border: "border-green-500/30" },
            { label: "View Progress", icon: "📊", tab: "analytics", color: "from-yellow-500/20 to-orange-500/10", border: "border-yellow-500/30" },
          ].map((action) => (
            <motion.button
              key={action.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(action.tab)}
              className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${action.color} border ${action.border} text-left`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-semibold text-white">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
