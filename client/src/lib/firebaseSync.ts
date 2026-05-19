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
  // Daily streak
  dailyStreak?: {
    currentStreak: number;
    lastClaimDate: string;
    totalDaysClaimed: number;
    longestStreak: number;
  };
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

  // Daily streak
  let dailyStreak = { currentStreak: 0, lastClaimDate: "", totalDaysClaimed: 0, longestStreak: 0 };
  try {
    const raw = localStorage.getItem("teensBibleDailyStreak");
    if (raw) dailyStreak = JSON.parse(raw);
  } catch {}

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
    dailyStreak,
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

  // Daily streak
  if (data.dailyStreak) {
    localStorage.setItem("teensBibleDailyStreak", JSON.stringify(data.dailyStreak));
    // Also update teensBible.streak for leaderboard
    try {
      const raw = localStorage.getItem("teensBible");
      const teensBible = raw ? JSON.parse(raw) : {};
      teensBible.streak = data.dailyStreak.currentStreak;
      localStorage.setItem("teensBible", JSON.stringify(teensBible));
    } catch {}
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
    const leaderboardData: Record<string, any> = {
      nickname: data.profile.nickname,
      avatar: data.profile.avatar,
      groupCode,
      xp: data.stats.totalXP,
      streak: data.dailyStreak?.currentStreak || 0,
      chaptersRead: Object.values(data.chaptersRead).reduce((sum, arr) => sum + arr.length, 0),
      quizTotal: data.stats.quizTotal,
      quizCorrect: data.stats.quizCorrect,
      joinedAt: data.profile.joinedAt,
      isNasumMember: data.profile.isNasumMember,
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Include profile photo URL if available locally
    const profilePhotoUrl = localStorage.getItem("profilePhotoUrl") || localStorage.getItem("profilePhoto") || null;
    if (profilePhotoUrl) {
      leaderboardData.profilePhotoUrl = profilePhotoUrl;
    } else {
      // Preserve existing photo from DB
      try {
        const existingSnapshot = await get(ref(db, `users/${uid}/profilePhotoUrl`));
        const existingUrl = existingSnapshot.val();
        if (existingUrl) {
          leaderboardData.profilePhotoUrl = existingUrl;
          localStorage.setItem("profilePhotoUrl", existingUrl);
        }
      } catch {}
    }

    // Include equipped frame if available
    try {
      const equipped = JSON.parse(localStorage.getItem("teensBibleEquipped") || "{}");
      if (equipped.frame) {
        leaderboardData.equippedFrame = equipped.frame;
      }
    } catch {}

    await update(ref(db, `users/${uid}`), leaderboardData);
    await update(ref(db, `groups/${groupCode}/members/${uid}`), leaderboardData);

    console.log("[Sync] \u2705 Data uploaded to Firebase");
    return true;
  } catch (err) {
    console.error("[Sync] \u274c Upload failed:", err);
    return false;
  }
}

// \u2500\u2500\u2500 Download: Pull Firebase \u2192 localStorage───────────────
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
      
      // Restore profile photo from Firebase
      await restoreProfilePhotoFromFirebase(uid);
      
      return true; // Data was restored
    } else {
      // Even if local is newer, merge critical data from remote
      // This ensures admin-granted items and gems are always picked up
      let anyMerged = false;

      // Merge inventory items
      if (remoteData.inventory?.ownedItems) {
        try {
          const localInvRaw = localStorage.getItem("teensBibleInventory");
          const localInv = localInvRaw ? JSON.parse(localInvRaw) : { ownedItems: ["theme_twilight", "reader_dark", "frame_none"] };
          const localOwned = new Set(localInv.ownedItems || []);
          const remoteOwned = remoteData.inventory.ownedItems || [];
          for (const item of remoteOwned) {
            if (!localOwned.has(item)) {
              localInv.ownedItems.push(item);
              anyMerged = true;
              console.log(`[Sync] Merged missing item from remote: ${item}`);
            }
          }
          if (anyMerged) {
            localStorage.setItem("teensBibleInventory", JSON.stringify(localInv));
          }
        } catch {}
      }

      // Merge gems: always take the higher value (admin grants increase remote)
      if (remoteData.stats?.gems !== undefined) {
        try {
          const localRaw = localStorage.getItem("teensBible");
          const localData = localRaw ? JSON.parse(localRaw) : {};
          const localGems = localData.gems || 0;
          const remoteGems = remoteData.stats.gems || 0;
          if (remoteGems > localGems) {
            localData.gems = remoteGems;
            localStorage.setItem("teensBible", JSON.stringify(localData));
            anyMerged = true;
            console.log(`[Sync] Merged gems from remote: ${localGems} → ${remoteGems}`);
            // Dispatch event so UI updates
            window.dispatchEvent(new CustomEvent("gems-changed", { detail: remoteGems }));
          }
        } catch {}
      }

      // Merge equipped state from remote (in case admin changed it)
      if (remoteData.equipped) {
        try {
          const localEqRaw = localStorage.getItem("teensBibleEquipped");
          const localEq = localEqRaw ? JSON.parse(localEqRaw) : { theme: "theme_twilight", readerBg: "reader_dark", frame: "frame_none", pet: null };
          // Only apply remote equipped if it references items the user owns
          const localInvRaw = localStorage.getItem("teensBibleInventory");
          const localInv = localInvRaw ? JSON.parse(localInvRaw) : { ownedItems: [] };
          const owned = new Set(localInv.ownedItems || []);
          let eqChanged = false;
          if (remoteData.equipped.readerBg && remoteData.equipped.readerBg !== localEq.readerBg && owned.has(remoteData.equipped.readerBg)) {
            localEq.readerBg = remoteData.equipped.readerBg;
            eqChanged = true;
          }
          if (remoteData.equipped.theme && remoteData.equipped.theme !== localEq.theme && owned.has(remoteData.equipped.theme)) {
            localEq.theme = remoteData.equipped.theme;
            eqChanged = true;
          }
          if (remoteData.equipped.frame && remoteData.equipped.frame !== localEq.frame && owned.has(remoteData.equipped.frame)) {
            localEq.frame = remoteData.equipped.frame;
            eqChanged = true;
          }
          if (remoteData.equipped.pet !== undefined && remoteData.equipped.pet !== localEq.pet) {
            if (remoteData.equipped.pet === null || owned.has(remoteData.equipped.pet)) {
              localEq.pet = remoteData.equipped.pet;
              eqChanged = true;
            }
          }
          if (eqChanged) {
            localStorage.setItem("teensBibleEquipped", JSON.stringify(localEq));
            anyMerged = true;
            console.log(`[Sync] Merged equipped state from remote`);
            window.dispatchEvent(new CustomEvent("equipped-changed", { detail: localEq }));
          }
        } catch {}
      }

      if (anyMerged) {
        console.log("[Sync] Merged remote data into local (local was newer)");
      } else {
        console.log("[Sync] Local data is newer or same, no merge needed");
      }
      return false;
    }
  } catch (err) {
    console.error("[Sync] ❌ Download failed:", err);
    return false;
  }
}

// ─── Restore profile photo from Firebase Realtime DB ──────────────────
async function restoreProfilePhotoFromFirebase(uid: string): Promise<void> {
  try {
    // Check if there's a profilePhotoUrl in the DB (base64 or URL)
    const userSnapshot = await get(ref(db, `users/${uid}/profilePhotoUrl`));
    const photoData = userSnapshot.val();
    
    if (photoData && typeof photoData === "string") {
      // Restore to localStorage
      localStorage.setItem("profilePhotoUrl", photoData);
      console.log("[Sync] ✅ Profile photo restored from Firebase DB");
      window.dispatchEvent(new CustomEvent("profile-photo-changed"));
    }
  } catch (err: any) {
    console.log("[Sync] No profile photo to restore");
  }
}

// ─── Full sync: Download first, then upload ─────────────────────
export async function fullSync(): Promise<{ restored: boolean }> {
  const uid = auth.currentUser?.uid;
  if (!uid) return { restored: false };

  // Step 1: Check if remote has newer data (e.g., user cleared browser or switched device)
  const restored = await syncFromFirebase();

  // Step 2: Upload current state, but use smart merge to not overwrite admin-granted data
  await smartSyncToFirebase();

  return { restored };
}

// Smart sync: reads remote first, merges admin-granted values, then uploads
async function smartSyncToFirebase(): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;

  try {
    // Read current remote state
    const snapshot = await get(ref(db, `userData/${uid}`));
    const remoteData = snapshot.val() as UserDataSnapshot | null;
    
    const localData = collectLocalData();

    // If remote has higher gems (admin grant), preserve the higher value
    if (remoteData?.stats?.gems !== undefined) {
      const remoteGems = remoteData.stats.gems || 0;
      if (remoteGems > localData.stats.gems) {
        localData.stats.gems = remoteGems;
        // Also update localStorage so UI stays in sync
        let teensBible: any = {};
        try {
          const raw = localStorage.getItem("teensBible");
          if (raw) teensBible = JSON.parse(raw);
        } catch {}
        teensBible.gems = remoteGems;
        localStorage.setItem("teensBible", JSON.stringify(teensBible));
        console.log(`[Sync] Preserved higher remote gems: ${remoteGems}`);
        // Notify UI
        window.dispatchEvent(new CustomEvent("gems-changed", { detail: remoteGems }));
      }
    }

    // If remote has inventory items we don't have, merge them
    if (remoteData?.inventory?.ownedItems) {
      const localOwned = new Set(localData.inventory.ownedItems);
      for (const item of remoteData.inventory.ownedItems) {
        if (!localOwned.has(item)) {
          localData.inventory.ownedItems.push(item);
          console.log(`[Sync] Preserved remote inventory item: ${item}`);
        }
      }
    }

    // Now upload the merged data
    await set(ref(db, `userData/${uid}`), localData);

    // Also update leaderboard-facing data
    const groupCode = localData.profile.groupCode || "GLOBAL";
    const leaderboardData: Record<string, any> = {
      nickname: localData.profile.nickname,
      avatar: localData.profile.avatar,
      groupCode,
      xp: localData.stats.totalXP,
      streak: localData.dailyStreak?.currentStreak || 0,
      chaptersRead: Object.values(localData.chaptersRead).reduce((sum, arr) => sum + arr.length, 0),
      quizTotal: localData.stats.quizTotal,
      quizCorrect: localData.stats.quizCorrect,
      joinedAt: localData.profile.joinedAt,
      isNasumMember: localData.profile.isNasumMember,
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Include profile photo URL if available locally
    const profilePhotoUrl = localStorage.getItem("profilePhotoUrl") || localStorage.getItem("profilePhoto") || null;
    if (profilePhotoUrl) {
      leaderboardData.profilePhotoUrl = profilePhotoUrl;
    } else {
      // Preserve existing photo from DB
      try {
        const existingSnapshot = await get(ref(db, `users/${uid}/profilePhotoUrl`));
        const existingUrl = existingSnapshot.val();
        if (existingUrl) {
          leaderboardData.profilePhotoUrl = existingUrl;
          localStorage.setItem("profilePhotoUrl", existingUrl);
        }
      } catch {}
    }

    // Include equipped frame if available
    try {
      const equipped = JSON.parse(localStorage.getItem("teensBibleEquipped") || "{}");
      if (equipped.frame) {
        leaderboardData.equippedFrame = equipped.frame;
      }
    } catch {}

    await update(ref(db, `users/${uid}`), leaderboardData);
    await update(ref(db, `groups/${groupCode}/members/${uid}`), leaderboardData);

    console.log("[Sync] \u2705 Smart sync uploaded to Firebase");   return true;
  } catch (err) {
    console.error("[Sync] ❌ Smart sync failed, falling back to regular sync:", err);
    return syncToFirebase();
  }
}

// ─── Auto-sync: Call after any significant data change ──────────
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleSyncToFirebase() {
  // Debounce: wait 2 seconds after last change before syncing
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    smartSyncToFirebase();
  }, 2000);
}

// Immediate sync for critical operations (purchases, equips)
export function immediateSyncToFirebase() {
  if (syncTimeout) clearTimeout(syncTimeout);
  smartSyncToFirebase();
}

// Sync on page unload to prevent data loss
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    // Use sendBeacon-style sync or at least attempt sync
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      smartSyncToFirebase();
    }
  });

  // Also sync on visibility change (user switches tabs/minimizes)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && syncTimeout) {
      clearTimeout(syncTimeout);
      smartSyncToFirebase();
    }
  });
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
