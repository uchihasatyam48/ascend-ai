"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Users } from "lucide-react";

const challenges = [
  { id: "c1", name: "30-Day Fitness Blitz", emoji: "💪", members: 1247, daysLeft: 12, xpReward: 2000, category: "Fitness" },
  { id: "c2", name: "Study Marathon", emoji: "📚", members: 892, daysLeft: 5, xpReward: 1500, category: "Study" },
  { id: "c3", name: "Consistency Kings", emoji: "🔥", members: 2341, daysLeft: 18, xpReward: 3000, category: "Habits" },
  { id: "c4", name: "Water Warriors", emoji: "💧", members: 567, daysLeft: 7, xpReward: 500, category: "Health" },
];

const feed = [
  { id: "f1", user: "Alex C.", avatar: "🦁", action: "completed a 45-min workout", time: "2m ago", xp: 200 },
  { id: "f2", user: "Maya P.", avatar: "🌟", action: "reached Level 38!", time: "15m ago", xp: 0 },
  { id: "f3", user: "Jordan K.", avatar: "🔥", action: "maintained a 67-day streak", time: "1h ago", xp: 100 },
  { id: "f4", user: "Sam R.", avatar: "⚡", action: "completed all daily quests", time: "2h ago", xp: 450 },
  { id: "f5", user: "Casey L.", avatar: "🎯", action: "studied for 4 hours straight", time: "3h ago", xp: 600 },
];

export default function CommunityScreen() {
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set());

  const handleJoin = (id: string) => {
    setJoinedChallenges((prev) => new Set([...prev, id]));
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h2 className="text-xl font-black text-white mb-1">👥 Community</h2>
        <p className="text-sm text-gray-400">Join challenges, compete with friends</p>
      </div>

      {/* Live Feed */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-bold text-sm text-white">Live Activity Feed</h3>
        </div>
        {feed.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">
              {item.avatar}
            </div>
            <div className="flex-1">
              <p className="text-xs text-white">
                <span className="font-bold">{item.user}</span>{" "}
                <span className="text-gray-400">{item.action}</span>
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {item.time}
                {item.xp > 0 && <span className="text-purple-400 ml-2">+{item.xp} XP</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Challenges */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-white">Active Challenges</h3>
        {challenges.map((challenge, i) => {
          const joined = joinedChallenges.has(challenge.id);
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{challenge.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{challenge.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                      {challenge.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 mb-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users size={10} />
                      {challenge.members.toLocaleString()} members
                    </span>
                    <span className="text-xs text-orange-400">{challenge.daysLeft}d left</span>
                    <span className="text-xs text-purple-400">+{challenge.xpReward} XP</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleJoin(challenge.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      joined
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "gradient-purple text-white"
                    }`}
                  >
                    {joined ? "✓ Joined" : "Join Challenge"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
