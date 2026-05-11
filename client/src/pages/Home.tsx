import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getEquipped, PETS, PROFILE_FRAMES } from "@/data/storeItems";

function getPlayerName() { return localStorage.getItem("playerName") || ""; }
// Standard chapter counts for each Bible book
const CHAPTER_COUNTS: Record<string, number> = {
  Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,
  "1 Samuel":31,"2 Samuel":24,"1 Kings":22,"2 Kings":25,"1 Chronicles":29,"2 Chronicles":36,
  Ezra:10,Nehemiah:13,Esther:10,Job:42,Psalms:150,Proverbs:31,Ecclesiastes:12,"Song of Solomon":8,
  Isaiah:66,Jeremiah:52,Lamentations:5,Ezekiel:48,Daniel:12,Hosea:14,Joel:3,Amos:9,
  Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,Zephaniah:3,Haggai:2,Zechariah:14,Malachi:4,
  Matthew:28,Mark:16,Luke:24,John:21,Acts:28,Romans:16,"1 Corinthians":16,"2 Corinthians":13,
  Galatians:6,Ephesians:6,Philippians:4,Colossians:4,"1 Thessalonians":5,"2 Thessalonians":3,
  "1 Timothy":6,"2 Timothy":4,Titus:3,Philemon:1,Hebrews:13,James:5,"1 Peter":5,"2 Peter":3,
  "1 John":5,"2 John":1,"3 John":1,Jude:1,Revelation:22
};
function getLastRead() {
  const book = localStorage.getItem("lastReadBook");
  const chapter = localStorage.getItem("lastReadChapter");
  const chapterIdx = localStorage.getItem("lastReadChapterIdx");
  if (book && chapter) {
    const totalChapters = CHAPTER_COUNTS[book] || 1;
    const readChapters = (() => { try { return JSON.parse(localStorage.getItem(`chaptersRead_${book}`) || "[]").length; } catch { return 0; } })();
    const progress = Math.round((readChapters / totalChapters) * 100);
    return { book, chapter: parseInt(chapter), chapterIdx: parseInt(chapterIdx || "0"), progress, totalChapters };
  }
  return null;
}
function getTotalXP() { return parseInt(localStorage.getItem("totalXP") || "0"); }
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

// Real meme images hosted on Firebase (same as old app)
const MEME_BASE_URL = "https://teens-bible-94271.web.app/memes/";
const memeUrls = [
  "meme_001.jpg","meme_002.webp","meme_003.webp","meme_004.webp","meme_005.webp",
  "meme_006.webp","meme_007.webp","meme_008.jpg","meme_009.jpg","meme_010.jpg",
  "meme_011.jpg","meme_012.jpg","meme_013.webp","meme_014.jpg","meme_015.webp",
  "meme_016.jpg","meme_017.jpg","meme_018.jpg","meme_019.jpg","meme_020.jpg",
  "meme_021.jpg","meme_022.jpeg","meme_023.jpg","meme_024.webp","meme_025.jpg",
  "meme_026.jpg","meme_027.webp","meme_028.jpeg","meme_029.webp","meme_030.jpg",
  "meme_031.jpg","meme_032.jpg","meme_033.jpg","meme_034.jpg","meme_035.png",
  "meme_036.jpg","meme_037.jpg","meme_038.jpg","meme_039.jpeg","meme_040.jpg",
  "meme_041.png","meme_042.jpg","meme_043.jpg","meme_044.jpg","meme_045.jpg",
  "meme_046.jpg","meme_047.jpg","meme_048.jpg","meme_049.jpg","meme_050.png",
  "meme_051.jpg","meme_052.jpg","meme_053.jpg","meme_054.jpg","meme_055.jpg",
  "meme_056.jpg","meme_057.jpg","meme_058.jpg","meme_059.jpg","meme_060.jpg",
  "meme_061.jpg","meme_062.jpg","meme_063.jpg","meme_064.jpg","meme_065.gif",
  "meme_066.jpg","meme_067.jpg","meme_068.jpg","meme_069.jpg","meme_070.jpg",
  "meme_071.jpg","meme_072.jpg","meme_073.jpg","meme_074.jpg","meme_075.jpg",
  "meme_076.jpg","meme_077.jpg","meme_078.jpg","meme_079.jpg","meme_080.jpg",
  "meme_081.png","meme_082.png","meme_083.jpg","meme_084.jpg","meme_085.jpg",
  "meme_086.jpg","meme_087.jpg","meme_088.jpg","meme_089.jpg","meme_090.jpg",
  "meme_091.jpg","meme_092.jpg","meme_093.jpg","meme_094.jpg","meme_095.jpg",
  "meme_096.jpg","meme_097.jpg","meme_098.jpg","meme_099.jpg","meme_100.jpg",
];

// Seasonal memes
const seasonalMemes: Record<string, string[]> = {
  christmas: ["christmas_001.jpg","christmas_002.jpg","christmas_003.png","christmas_004.jpg","christmas_005.jpg","christmas_006.jpg"],
  easter: ["easter_001.jpg","easter_002.jpg","easter_003.jpg","easter_004.jpg","easter_005.jpg","easter_006.jpg","easter_007.jpg"],
  thanksgiving: ["thanksgiving_001.jpg","thanksgiving_002.jpg","thanksgiving_003.jpg","thanksgiving_004.jpg","thanksgiving_005.jpg","thanksgiving_006.jpg"],
  lent: ["lent_001.jpg","lent_002.jpg"],
  backtoschool: ["school_001.jpg","school_002.jpg","school_003.jpg","school_004.jpg","school_005.jpg"],
};

function getActiveSeason(): string | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (month === 12 || (month === 1 && day <= 6)) return "christmas";
  if ((month === 3 && day >= 15) || month === 4) return "easter";
  if ((month === 2 && day >= 15) || (month === 3 && day < 15)) return "lent";
  if (month === 11) return "thanksgiving";
  if ((month === 8 && day >= 15) || (month === 9 && day <= 15)) return "backtoschool";
  if (month === 2 && day >= 20 && day <= 28) return "backtoschool";
  return null;
}

function getDailyMemeUrl(): string {
  let allMemes = [...memeUrls];
  const season = getActiveSeason();
  if (season && seasonalMemes[season]) {
    allMemes = allMemes.concat(seasonalMemes[season]);
  }
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const idx = dayOfYear % allMemes.length;
  return MEME_BASE_URL + allMemes[idx];
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

  const chaptersRead = getChaptersRead();
  const gems = getGems();
  const level = getLevel(totalXP);
  const xpProgress = Math.min(100, (totalXP / level.next) * 100);

  const memeUrl = getDailyMemeUrl();

  const greeting = playerName ? `Hey ${playerName}!` : "Hey there!";
  const equipped = getEquipped();
  const equippedPet = PETS.find(p => p.id === equipped.pet);
  const equippedFrame = PROFILE_FRAMES.find(f => f.id === equipped.frame);

  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-full overflow-hidden bg-purple-900/50 flex items-center justify-center ${equippedFrame?.frameClass || 'border-[3px] border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]'}`}>
            <span className="text-3xl">👦</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-purple-400">{level.level}</div>
          {equippedPet && <div className="absolute -top-1 -left-1 text-lg">{equippedPet.petEmoji}</div>}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white font-display">{greeting}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span>📖 {chaptersRead} Chapters Read</span>
            <span>💎 Lv. {level.level}</span>
          </div>
        </div>
      </div>

      {/* Today's Reading Card */}
      {(() => {
        const lastRead = getLastRead();
        const bookName = lastRead?.book || "Genesis";
        const chapterNum = lastRead?.chapter || 1;
        const progress = lastRead?.progress || 0;
        return (
          <div className="neon-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-300 text-sm font-semibold">{lastRead ? "📖 CONTINUE READING" : "📖 START READING"}</span>
                </div>
                <h2 className="text-2xl font-bold text-white font-display">{bookName}</h2>
                <h3 className="text-xl font-bold text-white font-display">Chapter {chapterNum}</h3>
                <p className="text-gray-400 text-sm mt-1">{lastRead ? `${lastRead.totalChapters} chapters total` : "Begin your journey"}</p>
                <button onClick={() => setLocation("/bible")}
                  className="mt-3 px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-xl text-purple-200 text-sm font-medium flex items-center gap-2 hover:bg-purple-600/50 transition-all active:scale-95">
                  📖 {lastRead ? "Continue Reading" : "Start Reading"}
                </button>
              </div>
              <div className="relative flex items-center justify-center">
                <ProgressRing progress={progress} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{progress}<span className="text-sm">%</span></span>
                  <span className="text-[10px] text-purple-300">Progress</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bible AI - Prominent Card */}
      <button
        onClick={() => setLocation("/chat")}
        className="w-full neon-card p-5 flex items-center gap-4 hover:border-purple-400/60 transition-all active:scale-[0.98] cursor-pointer group"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Rounded square outline */}
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" strokeWidth="1.8" fill="none" />
            {/* Large 4-point star (bottom-left) */}
            <path d="M8 17 L8.8 14.5 L11 13.7 L8.8 12.9 L8 10.4 L7.2 12.9 L5 13.7 L7.2 14.5 Z" fill="white" />
            {/* Medium 4-point star (top-right) */}
            <path d="M16 11 L16.7 9 L18.5 8.3 L16.7 7.6 L16 5.6 L15.3 7.6 L13.5 8.3 L15.3 9 Z" fill="white" />
            {/* Small 4-point star (top-left area) */}
            <path d="M9 7.5 L9.4 6.3 L10.5 5.9 L9.4 5.5 L9 4.3 L8.6 5.5 L7.5 5.9 L8.6 6.3 Z" fill="white" />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-white font-bold text-base">Bible AI</h3>
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



      {/* Bible Meme of the Day */}
      <div className="neon-card p-4 cursor-pointer active:scale-[0.98] transition-transform">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold text-sm">😂 BIBLE MEME OF THE DAY</span>
        </div>
        <div className="rounded-xl overflow-hidden border border-purple-500/20">
          <img
            src={memeUrl}
            alt="Bible Meme of the Day"
            className="w-full h-auto rounded-xl"
            loading="lazy"
          />
        </div>
        <div className="flex justify-center gap-3 mt-3">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-sm active:scale-95 transition-transform">
            <span>😂</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-sm active:scale-95 transition-transform">
            <span>🔥</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-sm active:scale-95 transition-transform">
            <span>💀</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-sm active:scale-95 transition-transform">
            <span>🙏</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="neon-card p-3 text-center"><span className="text-2xl">📖</span><div className="text-xl font-bold text-white mt-1">{chaptersRead}</div><div className="text-[10px] text-gray-400">Chapters Read</div></div>
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
