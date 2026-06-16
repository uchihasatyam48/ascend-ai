import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getLevelTitle(level: number): string {
  if (level >= 100) return "Ascended";
  if (level >= 50) return "Elite";
  if (level >= 25) return "Warrior";
  if (level >= 10) return "Disciplined";
  return "Beginner";
}

export function getXPForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level));
}
