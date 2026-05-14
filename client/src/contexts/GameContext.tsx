import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { feedPet, getEquipped, getPetState, PETS } from "@/data/storeItems";

// Dispatch sync event after data changes
function dispatchSyncEvent() {
  window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
}

// ─── Types ───────────────────────────────────────────────────
export interface GameState {
  playerName: string;
  className: string;
  totalXP: number;
  gems: number;
  ownedPets: string[];
  equippedPet: string;
  ownedThemes: string[];
  equippedTheme: string;
  ownedFrames: string[];
  equippedFrame: string;
  badges: string[];
  watchedVideos: string[];
  settingsOpen: boolean;
  editNameOpen: boolean;
  notificationsOpen: boolean;
}

interface GameContextType extends GameState {
  // Actions
  addXP: (amount: number) => void;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  setPlayerName: (name: string) => void;
  setClassName: (name: string) => void;
  buyItem: (type: "pet" | "theme" | "frame", id: string, price: number) => boolean;
  equipItem: (type: "pet" | "theme" | "frame", id: string) => void;
  getChaptersRead: (book: string) => number[];
  markChapterRead: (book: string, chapterNum: number) => void;
  getTotalChaptersRead: () => number;
  markVideoWatched: (book: string) => void;
  getWatchedVideos: () => string[];
  getLevel: () => { name: string; level: number; next: number; prev: number };
  openSettings: () => void;
  closeSettings: () => void;
  openEditName: () => void;
  closeEditName: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  refreshState: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

// ─── localStorage helpers ────────────────────────────────────
function loadState(): GameState {
  let teensBible: any = {};
  try {
    const raw = localStorage.getItem("teensBible");
    if (raw) teensBible = JSON.parse(raw);
  } catch {}

  return {
    playerName: localStorage.getItem("playerName") || "",
    className: localStorage.getItem("className") || "",
    totalXP: parseInt(localStorage.getItem("totalXP") || "0"),
    gems: teensBible.gems || 0,
    ownedPets: JSON.parse(localStorage.getItem("ownedPets") || '["Faithy Cat"]'),
    equippedPet: localStorage.getItem("equippedPet") || "Faithy Cat",
    ownedThemes: JSON.parse(localStorage.getItem("ownedThemes") || '["Twilight Glow"]'),
    equippedTheme: localStorage.getItem("equippedTheme") || "Twilight Glow",
    ownedFrames: JSON.parse(localStorage.getItem("ownedFrames") || '["Basic"]'),
    equippedFrame: localStorage.getItem("equippedFrame") || "Basic",
    badges: JSON.parse(localStorage.getItem("badges") || '["First Step"]'),
    watchedVideos: JSON.parse(localStorage.getItem("watchedVideos") || '[]'),
    settingsOpen: false,
    editNameOpen: false,
    notificationsOpen: false,
  };
}

function saveGems(gems: number) {
  let teensBible: any = {};
  try {
    const raw = localStorage.getItem("teensBible");
    if (raw) teensBible = JSON.parse(raw);
  } catch {}
  teensBible.gems = gems;
  localStorage.setItem("teensBible", JSON.stringify(teensBible));
}

// ─── Level calculation ───────────────────────────────────────
const LEVELS = [
  { name: "Newbie", level: 1, min: 0, next: 100 },
  { name: "Beginner", level: 2, min: 100, next: 500 },
  { name: "Reader", level: 3, min: 500, next: 1000 },
  { name: "Explorer", level: 5, min: 1000, next: 2000 },
  { name: "Scholar", level: 6, min: 2000, next: 3000 },
  { name: "Champion", level: 8, min: 3000, next: 5000 },
  { name: "Master", level: 10, min: 5000, next: 999999 },
];

function calcLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return { ...LEVELS[i], prev: LEVELS[i].min };
  }
  return { ...LEVELS[0], prev: 0 };
}

// ─── Provider ────────────────────────────────────────────────
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadState);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP = prev.totalXP + amount;
      localStorage.setItem("totalXP", String(newXP));
      const oldLevel = calcLevel(prev.totalXP);
      const newLevel = calcLevel(newXP);
      if (newLevel.level > oldLevel.level) {
        toast.success(`🎉 Level Up! Lv.${newLevel.level} ${newLevel.name}`);
      }
      dispatchSyncEvent();
      return { ...prev, totalXP: newXP };
    });
  }, []);

  const addGems = useCallback((amount: number) => {
    setState(prev => {
      const newGems = prev.gems + amount;
      saveGems(newGems);
      dispatchSyncEvent();
      return { ...prev, gems: newGems };
    });
  }, []);

  const spendGems = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.gems < amount) {
        toast.error("💎 Not enough gems!");
        return prev;
      }
      const newGems = prev.gems - amount;
      saveGems(newGems);
      success = true;
      return { ...prev, gems: newGems };
    });
    return success;
  }, []);

  const setPlayerNameFn = useCallback((name: string) => {
    localStorage.setItem("playerName", name);
    setState(prev => ({ ...prev, playerName: name }));
    toast.success("Name updated!");
  }, []);

  const setClassNameFn = useCallback((name: string) => {
    localStorage.setItem("className", name);
    setState(prev => ({ ...prev, className: name }));
  }, []);

  const buyItem = useCallback((type: "pet" | "theme" | "frame", id: string, price: number): boolean => {
    let success = false;
    setState(prev => {
      const ownedKey = type === "pet" ? "ownedPets" : type === "theme" ? "ownedThemes" : "ownedFrames";
      const owned = prev[ownedKey] as string[];
      if (owned.includes(id)) {
        toast.info("You already own this item!");
        return prev;
      }
      if (prev.gems < price) {
        toast.error("💎 Not enough gems!");
        return prev;
      }
      const newGems = prev.gems - price;
      const newOwned = [...owned, id];
      saveGems(newGems);
      localStorage.setItem(ownedKey, JSON.stringify(newOwned));
      success = true;
      toast.success(`🎉 ${id} purchased!`);
      return { ...prev, gems: newGems, [ownedKey]: newOwned };
    });
    return success;
  }, []);

  const equipItem = useCallback((type: "pet" | "theme" | "frame", id: string) => {
    const equippedKey = type === "pet" ? "equippedPet" : type === "theme" ? "equippedTheme" : "equippedFrame";
    localStorage.setItem(equippedKey, id);
    setState(prev => ({ ...prev, [equippedKey]: id }));
    toast.success(`✨ ${id} equipped!`);
  }, []);

  const getChaptersRead = useCallback((book: string): number[] => {
    try {
      const raw = localStorage.getItem(`chaptersRead_${book}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, []);

  const markChapterRead = useCallback((book: string, chapterNum: number) => {
    const read = getChaptersRead(book);
    if (!read.includes(chapterNum)) {
      read.push(chapterNum);
      localStorage.setItem(`chaptersRead_${book}`, JSON.stringify(read));
      dispatchSyncEvent();

      // Add XP and Gems for reading
      addXP(10);
      addGems(5);

      // Feed pet when reading a chapter
      const equipped = getEquipped();
      if (equipped.pet) {
        feedPet();
        const pet = PETS.find(p => p.id === equipped.pet);
        if (pet) {
          toast.success(`${pet.petEmoji} ${pet.name} is happy! Fed successfully!`);
        }
      }

      // Check badges
      setState(prev => {
        const totalRead = getTotalChaptersReadInternal();
        const newBadges = [...prev.badges];
        if (totalRead >= 1 && !newBadges.includes("First Step")) {
          newBadges.push("First Step");
          localStorage.setItem("badges", JSON.stringify(newBadges));
          toast.success("🏆 Achievement unlocked: First Step!");
        }
        if (totalRead >= 100 && !newBadges.includes("100 Chapters")) {
          newBadges.push("100 Chapters");
          localStorage.setItem("badges", JSON.stringify(newBadges));
          toast.success("🏆 Achievement unlocked: 100 Chapters!");
        }
        if (totalRead >= 500 && !newBadges.includes("500 Chapters")) {
          newBadges.push("500 Chapters");
          localStorage.setItem("badges", JSON.stringify(newBadges));
          toast.success("🏆 Achievement unlocked: 500 Chapters!");
        }
        return { ...prev, badges: newBadges };
      });
    }
  }, []);

  function getTotalChaptersReadInternal(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("chaptersRead_")) {
        try { const arr = JSON.parse(localStorage.getItem(key) || "[]"); total += arr.length; } catch {}
      }
    }
    return total;
  }

  const getTotalChaptersRead = useCallback(getTotalChaptersReadInternal, []);

  const getLevel = useCallback(() => calcLevel(state.totalXP), [state.totalXP]);

  const openSettings = useCallback(() => setState(prev => ({ ...prev, settingsOpen: true })), []);
  const closeSettings = useCallback(() => setState(prev => ({ ...prev, settingsOpen: false })), []);
  const openEditName = useCallback(() => setState(prev => ({ ...prev, editNameOpen: true })), []);
  const closeEditName = useCallback(() => setState(prev => ({ ...prev, editNameOpen: false })), []);
  const openNotifications = useCallback(() => setState(prev => ({ ...prev, notificationsOpen: true })), []);
  const closeNotifications = useCallback(() => setState(prev => ({ ...prev, notificationsOpen: false })), []);

  const markVideoWatched = useCallback((book: string) => {
    setState(prev => {
      if (prev.watchedVideos.includes(book)) return prev;
      const newWatched = [...prev.watchedVideos, book];
      localStorage.setItem("watchedVideos", JSON.stringify(newWatched));
      addXP(15);
      addGems(5);
      toast.success(`🎬 Video watched! +15 XP, +5 💎`);
      dispatchSyncEvent();
      return { ...prev, watchedVideos: newWatched };
    });
  }, []);

  const getWatchedVideos = useCallback((): string[] => {
    try {
      return JSON.parse(localStorage.getItem("watchedVideos") || '[]');
    } catch { return []; }
  }, []);

  const refreshState = useCallback(() => {
    setState(loadState());
  }, []);

  const value: GameContextType = {
    ...state,
    addXP,
    addGems,
    spendGems,
    setPlayerName: setPlayerNameFn,
    setClassName: setClassNameFn,
    buyItem,
    equipItem,
    getChaptersRead,
    markChapterRead,
    getTotalChaptersRead,
    markVideoWatched,
    getWatchedVideos,
    getLevel,
    openSettings,
    closeSettings,
    openEditName,
    closeEditName,
    openNotifications,
    closeNotifications,
    refreshState,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
