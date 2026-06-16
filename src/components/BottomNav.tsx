"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  CheckSquare,
  Trophy,
  User,
  ShoppingBag,
  Users,
  BarChart3,
  Zap,
} from "lucide-react";

const tabs = [
  { id: "dashboard", icon: LayoutDashboard, label: "Home" },
  { id: "fitness", icon: Dumbbell, label: "Fitness" },
  { id: "study", icon: BookOpen, label: "Study" },
  { id: "habits", icon: CheckSquare, label: "Habits" },
  { id: "quests", icon: Zap, label: "Quests" },
  { id: "leaderboard", icon: Trophy, label: "Ranks" },
  { id: "analytics", icon: BarChart3, label: "Stats" },
  { id: "community", icon: Users, label: "Social" },
  { id: "store", icon: ShoppingBag, label: "Store" },
  { id: "profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();

  // Show only 5 primary tabs in bottom nav
  const primaryTabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Home" },
    { id: "fitness", icon: Dumbbell, label: "Fitness" },
    { id: "study", icon: BookOpen, label: "Study" },
    { id: "quests", icon: Zap, label: "Quests" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="bottom-nav px-2 pb-2">
      <div className="glass-strong rounded-2xl px-2 py-2 flex items-center justify-around shadow-2xl">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl gradient-purple opacity-20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                size={22}
                className={isActive ? "text-purple-400" : "text-gray-500"}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-purple-400" : "text-gray-500"
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Secondary navigation row */}
      <div className="flex items-center justify-around mt-1 px-2">
        {tabs
          .filter((t) => !primaryTabs.find((p) => p.id === t.id))
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
                  isActive ? "text-purple-400" : "text-gray-600"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[9px] font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
      </div>
    </nav>
  );
}
