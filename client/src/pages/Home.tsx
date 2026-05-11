import { useGame } from "@/contexts/GameContext";
import { useLocation } from "wouter";
import { allBibleData } from "@/data/allBibleData";
import { MemeHomeCard } from "@/pages/MemeOfDay";

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

const LOGIN_REWARDS = [3, 3, 5, 5, 8, 10, 20];
const VERSES = [
  { text: "Do not be anxious about anything, but in everything, by prayer, present your requests to God.", ref: "Philippians 4:6" },
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you.", ref: "Jeremiah 29:11" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
  { text: "But those who hope in the Lord will renew their strength.", ref: "Isaiah 40:31" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const game = useGame();
  const level = game.getLevel();
  const xpProgress = Math.min(100, ((game.totalXP - level.prev) / (level.next - level.prev)) * 100);
  const chaptersRead = game.getTotalChaptersRead();
  const days = ["S","M","T","W","T","F","S"];
  const today = new Date().getDay();
  const verseOfDay = VERSES[new Date().getDay() % VERSES.length];

  // Calculate today's reading progress
  let currentBook = "Matthew";
  let currentChapter = 1;
  let bookProgress = 0;
  for (const bookName of Object.keys(allBibleData)) {
    const chapters = allBibleData[bookName];
    const read = game.getChaptersRead(bookName);
    if (read.length < chapters.length) {
      currentBook = bookName;
      currentChapter = read.length > 0 ? Math.max(...read) + 1 : 1;
      bookProgress = Math.round((read.length / chapters.length) * 100);
      break;
    }
    bookProgress = 100;
  }

  const todayChaptersRead = game.dailyMissionDone ? 1 : 0;
  const weeklyChapters = chaptersRead;
  const streakDays = game.dayStreak;

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
          <h1 className="text-xl font-bold text-white font-display">Hey {game.playerName}! 🔥</h1>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span>🔥 {game.dayStreak} Day Streak</span>
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
            <h2 className="text-2xl font-bold text-white font-display">{currentBook}</h2>
            <h3 className="text-xl font-bold text-white font-display">Chapter {currentChapter}</h3>
            <p className="text-gray-400 text-sm mt-1">
              {allBibleData[currentBook]?.[currentChapter - 1]?.title || "Continue your journey"}
            </p>
            <button onClick={() => setLocation("/bible")}
              className="mt-3 px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-xl text-purple-200 text-sm font-medium flex items-center gap-2 hover:bg-purple-600/50 transition-all active:scale-95">
              📖 Continue Reading
            </button>
          </div>
          <div className="relative flex items-center justify-center">
            <ProgressRing progress={bookProgress} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{bookProgress}<span className="text-sm">%</span></span>
              <span className="text-[10px] text-purple-300">Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="neon-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-800 border border-yellow-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.3)]">
          <span className="text-xs font-bold text-yellow-200">XP</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold">{game.totalXP.toLocaleString()}</span>
            <span className="text-gray-400 text-xs">/ {level.next.toLocaleString()} XP</span>
          </div>
          <div className="h-2.5 bg-gray-800/80 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-cyan-400 transition-all duration-500" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-yellow-600/20 border border-yellow-500/40 flex items-center justify-center"><span className="text-sm">🏆</span></div>
      </div>

      {/* Daily Mission */}
      <div className="neon-card-gold p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className="text-yellow-300 text-sm font-semibold">🎯 DAILY MISSION</span>
            <h3 className="text-lg font-bold text-white mt-1">Read 1 Chapter Today</h3>
            <p className="text-gray-400 text-sm mt-1">Stay consistent in God's Word!</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-cyan-400">💎</span>
              <span className="text-cyan-300 font-bold text-sm">+50 XP</span>
            </div>
            {game.dailyMissionDone && (
              <div className="mt-2 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-lg inline-block">
                <span className="text-green-400 text-xs font-bold">✓ Completed!</span>
              </div>
            )}
          </div>
          <div className={`w-16 h-16 rounded-full border-[3px] ${game.dailyMissionDone ? 'border-green-500/60' : 'border-yellow-500/60'} bg-gray-900/80 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]`}>
            <div className="text-center">
              <span className="text-2xl">{game.dailyMissionDone ? '✅' : '📖'}</span>
              <div className="text-[10px] text-gray-300">{todayChaptersRead} / 1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="neon-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-bold text-sm">🔥 Streak Calendar</span>
          <span className="text-purple-300 text-xs">{game.dayStreak} days</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 py-2 rounded-lg ${i === today ? 'bg-purple-600/30 border border-purple-500/40' : ''}`}>
              <span className="text-gray-400 text-[10px]">{d}</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                i < today && game.dayStreak > 0 ? 'bg-green-500/20 border border-green-500/40 text-green-400' :
                i === today && game.loginRewardClaimed ? 'bg-green-500/30 border border-green-400 text-green-300' :
                i === today ? 'bg-purple-500/30 border border-purple-400 text-purple-300' :
                'bg-gray-800/50 border border-gray-700/30 text-gray-600'
              }`}>
                {(i < today && game.dayStreak > 0) || (i === today && game.loginRewardClaimed) ? '✓' : i === today ? '•' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bible Meme of the Day */}
      <MemeHomeCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="neon-card p-3 text-center"><span className="text-2xl">🔥</span><div className="text-xl font-bold text-white mt-1">{game.dayStreak}</div><div className="text-[10px] text-gray-400">Day Streak</div></div>
        <div className="neon-card p-3 text-center"><span className="text-2xl">📖</span><div className="text-xl font-bold text-white mt-1">{chaptersRead}</div><div className="text-[10px] text-gray-400">Chapters</div></div>
        <div className="neon-card p-3 text-center"><span className="text-2xl">💎</span><div className="text-xl font-bold text-white mt-1">{game.gems}</div><div className="text-[10px] text-gray-400">Gems</div></div>
      </div>

      {/* Daily Login Rewards */}
      <div className="neon-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-bold text-sm">📅 Daily Login Rewards</span>
          <span className="text-orange-400 text-xs">🔥 Day {game.loginDay}</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {LOGIN_REWARDS.map((reward, i) => {
            const isPast = i < game.loginDay - 1;
            const isCurrent = i === game.loginDay - 1;
            return (
              <div key={i} className={`flex flex-col items-center py-2 rounded-lg text-center ${
                isPast ? 'bg-green-900/20 border border-green-500/30' :
                isCurrent ? 'bg-purple-600/20 border border-purple-500/40' :
                'bg-gray-800/30 border border-gray-700/20'
              }`}>
                <span className="text-[8px] text-gray-400">Day {i+1}</span>
                <span className="text-sm mt-0.5">{isPast ? '✅' : '💎'}</span>
                <span className="text-[10px] text-cyan-300 font-bold">+{reward}</span>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => game.claimLoginReward()}
          disabled={game.loginRewardClaimed}
          className={`w-full mt-3 py-2.5 rounded-xl text-white text-sm font-bold transition-transform active:scale-95 ${
            game.loginRewardClaimed
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
          }`}
        >
          {game.loginRewardClaimed
            ? "✅ Today's Reward Claimed!"
            : `🎁 Claim Today's Reward: +${LOGIN_REWARDS[Math.min(game.loginDay - 1, 6)]} Gems!`
          }
        </button>
      </div>

      {/* Verse of the Day */}
      <div className="neon-card p-5 border-purple-400/40">
        <span className="text-purple-300 text-sm font-semibold">✨ VERSE OF THE DAY</span>
        <p className="text-gray-200 italic text-sm leading-relaxed mt-2">"{verseOfDay.text}"</p>
        <p className="text-purple-400 text-xs mt-2 font-semibold">— {verseOfDay.ref}</p>
      </div>

      {/* Weekly Challenges */}
      <div className="neon-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-bold text-sm">🎯 WEEKLY CHALLENGES</span>
          <span className="text-gray-400 text-xs">{7 - today} days left</span>
        </div>
        <div className="space-y-2.5">
          {[
            { icon: "📖", task: "Read 5 Chapters", current: Math.min(weeklyChapters, 5), target: 5, reward: 15 },
            { icon: "📚", task: "Read 10 Chapters", current: Math.min(weeklyChapters, 10), target: 10, reward: 30 },
            { icon: "🔥", task: "3-Day Streak", current: Math.min(streakDays, 3), target: 3, reward: 20 },
          ].map((c, i) => {
            const done = c.current >= c.target;
            return (
              <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${done ? 'bg-green-900/20' : 'bg-purple-900/20'}`}>
                <span className="text-lg">{done ? '✅' : c.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-xs font-medium">{c.task}</p>
                  <p className="text-gray-500 text-[10px]">{c.current}/{c.target}</p>
                  <div className="mt-1 h-1 bg-gray-800/80 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: `${(c.current / c.target) * 100}%` }} />
                  </div>
                </div>
                <span className="text-cyan-300 text-xs font-bold">+{c.reward} 💎</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setLocation("/bible")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">📖</span><div className="text-sm font-medium text-white mt-1">Start Reading</div>
        </button>
        <button onClick={() => setLocation("/chat")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">🤖</span><div className="text-sm font-medium text-white mt-1">Bible AI Chat</div>
        </button>
        <button onClick={() => setLocation("/map")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">🗺️</span><div className="text-sm font-medium text-white mt-1">Bible Map</div>
        </button>
        <button onClick={() => setLocation("/store")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">🏪</span><div className="text-sm font-medium text-white mt-1">Gem Store</div>
        </button>
        <button onClick={() => setLocation("/challenges")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">🏆</span><div className="text-sm font-medium text-white mt-1">Challenges</div>
        </button>
        <button onClick={() => setLocation("/memes")} className="neon-card p-4 text-center hover:border-purple-400 transition-all active:scale-95">
          <span className="text-2xl">😂</span><div className="text-sm font-medium text-white mt-1">Meme Gallery</div>
        </button>
      </div>
      <div className="h-4" />
    </div>
  );
}
