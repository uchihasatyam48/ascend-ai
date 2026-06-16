import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ascend AI – Level Up Your Life",
  description:
    "Your AI-powered self-improvement companion. Transform your fitness, studies, and habits with personalized coaching, gamification, and intelligent tracking.",
  keywords: "fitness tracker, study planner, habit builder, AI coaching, self-improvement, gamification",
  authors: [{ name: "Ascend AI" }],
  openGraph: {
    title: "Ascend AI – Level Up Your Life",
    description: "AI-powered self-improvement app combining fitness, studying, habits, and gamification.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
