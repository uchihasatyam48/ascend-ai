"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Play, CheckCircle, Clock, Flame, Check } from "lucide-react";

const workoutPlans = [
  {
    id: "w1",
    name: "Fat Burner HIIT",
    category: "Cardio",
    duration: 30,
    calories: 350,
    difficulty: "Medium",
    emoji: "🔥",
    color: "from-orange-500/20 to-red-500/10",
    border: "border-orange-500/30",
    exercises: [
      { name: "Jumping Jacks", sets: 3, reps: 30 },
      { name: "Burpees", sets: 3, reps: 10 },
      { name: "Mountain Climbers", sets: 3, reps: 20 },
      { name: "High Knees", sets: 3, reps: 30 },
    ],
  },
  {
    id: "w2",
    name: "Upper Body Power",
    category: "Strength",
    duration: 45,
    calories: 280,
    difficulty: "Hard",
    emoji: "💪",
    color: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-500/30",
    exercises: [
      { name: "Push-ups", sets: 4, reps: 20 },
      { name: "Pike Push-ups", sets: 3, reps: 12 },
      { name: "Tricep Dips", sets: 3, reps: 15 },
      { name: "Plank", sets: 3, reps: 1, duration: 60 },
    ],
  },
  {
    id: "w3",
    name: "Core Crusher",
    category: "Core",
    duration: 25,
    calories: 200,
    difficulty: "Medium",
    emoji: "⚡",
    color: "from-yellow-500/20 to-amber-500/10",
    border: "border-yellow-500/30",
    exercises: [
      { name: "Crunches", sets: 3, reps: 30 },
      { name: "Bicycle Crunches", sets: 3, reps: 20 },
      { name: "Leg Raises", sets: 3, reps: 15 },
      { name: "Russian Twists", sets: 3, reps: 20 },
    ],
  },
  {
    id: "w4",
    name: "Leg Day Beast",
    category: "Strength",
    duration: 50,
    calories: 400,
    difficulty: "Hard",
    emoji: "🏋️",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    exercises: [
      { name: "Squats", sets: 4, reps: 20 },
      { name: "Lunges", sets: 3, reps: 15 },
      { name: "Jump Squats", sets: 3, reps: 12 },
      { name: "Glute Bridges", sets: 3, reps: 20 },
    ],
  },
];

const categories = ["All", "Cardio", "Strength", "Core"];

export default function FitnessScreen() {
  const { logWorkout, addXP, addCoins, user, setCameraVerification } = useAppStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeWorkout, setActiveWorkout] = useState<(typeof workoutPlans)[0] | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [workoutDone, setWorkoutDone] = useState(false);

  const filtered =
    activeCategory === "All"
      ? workoutPlans
      : workoutPlans.filter((w) => w.category === activeCategory);

  const handleComplete = () => {
    if (!activeWorkout) return;
    logWorkout({
      id: `workout_${Date.now()}`,
      name: activeWorkout.name,
      category: activeWorkout.category,
      duration: activeWorkout.duration,
      calories: activeWorkout.calories,
      exercises: activeWorkout.exercises,
    });
    addXP(200);
    addCoins(40);
    setWorkoutDone(true);
  };

  if (activeWorkout) {
    return (
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {workoutDone ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-7xl mb-4 animate-float">🏆</div>
              <h2 className="text-2xl font-black text-gradient mb-2">Workout Complete!</h2>
              <p className="text-gray-400 mb-6">You crushed {activeWorkout.name}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="card p-4 text-center">
                  <div className="text-2xl font-black text-orange-400">{activeWorkout.calories}</div>
                  <div className="text-xs text-gray-500">Calories Burned</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-black text-purple-400">+200</div>
                  <div className="text-xs text-gray-500">XP Earned</div>
                </div>
              </div>
              <button onClick={() => { setActiveWorkout(null); setWorkoutDone(false); }} className="btn-primary w-full">
                Back to Workouts
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <button onClick={() => setActiveWorkout(null)} className="text-gray-400 text-sm font-medium">← Back</button>
              <div className={`rounded-3xl p-5 bg-gradient-to-br ${activeWorkout.color} border ${activeWorkout.border}`}>
                <div className="text-4xl mb-2">{activeWorkout.emoji}</div>
                <h2 className="text-xl font-black text-white">{activeWorkout.name}</h2>
              </div>
              <div className="space-y-2">
                {activeWorkout.exercises.map((ex, i) => {
                  const done = completedExercises.has(ex.name);
                  return (
                    <div
                      key={ex.name}
                      onClick={() => {
                        if (done) {
                          const next = new Set(completedExercises);
                          next.delete(ex.name);
                          setCompletedExercises(next);
                        } else {
                          // Start camera tracking for this specific exercise
                          setCameraVerification(true, `Workout: ${ex.name}`, () => {
                            const next = new Set(completedExercises);
                            next.add(ex.name);
                            setCompletedExercises(next);
                          });
                        }
                      }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        done ? "border-green-500/40 bg-green-500/10" : "border-white/8 bg-white/3 hover:bg-white/6"
                      }`}
                    >
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          done ? "border-green-500 bg-green-500 text-white animate-scale-up" : "border-gray-600"
                        }`}
                      >
                        {done && <Check size={16} />}
                      </motion.button>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${done ? "line-through text-gray-500" : "text-white"}`}>
                          {ex.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ex.sets} sets × {ex.duration ? `${ex.duration}s` : `${ex.reps} reps`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleComplete} className="btn-primary w-full flex items-center justify-center gap-2">
                <CheckCircle size={18} /> Complete Workout (+200 XP)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h2 className="text-xl font-black text-white mb-1">💪 Fitness Training</h2>
        <p className="text-sm text-gray-400">AI-curated workout plans</p>
      </div>
      <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <div className="flex justify-center gap-8">
          <div><div className="text-xl font-black text-white">{user?.weight || "—"}kg</div><div className="text-xs text-gray-500">Weight</div></div>
          <div><div className="text-xl font-black text-white">{user?.height || "—"}cm</div><div className="text-xs text-gray-500">Height</div></div>
          <div><div className="text-xl font-black text-purple-400 capitalize">{user?.fitnessGoal?.replace("_", " ") || "—"}</div><div className="text-xs text-gray-500">Goal</div></div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === cat ? "gradient-purple text-white" : "bg-white/8 text-gray-400 border border-white/10"}`}>
            {cat}
          </motion.button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((workout, i) => (
          <motion.div key={workout.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl p-4 bg-gradient-to-br ${workout.color} border ${workout.border}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{workout.emoji}</span>
                <div>
                  <h3 className="font-bold text-sm text-white">{workout.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{workout.category}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{workout.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} />{workout.duration}m</div>
                <div className="flex items-center gap-1 text-xs text-orange-400"><Flame size={12} />{workout.calories} cal</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCameraVerification(true, `Workout: ${workout.name}`, () => {
                    setActiveWorkout(workout);
                    setCompletedExercises(new Set());
                    setWorkoutDone(false);
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-purple text-white text-xs font-bold"
              >
                <Play size={12} /> Start
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
