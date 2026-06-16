"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface TooltipProps { active?: boolean; payload?: Array<{ value: number }>; label?: string; }
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-xl p-2 text-xs border border-white/10">
        <p className="text-gray-400">{label}</p>
        <p className="font-bold text-purple-400">{payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsScreen() {
  const { weightHistory, studySessions, habits, user } = useAppStore();

  const weightData = weightHistory.map((e) => ({
    date: e.date.slice(5),
    weight: e.weight,
  }));

  const studyData = useMemo(() => {
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const mockHours = [2.5, 3.2, 1.8, 4.0, 3.5, 2.0, 1.5];
    return weekDays.map((day, i) => ({ day, hours: mockHours[i] }));
  }, []);

  return (
    <div className="px-4 py-4 space-y-5">
      <div>
        <h2 className="text-xl font-black text-white mb-1">📊 Analytics</h2>
        <p className="text-sm text-gray-400">Your progress at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Study Hours", value: `${(studySessions.reduce((a, s) => a + s.duration, 0) / 3600).toFixed(1)}h`, icon: "📚", color: "text-blue-400" },
          { label: "Workouts Done", value: user?.level ? user.level * 3 : 0, icon: "💪", color: "text-purple-400" },
          { label: "Best Streak", value: `${Math.max(...habits.map(h => h.streak), 0)}d`, icon: "🔥", color: "text-orange-400" },
          { label: "XP Earned", value: user?.xp.toLocaleString() || 0, icon: "⭐", color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weight Chart */}
      <div className="card p-4">
        <h3 className="font-bold text-sm text-white mb-4">⚖️ Weight Progress (kg)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 10 }} />
            <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#a78bfa" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Study Hours Chart */}
      <div className="card p-4">
        <h3 className="font-bold text-sm text-white mb-4">📚 Study Hours (This Week)</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={studyData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#4b5563" tick={{ fontSize: 10 }} />
            <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]}
              style={{ filter: "drop-shadow(0 0 6px rgba(59,130,246,0.4))" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Habit Streaks */}
      <div className="card p-4">
        <h3 className="font-bold text-sm text-white mb-4">🔥 Habit Streaks</h3>
        <div className="space-y-3">
          {habits.map((h) => (
            <div key={h.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{h.icon} {h.name}</span>
                <span className="font-bold" style={{ color: h.color }}>{h.streak} days</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((h.streak / 30) * 100, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: h.color, boxShadow: `0 0 8px ${h.color}60` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
