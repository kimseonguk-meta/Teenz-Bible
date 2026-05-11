import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────
export interface GameState {
  playerName: string;
  className: string;
  totalXP: number;
  gems: number;
  dayStreak: number;
  lastLoginDate: string;
  loginDay: number;
  loginRewardClaimed: boolean;
  dailyMissionDone: boolean;
  ownedPets: string[];
  equippedPet: string;
  ownedThemes: string[];
  equippedTheme: string;
  ownedFrames: string[];
  equippedFrame: string;
  badges: string[];
  settingsOpen: boolean;
  editNameOpen: boolean;
  notificationsOpen: boolean;
}

interface GameContextType extends GameState {
  // Actions
  addXP: (amount: number) => void;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  claimLoginReward: () => void;
  completeDailyMission: () => void;
  incrementStreak: () => void;
  setPlayerName: (name: string) => void;
  setClassName: (name: string) => void;
  buyItem: (type: "pet" | "theme" | "frame", id: string, price: number) => boolean;
  equipItem: (type: "pet" | "theme" | "frame", id: string) => void;
  getChaptersRead: (book: string) => number[];
  markChapterRead: (book: string, chapterNum: number) => void;
  getTotalChaptersRead: () => number;
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
  const today = new Date().toISOString().split("T")[0];
  let teensBible: any = {};
  try {
    const raw = localStorage.getItem("teensBible");
    if (raw) teensBible = JSON.parse(raw);
  } catch {}

  const lastLogin = localStorage.getItem("lastLoginDate") || "";
  const isNewDay = lastLogin !== today;

  return {
    playerName: localStorage.getItem("playerName") || "다니엘",
    className: localStorage.getItem("className") || "중등1반",
    totalXP: parseInt(localStorage.getItem("totalXP") || "0"),
    gems: teensBible.gems || 0,
    dayStreak: parseInt(localStorage.getItem("dayStreak") || "0"),
    lastLoginDate: lastLogin,
    loginDay: parseInt(localStorage.getItem("loginDay") || "1"),
    loginRewardClaimed: isNewDay ? false : localStorage.getItem("loginRewardClaimed") === "true",
    dailyMissionDone: isNewDay ? false : localStorage.getItem("dailyMissionDone") === "true",
    ownedPets: JSON.parse(localStorage.getItem("ownedPets") || '["Faithy Cat"]'),
    equippedPet: localStorage.getItem("equippedPet") || "Faithy Cat",
    ownedThemes: JSON.parse(localStorage.getItem("ownedThemes") || '["Twilight Glow"]'),
    equippedTheme: localStorage.getItem("equippedTheme") || "Twilight Glow",
    ownedFrames: JSON.parse(localStorage.getItem("ownedFrames") || '["Basic"]'),
    equippedFrame: localStorage.getItem("equippedFrame") || "Basic",
    badges: JSON.parse(localStorage.getItem("badges") || '["첫 시작"]'),
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

// ─── Login reward amounts ────────────────────────────────────
const LOGIN_REWARDS = [3, 3, 5, 5, 8, 10, 20];

// ─── Provider ────────────────────────────────────────────────
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadState);

  // Check for new day on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (state.lastLoginDate && state.lastLoginDate !== today) {
      // New day - check streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      setState(prev => {
        const streakContinues = prev.lastLoginDate === yesterdayStr;
        const newStreak = streakContinues ? prev.dayStreak : 0;
        const newLoginDay = streakContinues ? Math.min(prev.loginDay + 1, 7) : 1;

        localStorage.setItem("dayStreak", String(newStreak));
        localStorage.setItem("loginDay", String(newLoginDay));
        localStorage.setItem("lastLoginDate", today);
        localStorage.setItem("loginRewardClaimed", "false");
        localStorage.setItem("dailyMissionDone", "false");

        return {
          ...prev,
          dayStreak: newStreak,
          loginDay: newLoginDay,
          lastLoginDate: today,
          loginRewardClaimed: false,
          dailyMissionDone: false,
        };
      });
    } else if (!state.lastLoginDate) {
      localStorage.setItem("lastLoginDate", today);
      setState(prev => ({ ...prev, lastLoginDate: today }));
    }
  }, []);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP = prev.totalXP + amount;
      localStorage.setItem("totalXP", String(newXP));
      const oldLevel = calcLevel(prev.totalXP);
      const newLevel = calcLevel(newXP);
      if (newLevel.level > oldLevel.level) {
        toast.success(`🎉 Level Up! Lv.${newLevel.level} ${newLevel.name}`);
      }
      return { ...prev, totalXP: newXP };
    });
  }, []);

  const addGems = useCallback((amount: number) => {
    setState(prev => {
      const newGems = prev.gems + amount;
      saveGems(newGems);
      return { ...prev, gems: newGems };
    });
  }, []);

  const spendGems = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.gems < amount) {
        toast.error("💎 젬이 부족합니다!");
        return prev;
      }
      const newGems = prev.gems - amount;
      saveGems(newGems);
      success = true;
      return { ...prev, gems: newGems };
    });
    return success;
  }, []);

  const claimLoginReward = useCallback(() => {
    setState(prev => {
      if (prev.loginRewardClaimed) {
        toast.info("오늘의 보상은 이미 받았습니다!");
        return prev;
      }
      const rewardIdx = Math.min(prev.loginDay - 1, LOGIN_REWARDS.length - 1);
      const reward = LOGIN_REWARDS[rewardIdx];
      const newGems = prev.gems + reward;
      saveGems(newGems);

      const today = new Date().toISOString().split("T")[0];
      const newStreak = prev.dayStreak + 1;
      localStorage.setItem("dayStreak", String(newStreak));
      localStorage.setItem("lastLoginDate", today);
      localStorage.setItem("loginRewardClaimed", "true");

      toast.success(`🎁 +${reward} 젬 획득! (Day ${prev.loginDay})`);
      return {
        ...prev,
        gems: newGems,
        dayStreak: newStreak,
        lastLoginDate: today,
        loginRewardClaimed: true,
      };
    });
  }, []);

  const completeDailyMission = useCallback(() => {
    setState(prev => {
      if (prev.dailyMissionDone) return prev;
      const newXP = prev.totalXP + 50;
      localStorage.setItem("totalXP", String(newXP));
      localStorage.setItem("dailyMissionDone", "true");
      toast.success("🎯 데일리 미션 완료! +50 XP");
      return { ...prev, totalXP: newXP, dailyMissionDone: true };
    });
  }, []);

  const incrementStreak = useCallback(() => {
    setState(prev => {
      const newStreak = prev.dayStreak + 1;
      localStorage.setItem("dayStreak", String(newStreak));
      return { ...prev, dayStreak: newStreak };
    });
  }, []);

  const setPlayerNameFn = useCallback((name: string) => {
    localStorage.setItem("playerName", name);
    setState(prev => ({ ...prev, playerName: name }));
    toast.success("이름이 변경되었습니다!");
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
        toast.info("이미 보유한 아이템입니다!");
        return prev;
      }
      if (prev.gems < price) {
        toast.error("💎 젬이 부족합니다!");
        return prev;
      }
      const newGems = prev.gems - price;
      const newOwned = [...owned, id];
      saveGems(newGems);
      localStorage.setItem(ownedKey, JSON.stringify(newOwned));
      success = true;
      toast.success(`🎉 ${id} 구매 완료!`);
      return { ...prev, gems: newGems, [ownedKey]: newOwned };
    });
    return success;
  }, []);

  const equipItem = useCallback((type: "pet" | "theme" | "frame", id: string) => {
    const equippedKey = type === "pet" ? "equippedPet" : type === "theme" ? "equippedTheme" : "equippedFrame";
    localStorage.setItem(equippedKey, id);
    setState(prev => ({ ...prev, [equippedKey]: id }));
    toast.success(`✨ ${id} 장착 완료!`);
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

      // Add XP for reading
      addXP(10);

      // Check daily mission
      setState(prev => {
        if (!prev.dailyMissionDone) {
          const newXP = prev.totalXP + 50;
          localStorage.setItem("totalXP", String(newXP));
          localStorage.setItem("dailyMissionDone", "true");
          toast.success("🎯 데일리 미션 완료! +50 XP");

          // Check badge
          const totalRead = getTotalChaptersReadInternal();
          const newBadges = [...prev.badges];
          if (totalRead >= 1 && !newBadges.includes("첫 시작")) {
            newBadges.push("첫 시작");
            localStorage.setItem("badges", JSON.stringify(newBadges));
            toast.success("🏆 업적 달성: 첫 시작!");
          }
          if (totalRead >= 100 && !newBadges.includes("백 장 독파")) {
            newBadges.push("백 장 독파");
            localStorage.setItem("badges", JSON.stringify(newBadges));
            toast.success("🏆 업적 달성: 백 장 독파!");
          }

          return { ...prev, totalXP: newXP, dailyMissionDone: true, badges: newBadges };
        }
        return prev;
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

  const refreshState = useCallback(() => {
    setState(loadState());
  }, []);

  const value: GameContextType = {
    ...state,
    addXP,
    addGems,
    spendGems,
    claimLoginReward,
    completeDailyMission,
    incrementStreak,
    setPlayerName: setPlayerNameFn,
    setClassName: setClassNameFn,
    buyItem,
    equipItem,
    getChaptersRead,
    markChapterRead,
    getTotalChaptersRead,
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
