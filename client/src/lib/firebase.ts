import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child, onValue, set, update, serverTimestamp } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, OAuthProvider, signInWithPopup, linkWithCredential, signInWithCredential, EmailAuthProvider } from "firebase/auth";
import type { AuthCredential, User } from "firebase/auth";

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
export const auth = getAuth(app);
export const storage = getStorage(app);

export { ref, get, child, onValue, set, update, serverTimestamp, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, OAuthProvider, signInWithPopup, linkWithCredential, signInWithCredential };
export { storageRef, uploadBytes, getDownloadURL };
export type { AuthCredential, User };

// Types
export interface LeaderboardMember {
  uid: string;
  nickname: string;
  avatar: string;
  profilePhotoUrl?: string;
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

// Fetch all members across all groups (with dedup + cleanup)
export async function fetchAllMembers(): Promise<LeaderboardMember[]> {
  const snapshot = await get(ref(db, "groups"));
  const allGroups = snapshot.val();
  if (!allGroups) return [];
  
  // Deduplicate by uid: keep the entry with higher XP if same uid in multiple groups
  const memberMap = new Map<string, LeaderboardMember>();
  Object.entries(allGroups).forEach(([gCode, gData]: [string, any]) => {
    if (gData && gData.members) {
      Object.entries(gData.members).forEach(([uid, d]: [string, any]) => {
        const member: LeaderboardMember = { uid, groupCode: gCode, ...d };
        const existing = memberMap.get(uid);
        if (!existing || (member.xp || 0) > (existing.xp || 0)) {
          memberMap.set(uid, member);
        }
      });
    }
  });
  
  // Filter out test accounts, unnamed users, and 0-activity users
  return Array.from(memberMap.values()).filter(m => {
    // Remove users with no nickname or empty nickname
    if (!m.nickname || m.nickname.trim() === "" || m.nickname === "Anonymous") return false;
    // Remove test/debug accounts
    if (TEST_PATTERNS.test(m.nickname)) return false;
    // Remove users with zero chapters AND zero XP (never actually used the app)
    if ((m.chaptersRead || 0) === 0 && (m.xp || 0) === 0) return false;
    return true;
  });
}

// Fetch members from a specific class/group
export async function fetchClassMembers(groupCode: string): Promise<LeaderboardMember[]> {
  const snapshot = await get(ref(db, `groups/${groupCode}/members`));
  const data = snapshot.val();
  if (!data) return [];
  
  return Object.entries(data).map(([uid, d]: [string, any]) => ({
    uid, ...d
  }));
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
  
  const userProfile = JSON.parse(profile);
  const groupCode = userProfile.groupCode || "GLOBAL";
  
  // Get stats from localStorage
  const totalXP = parseInt(localStorage.getItem("totalXP") || "0");
  let chaptersRead = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("chaptersRead_")) {
      try {
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        chaptersRead += arr.length;
      } catch {}
    }
  }
  
  const teensBible = JSON.parse(localStorage.getItem("teensBible") || "{}");
  
  // Include profile photo URL if available
  const profilePhotoUrl = localStorage.getItem("profilePhotoUrl") || null;
  
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
  }
  
  try {
    await update(ref(db, `users/${uid}`), userData);
    await update(ref(db, `groups/${groupCode}/members/${uid}`), userData);
  } catch (err) {
    console.log("Sync error:", err);
  }
}

// Get current user's group code
export function getCurrentGroupCode(): string {
  try {
    const profile = localStorage.getItem("teensBibleProfile");
    if (profile) {
      return JSON.parse(profile).groupCode || "GLOBAL";
    }
  } catch {}
  return "GLOBAL";
}

// Get current user's UID
export function getCurrentUid(): string | null {
  return auth.currentUser?.uid || null;
}
