import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child, onValue, set, update, remove, serverTimestamp } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, initializeAuth, browserLocalPersistence, browserPopupRedirectResolver, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, OAuthProvider, signInWithPopup, linkWithCredential, signInWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import type { AuthCredential, User } from "firebase/auth";
import { safeParseJSON } from "./safeStorage";

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

const firebaseConfig = {
  apiKey: "AIzaSyCJ5qm_sCzkUfFGC8WcTGbjfviBz_SyNAg",
  authDomain: "teens-bible-94271.firebaseapp.com",
  databaseURL: "https://teens-bible-94271-default-rtdb.firebaseio.com",
  projectId: "teens-bible-94271",
  storageBucket: "teens-bible-94271.firebasestorage.app",
  messagingSenderId: "226355097233",
  appId: "1:226355097233:web:838afede878c9915225930"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
// Root cause fix for Apple/Google popupRedirectResolver error:
// getAuth(app) alone leaves _popupRedirectResolver undefined in newer SDKs,
// causing "Cannot read properties of undefined (reading 'popupRedirectResolver')"
// when signInWithPopup is called for Apple. initializeAuth with explicit resolver fixes it.
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch (e: any) {
  // If already initialized (HMR), fall back to getAuth
  _auth = getAuth(app);
}
export const auth = _auth;
export const storage = getStorage(app);
// Export resolver for explicit popup calls (web fallback)
export const popupResolver = browserPopupRedirectResolver;

export { ref, get, child, onValue, set, update, remove, serverTimestamp, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, OAuthProvider, signInWithPopup, linkWithCredential, signInWithCredential, deleteUser };
export { storageRef, uploadBytes, getDownloadURL };
export type { AuthCredential, User };

// Types
export interface LeaderboardMember {
  uid: string;
  nickname: string;
  avatar: string;
  profilePhotoUrl?: string;
  equippedFrame?: string;
  groupCode: string;
  xp: number;
  streak: number;
  chaptersRead: number;
  quizTotal: number;
  quizCorrect: number;
  lastActive: number;
  joinedAt?: number;
}

export type SortBy = "xp" | "streak" | "chapters" | "quiz";
export type TimeFilter = "all" | "week" | "month";
export type ScopeFilter = "myclass" | "all";

// Test account patterns to filter out
const TEST_PATTERNS = /^(test|admin|debug|demo|bot|fake|tmp)/i;

// --- Circuit breaker: stops runaway re-fetch loops from burning DB quota ---
// A bulk read like fetchAllMembers is normally called ~once per tab switch.
// If it is invoked more than BREAKER_MAX_CALLS times inside BREAKER_WINDOW_MS,
// something is looping (e.g. a useEffect/useCallback dependency cycle) —
// refuse the network call and throw, so the UI shows an error instead of
// downloading the same payload forever. The window slides, so it recovers
// automatically once the looping stops.
const BREAKER_WINDOW_MS = 10_000;
const BREAKER_MAX_CALLS = 5;
const breakerCalls = new Map<string, number[]>();

function breakerGuard(name: string): void {
  const now = Date.now();
  const recent = (breakerCalls.get(name) ?? []).filter((t) => now - t < BREAKER_WINDOW_MS);
  recent.push(now);
  breakerCalls.set(name, recent);
  if (recent.length === 3) {
    console.warn(`[CircuitBreaker] ${name} called 3x within 10s — watching for a fetch loop`);
  }
  if (recent.length > BREAKER_MAX_CALLS) {
    console.error(`[CircuitBreaker] ${name} TRIPPED: ${recent.length} calls within 10s — refusing network call`);
    throw new Error(`[CircuitBreaker] ${name}: too many calls in a short time (possible infinite loop)`);
  }
}

// Shared member filter: test accounts and unnamed users are excluded.
// Root cause fix: do NOT filter out 0 XP + 0 chapters users — new users like Xxcd
// have 0 activity but should still appear in rankings. The old filter caused
// "Ranking 로딩 후 목록 미표시" for new accounts.
function applyMemberFilter(members: LeaderboardMember[]): LeaderboardMember[] {
  const filtered = members.filter(m => {
    if (!m.nickname || m.nickname.trim() === "" || m.nickname === "Anonymous") return false;
    if (TEST_PATTERNS.test(m.nickname)) return false;
    // Keep 0-activity users visible — they are valid users
    return true;
  });
  console.log(`[fetchAllMembers] After filter: ${filtered.length}`);
  return filtered;
}

// Fetch all members across all groups (with dedup + cleanup)
export async function fetchAllMembers(): Promise<LeaderboardMember[]> {
  breakerGuard("fetchAllMembers");
  try {
    // Prefer the small aggregate node (~24KB) maintained by the
    // mirrorMemberToLeaderboard function. Falls back to the full /groups
    // read (~565KB) when the aggregate is not populated yet (pre-Blaze)
    // or unreadable — behavior is identical either way.
    try {
      const aggSnap = await get(ref(db, "leaderboardGlobal"));
      const agg = aggSnap.val();
      if (agg && typeof agg === "object" && Object.keys(agg).length > 0) {
        const members = Object.values(agg) as LeaderboardMember[];
        console.log(`[fetchAllMembers] leaderboardGlobal hit: ${members.length} members`);
        return applyMemberFilter(members);
      }
      console.log("[fetchAllMembers] leaderboardGlobal empty, falling back to /groups");
    } catch (e: any) {
      console.warn("[fetchAllMembers] leaderboardGlobal read failed, falling back to /groups:", e?.code || e?.message);
    }
    return await fetchAllMembersFromGroups();
  } catch (e: any) {
    console.error("[fetchAllMembers] failed:", e?.code, e?.message, e);
    // Re-throw with code so UI can distinguish permission vs empty
    if (e?.code === "PERMISSION_DENIED") {
      throw new Error("PERMISSION_DENIED");
    }
    return [];
  }
}

// Full /groups read with dedupe. Used as the fallback until the
// leaderboardGlobal aggregate is populated (Blaze, Oct 2026).
async function fetchAllMembersFromGroups(): Promise<LeaderboardMember[]> {
  const snapshot = await get(ref(db, "groups"));
  const allGroups = snapshot.val();
  if (!allGroups) {
    console.warn("[fetchAllMembers] No groups data at /groups");
    return [];
  }

  // Deduplicate by uid: keep the entry with higher XP if same uid in multiple groups
  const memberMap = new Map<string, LeaderboardMember>();
  let totalRaw = 0;
  Object.entries(allGroups).forEach(([gCode, gData]: [string, any]) => {
    if (gData && gData.members) {
      Object.entries(gData.members).forEach(([uid, d]: [string, any]) => {
        totalRaw++;
        const member: LeaderboardMember = { uid, groupCode: gCode, ...d };
        const existing = memberMap.get(uid);
        if (!existing || (member.xp || 0) > (existing.xp || 0)) {
          memberMap.set(uid, member);
        }
      });
    }
  });

  console.log(`[fetchAllMembers] Raw members: ${totalRaw}, unique: ${memberMap.size}`);
  return applyMemberFilter(Array.from(memberMap.values()));
}

// Fetch members from a specific class/group
export async function fetchClassMembers(groupCode: string): Promise<LeaderboardMember[]> {
  breakerGuard("fetchClassMembers");
  try {
    console.log(`[fetchClassMembers] Fetching group ${groupCode}`);
    const snapshot = await get(ref(db, `groups/${groupCode}/members`));
    const data = snapshot.val();
    if (!data) {
      console.warn(`[fetchClassMembers] No members for ${groupCode}`);
      return [];
    }
    
    const members = Object.entries(data).map(([uid, d]: [string, any]) => ({
      uid, ...d
    }));
    console.log(`[fetchClassMembers] ${groupCode}: ${members.length} members`);
    return members;
  } catch (e: any) {
    console.error("[fetchClassMembers] failed:", e?.code, e?.message, e);
    if (e?.code === "PERMISSION_DENIED") {
      throw new Error("PERMISSION_DENIED");
    }
    return [];
  }
}

// Sort members by criteria
export function sortMembers(members: LeaderboardMember[], sortBy: SortBy): LeaderboardMember[] {
  const sorted = [...members];
  switch (sortBy) {
    case "xp":
      sorted.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      break;
    case "streak":
      sorted.sort((a, b) => (b.streak || 0) - (a.streak || 0));
      break;
    case "chapters":
      sorted.sort((a, b) => (b.chaptersRead || 0) - (a.chaptersRead || 0));
      break;
    case "quiz":
      sorted.sort((a, b) => {
        const aRate = (a.quizTotal || 0) > 0 ? (a.quizCorrect || 0) / (a.quizTotal || 1) : 0;
        const bRate = (b.quizTotal || 0) > 0 ? (b.quizCorrect || 0) / (b.quizTotal || 1) : 0;
        return bRate - aRate;
      });
      break;
  }
  return sorted;
}

// Filter members by time
export function filterByTime(members: LeaderboardMember[], time: TimeFilter): LeaderboardMember[] {
  if (time === "all") return members;
  const now = Date.now();
  const cutoff = time === "week" ? now - 7 * 24 * 60 * 60 * 1000 : now - 30 * 24 * 60 * 60 * 1000;
  return members.filter(m => m.lastActive && m.lastActive > cutoff);
}

// Get display value for a member based on sort criteria
export function getDisplayValue(member: LeaderboardMember, sortBy: SortBy): string {
  switch (sortBy) {
    case "xp":
      return `${(member.xp || 0).toLocaleString()} XP`;
    case "streak":
      return `${member.streak || 0} days`;
    case "chapters":
      return `${member.chaptersRead || 0} ch`;
    case "quiz":
      const rate = (member.quizTotal || 0) > 0
        ? Math.round((member.quizCorrect || 0) / (member.quizTotal || 1) * 100)
        : 0;
      return `${rate}% (${member.quizCorrect || 0}/${member.quizTotal || 0})`;
    default:
      return "";
  }
}

// Sync current user data to Firebase
export async function syncUserToFirebase(uid: string) {
  const profile = localStorage.getItem("teensBibleProfile");
  if (!profile) return;
  
  const userProfile = safeParseJSON<any>("teensBibleProfile", {});
  if (!userProfile || Object.keys(userProfile).length === 0) return;
  const groupCode = userProfile.groupCode || "GLOBAL";
  
  const totalXP = parseInt(localStorage.getItem("totalXP") || "0");
  let chaptersRead = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("chaptersRead_")) {
      const arr = safeParseJSON<number[]>(key, []);
      chaptersRead += arr.length;
    }
  }
  
  const teensBible = safeParseJSON<any>("teensBible", {});
  
  const profilePhotoUrl = localStorage.getItem("profilePhotoUrl") || localStorage.getItem("profilePhoto") || null;
  
  const userData: Record<string, any> = {
    nickname: userProfile.nickname || "Anonymous",
    avatar: userProfile.avatar || "😎",
    groupCode,
    xp: totalXP,
    streak: teensBible.streak || 0,
    chaptersRead,
    quizTotal: teensBible.quizTotal || 0,
    quizCorrect: teensBible.quizCorrect || 0,
    joinedAt: userProfile.joinedAt || Date.now(),
    isNasumMember: userProfile.isNasumMember || false,
    lastActive: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  if (profilePhotoUrl) {
    userData.profilePhotoUrl = profilePhotoUrl;
  } else {
    try {
      const existingSnapshot = await get(ref(db, `users/${uid}/profilePhotoUrl`));
      const existingUrl = existingSnapshot.val();
      if (existingUrl) {
        userData.profilePhotoUrl = existingUrl;
        localStorage.setItem("profilePhotoUrl", existingUrl);
      }
    } catch {}
  }
  
  try {
    const equipped = safeParseJSON<any>("teensBibleEquipped", {});
    if (equipped.frame) {
      userData.equippedFrame = equipped.frame;
    }
  } catch {}
  
  try {
    await update(ref(db, `users/${uid}`), userData);
    await update(ref(db, `groups/${groupCode}/members/${uid}`), userData);
    
    try {
      const { getLocalGroups } = await import("./groups");
      const allGroups = getLocalGroups();
      for (const g of allGroups) {
        if (g.groupCode !== groupCode) {
          const groupData = { ...userData, groupCode: g.groupCode };
          await update(ref(db, `groups/${g.groupCode}/members/${uid}`), groupData);
        }
      }
    } catch (e) {}
  } catch (err) {
    console.log("Sync error:", err);
  }
}

export function getCurrentGroupCode(): string {
  const profile = safeParseJSON<any>("teensBibleProfile", {});
  if (profile && profile.groupCode) {
    return profile.groupCode;
  }
  return "GLOBAL";
}

export function getCurrentUid(): string | null {
  return auth.currentUser?.uid || null;
}
