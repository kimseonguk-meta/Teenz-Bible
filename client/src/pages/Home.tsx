import { useState, useEffect } from "react";
import { useLocation } from "wouter";

function getPlayerName() { return localStorage.getItem("playerName") || ""; }
function getTotalXP() { return parseInt(localStorage.getItem("totalXP") || "0"); }
function getDayStreak() { return parseInt(localStorage.getItem("dayStreak") || "0"); }
function getGems() {
  try { const raw = localStorage.getItem("teensBible"); return raw ? JSON.parse(raw).gems || 0 : 0; } catch { return 0; }
}
function getChaptersRead() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("chaptersRead_")) {
      try { const arr = JSON.parse(localStorage.getItem(key) || "[]"); total += arr.length; } catch {}
    }
  }
  return total;
}
function getLevel(xp: number) {
  if (xp >= 5000) return { name: "Master", level: 10, next: 999999 };
  if (xp >= 3000) return { name: "Champion", level: 8, next: 5000 };
  if (xp >= 2000) return { name: "Scholar", level: 6, next: 3000 };
  if (xp >= 1000) return { name: "Explorer", level: 5, next: 2000 };
  if (xp >= 500) return { name: "Reader", level: 3, next: 1000 };
  if (xp >= 100) return { name: "Beginner", level: 2, next: 500 };
  return { name: "Newbie", level: 1, next: 100 };
}

// Meme data for Bible Meme of the Day
const MEMES = [
  { id: 1, text: "When you finally finish reading Leviticus", emoji: "😅", reaction: "LOL" },
  { id: 2, text: "Noah building the ark while everyone laughs", emoji: "🚢", reaction: "Fire" },
  { id: 3, text: "When someone says 'I'll pray for you' during an argument", emoji: "🙏", reaction: "Dead" },
  { id: 4, text: "Moses parting the Red Sea like a boss", emoji: "🌊", reaction: "Fire" },
  { id: 5, text: "When David pulled up with just a sling", emoji: "💪", reaction: "LOL" },
  { id: 6, text: "Jonah trying to run from God... in a boat", emoji: "🐋", reaction: "Dead" },
  { id: 7, text: "Peter walking on water then looking down", emoji: "😱", reaction: "LOL" },
];

function getDailyMeme() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return MEMES[dayOfYear % MEMES.length];
}

function ProgressRing({ progress, size = 90, strokeWidth = 7 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(139,92,246,0.15)" strokeWidth={strokeWidth} fill="none" />
      <circle cx={size/2} cy={size/2} r={radius} stroke="url(#pgr)" strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      <defs><linearGradient id="pgr" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#c084fc"/></linearGradient></defs>
    </svg>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const playerName = getPlayerName();
  const totalXP = getTotalXP();
  const dayStreak = getDayStreak();
  const chaptersRead = getChaptersRead();
  const gems = getGems();
  const level = getLevel(totalXP);
  const xpProgress = Math.min(100, (totalXP / level.next) * 100);
  const days = ["S","M","T","W","T","F","S"];
  const today = new Date().getDay();
  const meme = getDailyMeme();

  const greeting = playerName ? `Hey ${playerName}!` : "Hey there!";

  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-[3px] border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] overflow-hidden bg-purple-900/50 flex items-center justify-center">
            <span className="text-3xl">👦</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-purple-400">{level.level}</div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white font-display">{greeting} 🔥</h1>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span>🔥 {dayStreak} Day Streak</span>
            <span>💎 Lv. {level.level}</span>
          </div>
        </div>
      </div>

      {/* Today's Reading Card */}
      <div className="neon-card p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-300 text-sm font-semibold">📖 TODAY'S READING</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-display">Matthew</h2>
            <h3 className="text-xl font-bold text-white font-display">Chapter 5</h3>
            <p className="text-gray-400 text-sm mt-1">The Sermon on the Mount</p>
            <button onClick={() => setLocation("/bible")}
              className="mt-3 px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-xl text-purple-200 text-sm font-medium flex items-center gap-2 hover:bg-purple-600/50 transition-all active:scale-95">
              📖 Continue Reading
            </button>
          </div>
          <div className="relative flex items-center justify-center">
            <ProgressRing progress={75} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">75<span className="text-sm">%</span></span>
              <span className="text-[10px] text-purple-300">Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Bible Chat - Prominent Card */}
      <button
        onClick={() => setLocation("/chat")}
        className="w-full neon-card p-5 flex items-center gap-4 hover:border-purple-400/60 transition-all active:scale-[0.98] cursor-pointer group"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" fill="url(#sparkle-grad)" />
            <path d="M12 6L13.09 9.26L16 9.77L13.78 12.22L14.45 15.5L12 14.1L9.55 15.5L10.22 12.22L8 9.77L10.91 9.26L12 6Z" fill="rgba(255,255,255,0.9)" />
            <defs>
              <linearGradient id="sparkle-grad" x1="4" y1="2" x2="20" y2="20">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-white font-bold text-base">Bible AI Chat</h3>
          <p className="text-gray-400 text-sm mt-0.5">Ask anything about the Bible — get instant answers</p>
        </div>
        <div className="text-purple-400 text-lg">→</div>
      </button>

      {/* XP Bar */}
      <div className="neon-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-800 border border-yellow-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.3)]">
          <span className="text-xs font-bold text-yellow-200">XP</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold">{totalXP.toLocaleString()}</span>
            <span className="text-gray-400 text-xs">/ {level.next.toLocaleString()} XP</span>
          </div>
          <div className="h-2.5 bg-gray-800/80 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-cyan-400 transition-all duration-500" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-yellow-600/20 border border-yellow-500/40 flex items-center justify-center"><span className="text-sm">🏆</span></div>
      </div>

      {/* Streak Calendar */}
      <div className="neon-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-bold text-sm">🔥 Streak Calendar</span>
          <span className="text-purple-300 text-xs">{dayStreak} days</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 py-2 rounded-lg ${i === today ? 'bg-purple-600/30 border border-purple-500/40' : ''}`}>
              <span className="text-gray-400 text-[10px]">{d}</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                i < today ? 'bg-green-500/20 border border-green-500/40 text-green-400' :
                i === today ? 'bg-purple-500/30 border border-purple-400 text-purple-300' :
                'bg-gray-800/50 border border-gray-700/30 text-gray-600'
              }`}>
                {i < today ? '✓' : i === today ? '•' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bible Meme of the Day */}
      <div className="neon-card p-4 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setLocation("/memes")}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold text-sm">😂 MEME OF THE DAY</span>
          <span className="text-purple-300 text-[10px]">Tap to see more</span>
        </div>
        <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/20">
          <div className="text-center">
            <span className="text-4xl">{meme.emoji}</span>
            <p className="text-white text-sm font-medium mt-2 leading-relaxed">{meme.text}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="neon-card p-3 text-center"><span className="text-2xl">🔥</span><div className="text-xl font-bold text-white mt-1">{dayStreak}</div><div className="text-[10px] text-gray-400">Day Streak</div></div>
        <div className="neon-card p-3 text-center"><span className="text-2xl">📖</span><div className="text-xl font-bold text-white mt-1">{chaptersRead}</div><div className="text-[10px] text-gray-400">Chapters</div></div>
        <div className="neon-card p-3 text-center"><span className="text-2xl">💎</span><div className="text-xl font-bold text-white mt-1">{gems}</div><div className="text-[10px] text-gray-400">Gems</div></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <button onClick={() => setLocation("/bible")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">📖</span><div className="text-sm font-medium text-white mt-1">Start Reading</div>
        </button>
        <button onClick={() => setLocation("/map")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">🗺️</span><div className="text-sm font-medium text-white mt-1">Bible Map</div>
        </button>
      </div>
    </div>
  );
}
