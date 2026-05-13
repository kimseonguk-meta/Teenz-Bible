import { useState, useEffect, useCallback } from "react";
import {
  fetchAllMembers,
  fetchClassMembers,
  sortMembers,
  filterByTime,
  getDisplayValue,
  getCurrentGroupCode,
  getCurrentUid,
  auth,
  signInAnonymously,
  onAuthStateChanged,
  syncUserToFirebase,
  type LeaderboardMember,
  type SortBy,
  type TimeFilter,
  type ScopeFilter,
} from "@/lib/firebase";

const SORT_TABS: { key: SortBy; icon: string; label: string }[] = [
  { key: "xp", icon: "⚡", label: "XP" },
  { key: "streak", icon: "🔥", label: "Streak" },
  { key: "chapters", icon: "📖", label: "Chapters" },
  { key: "quiz", icon: "🏆", label: "Quiz" },
];

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortBy>("chapters");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const groupCode = getCurrentGroupCode();
  const isNasumMember = groupCode !== "INDIVIDUAL" && groupCode !== "GLOBAL";

  // Auth setup
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUid(user.uid);
        syncUserToFirebase(user.uid);
      } else {
        signInAnonymously(auth).catch(console.error);
      }
    });
    return () => unsub();
  }, []);

  // If not a Nasum member, force scope to "all"
  useEffect(() => {
    if (!isNasumMember && scope === "myclass") {
      setScope("all");
    }
  }, [isNasumMember, scope]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let raw: LeaderboardMember[];
      if (scope === "all") {
        raw = await fetchAllMembers();
      } else {
        raw = await fetchClassMembers(groupCode);
      }
      const filtered = filterByTime(raw, timeFilter);
      const sorted = sortMembers(filtered, sortBy);
      setMembers(sorted);
    } catch (err: any) {
      setError("Failed to load leaderboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [scope, timeFilter, sortBy, groupCode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const top3 = members.slice(0, 3);
  const rest = members.slice(3);

  // Helper to display group badge - hide "INDIVIDUAL" and show friendly label
  const renderGroupBadge = (code: string | undefined) => {
    if (!code || code === "INDIVIDUAL" || code === "GLOBAL") return null;
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 mt-0.5">
        {code}
      </span>
    );
  };

  const renderGroupBadgeInline = (code: string | undefined) => {
    if (!code || code === "INDIVIDUAL" || code === "GLOBAL") return null;
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 shrink-0">
        {code}
      </span>
    );
  };

  return (
    <div className="px-4 pt-6 space-y-4 pb-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white font-display neon-text-purple">🏆 LEADERBOARD</h1>
      </div>

      {/* Sort Tabs */}
      <div id="lb-tabs" className="flex gap-1.5 justify-center">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSortBy(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortBy === tab.key
                ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                : "bg-transparent border border-purple-500/30 text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Time Filter */}
      <div className="flex gap-1.5 justify-center">
        {TIME_FILTERS.map((tf) => (
          <button
            key={tf.key}
            onClick={() => setTimeFilter(tf.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              timeFilter === tf.key
                ? "bg-purple-600 text-white"
                : "bg-transparent border border-purple-500/30 text-gray-400 hover:text-gray-200"
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Scope Filter - only show My Class for Nasum members */}
      <div className="flex gap-2 justify-center">
        {isNasumMember && (
          <button
            onClick={() => setScope("myclass")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              scope === "myclass"
                ? "bg-teal-500 text-white shadow-[0_0_10px_rgba(78,205,196,0.4)]"
                : "bg-transparent border border-purple-500/30 text-gray-400"
            }`}
          >
            My Class ({groupCode})
          </button>
        )}
        <button
          onClick={() => setScope("all")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            scope === "all"
              ? "bg-teal-500 text-white shadow-[0_0_10px_rgba(78,205,196,0.4)]"
              : "bg-transparent border border-purple-500/30 text-gray-400"
          }`}
        >
          Everyone
        </button>
      </div>

      {/* Loading / Error / Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <span className="text-4xl">🏆</span>
          <p className="text-gray-400 text-sm">No active members in this period.</p>
          <p className="text-gray-500 text-xs">Start reading to appear on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Member count */}
          <p className="text-center text-teal-400 text-xs font-bold">
            All {members.length} members
          </p>

          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-3 pt-4 pb-2">
              {/* 2nd place */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center border-2 border-gray-300">2</div>
                  <div className="w-14 h-14 rounded-xl border-2 border-blue-400/50 bg-[rgba(15,5,40,0.8)] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                    {top3[1]?.avatar || "😎"}
                  </div>
                </div>
                <p className="text-white text-xs font-bold mt-2 max-w-[70px] truncate">{top3[1]?.nickname}</p>
                {renderGroupBadge(top3[1]?.groupCode)}
                <p className="text-purple-300 font-bold text-xs mt-0.5">{getDisplayValue(top3[1], sortBy)}</p>
                <span className="text-yellow-400 text-xs">★</span>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center -mt-4">
                <div className="text-2xl mb-1">👑</div>
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center border-2 border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]">1</div>
                  <div className="w-18 h-18 rounded-xl border-2 border-yellow-500/70 bg-[rgba(15,5,40,0.8)] flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(234,179,8,0.3)]" style={{width: '72px', height: '72px'}}>
                    {top3[0]?.avatar || "😎"}
                  </div>
                </div>
                <p className="text-white text-sm font-bold mt-2 max-w-[80px] truncate">
                  {top3[0]?.nickname}
                  {top3[0]?.uid === currentUid && <span className="text-red-400 text-xs ml-1">(You)</span>}
                </p>
                {renderGroupBadge(top3[0]?.groupCode)}
                <p className="text-yellow-300 font-bold text-sm mt-0.5">{getDisplayValue(top3[0], sortBy)}</p>
                <span className="text-yellow-400 text-xs">★</span>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center border-2 border-amber-600">3</div>
                  <div className="w-14 h-14 rounded-xl border-2 border-amber-600/50 bg-[rgba(15,5,40,0.8)] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(180,83,9,0.3)]">
                    {top3[2]?.avatar || "😎"}
                  </div>
                </div>
                <p className="text-white text-xs font-bold mt-2 max-w-[70px] truncate">{top3[2]?.nickname}</p>
                {renderGroupBadge(top3[2]?.groupCode)}
                <p className="text-amber-400 font-bold text-xs mt-0.5">{getDisplayValue(top3[2], sortBy)}</p>
                <span className="text-yellow-400 text-xs">★</span>
              </div>
            </div>
          )}

          {/* Rest of leaderboard */}
          <div className="space-y-1.5">
            {rest.map((member, idx) => {
              const rank = idx + 4;
              const isMe = member.uid === currentUid;
              return (
                <div
                  key={member.uid}
                  className={`p-3 flex items-center gap-3 rounded-xl transition-all ${
                    isMe
                      ? "bg-red-500/10 border border-red-500/30"
                      : "bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <span className="text-base font-bold text-gray-400 w-7 text-center">{rank}</span>
                  <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-xl">
                    {member.avatar || "😎"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`font-medium text-sm truncate ${isMe ? "text-red-400" : "text-white"}`}>
                        {member.nickname || "Anonymous"}
                        {isMe && " (You)"}
                      </p>
                      {member.joinedAt && (Date.now() - member.joinedAt < 7 * 24 * 60 * 60 * 1000) && (
                        <span className="text-[9px] text-gray-500">NEW</span>
                      )}
                      {scope === "all" && renderGroupBadgeInline(member.groupCode)}
                    </div>
                    <p className="text-gray-400 text-xs">{getDisplayValue(member, sortBy)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="h-4" />
    </div>
  );
}
