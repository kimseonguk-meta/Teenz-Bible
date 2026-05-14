/**
 * Firebase Data Sync Module
 * 
 * Syncs all localStorage data to Firebase Realtime DB so that:
 * 1. Data persists across devices
 * 2. Data survives browser cache clears
 * 3. Leaderboard always has up-to-date stats
 * 
 * Data synced:
 * - Profile (nickname, avatar, groupCode, joinedAt)
 * - XP & Gems
 * - Chapters read (per book)
 * - Quiz scores
 * - Watched videos
 * - Store inventory & equipped items
 * - Settings (font size, language)
 * - Meme reactions
 */

import { db, ref, get, set, update, serverTimestamp, auth } from "./firebase";

// ─── Types ──────────────────────────────────────────────────────
interface UserDataSnapshot {
  // Profile
  profile: {
    nickname: string;
    avatar: string;
    groupCode: string;
    joinedAt: number;
    isNasumMember: boolean;
  };
  // Stats
  stats: {
    totalXP: number;
    gems: number;
    quizTotal: number;
    quizCorrect: number;
  };
  // Reading progress
  chaptersRead: Record<string, number[]>; // { "Matthew": [1,2,3], "Genesis": [1] }
  watchedVideos: string[];
  lastRead: {
    book: string;
    chapter: number;
    chapterIdx: number;
  } | null;
  // Store
  inventory: {
    ownedItems: string[];
  };
  equipped: {
    theme: string;
    readerBg: string;
    frame: string;
    pet: string | null;
  };
  // Settings
  settings: {
    readerFontSize: string;
    readerLang: string;
    bibleTestament: string;
  };
  // Meme reactions
  memeReactions: Record<string, string>;
  // Metadata
  lastSyncedAt: number;
  version: number;
}

const SYNC_VERSION = 1;

// ─── Collect all localStorage data into a snapshot ──────────────
function collectLocalData(): UserDataSnapshot {
  // Profile
  let profile = { nickname: "Anonymous", avatar: "😎", groupCode: "GLOBAL", joinedAt: Date.now(), isNasumMember: false };
  try {
    const raw = localStorage.getItem("teensBibleProfile");
    if (raw) {
      const p = JSON.parse(raw);
      profile = { ...profile, ...p };
    }
  } catch {}

  // teensBible object (gems, quiz)
  let teensBible: any = {};
  try {
    const raw = localStorage.getItem("teensBible");
    if (raw) teensBible = JSON.parse(raw);
  } catch {}

  // Stats
  const stats = {
    totalXP: parseInt(localStorage.getItem("totalXP") || "0"),
    gems: teensBible.gems || 0,
    quizTotal: teensBible.quizTotal || 0,
    quizCorrect: teensBible.quizCorrect || 0,
  };

  // Chapters read (dynamic keys: chaptersRead_BookName)
  const chaptersRead: Record<string, number[]> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("chaptersRead_")) {
      const bookName = key.replace("chaptersRead_", "");
      try {
        chaptersRead[bookName] = JSON.parse(localStorage.getItem(key) || "[]");
      } catch {}
    }
  }

  // Watched videos
  let watchedVideos: string[] = [];
  try {
    watchedVideos = JSON.parse(localStorage.getItem("watchedVideos") || "[]");
  } catch {}

  // Last read position
  let lastRead: UserDataSnapshot["lastRead"] = null;
  const lastReadBook = localStorage.getItem("lastReadBook");
  if (lastReadBook) {
    lastRead = {
      book: lastReadBook,
      chapter: parseInt(localStorage.getItem("lastReadChapter") || "1"),
      chapterIdx: parseInt(localStorage.getItem("lastReadChapterIdx") || "0"),
    };
  }

  // Store inventory
  let inventory = { ownedItems: ["theme_twilight", "reader_dark", "frame_none"] };
  try {
    const raw = localStorage.getItem("teensBibleInventory");
    if (raw) inventory = JSON.parse(raw);
  } catch {}

  // Equipped items
  let equipped = { theme: "theme_twilight", readerBg: "reader_dark", frame: "frame_none", pet: null as string | null };
  try {
    const raw = localStorage.getItem("teensBibleEquipped");
    if (raw) equipped = JSON.parse(raw);
  } catch {}

  // Settings
  const settings = {
    readerFontSize: localStorage.getItem("readerFontSize") || "text-lg",
    readerLang: localStorage.getItem("readerLang") || "en",
    bibleTestament: localStorage.getItem("bibleTestament") || "ot",
  };

  // Meme reactions
  const memeReactions: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("memeUserReaction_")) {
      const memeId = key.replace("memeUserReaction_", "");
      memeReactions[memeId] = localStorage.getItem(key) || "";
    }
  }

  return {
    profile,
    stats,
    chaptersRead,
    watchedVideos,
    lastRead,
    inventory,
    equipped,
    settings,
    memeReactions,
    lastSyncedAt: Date.now(),
    version: SYNC_VERSION,
  };
}

// ─── Apply snapshot data to localStorage ────────────────────────
function applyDataToLocal(data: UserDataSnapshot) {
  // Profile
  if (data.profile) {
    localStorage.setItem("teensBibleProfile", JSON.stringify(data.profile));
    localStorage.setItem("playerName", data.profile.nickname);
    localStorage.setItem("className", data.profile.groupCode);
  }

  // Stats
  if (data.stats) {
    localStorage.setItem("totalXP", String(data.stats.totalXP));
    // Update teensBible object
    let teensBible: any = {};
    try {
      const raw = localStorage.getItem("teensBible");
      if (raw) teensBible = JSON.parse(raw);
    } catch {}
    teensBible.gems = data.stats.gems;
    teensBible.quizTotal = data.stats.quizTotal;
    teensBible.quizCorrect = data.stats.quizCorrect;
    localStorage.setItem("teensBible", JSON.stringify(teensBible));
  }

  // Chapters read
  if (data.chaptersRead) {
    Object.entries(data.chaptersRead).forEach(([book, chapters]) => {
      localStorage.setItem(`chaptersRead_${book}`, JSON.stringify(chapters));
    });
  }

  // Watched videos
  if (data.watchedVideos) {
    localStorage.setItem("watchedVideos", JSON.stringify(data.watchedVideos));
  }

  // Last read
  if (data.lastRead) {
    localStorage.setItem("lastReadBook", data.lastRead.book);
    localStorage.setItem("lastReadChapter", String(data.lastRead.chapter));
    localStorage.setItem("lastReadChapterIdx", String(data.lastRead.chapterIdx));
  }

  // Inventory
  if (data.inventory) {
    localStorage.setItem("teensBibleInventory", JSON.stringify(data.inventory));
  }

  // Equipped
  if (data.equipped) {
    localStorage.setItem("teensBibleEquipped", JSON.stringify(data.equipped));
    if (data.equipped.theme) {
      localStorage.setItem("teensBibleActiveTheme", data.equipped.theme);
    }
  }

  // Settings
  if (data.settings) {
    localStorage.setItem("readerFontSize", data.settings.readerFontSize);
    localStorage.setItem("readerLang", data.settings.readerLang);
    localStorage.setItem("bibleTestament", data.settings.bibleTestament);
  }

  // Meme reactions
  if (data.memeReactions) {
    Object.entries(data.memeReactions).forEach(([memeId, reaction]) => {
      localStorage.setItem(`memeUserReaction_${memeId}`, reaction);
    });
  }
}

// ─── Upload: Push localStorage → Firebase ───────────────────────
export async function syncToFirebase(): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    console.log("[Sync] No authenticated user, skipping upload");
    return false;
  }

  const data = collectLocalData();

  try {
    // Save full user data snapshot
    await set(ref(db, `userData/${uid}`), data);

    // Also update the leaderboard-facing data (groups + users nodes)
    const groupCode = data.profile.groupCode || "GLOBAL";
    const leaderboardData = {
      nickname: data.profile.nickname,
      avatar: data.profile.avatar,
      groupCode,
      xp: data.stats.totalXP,
      streak: 0,
      chaptersRead: Object.values(data.chaptersRead).reduce((sum, arr) => sum + arr.length, 0),
      quizTotal: data.stats.quizTotal,
      quizCorrect: data.stats.quizCorrect,
      joinedAt: data.profile.joinedAt,
      isNasumMember: data.profile.isNasumMember,
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await update(ref(db, `users/${uid}`), leaderboardData);
    await update(ref(db, `groups/${groupCode}/members/${uid}`), leaderboardData);

    console.log("[Sync] ✅ Data uploaded to Firebase");
    return true;
  } catch (err) {
    console.error("[Sync] ❌ Upload failed:", err);
    return false;
  }
}

// ─── Download: Pull Firebase → localStorage ─────────────────────
export async function syncFromFirebase(): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    console.log("[Sync] No authenticated user, skipping download");
    return false;
  }

  try {
    const snapshot = await get(ref(db, `userData/${uid}`));
    const remoteData = snapshot.val() as UserDataSnapshot | null;

    if (!remoteData) {
      console.log("[Sync] No remote data found, this is a fresh user");
      return false;
    }

    // Compare timestamps: only apply remote data if it's newer
    const localSyncTime = parseInt(localStorage.getItem("lastSyncedAt") || "0");
    const remoteSyncTime = remoteData.lastSyncedAt || 0;

    if (remoteSyncTime > localSyncTime) {
      console.log("[Sync] Remote data is newer, applying to local...");
      applyDataToLocal(remoteData);
      localStorage.setItem("lastSyncedAt", String(remoteSyncTime));
      return true; // Data was restored
    } else {
      // Even if local is newer, merge inventory items from remote
      // This ensures admin-granted items are always picked up
      if (remoteData.inventory?.ownedItems) {
        try {
          const localInvRaw = localStorage.getItem("teensBibleInventory");
          const localInv = localInvRaw ? JSON.parse(localInvRaw) : { ownedItems: ["theme_twilight", "reader_dark", "frame_none"] };
          const localOwned = new Set(localInv.ownedItems || []);
          const remoteOwned = remoteData.inventory.ownedItems || [];
          let merged = false;
          for (const item of remoteOwned) {
            if (!localOwned.has(item)) {
              localInv.ownedItems.push(item);
              merged = true;
              console.log(`[Sync] Merged missing item from remote: ${item}`);
            }
          }
          if (merged) {
            localStorage.setItem("teensBibleInventory", JSON.stringify(localInv));
          }
        } catch {}
      }
      console.log("[Sync] Local data is newer or same, no full restore needed");
      return false;
    }
  } catch (err) {
    console.error("[Sync] ❌ Download failed:", err);
    return false;
  }
}

// ─── Full sync: Download first, then upload ─────────────────────
export async function fullSync(): Promise<{ restored: boolean }> {
  const uid = auth.currentUser?.uid;
  if (!uid) return { restored: false };

  // Step 1: Check if remote has newer data (e.g., user cleared browser or switched device)
  const restored = await syncFromFirebase();

  // Step 2: Always upload current state to keep Firebase up to date
  if (!restored) {
    await syncToFirebase();
  }

  return { restored };
}

// ─── Auto-sync: Call after any significant data change ──────────
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleSyncToFirebase() {
  // Debounce: wait 3 seconds after last change before syncing
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncToFirebase();
  }, 3000);
}

// ─── Initialize sync on app load ────────────────────────────────
export async function initializeSync(): Promise<{ restored: boolean }> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    // Wait for auth to be ready
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) {
          fullSync().then(resolve);
        } else {
          resolve({ restored: false });
        }
      });
    });
  }
  return fullSync();
}
