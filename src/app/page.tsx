"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import Auth from "@/components/Auth";
import Onboarding from "@/components/Onboarding";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/components/screens/Dashboard";
import FitnessScreen from "@/components/screens/FitnessScreen";
import StudyScreen from "@/components/screens/StudyScreen";
import HabitsScreen from "@/components/screens/HabitsScreen";
import QuestsScreen from "@/components/screens/QuestsScreen";
import LeaderboardScreen from "@/components/screens/LeaderboardScreen";
import AnalyticsScreen from "@/components/screens/AnalyticsScreen";
import CommunityScreen from "@/components/screens/CommunityScreen";
import StoreScreen from "@/components/screens/StoreScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import AICameraVerification from "@/components/AICameraVerification";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

function AppScreen() {
  const { activeTab } = useAppStore();

  const screens: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    fitness: <FitnessScreen />,
    study: <StudyScreen />,
    habits: <HabitsScreen />,
    quests: <QuestsScreen />,
    leaderboard: <LeaderboardScreen />,
    analytics: <AnalyticsScreen />,
    community: <CommunityScreen />,
    store: <StoreScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div className="mobile-container bg-[var(--bg-primary)] min-h-screen flex flex-col shadow-2xl relative">
      {/* AI camera verification overlays */}
      <AICameraVerification />

      {/* Fixed Header */}
      <Header />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto page-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {screens[activeTab] || <Dashboard />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Nav */}
      <BottomNav />
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, user } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply saved theme on mount
  useEffect(() => {
    if (user?.theme) {
      document.documentElement.setAttribute("data-theme", user.theme);
    }
  }, [user?.theme]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#090514] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — show auth
  if (!isAuthenticated || !user) {
    return <Auth onComplete={() => {}} />;
  }

  // Authenticated but onboarding not done
  if (!user.onboardingComplete) {
    return <Onboarding onComplete={() => {}} />;
  }

  // Fully onboarded — show app
  return <AppScreen />;
}
