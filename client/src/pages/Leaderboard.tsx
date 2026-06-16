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
} from "@/lib/firebase";
import { getLocalGroups, fetchGroupMeta, type GroupMeta, type GroupMembership } from "@/lib/groups";
import { PROFILE_FRAMES } from "@/data/storeItems";
import { ASSETS } from "@/lib/assets";

// Get frame class by ID
function getFrameClass(frameId?: string): string {
  if (!frameId || frameId === "frame_none") return "";
  const frame = PROFILE_FRAMES.find((f) => f.id === frameId);
  return frame?.frameClass || "";
}

// Helper to render member avatar with optional frame
function MemberAvatar({
  member,
  size = "md",
  showFrame = false,
}: {
  member: LeaderboardMember | undefined;
  size?: "sm" | "md" | "lg";
  showFrame?: boolean;
}) {
  const sizeClasses = size === "lg" ? "w-[72px] h-[72px]" : size === "md" ? "w-14 h-14" : "w-10 h-10";
  const textSize = size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-xl";
  const frameClass = showFrame ? getFrameClass(member?.equippedFrame) : "";

  const inner = member?.profilePhotoUrl ? (
    <img
      src={member.profilePhotoUrl}
      alt={member.nickname || ""}
      className={`${sizeClasses} object-cover`}
      style={{ borderRadius: "inherit" }}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <span className={textSize}>{member?.avatar || "😎"}</span>
  );

  if (frameClass) {
    return (
      <div className={`${sizeClasses} rounded-full flex items-center justify-center overflow-hidden ${frameClass}`}>
        {inner}
      </div>
    );
  }
  return <>{inner}</>;
}

// Mini Profile Card Popup
function MiniProfileCard({
  member,
  rank,
  onClose,
}: {
  member: LeaderboardMember;
  rank: number;
  onClose: () => void;
}) {
  const frameClass = getFrameClass(member.equippedFrame);
  const quizAccuracy = member.quizTotal > 0 ? Math.round((member.quizCorrect / member.quizTotal) * 100) : 0;
  const joinedDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—";

  const rankLabel =
    rank === 1 ? "🥇 1st" : rank === 2 ? "🥈 2nd" : rank === 3 ? "🥉 3rd" : `#${rank}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative w-full max-w-[280px] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'rgba(26, 10, 46, 0.98)', border: '1px solid rgba(212,175,55,0.4)', boxShadow: '0 0 30px rgba(212,175,55,0.15)', animation: 'popIn 200ms cubic-bezier(0.23,1,0.32,1)' }}
      >
        {/* Top gradient bar */}
        <div className="h-16" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(160,133,32,0.2), rgba(212,175,55,0.3))' }} />

        {/* Avatar */}
        <div className="flex flex-col items-center -mt-10">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden ${frameClass}`}
            style={{ background: 'rgba(26, 10, 46, 0.9)', border: '3px solid rgba(212,175,55,0.5)' }}
          >
            {member.profilePhotoUrl ? (
              <img
                src={member.profilePhotoUrl}
                alt={member.nickname}
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="text-4xl">{member.avatar || "😎"}</span>
            )}
          </div>

          {/* Name & Rank */}
          <h3 className="text-white font-bold text-lg mt-2">{member.nickname || "Anonymous"}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-bold text-yellow-400">{rankLabel}</span>
            {member.groupCode && member.groupCode !== "INDIVIDUAL" && member.groupCode !== "GLOBAL" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400">
                {member.groupCode}
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 p-4 pt-3">
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-[#f0d060] font-bold text-lg">{member.xp.toLocaleString()}</p>
            <p className="text-gray-400 text-[10px]">⚡ XP</p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-orange-400 font-bold text-lg">{member.streak}</p>
            <p className="text-gray-400 text-[10px]">🔥 Streak</p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-blue-400 font-bold text-lg">{member.chaptersRead}</p>
            <p className="text-gray-400 text-[10px]">📖 Chapters</p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-green-400 font-bold text-lg">{quizAccuracy}%</p>
            <p className="text-gray-400 text-[10px]">🏆 Quiz ({member.quizTotal})</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <span className="text-gray-500 text-[10px]">Joined {joinedDate}</span>
          <button
            onClick={onClose}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

const SORT_TABS: { key: SortBy; icon: string; label: string }[] = [
  { key: "xp", icon: "⚡", label: "XP" },
  { key: "streak", icon: "🔥", label: "Streak" },
  { key: "chapters", icon: "📖", label: "Chapters" },
  { key: "quiz", icon: "🏆", label: "Quiz" },
];

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

type MainTab = "mygroups" | "global";

export default function Leaderboard() {
  const [mainTab, setMainTab] = useState<MainTab>("mygroups");
  const [sortBy, setSortBy] = useState<SortBy>("chapters");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ member: LeaderboardMember; rank: number } | null>(null);
  
  // Multi-group state
  const [userGroups, setUserGroups] = useState<GroupMembership[]>([]);
  const [selectedGroupCode, setSelectedGroupCode] = useState<string>("");
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  const groupCode = getCurrentGroupCode();

  // Auth setup with timeout fallback
  useEffect(() => {
    let authTimeout: ReturnType<typeof setTimeout> | null = null;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (authTimeout) { clearTimeout(authTimeout); authTimeout = null; }
      if (user) {
        setCurrentUid(user.uid);
        syncUserToFirebase(user.uid);
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error('Anonymous auth failed:', err);
          setError('Unable to connect. Please check your internet and try again.');
          setLoading(false);
        });
      }
    });
    // Timeout: if auth doesn't resolve in 10s, show error
    authTimeout = setTimeout(() => {
      if (!currentUid) {
        setError('Connection timed out. Tap to retry.');
        setLoading(false);
      }
    }, 10000);
    return () => { unsub(); if (authTimeout) clearTimeout(authTimeout); };
  }, []);

  // Load user groups
  useEffect(() => {
    const groups = getLocalGroups();
    // Also include primary groupCode if not in groups list
    const primaryCode = groupCode;
    if (primaryCode && primaryCode !== "GLOBAL" && primaryCode !== "INDIVIDUAL") {
      if (!groups.find(g => g.groupCode === primaryCode)) {
        groups.unshift({ groupCode: primaryCode, joinedAt: 0, role: "member" });
      }
    }
    setUserGroups(groups);
    
    // Set default selected group
    if (groups.length > 0) {
      setSelectedGroupCode(groups[0].groupCode);
    }

    // Fetch group names for user's groups
    const fetchNames = async () => {
      const names: Record<string, string> = {};
      for (const g of groups) {
        try {
          const meta = await fetchGroupMeta(g.groupCode);
          names[g.groupCode] = meta?.name || g.groupCode;
        } catch {
          names[g.groupCode] = g.groupCode;
        }
      }
      setGroupNames(names);
    };
    if (groups.length > 0) fetchNames();
  }, [groupCode]);

  // Load data - only after auth is ready
  const loadData = useCallback(async () => {
    if (!currentUid) return; // Wait for auth
    setLoading(true);
    setError(null);
    try {
      let raw: LeaderboardMember[];
      if (mainTab === "global") {
        raw = await fetchAllMembers();
      } else {
        // My Groups tab — fetch selected group
        const code = selectedGroupCode || groupCode;
        if (code && code !== "GLOBAL" && code !== "INDIVIDUAL") {
          raw = await fetchClassMembers(code);
        } else {
          raw = await fetchAllMembers();
        }
      }
      const filtered = filterByTime(raw, timeFilter);
      const sorted = sortMembers(filtered, sortBy);
      setMembers(sorted);

      // Resolve group names for members in global view
      if (mainTab === "global") {
        const unknownCodes = new Set<string>();
        sorted.forEach(m => {
          if (m.groupCode && m.groupCode !== "INDIVIDUAL" && m.groupCode !== "GLOBAL" && !groupNames[m.groupCode]) {
            unknownCodes.add(m.groupCode);
          }
        });
        if (unknownCodes.size > 0) {
          const newNames: Record<string, string> = {};
          for (const code of Array.from(unknownCodes)) {
            try {
              const meta = await fetchGroupMeta(code);
              newNames[code] = meta?.name || code;
            } catch { newNames[code] = code; }
          }
          setGroupNames(prev => ({ ...prev, ...newNames }));
        }
      }
    } catch (err: any) {
      setError("Failed to load leaderboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mainTab, selectedGroupCode, timeFilter, sortBy, groupCode, currentUid]);

  useEffect(() => {
    if (currentUid) {
      loadData();
    }
  }, [loadData, currentUid]);

  const top3 = members.slice(0, 3);
  const rest = members.slice(3);

  const handleMemberTap = (member: LeaderboardMember, rank: number) => {
    setSelectedMember({ member, rank });
  };

  // Helper to display group badge (shows group name if available, falls back to code)
  const getGroupDisplayName = (code: string | undefined): string => {
    if (!code || code === "INDIVIDUAL" || code === "GLOBAL") return "";
    return groupNames[code] || code;
  };

  const renderGroupBadgeInline = (code: string | undefined) => {
    if (!code || code === "INDIVIDUAL" || code === "GLOBAL") return null;
    const displayName = getGroupDisplayName(code);
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 shrink-0 max-w-[60px] truncate">
        {displayName}
      </span>
    );
  };

  const renderGroupBadge = (code: string | undefined) => {
    if (!code || code === "INDIVIDUAL" || code === "GLOBAL") return null;
    const displayName = getGroupDisplayName(code);
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 mt-0.5 max-w-[70px] truncate">
        {displayName}
      </span>
    );
  };

  const hasGroups = userGroups.length > 0;

  return (
    <div className="px-4 pt-6 space-y-4 pb-4">
      {/* Mini Profile Card */}
      {selectedMember && (
        <MiniProfileCard
          member={selectedMember.member}
          rank={selectedMember.rank}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Header - Gold Ribbon Banner */}
      <div className="flex justify-center">
        <div className="relative flex items-center justify-center" style={{ width: '260px', height: '65px' }}>
          <img src={ASSETS.ribbons.ranking} alt="" className="absolute inset-0 w-full h-full object-contain" />
          <span className="relative z-10 text-base font-bold" style={{ color: '#1a0a2e', paddingBottom: '4px' }}>RANKING</span>
        </div>
      </div>

      {/* Main Tabs: My Groups | Global */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setMainTab("mygroups")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all`}
          style={mainTab === "mygroups" ? { background: 'linear-gradient(135deg, #d4af37, #a08520)', color: '#1a0a2e' } : { background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', color: '#9ca3af' }}
        >
          👥 My Groups
        </button>
        <button
          onClick={() => setMainTab("global")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all`}
          style={mainTab === "global" ? { background: 'linear-gradient(135deg, #d4af37, #a08520)', color: '#1a0a2e' } : { background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', color: '#9ca3af' }}
        >
          🌍 Global
        </button>
      </div>

      {/* No Groups Empty State */}
      {mainTab === "mygroups" && userGroups.length === 0 && (
        <div className="text-center py-8 space-y-3">
          <span className="text-5xl">👥</span>
          <p className="text-gray-300 text-sm font-medium">You haven't joined any groups yet.</p>
          <p className="text-gray-500 text-xs">Join a group from your Profile to see group rankings!</p>
          <a href="/profile" className="inline-block mt-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-bold active:scale-95 transition-transform shadow-[0_4px_15px_rgba(78,205,196,0.3)]">
            Go to Profile →
          </a>
        </div>
      )}

      {/* Group Selector (in My Groups tab when user has groups) */}
      {mainTab === "mygroups" && userGroups.length >= 1 && (
        <div className="relative">
          <button
            onClick={() => setShowGroupDropdown(!showGroupDropdown)}
            className="w-full py-3 px-4 rounded-xl text-white text-sm font-medium flex items-center justify-between transition-all"
            style={{ background: 'rgba(26, 10, 46, 0.6)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <span className="flex items-center gap-2">
              <span className="text-[#d4af37]">📌</span>
              {groupNames[selectedGroupCode] || selectedGroupCode}
            </span>
            <span className={`text-gray-400 transition-transform ${showGroupDropdown ? "rotate-180" : ""}`}>▾</span>
          </button>
          
          {showGroupDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl overflow-hidden" style={{ background: 'rgba(26, 10, 46, 0.98)', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              {userGroups.map((g) => (
                <button
                  key={g.groupCode}
                  onClick={() => { setSelectedGroupCode(g.groupCode); setShowGroupDropdown(false); }}
                  className={`w-full py-3 px-4 text-left text-sm transition-all flex items-center justify-between ${
                    selectedGroupCode === g.groupCode
                      ? "text-[#f0d060] font-bold"
                      : "text-gray-300"
                  }`}
                  style={selectedGroupCode === g.groupCode ? { background: 'rgba(212,175,55,0.1)' } : {}}
                >
                  <span>{groupNames[g.groupCode] || g.groupCode}</span>
                  {g.role === "admin" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.2)', color: '#f0d060' }}>Admin</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sort Tabs */}
      <div id="lb-tabs" className="flex gap-1.5 justify-center">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSortBy(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all`}
            style={sortBy === tab.key ? { background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.6)', color: '#f0d060' } : { background: 'transparent', border: '1px solid rgba(212,175,55,0.2)', color: '#9ca3af' }}
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
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all`}
            style={timeFilter === tf.key ? { background: 'rgba(212,175,55,0.3)', color: '#f0d060' } : { background: 'transparent', border: '1px solid rgba(212,175,55,0.15)', color: '#9ca3af' }}
          >
            {tf.label}
          </button>
        ))}
      </div>
      {timeFilter === "week" && (
        <p className="text-center text-xs text-[#d4af37]/70 -mt-1">
          🔥 Weekly rankings reset every Monday — climb to the top!
        </p>
      )}

      {/* Loading / Error / Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(212,175,55,0.6)', borderTopColor: 'transparent' }} />
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="text-4xl">⚠️</span>
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); signInAnonymously(auth).catch(console.error); }}
            className="px-4 py-2 rounded-full text-sm font-medium gold-btn"
          >
            🔄 Retry
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <span className="text-4xl">🏆</span>
          <p className="text-gray-400 text-sm">No active members in this period.</p>
          <p className="text-gray-500 text-xs">Start reading to appear on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Member count */}
          <p className="text-center text-[#d4af37] text-xs font-bold">
            {mainTab === "mygroups" && selectedGroupCode
              ? `${groupNames[selectedGroupCode] || selectedGroupCode} — ${members.length} members`
              : `All ${members.length} members`}
          </p>

          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-3 pt-4 pb-2">
              {/* 2nd place */}
              <div
                className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
                onClick={() => handleMemberTap(top3[1], 2)}
              >
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-10">
                    <img src={ASSETS.ranking.badgeSilver} alt="2nd" className="w-full h-full object-contain" />
                  </div>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${!getFrameClass(top3[1]?.equippedFrame) ? "" : ""}`} style={{ background: 'rgba(26, 10, 46, 0.8)', border: '2px solid rgba(192,192,192,0.6)', boxShadow: '0 0 15px rgba(192,192,192,0.3)' }}>
                    <MemberAvatar member={top3[1]} size="md" showFrame />
                  </div>
                </div>
                <p className="text-white text-xs font-bold mt-2 max-w-[70px] truncate">{top3[1]?.nickname}</p>
                {mainTab === "global" && renderGroupBadge(top3[1]?.groupCode)}
                <p className="text-gray-300 font-bold text-xs mt-0.5">{getDisplayValue(top3[1], sortBy)}</p>
                <span className="text-yellow-400 text-xs">★</span>
              </div>

              {/* 1st place */}
              <div
                className="flex flex-col items-center -mt-4 cursor-pointer active:scale-95 transition-transform"
                onClick={() => handleMemberTap(top3[0], 1)}
              >
                <div className="text-2xl mb-1">👑</div>
                <div className="relative">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 z-10">
                    <img src={ASSETS.ranking.badgeGold} alt="1st" className="w-full h-full object-contain" />
                  </div>
                  <div className={`flex items-center justify-center overflow-hidden ${!getFrameClass(top3[0]?.equippedFrame) ? "" : ""}`} style={{width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(26, 10, 46, 0.8)', border: '2px solid rgba(212,175,55,0.7)', boxShadow: '0 0 20px rgba(212,175,55,0.3)'}}>
                    <MemberAvatar member={top3[0]} size="lg" showFrame />
                  </div>
                </div>
                <p className="text-white text-sm font-bold mt-2 max-w-[80px] truncate">
                  {top3[0]?.nickname}
                  {top3[0]?.uid === currentUid && <span className="text-red-400 text-xs ml-1">(You)</span>}
                </p>
                {mainTab === "global" && renderGroupBadge(top3[0]?.groupCode)}
                <p className="text-[#f0d060] font-bold text-sm mt-0.5">{getDisplayValue(top3[0], sortBy)}</p>
                <span className="text-yellow-400 text-xs">★</span>
              </div>

              {/* 3rd place */}
              <div
                className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
                onClick={() => handleMemberTap(top3[2], 3)}
              >
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-10">
                    <img src={ASSETS.ranking.badgeBronze} alt="3rd" className="w-full h-full object-contain" />
                  </div>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${!getFrameClass(top3[2]?.equippedFrame) ? "" : ""}`} style={{ background: 'rgba(26, 10, 46, 0.8)', border: '2px solid rgba(205,127,50,0.6)', boxShadow: '0 0 15px rgba(205,127,50,0.3)' }}>
                    <MemberAvatar member={top3[2]} size="md" showFrame />
                  </div>
                </div>
                <p className="text-white text-xs font-bold mt-2 max-w-[70px] truncate">{top3[2]?.nickname}</p>
                {mainTab === "global" && renderGroupBadge(top3[2]?.groupCode)}
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
              const memberFrameClass = getFrameClass(member.equippedFrame);
              return (
                <div
                  key={member.uid}
                  onClick={() => handleMemberTap(member, rank)}
                  className={`p-3 flex items-center gap-3 rounded-xl transition-all cursor-pointer active:scale-[0.98]`}
                  style={isMe ? { background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.4)' } : { background: 'rgba(26, 10, 46, 0.4)', border: '1px solid rgba(212,175,55,0.1)' }}
                >
                  <span className="text-base font-bold text-gray-400 w-7 text-center">{rank}</span>
                  <div className={`w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center overflow-hidden ${memberFrameClass || "border border-purple-500/30"}`}>
                    {member.profilePhotoUrl ? (
                      <img src={member.profilePhotoUrl} alt={member.nickname} className="w-10 h-10 rounded-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <span className="text-xl">{member.avatar || "😎"}</span>
                    )}
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
                      {mainTab === "global" && renderGroupBadgeInline(member.groupCode)}
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
