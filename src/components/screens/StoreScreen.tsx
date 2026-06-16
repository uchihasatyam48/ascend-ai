"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

const storeItems = [
  { id: "s1", name: "Dark Knight Theme", category: "Theme", cost: 500, emoji: "🌑", description: "Premium dark UI theme with crimson accents", rarity: "epic" },
  { id: "s2", name: "Neon Cyber Theme", category: "Theme", cost: 750, emoji: "💜", description: "Cyberpunk-inspired neon purple theme", rarity: "legendary" },
  { id: "s3", name: "Warrior Avatar", category: "Avatar", cost: 300, emoji: "⚔️", description: "Unlock the Warrior avatar frame", rarity: "rare" },
  { id: "s4", name: "Dragon Avatar", category: "Avatar", cost: 800, emoji: "🐉", description: "Legendary dragon frame avatar", rarity: "legendary" },
  { id: "s5", name: "Elite Badge Pack", category: "Badge", cost: 200, emoji: "🏅", description: "5 exclusive elite achievement badges", rarity: "rare" },
  { id: "s6", name: "Motivation Pack", category: "Content", cost: 150, emoji: "🧠", description: "50 AI-curated motivational quotes", rarity: "common" },
  { id: "s7", name: "XP Boost 24h", category: "Boost", cost: 100, emoji: "⚡", description: "Double XP for 24 hours", rarity: "rare" },
  { id: "s8", name: "Power Challenge", category: "Challenge", cost: 250, emoji: "🔥", description: "7-day elite fitness challenge", rarity: "epic" },
];

const rarityColors: Record<string, { text: string; bg: string; border: string }> = {
  common: { text: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/30" },
  rare: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  epic: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  legendary: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
};

const categories = ["All", "Theme", "Avatar", "Badge", "Boost", "Challenge", "Content"];

import { useState } from "react";

export default function StoreScreen() {
  const { user, addCoins } = useAppStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  const filtered = activeCategory === "All" ? storeItems : storeItems.filter((i) => i.category === activeCategory);

  const handlePurchase = (item: (typeof storeItems)[0]) => {
    if (!user || user.coins < item.cost || purchased.has(item.id)) return;
    addCoins(-item.cost);
    setPurchased((prev) => new Set([...prev, item.id]));
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h2 className="text-xl font-black text-white mb-1">🛍️ Ascend Store</h2>
        <p className="text-sm text-gray-400">Spend your earned coins on premium items</p>
      </div>

      {/* Coin Balance */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))", border: "1px solid rgba(245,158,11,0.3)" }}
      >
        <div>
          <p className="text-xs text-gray-400 mb-1">Your Balance</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="text-3xl font-black text-yellow-400">{user?.coins || 0}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">Earn more by</p>
          <p className="text-xs text-yellow-300 font-semibold">Completing quests & habits</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory === cat ? "gradient-purple text-white" : "bg-white/8 text-gray-400 border border-white/10"}`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((item, i) => {
          const rarity = rarityColors[item.rarity];
          const isPurchased = purchased.has(item.id);
          const canAfford = (user?.coins || 0) >= item.cost;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl p-4 ${rarity.bg} border ${rarity.border} flex flex-col gap-2`}
            >
              <div className="text-4xl">{item.emoji}</div>
              <div>
                <h3 className="font-bold text-xs text-white leading-tight">{item.name}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className={`text-[10px] font-bold uppercase ${rarity.text}`}>{item.rarity}</div>
                <span className={`text-xs font-bold ${rarity.text}`}>🪙 {item.cost}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePurchase(item)}
                disabled={isPurchased || !canAfford}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  isPurchased
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : canAfford
                    ? "gradient-purple text-white"
                    : "bg-white/5 text-gray-600 border border-white/8 cursor-not-allowed"
                }`}
              >
                {isPurchased ? "✓ Owned" : canAfford ? "Buy Now" : "Not Enough Coins"}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
