import { useState, useEffect } from "react";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { registerPlugin } from '@capacitor/core';
import { isNativePlatform } from '@/lib/platform';

// Register the SaveToPhotos native plugin
interface SaveToPhotosPlugin {
  savePhoto(options: { url: string }): Promise<{ saved: boolean }>;
}
const SaveToPhotos = registerPlugin<SaveToPhotosPlugin>('SaveToPhotos');
import { useLocation } from "wouter";
import { getEquipped, PETS, PROFILE_FRAMES } from "@/data/storeItems";
import { getPetDefaultSprite } from "@/data/petSprites";
import { toast } from "sonner";
import { isLinkedToGoogle, linkOrSignInWithGoogle } from "@/lib/googleAuth";
import { isLinkedToApple, linkOrSignInWithApple } from "@/lib/appleAuth";
import { celebrateLogin } from "@/lib/celebration";
import FantasyIcon from "@/components/FantasyIcon";

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
  "meme_001.jpg","meme_002.jpg","meme_003.jpg","meme_004.jpg","meme_005.jpg",
  "meme_006.jpg","meme_007.jpg","meme_008.jpg","meme_009.jpg","meme_010.jpg",
  "meme_011.webp","meme_012.jpg","meme_013.webp","meme_014.jpg","meme_015.jpg",
  "meme_016.jpg","meme_017.webp","meme_018.jpg","meme_019.webp","meme_020.jpg",
  "meme_021.jpg","meme_022.jpg","meme_023.jpg","meme_024.jpg","meme_025.jpg",
  "meme_026.jpg","meme_027.jpeg","meme_028.jpg","meme_029.jpg","meme_030.jpg",
  "meme_031.jpg","meme_032.jpg","meme_033.jpg","meme_034.webp","meme_035.jpeg",
  "meme_036.webp","meme_037.jpg","meme_038.jpg","meme_039.jpg","meme_040.jpg",
  "meme_041.webp","meme_042.jpg","meme_043.jpg","meme_044.jpg","meme_045.jpg",
  "meme_046.jpeg","meme_047.jpeg","meme_048.png","meme_049.jpg","meme_050.jpg",
  "meme_051.webp","meme_052.jpg","meme_053.jpeg","meme_054.jpg","meme_055.jpg",
  "meme_056.jpg","meme_057.jpg","meme_058.jpg","meme_059.jpg","meme_060.jpg",
  "meme_061.jpg","meme_062.png","meme_063.webp","meme_064.jpg","meme_065.webp",
  "meme_066.jpg","meme_067.jpg","meme_068.jpg","meme_069.jpg","meme_070.jpg",
  "meme_071.jpg","meme_072.jpg","meme_073.jpg","meme_074.jpg","meme_075.jpg",
  "meme_076.jpg","meme_077.jpg","meme_078.jpg","meme_079.jpg","meme_080.jpg",
  "meme_081.jpeg","meme_082.jpg","meme_083.jpg","meme_084.jpg","meme_085.jpg",
  "meme_086.jpg","meme_087.jpg","meme_088.jpg","meme_089.jpg","meme_090.jpg",
  "meme_091.jpg","meme_092.webp","meme_093.jpg","meme_094.jpg","meme_095.jpg",
  "meme_096.jpg","meme_097.jpg","meme_098.jpg","meme_099.jpg","meme_100.jpg",
  "meme_101.jpeg","meme_102.jpeg",
  "meme_103.webp","meme_104.jpg","meme_105.jpg","meme_106.webp",
];

// Seasonal memes (disabled - no seasonal files currently)
const seasonalMemes: Record<string, string[]> = {
  // christmas: [],
  // easter: [],
  // thanksgiving: [],
  // lent: [],
  // backtoschool: [],
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

  // Meme fullscreen viewer state
  const [memeFullscreen, setMemeFullscreen] = useState(false);

  // Meme reactions state
  const [memeLoaded, setMemeLoaded] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem("memeReactions") || "{}"); } catch { return {}; }
  });
  const [userReaction, setUserReaction] = useState<string | null>(() => localStorage.getItem("memeUserReaction_" + new Date().toISOString().split("T")[0]));
  const handleReaction = (emoji: string) => {
    const today = new Date().toISOString().split("T")[0];
    const newReactions = { ...reactions };
    if (userReaction) { newReactions[userReaction] = Math.max(0, (newReactions[userReaction] || 1) - 1); }
    if (userReaction === emoji) { setUserReaction(null); localStorage.removeItem("memeUserReaction_" + today); }
    else { newReactions[emoji] = (newReactions[emoji] || 0) + 1; setUserReaction(emoji); localStorage.setItem("memeUserReaction_" + today, emoji); }
    setReactions(newReactions); localStorage.setItem("memeReactions", JSON.stringify(newReactions));
  };

  const greeting = playerName ? `Hey ${playerName}!` : "Hey there!";
  const equipped = getEquipped();
  const equippedPet = PETS.find(p => p.id === equipped.pet);
  const equippedFrame = PROFILE_FRAMES.find(f => f.id === equipped.frame);
  const [accountLinked, setAccountLinked] = useState(() => isLinkedToGoogle() || isLinkedToApple());
  // Re-check linked status when Firebase auth state resolves or auth-changed event fires
  useEffect(() => {
    const checkLinked = () => {
      if (isLinkedToGoogle() || isLinkedToApple()) setAccountLinked(true);
    };
    // Check after short delay for Firebase auth to initialize
    const t1 = setTimeout(checkLinked, 500);
    const t2 = setTimeout(checkLinked, 1500);
    const t3 = setTimeout(checkLinked, 3000);
    // Listen for auth-changed event (fired after successful Apple/Google sign-in)
    window.addEventListener("auth-changed", checkLinked);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      window.removeEventListener("auth-changed", checkLinked);
    };
  }, []);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    const dismissed = localStorage.getItem("syncBannerDismissed");
    if (!dismissed) return false;
    return Date.now() - parseInt(dismissed) < 3 * 24 * 60 * 60 * 1000;
  });
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [linkingApple, setLinkingApple] = useState(false);
  const handleBannerLinkGoogle = async () => {
    setLinkingGoogle(true);
    try {
      const result = await linkOrSignInWithGoogle();
      if (result.success) {
        setAccountLinked(true);
        celebrateLogin();
        toast.success(result.type === "linked" ? "Account linked! Your data is now protected." : "Signed in with Google!");
      } else {
        toast.error(result.message || "Failed to link account");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLinkingGoogle(false);
    }
  };
  const handleBannerLinkApple = async () => {
    setLinkingApple(true);
    try {
      const result = await linkOrSignInWithApple();
      if (result.success) {
        setAccountLinked(true);
        celebrateLogin();
        toast.success(result.type === "linked" ? "Account linked! Your data is now protected." : "Signed in with Apple!");
      } else {
        toast.error(result.message || "Failed to link account");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLinkingApple(false);
    }
  };
  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("syncBannerDismissed", String(Date.now()));
  };

  return (
    <div className="teenz-page space-y-4">
      {/* Full-screen loading overlay during sign-in */}
      {(linkingApple || linkingGoogle) && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <svg className="animate-spin h-10 w-10 text-purple-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <p className="text-white text-sm font-medium">
            {linkingApple ? "Connecting to Apple..." : "Connecting to Google..."}
          </p>
          <p className="text-gray-400 text-xs">Please wait, this may take a moment</p>
        </div>
      )}
      {/* Account Linking Banner */}
      {!accountLinked && !bannerDismissed && (
        <div className="relative overflow-hidden rounded-[26px] border border-amber-300/25 bg-gradient-to-br from-amber-300/18 via-white/7 to-orange-500/10 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <button onClick={handleDismissBanner} className="absolute top-2 right-2 text-white/55 hover:text-white text-lg leading-none p-1">✕</button>
          <div className="flex items-start gap-3">
            <div className="text-2xl mt-0.5">⚠️</div>
            <div className="flex-1 pr-4">
              <h3 className="text-amber-100 font-black text-sm">Back up your progress</h3>
              <p className="text-white/65 text-xs mt-1">Link an account to save your Bible journey across devices.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleBannerLinkGoogle}
                  disabled={linkingGoogle || linkingApple}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white text-gray-800 text-xs font-semibold hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {linkingGoogle ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Signing in...
                    </>
                  ) : "Google"}
                </button>
                <button
                  onClick={handleBannerLinkApple}
                  disabled={linkingGoogle || linkingApple}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-black text-white text-xs font-semibold border border-gray-600/50 hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  {linkingApple ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Signing in...
                    </>
                  ) : "Apple"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mockup-style top stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="tb-stat"><FantasyIcon name="flame" className="h-7 w-7" /><span>{Math.max(0, parseInt(localStorage.getItem("dayStreak") || "0") || 0)}</span></div>
        <div className="tb-stat"><FantasyIcon name="gem" className="h-7 w-7" /><span>{totalXP.toLocaleString()} XP</span></div>
        <div className="tb-stat"><FantasyIcon name="coin" className="h-7 w-7" /><span>{gems.toLocaleString()}</span></div>
      </div>

      {/* Welcome ribbon */}
      <div className="pt-6 text-center">
        <div className="tb-ribbon text-xl">Welcome Back!</div>
        <h1 className="tb-title mt-5 text-5xl">{playerName || "Adventurer"}</h1>
        <p className="mt-2 text-base font-extrabold text-white/45 drop-shadow">Continue your journey</p>
      </div>

      {/* Today's Mission */}
      {(() => {
        const lastRead = getLastRead();
        const bookName = lastRead?.book || "Matthew";
        const chapterNum = lastRead?.chapter || 5;
        const progress = lastRead?.progress || 0;
        return (
          <div className="neon-card mx-1 p-5 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <FantasyIcon name="book" className="h-10 w-10" />
              <h2 className="tb-gold-text text-2xl font-black">Today's Mission</h2>
            </div>
            <h3 className="tb-title text-2xl">Read {bookName} Chapter {chapterNum}</h3>
            <div className="tb-progress mx-auto mt-4 max-w-[270px]">
              <div className="tb-progress-fill" style={{ width: `${Math.max(18, progress)}%` }} />
            </div>
            <p className="mt-2 text-sm font-black text-white drop-shadow">{lastRead ? `${progress}% complete` : "3/5 verses"}</p>
            <button onClick={() => setLocation("/bible")}
              className="tb-btn-purple mx-auto mt-4 px-6 py-3 text-base transition-all active:scale-95">
              Continue Reading
            </button>
          </div>
        );
      })()}

      {/* Pet and quick actions */}
      <div className="grid grid-cols-[1.12fr_2fr] items-end gap-4 pt-6">
        <button onClick={() => setLocation("/profile")} className="neon-card p-2 text-center active:scale-95 transition-transform">
          <div className="mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#f6e7d2] to-[#463322]">
            {equippedPet && getPetDefaultSprite(equippedPet.id.replace('pet_', '')) ? (
              <img src={getPetDefaultSprite(equippedPet.id.replace('pet_', ''))!} alt={equippedPet.name} className="h-24 w-24 object-contain" />
            ) : (
              <img src="/pet-sprites/lamb_normal.webp" alt="Luna" className="h-24 w-24 object-contain" />
            )}
          </div>
          <p className="tb-title mt-2 text-lg">{equippedPet?.name || "Luna"}</p>
          <p className="text-xs font-black text-lime-300">Happy 😊</p>
        </button>
        <div className="grid grid-cols-3 gap-3 pb-5">
          <button onClick={() => setLocation("/bible")} className="text-center active:scale-95 transition-transform">
            <div className="tb-gold-panel mx-auto flex h-20 w-20 items-center justify-center rounded-full"><FantasyIcon name="brain" className="h-12 w-12" /></div>
            <p className="tb-title mt-2 text-sm">Quiz</p>
          </button>
          <button onClick={() => setLocation("/bible")} className="text-center active:scale-95 transition-transform">
            <div className="tb-gold-panel mx-auto flex h-20 w-20 items-center justify-center rounded-full"><FantasyIcon name="candle" className="h-12 w-12" /></div>
            <p className="tb-title mt-2 text-sm">Devotion</p>
          </button>
          <button onClick={() => setLocation("/leaderboard")} className="text-center active:scale-95 transition-transform">
            <div className="tb-gold-panel mx-auto flex h-20 w-20 items-center justify-center rounded-full"><FantasyIcon name="friends" className="h-12 w-12" /></div>
            <p className="tb-title mt-2 text-sm">Friends</p>
          </button>
        </div>
      </div>

      {/* Bible AI - Prominent Card */}
      <button
        onClick={() => setLocation("/bible-ai")}
        className="w-full neon-card p-4 flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer group"
      >
        <div className="tb-gold-panel flex h-14 w-14 items-center justify-center rounded-full text-2xl">✨</div>
        <div className="flex-1 text-left">
          <h3 className="tb-title text-lg">Bible AI</h3>
          <p className="text-white/55 text-xs font-bold mt-0.5">Ask anything about the Bible</p>
        </div>
        <div className="tb-gold-text text-2xl">›</div>
      </button>

      {/* XP Bar */}
      <div className="neon-card p-4 flex items-center gap-3">
        <div className="tb-gold-panel flex h-12 w-12 items-center justify-center rounded-full">
          <span className="text-xs font-black text-white drop-shadow">XP</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="tb-title text-base">{totalXP.toLocaleString()}</span>
            <span className="text-white/55 text-xs font-bold">/ {level.next.toLocaleString()} XP</span>
          </div>
          <div className="tb-progress">
            <div className="tb-progress-fill transition-all duration-500" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        <div className="text-2xl">🏆</div>
      </div>



      {/* Bible Meme of the Day */}
      <div className="neon-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold text-sm">😂 BIBLE MEME OF THE DAY</span>
        </div>
        <div className="rounded-xl overflow-hidden border border-purple-500/20 relative cursor-pointer" onClick={() => setMemeFullscreen(true)}>
          {!memeLoaded && <div className="w-full h-64 bg-purple-900/30 animate-pulse rounded-xl" />}
          <img
            src={memeUrl}
            alt="Bible Meme of the Day"
            className={`w-full h-auto rounded-xl ${memeLoaded ? '' : 'absolute opacity-0'}`}
            loading="lazy"
            onLoad={() => setMemeLoaded(true)}
          />
          {memeLoaded && <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-[10px] text-gray-300 pointer-events-none"><span>🔍</span> Tap to view</div>}
        </div>
        <div className="flex justify-center gap-3 mt-3">
          {["😂", "🔥", "💀", "🙏"].map(emoji => (
            <button key={emoji} onClick={() => handleReaction(emoji)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm active:scale-95 transition-all ${userReaction === emoji ? 'bg-purple-600/60 border-purple-400 scale-110' : 'bg-purple-900/40 border-purple-500/30'}`}>
              <span>{emoji}</span>
              {(reactions[emoji] || 0) > 0 && <span className="text-xs text-gray-300">{reactions[emoji]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Meme Fullscreen Viewer */}
      {memeFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center" onClick={() => setMemeFullscreen(false)}>
          {/* Close button */}
          <button onClick={() => setMemeFullscreen(false)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white text-xl hover:bg-white/20 transition-all">
            ✕
          </button>
          {/* Meme image */}
          <div className="flex-1 flex items-center justify-center w-full px-4 py-16" onClick={(e) => e.stopPropagation()}>
            <img src={memeUrl} alt="Bible Meme of the Day" className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
          {/* Action buttons */}
          <div className="absolute bottom-0 left-0 right-0 pb-24 pt-4 bg-gradient-to-t from-black/80 to-transparent" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center gap-4 px-6">
              <button
                onClick={async () => {
                  try {
                    if (isNativePlatform()) {
                      // Native: download file to cache, then share via native Share Sheet
                      const ext = memeUrl.split('.').pop() || 'jpg';
                      const fileName = `bible-meme-${Date.now()}.${ext}`;
                      await Filesystem.downloadFile({
                        url: memeUrl,
                        path: fileName,
                        directory: Directory.Cache,
                      });
                      const fileUri = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
                      await Share.share({
                        title: '😂 Bible Meme of the Day',
                        text: 'Check out this Bible meme from Teenz Bible!',
                        files: [fileUri.uri],
                      });
                      toast.success('Shared successfully!');
                    } else if (navigator.share) {
                      const response = await fetch(memeUrl);
                      const blob = await response.blob();
                      const file = new File([blob], 'bible-meme.jpg', { type: blob.type });
                      await navigator.share({ title: '😂 Bible Meme of the Day', text: 'Check out this Bible meme from Teenz Bible!', files: [file] });
                      toast.success('Shared successfully!');
                    } else {
                      await navigator.clipboard.writeText(memeUrl);
                      toast.success('Link copied to clipboard!');
                    }
                  } catch (err: any) {
                    if (err?.name !== 'AbortError') {
                      try { await navigator.clipboard.writeText(memeUrl); toast.success('Link copied to clipboard!'); } catch { toast.error('Could not share'); }
                    }
                  }
                }}
                className="flex-1 max-w-[160px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all active:scale-95"
              >
                <span>📤</span> Share
              </button>
              <button
                onClick={async () => {
                  try {
                    if (isNativePlatform()) {
                      // Native: use Capacitor SaveToPhotos plugin
                      await SaveToPhotos.savePhoto({ url: memeUrl });
                      toast.success('Saved to Photos! 📥');
                    } else {
                      // Web fallback: blob download
                      const response = await fetch(memeUrl);
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `bible-meme-${new Date().toISOString().split('T')[0]}.jpg`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success('Meme saved! 📥');
                    }
                  } catch (err: any) {
                    console.error('Save meme error:', err);
                    toast.error('Could not save meme. Please allow photo access in Settings.');
                  }
                }}
                className="flex-1 max-w-[160px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-sm border border-white/20 transition-all active:scale-95"
              >
                <span>💾</span> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="neon-card p-3 text-center"><span className="text-2xl">📖</span><div className="text-xl font-bold text-white mt-1">{chaptersRead}</div><div className="text-[10px] text-gray-400">Chapters Read</div></div>
        <div className="neon-card p-3 text-center"><span className="text-2xl">💎</span><div className="text-xl font-bold text-white mt-1">{gems}</div><div className="text-[10px] text-gray-400">Gems</div></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 pb-24">
        <button onClick={() => setLocation("/bible")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">📖</span><div className="text-sm font-medium text-white mt-1">Start Reading</div>
        </button>
        <button onClick={() => setLocation("/bible-map")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">🗺️</span><div className="text-sm font-medium text-white mt-1">Bible Map</div>
        </button>
      </div>
    </div>
  );
}
