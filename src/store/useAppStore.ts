import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getXPForNextLevel } from "@/lib/utils";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  fitnessGoal: string;
  studyGoal: string;
  availableTime: number;
  sleepSchedule: string;
  targetDeadline: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  joinedAt: string;
  onboardingComplete: boolean;
  theme: "dark" | "light";
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: string;
  streak: number;
  completedToday: boolean;
  completedDates: string[];
  targetPerDay: number;
  unit: string;
  color: string;
}

export interface Workout {
  id: string;
  name: string;
  category: string;
  duration: number;
  calories: number;
  exercises: Exercise[];
  completedAt?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration?: number;
}

export interface StudySession {
  id: string;
  subject: string;
  duration: number;
  date: string;
  focusScore: number;
  distractions?: number;
  sleepIncidents?: number;
  timeAway?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  type: "study" | "fitness" | "habit" | "social";
  completed: boolean;
  progress: number;
  target: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  rank: number;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  habits: Habit[];
  workouts: Workout[];
  studySessions: StudySession[];
  dailyQuests: Quest[];
  achievements: Achievement[];
  weightHistory: WeightEntry[];
  leaderboard: LeaderboardEntry[];
  activeTab: string;
  pomodoroActive: boolean;
  pomodoroTime: number;
  pomodoroMode: "work" | "break";
  cameraVerificationActive: boolean;
  cameraVerificationTaskName: string;
  cameraVerificationCallback: (() => void) | null;

  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  toggleHabit: (id: string) => void;
  addHabit: (habit: Habit) => void;
  completeQuest: (id: string) => void;
  logWorkout: (workout: Workout) => void;
  logStudySession: (session: StudySession) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  setActiveTab: (tab: string) => void;
  setPomodoroActive: (active: boolean) => void;
  setPomodoroTime: (time: number) => void;
  setPomodoroMode: (mode: "work" | "break") => void;
  generateDailyQuests: () => void;
  initializeDefaultData: () => void;
  setCameraVerification: (active: boolean, taskName?: string, callback?: (() => void) | null) => void;
}

const defaultHabits: Habit[] = [
  {
    id: "h1",
    name: "Morning Water",
    icon: "💧",
    category: "Health",
    streak: 7,
    completedToday: false,
    completedDates: [],
    targetPerDay: 3,
    unit: "liters",
    color: "#3b82f6",
  },
  {
    id: "h2",
    name: "Meditation",
    icon: "🧘",
    category: "Mindfulness",
    streak: 3,
    completedToday: false,
    completedDates: [],
    targetPerDay: 10,
    unit: "minutes",
    color: "#8b5cf6",
  },
  {
    id: "h3",
    name: "Reading",
    icon: "📚",
    category: "Learning",
    streak: 5,
    completedToday: false,
    completedDates: [],
    targetPerDay: 20,
    unit: "pages",
    color: "#f59e0b",
  },
  {
    id: "h4",
    name: "Journaling",
    icon: "✍️",
    category: "Reflection",
    streak: 2,
    completedToday: false,
    completedDates: [],
    targetPerDay: 1,
    unit: "entry",
    color: "#10b981",
  },
];

const defaultAchievements: Achievement[] = [
  {
    id: "a1",
    title: "First Step",
    description: "Complete your first workout",
    icon: "🏋️",
    category: "Fitness",
    rarity: "common",
    unlockedAt: new Date().toISOString(),
  },
  {
    id: "a2",
    title: "Scholar",
    description: "Study for 10 hours total",
    icon: "📖",
    category: "Study",
    rarity: "rare",
    unlockedAt: new Date().toISOString(),
  },
  {
    id: "a3",
    title: "Streak Starter",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "Consistency",
    rarity: "rare",
    unlockedAt: new Date().toISOString(),
  },
  {
    id: "a4",
    title: "Centurion",
    description: "Reach Level 10",
    icon: "⚔️",
    category: "Progress",
    rarity: "epic",
  },
  {
    id: "a5",
    title: "Iron Will",
    description: "Complete 30-day streak",
    icon: "🛡️",
    category: "Consistency",
    rarity: "legendary",
  },
  {
    id: "a6",
    title: "Ascended",
    description: "Reach Level 100",
    icon: "👑",
    category: "Progress",
    rarity: "legendary",
  },
];

const defaultLeaderboard: LeaderboardEntry[] = [
  { id: "l1", name: "Alex Chen", avatar: "🥇", level: 45, xp: 98500, streak: 120, rank: 1 },
  { id: "l2", name: "Maya Patel", avatar: "🥈", level: 38, xp: 76200, streak: 89, rank: 2 },
  { id: "l3", name: "Jordan Kim", avatar: "🥉", level: 33, xp: 61800, streak: 67, rank: 3 },
  { id: "l4", name: "Sam Rivera", avatar: "🏅", level: 28, xp: 45300, streak: 45, rank: 4 },
  { id: "l5", name: "Casey Lee", avatar: "⭐", level: 22, xp: 32100, streak: 34, rank: 5 },
];

function generateQuests(): Quest[] {
  return [
    {
      id: `q${Date.now()}-1`,
      title: "Focus Session",
      description: "Complete a 25-min Pomodoro session",
      xpReward: 150,
      coinReward: 30,
      type: "study",
      completed: false,
      progress: 0,
      target: 1,
    },
    {
      id: `q${Date.now()}-2`,
      title: "Iron Body",
      description: "Complete today's workout routine",
      xpReward: 200,
      coinReward: 40,
      type: "fitness",
      completed: false,
      progress: 0,
      target: 1,
    },
    {
      id: `q${Date.now()}-3`,
      title: "Hydration Hero",
      description: "Drink 3L of water today",
      xpReward: 100,
      coinReward: 20,
      type: "habit",
      completed: false,
      progress: 0,
      target: 3,
    },
    {
      id: `q${Date.now()}-4`,
      title: "Deep Reader",
      description: "Read 20 pages of any book",
      xpReward: 120,
      coinReward: 25,
      type: "study",
      completed: false,
      progress: 0,
      target: 20,
    },
    {
      id: `q${Date.now()}-5`,
      title: "Jumping Jacks Challenge",
      description: "Perform 10 jumping jacks in front of the camera",
      xpReward: 250,
      coinReward: 50,
      type: "fitness",
      completed: false,
      progress: 0,
      target: 10,
    },
  ];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      habits: defaultHabits,
      workouts: [],
      studySessions: [],
      dailyQuests: generateQuests(),
      achievements: defaultAchievements,
      weightHistory: [
        { date: "2026-05-01", weight: 80 },
        { date: "2026-05-08", weight: 79.2 },
        { date: "2026-05-15", weight: 78.5 },
        { date: "2026-05-22", weight: 77.8 },
        { date: "2026-06-01", weight: 77.1 },
        { date: "2026-06-08", weight: 76.4 },
        { date: "2026-06-13", weight: 75.9 },
      ],
      leaderboard: defaultLeaderboard,
      activeTab: "dashboard",
      pomodoroActive: false,
      pomodoroTime: 25 * 60,
      pomodoroMode: "work",
      cameraVerificationActive: false,
      cameraVerificationTaskName: "",
      cameraVerificationCallback: null,

      setUser: (user) => {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(`ascend-ai-profile-${user.email}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              set({
                user: parsed.user || user,
                isAuthenticated: true,
                habits: parsed.habits || defaultHabits,
                workouts: parsed.workouts || [],
                studySessions: parsed.studySessions || [],
                achievements: parsed.achievements || defaultAchievements,
                weightHistory: parsed.weightHistory || [],
                dailyQuests: parsed.dailyQuests || generateQuests(),
              });
              return;
            } catch (e) {
              console.error("Failed to load saved profile", e);
            }
          }
        }
        // Brand new profile (or no saved progress found): reset store fields to defaults to avoid cross-profile leakage
        set({
          user,
          isAuthenticated: true,
          habits: defaultHabits,
          workouts: [],
          studySessions: [],
          achievements: defaultAchievements,
          weightHistory: [
            { date: "2026-05-01", weight: 80 },
            { date: "2026-05-08", weight: 79.2 },
            { date: "2026-05-15", weight: 78.5 },
            { date: "2026-05-22", weight: 77.8 },
            { date: "2026-06-01", weight: 77.1 },
            { date: "2026-06-08", weight: 76.4 },
            { date: "2026-06-13", weight: 75.9 },
          ],
          dailyQuests: generateQuests(),
        });
      },
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          habits: defaultHabits,
          workouts: [],
          studySessions: [],
          achievements: defaultAchievements,
          weightHistory: [
            { date: "2026-05-01", weight: 80 },
            { date: "2026-05-08", weight: 79.2 },
            { date: "2026-05-15", weight: 78.5 },
            { date: "2026-05-22", weight: 77.8 },
            { date: "2026-06-01", weight: 77.1 },
            { date: "2026-06-08", weight: 76.4 },
            { date: "2026-06-13", weight: 75.9 },
          ],
          dailyQuests: generateQuests(),
        }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      addXP: (amount) =>
        set((state) => {
          if (!state.user) return state;
          const newXP = state.user.xp + amount;
          const xpForNext = getXPForNextLevel(state.user.level);
          if (newXP >= xpForNext) {
            return {
              user: {
                ...state.user,
                xp: newXP - xpForNext,
                level: state.user.level + 1,
              },
            };
          }
          return { user: { ...state.user, xp: newXP } };
        }),

      addCoins: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, coins: state.user.coins + amount }
            : null,
        })),

      toggleHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completedToday: !h.completedToday,
                  streak: !h.completedToday ? h.streak + 1 : h.streak - 1,
                }
              : h
          ),
        })),

      addHabit: (habit) =>
        set((state) => ({ habits: [...state.habits, habit] })),

      completeQuest: (id) => {
        const quest = get().dailyQuests.find((q) => q.id === id);
        if (quest && !quest.completed) {
          get().addXP(quest.xpReward);
          get().addCoins(quest.coinReward);
          set((state) => ({
            dailyQuests: state.dailyQuests.map((q) =>
              q.id === id ? { ...q, completed: true, progress: q.target } : q
            ),
          }));
        }
      },

      logWorkout: (workout) =>
        set((state) => ({
          workouts: [...state.workouts, { ...workout, completedAt: new Date().toISOString() }],
        })),

      logStudySession: (session) =>
        set((state) => ({
          studySessions: [...state.studySessions, session],
        })),

      addWeightEntry: (entry) =>
        set((state) => ({
          weightHistory: [...state.weightHistory, entry],
        })),

      setActiveTab: (tab) => set({ activeTab: tab }),
      setPomodoroActive: (active) => set({ pomodoroActive: active }),
      setPomodoroTime: (time) => set({ pomodoroTime: time }),
      setPomodoroMode: (mode) => set({ pomodoroMode: mode }),

      generateDailyQuests: () => set({ dailyQuests: generateQuests() }),

      initializeDefaultData: () => {
        if (!get().user) return;
        if (get().habits.length === 0) {
          set({ habits: defaultHabits });
        }
      },
      setCameraVerification: (active, taskName = "", callback = null) =>
        set({
          cameraVerificationActive: active,
          cameraVerificationTaskName: taskName,
          cameraVerificationCallback: callback,
        }),
    }),
    {
      name: "ascend-ai-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        habits: state.habits,
        workouts: state.workouts,
        studySessions: state.studySessions,
        achievements: state.achievements,
        weightHistory: state.weightHistory,
        dailyQuests: state.dailyQuests,
      }),
    }
  )
);

// Subscribe to automatically save profile updates per-email
if (typeof window !== "undefined") {
  useAppStore.subscribe((state) => {
    if (state.user?.email) {
      const data = {
        user: state.user,
        habits: state.habits,
        workouts: state.workouts,
        studySessions: state.studySessions,
        achievements: state.achievements,
        weightHistory: state.weightHistory,
        dailyQuests: state.dailyQuests,
      };
      localStorage.setItem(`ascend-ai-profile-${state.user.email}`, JSON.stringify(data));
    }
  });
}

