"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Flame, Check } from "lucide-react";

const habitColors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];
const habitIcons = ["💧", "🧘", "📚", "✍️", "🏃", "🥗", "😴", "🎯", "💊", "🎵"];

export default function HabitsScreen() {
  const { habits, toggleHabit, addHabit, addXP, addCoins, setCameraVerification } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", icon: "🎯", color: "#8b5cf6", targetPerDay: 1, unit: "times" });

  const handleToggle = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    if (!habit.completedToday) {
      // Complete habit triggers camera verification
      setCameraVerification(true, `Habit: ${habit.name}`, () => {
        addXP(50);
        addCoins(10);
        toggleHabit(id);
      });
    } else {
      // Unchecking doesn't trigger verification
      toggleHabit(id);
    }
  };

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return;
    addHabit({
      id: `habit_${Date.now()}`,
      ...newHabit,
      streak: 0,
      completedToday: false,
      completedDates: [],
      category: "Custom",
    });
    setShowAdd(false);
    setNewHabit({ name: "", icon: "🎯", color: "#8b5cf6", targetPerDay: 1, unit: "times" });
  };

  const completedCount = habits.filter((h) => h.completedToday).length;
  const allDone = completedCount === habits.length;

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white mb-1">✅ Habit Tracker</h2>
          <p className="text-sm text-gray-400">{completedCount}/{habits.length} habits completed today</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center shadow-lg"
        >
          <Plus size={20} className="text-white" />
        </motion.button>
      </div>

      {/* All-done Banner */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-2xl p-4 text-center"
            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))", border: "1px solid rgba(16,185,129,0.3)" }}
          >
            <div className="text-3xl mb-1">🎉</div>
            <p className="font-bold text-green-400">All habits done! +100 bonus XP</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Overview */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-orange-400" />
          <h3 className="font-bold text-sm text-white">Top Streaks</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[...habits].sort((a, b) => b.streak - a.streak).slice(0, 4).map((h) => (
            <div key={h.id} className="shrink-0 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-1"
                style={{ background: `${h.color}20`, border: `1px solid ${h.color}40` }}>
                {h.icon}
              </div>
              <div className="text-xs font-bold" style={{ color: h.color }}>{h.streak}🔥</div>
              <div className="text-[9px] text-gray-500 truncate w-12">{h.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {habits.map((habit, i) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl p-4 border transition-all ${habit.completedToday ? "border-green-500/30 bg-green-500/8" : "border-white/8 bg-white/3"}`}
          >
            <div className="flex items-center gap-3">
              {/* Check button */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => handleToggle(habit.id)}
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: habit.completedToday ? habit.color : `${habit.color}20`,
                  border: `2px solid ${habit.color}60`,
                }}
              >
                {habit.completedToday ? (
                  <Check size={18} className="text-white" />
                ) : (
                  <span className="text-xl">{habit.icon}</span>
                )}
              </motion.button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${habit.completedToday ? "text-gray-400 line-through" : "text-white"}`}>
                    {habit.name}
                  </p>
                  {habit.completedToday && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">Done</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Target: {habit.targetPerDay} {habit.unit} · Streak: {habit.streak} days 🔥
                </p>
              </div>

              {/* Streak badge */}
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: habit.color }}>{habit.streak}</div>
                <div className="text-[9px] text-gray-500">streak</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="glass-strong rounded-t-3xl p-6 w-full max-w-sm space-y-4"
            >
              <h3 className="font-bold text-lg text-gradient">Add New Habit</h3>
              <input placeholder="Habit name..." value={newHabit.name} onChange={(e) => setNewHabit(p => ({ ...p, name: e.target.value }))} />
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {habitIcons.map((icon) => (
                    <button key={icon} onClick={() => setNewHabit(p => ({ ...p, icon }))}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border ${newHabit.icon === icon ? "border-purple-500 bg-purple-500/20" : "border-white/10 bg-white/5"}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Color</label>
                <div className="flex gap-2">
                  {habitColors.map((color) => (
                    <button key={color} onClick={() => setNewHabit(p => ({ ...p, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${newHabit.color === color ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Daily Target</label>
                  <input type="number" value={newHabit.targetPerDay} onChange={(e) => setNewHabit(p => ({ ...p, targetPerDay: parseInt(e.target.value) || 1 }))} className="text-center" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Unit</label>
                  <input placeholder="times, pages..." value={newHabit.unit} onChange={(e) => setNewHabit(p => ({ ...p, unit: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleAddHabit} className="btn-primary flex-1">Add Habit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
