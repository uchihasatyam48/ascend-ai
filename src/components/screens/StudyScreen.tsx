"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Play, Pause, RotateCcw, BookOpen, AlertTriangle, Moon, Clock, UserCheck, BarChart3, Award } from "lucide-react";
import StudyCameraMonitor from "@/components/StudyCameraMonitor";

const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "History", "English", "Computer Science", "Economics"];

export default function StudyScreen() {
  const { logStudySession, addXP, addCoins, pomodoroActive, pomodoroTime, pomodoroMode,
    setPomodoroActive, setPomodoroTime, setPomodoroMode, studySessions } = useAppStore();
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [customSubject, setCustomSubject] = useState("");
  const [sessionDone, setSessionDone] = useState(false);
  const [focusPausedToast, setFocusPausedToast] = useState(false);
  const [isStudySessionActive, setIsStudySessionActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // AI Focus stats during active session
  const [focusStats, setFocusStats] = useState({
    focusScore: 100,
    distractions: 0,
    sleepIncidents: 0,
    timeAway: 0,
    blinks: 0
  });

  // Completed session copy for the report card
  const [completedSessionStats, setCompletedSessionStats] = useState<typeof focusStats | null>(null);

  const handlePauseTimer = useCallback(() => {
    setPomodoroActive(false);
    setFocusPausedToast(true);
  }, [setPomodoroActive]);

  const handleResumeTimer = useCallback(() => {
    setFocusPausedToast(false);
    setPomodoroActive(true);
  }, [setPomodoroActive]);

  const handleUpdateStats = useCallback((stats: typeof focusStats) => {
    setFocusStats(stats);
  }, []);

  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  // Sync isStudySessionActive with pomodoroActive on page mount/reload
  useEffect(() => {
    if (pomodoroActive && pomodoroMode === "work") {
      setIsStudySessionActive(true);
    }
  }, []);

  useEffect(() => {
    if (pomodoroActive) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime(pomodoroTime <= 1 ? (pomodoroMode === "work" ? BREAK_TIME : WORK_TIME) : pomodoroTime - 1);
        if (pomodoroTime <= 1) {
          setPomodoroMode(pomodoroMode === "work" ? "break" : "work");
          if (pomodoroMode === "work") {
            logStudySession({
              id: `study_${Date.now()}`,
              subject: customSubject || selectedSubject,
              duration: WORK_TIME,
              date: new Date().toDateString(),
              focusScore: focusStats.focusScore,
              distractions: focusStats.distractions,
              sleepIncidents: focusStats.sleepIncidents,
              timeAway: focusStats.timeAway,
            });
            addXP(150);
            addCoins(30);
            setCompletedSessionStats({ ...focusStats });
            setSessionDone(true);
            setIsStudySessionActive(false);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [pomodoroActive, pomodoroTime, pomodoroMode]);

  const minutes = Math.floor(pomodoroTime / 60).toString().padStart(2, "0");
  const seconds = (pomodoroTime % 60).toString().padStart(2, "0");
  const progress = pomodoroMode === "work" ? (WORK_TIME - pomodoroTime) / WORK_TIME : (BREAK_TIME - pomodoroTime) / BREAK_TIME;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const todaySessions = studySessions.filter((s) => s.date === new Date().toDateString());
  const todayHours = todaySessions.reduce((acc, s) => acc + s.duration / 3600, 0);

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h2 className="text-xl font-black text-white mb-1">📚 Study Mode</h2>
        <p className="text-sm text-gray-400">Deep focus, Pomodoro tracking</p>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sessions", value: todaySessions.length, color: "text-purple-400" },
          { label: "Hours", value: todayHours.toFixed(1), color: "text-blue-400" },
          { label: "Avg Focus", value: `${todaySessions.length ? Math.round(todaySessions.reduce((a, s) => a + s.focusScore, 0) / todaySessions.length) : 0}%`, color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pomodoro Timer */}
      <div className="card p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${pomodoroMode === "work" ? "bg-purple-500/20 text-purple-300" : "bg-green-500/20 text-green-300"}`}>
            {pomodoroMode === "work" ? "🎯 Focus Time" : "☕ Break Time"}
          </div>
        </div>

        {/* SVG Circle timer */}
        <div className="relative w-52 h-52 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <motion.circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke={pomodoroMode === "work" ? "#8b5cf6" : "#10b981"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ filter: `drop-shadow(0 0 8px ${pomodoroMode === "work" ? "#8b5cf6" : "#10b981"})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-black text-white">{minutes}:{seconds}</div>
            <div className="text-xs text-gray-400 mt-1">
              {pomodoroMode === "work" ? "Stay focused!" : "Rest up!"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setPomodoroTime(WORK_TIME);
              setPomodoroActive(false);
              setPomodoroMode("work");
              setIsStudySessionActive(false);
            }}
            className="w-12 h-12 rounded-full bg-white/8 flex items-center justify-center border border-white/10"
          >
            <RotateCcw size={18} className="text-gray-400" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isStudySessionActive) {
                setPomodoroActive(false);
                setIsStudySessionActive(false);
              } else {
                setFocusPausedToast(false);
                setPomodoroActive(true);
                setIsStudySessionActive(true);
              }
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${isStudySessionActive ? "bg-red-500/80" : "gradient-purple"}`}
          >
            {isStudySessionActive ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setPomodoroMode(pomodoroMode === "work" ? "break" : "work")}
            className="w-12 h-12 rounded-full bg-white/8 flex items-center justify-center border border-white/10"
          >
            <BookOpen size={18} className="text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Embedded Study Focus Camera Monitor */}
      <AnimatePresence>
        {isStudySessionActive && pomodoroMode === "work" && (
          <StudyCameraMonitor
            isActive={isStudySessionActive}
            timerRunning={pomodoroActive}
            onPauseTimer={handlePauseTimer}
            onResumeTimer={handleResumeTimer}
            onUpdateStats={handleUpdateStats}
          />
        )}
      </AnimatePresence>

      {/* Subject Selector */}
      <div className="card p-4 space-y-3">
        <h3 className="font-bold text-sm text-white">Subject</h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSubject(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSubject === s ? "gradient-blue text-white" : "bg-white/8 text-gray-400 border border-white/10"}`}
            >
              {s}
            </motion.button>
          ))}
        </div>
        <input
          placeholder="Or type a custom subject..."
          value={customSubject}
          onChange={(e) => setCustomSubject(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Session Complete Analytics Report Card */}
      <AnimatePresence>
        {sessionDone && completedSessionStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card p-5 border border-green-500/30 bg-[#0c1219]/95 backdrop-blur-xl relative overflow-hidden space-y-4"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <Award className="text-green-400" size={22} />
              <div>
                <h3 className="font-black text-sm text-green-300">Focus Session Complete!</h3>
                <p className="text-[10px] text-gray-500">Subject: {customSubject || selectedSubject}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-2xl font-black text-white">{completedSessionStats.focusScore}%</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Focus Score</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                <div className="text-2xl font-black text-green-400">+{150} XP</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">XP Reward</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-1.5"><Clock size={12} /> Duration</span>
                <span className="font-bold text-white">25:00</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-1.5"><AlertTriangle size={12} className="text-yellow-500" /> Distractions</span>
                <span className="font-bold text-white">{completedSessionStats.distractions} events</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-1.5"><Moon size={12} className="text-blue-400" /> Sleep Alerts</span>
                <span className="font-bold text-white">{completedSessionStats.sleepIncidents} incidents</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-1.5"><UserCheck size={12} className="text-green-400" /> Blinks Recorded</span>
                <span className="font-bold text-white">{completedSessionStats.blinks}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSessionDone(false);
                setCompletedSessionStats(null);
              }}
              className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-green-500/20 transition-all"
            >
              Great, let's keep going!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session history */}
      {todaySessions.length > 0 && (
        <div className="card p-4 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <BarChart3 size={15} className="text-purple-400" />
            <span>Today&apos;s Focus Sessions</span>
          </h3>
          {todaySessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-bold text-white">{session.subject}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                  <span>{Math.round(session.duration / 60)} min</span>
                  <span>•</span>
                  <span>{session.distractions ?? 0} distracts</span>
                  <span>•</span>
                  <span>{session.sleepIncidents ?? 0} sleep events</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-green-400">{session.focusScore}%</div>
                <div className="text-[9px] text-gray-500 uppercase font-extrabold tracking-wider">focus</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Focus Lost Paused Toast */}
      <AnimatePresence>
        {focusPausedToast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto z-50 rounded-2xl p-4 bg-red-500/20 border border-red-500/40 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-sm text-red-300">Study Timer Paused</p>
                <p className="text-xs text-gray-400">AI Focus Monitor lost track of your study focus.</p>
              </div>
              <button onClick={() => setFocusPausedToast(false)} className="ml-auto text-gray-400 text-xs">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
