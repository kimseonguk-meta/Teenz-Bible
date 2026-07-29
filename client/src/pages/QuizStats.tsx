import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { allBibleData, otBooks, ntBooks } from "@/data/allBibleData";
import { hasQuiz } from "@/data/quizData";

interface QuizHistoryEntry {
  book: string;
  chapter: number;
  correct: boolean;
  timestamp: number;
}

function getQuizHistory(): QuizHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem("quizHistory") || "[]");
  } catch { return []; }
}

function getQuizStats() {
  try {
    const teensBible = JSON.parse(localStorage.getItem("teensBible") || "{}");
    return {
      total: teensBible.quizTotal || 0,
      correct: teensBible.quizCorrect || 0,
    };
  } catch { return { total: 0, correct: 0 }; }
}

export default function QuizStats() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"overview" | "books" | "history">("overview");
  
  const stats = useMemo(() => getQuizStats(), []);
  const history = useMemo(() => getQuizHistory(), []);
  
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  
  // Per-book stats
  const bookStats = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {};
    history.forEach(entry => {
      if (!map[entry.book]) map[entry.book] = { total: 0, correct: 0 };
      map[entry.book].total++;
      if (entry.correct) map[entry.book].correct++;
    });
    return map;
  }, [history]);
  
  // Most missed books (lowest accuracy with at least 2 attempts)
  const mostMissed = useMemo(() => {
    return Object.entries(bookStats)
      .filter(([, s]) => s.total >= 2)
      .map(([book, s]) => ({ book, accuracy: Math.round((s.correct / s.total) * 100), total: s.total }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
  }, [bookStats]);
  
  // Recent history (last 20)
  const recentHistory = useMemo(() => {
    return [...history].reverse().slice(0, 20);
  }, [history]);
  
  // Streak calculation
  const currentStreak = useMemo(() => {
    let streak = 0;
    const reversed = [...history].reverse();
    for (const entry of reversed) {
      if (entry.correct) streak++;
      else break;
    }
    return streak;
  }, [history]);
  
  // Best streak
  const bestStreak = useMemo(() => {
    let best = 0;
    let current = 0;
    for (const entry of history) {
      if (entry.correct) { current++; best = Math.max(best, current); }
      else current = 0;
    }
    return best;
  }, [history]);

  // Weekly progress
  const weeklyProgress = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = history.filter(e => e.timestamp > weekAgo);
    const correct = thisWeek.filter(e => e.correct).length;
    return { total: thisWeek.length, correct, accuracy: thisWeek.length > 0 ? Math.round((correct / thisWeek.length) * 100) : 0 };
  }, [history]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/profile")} className="text-[#FF9600] font-bold active:scale-95 transition-transform">
          ← Back
        </button>
        <h1 className="text-xl font-bold text-white font-display">📊 Quiz Stats</h1>
      </div>
      
      {/* Tab navigation */}
      <div className="flex gap-2 mb-6">
        {(["overview", "books", "history"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
              tab === t 
                ? "bg-purple-600 text-white" 
                : "bg-gray-50 text-[#FF9600] font-bold border border-gray-200"
            }`}
          >
            {t === "overview" ? "📈 Overview" : t === "books" ? "📚 Books" : "📋 History"}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Main stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Quizzes" value={stats.total.toString()} emoji="🧠" />
            <StatCard label="Correct" value={stats.correct.toString()} emoji="✅" />
            <StatCard label="Accuracy" value={`${accuracy}%`} emoji="🎯" color={accuracy >= 70 ? "green" : accuracy >= 50 ? "yellow" : "red"} />
            <StatCard label="Current Streak" value={currentStreak.toString()} emoji="🔥" />
          </div>
          
          {/* Progress ring */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5 text-center">
            <div className="relative w-32 h-32 mx-auto mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(147,51,234,0.2)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="42" fill="none" 
                  stroke={accuracy >= 70 ? "#22c55e" : accuracy >= 50 ? "#eab308" : "#ef4444"}
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray={`${accuracy * 2.64} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{accuracy}%</span>
                <span className="text-xs text-[#FF9600] font-bold">accuracy</span>
              </div>
            </div>
            <p className="text-[#f0d060] text-sm">
              {accuracy >= 80 ? "🌟 Amazing! You really know your Bible!" :
               accuracy >= 60 ? "👍 Good job! Keep reading and improving!" :
               accuracy >= 40 ? "📖 Keep reading! You'll get better!" :
               stats.total === 0 ? "Start reading chapters to take quizzes!" :
               "💪 Don't give up! Read more carefully!"}
            </p>
          </div>
          
          {/* Weekly progress */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4">
            <h3 className="text-white font-bold text-sm mb-2">📅 This Week</h3>
            <div className="flex justify-between text-sm">
              <span className="text-[#FF9600] font-bold">Quizzes taken</span>
              <span className="text-white font-bold">{weeklyProgress.total}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-[#FF9600] font-bold">Correct answers</span>
              <span className="text-green-400 font-bold">{weeklyProgress.correct}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-[#FF9600] font-bold">Weekly accuracy</span>
              <span className={`font-bold ${weeklyProgress.accuracy >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{weeklyProgress.accuracy}%</span>
            </div>
          </div>
          
          {/* Best streak */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4">
            <h3 className="text-white font-bold text-sm mb-2">🏆 Records</h3>
            <div className="flex justify-between text-sm">
              <span className="text-[#FF9600] font-bold">Best streak</span>
              <span className="text-yellow-400 font-bold">{bestStreak} 🔥</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-[#FF9600] font-bold">Current streak</span>
              <span className="text-orange-400 font-bold">{currentStreak} 🔥</span>
            </div>
          </div>
          
          {/* Most missed */}
          {mostMissed.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4">
              <h3 className="text-white font-bold text-sm mb-3">⚠️ Needs Review</h3>
              <div className="space-y-2">
                {mostMissed.map(({ book, accuracy: acc, total }) => (
                  <div key={book} className="flex items-center justify-between">
                    <span className="text-[#f0d060] text-sm">{book}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${acc >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${acc}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${acc >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{acc}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Books Tab */}
      {tab === "books" && (
        <div className="space-y-3">
          {stats.total === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 text-center">
              <span className="text-4xl">📚</span>
              <p className="text-[#f0d060] mt-3">No quiz data yet! Start reading chapters to take quizzes.</p>
            </div>
          ) : (
            <>
              <p className="text-[#FF9600] font-bold text-xs mb-2">Books you've been quizzed on:</p>
              {Object.entries(bookStats)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([book, s]) => {
                  const acc = Math.round((s.correct / s.total) * 100);
                  return (
                    <div key={book} className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-sm">{book}</p>
                        <p className="text-[#FF9600] font-bold text-xs">{s.correct}/{s.total} correct</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${acc >= 70 ? 'bg-green-500' : acc >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${acc}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold min-w-[3rem] text-right ${
                          acc >= 70 ? 'text-green-400' : acc >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{acc}%</span>
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      )}
      
      {/* History Tab */}
      {tab === "history" && (
        <div className="space-y-2">
          {recentHistory.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 text-center">
              <span className="text-4xl">📋</span>
              <p className="text-[#f0d060] mt-3">No quiz history yet! Start reading to take quizzes.</p>
            </div>
          ) : (
            <>
              <p className="text-[#FF9600] font-bold text-xs mb-2">Last 20 quizzes:</p>
              {recentHistory.map((entry, i) => (
                <div key={i} className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{entry.correct ? "✅" : "❌"}</span>
                    <div>
                      <p className="text-white text-sm font-bold">{entry.book} Ch.{entry.chapter}</p>
                      <p className="text-[#FF9600] font-bold text-xs">
                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    entry.correct ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {entry.correct ? "Correct" : "Wrong"}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, emoji, color }: { label: string; value: string; emoji: string; color?: string }) {
  const colorClass = color === "green" ? "text-green-400" : color === "red" ? "text-red-400" : color === "yellow" ? "text-yellow-400" : "text-white";
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4 text-center">
      <span className="text-2xl">{emoji}</span>
      <p className={`text-xl font-bold mt-1 ${colorClass}`}>{value}</p>
      <p className="text-[#FF9600] font-bold text-xs mt-1">{label}</p>
    </div>
  );
}
