import { safeParseJSON } from "@/lib/safeStorage";
// storeItems - inventory helpers (already migrated to safeStorage earlier)
// This file had remaining direct JSON.parse spots - fixed below

export type ItemCategory = "readerBg" | "frames" | "pets";
export type Rarity = "common" | "rare" | "epic" | "legendary";

export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bgColor: string; borderColor: string; glow: string }> = {
  common: { label: "Common", color: "text-gray-300", bgColor: "bg-gray-700/60", borderColor: "border-gray-500/40", glow: "" },
  rare: { label: "Rare", color: "text-blue-400", bgColor: "bg-blue-900/60", borderColor: "border-blue-500/40", glow: "shadow-[0_0_8px_rgba(59,130,246,0.3)]" },
  epic: { label: "Epic", color: "text-purple-400", bgColor: "bg-purple-900/60", borderColor: "border-purple-500/40", glow: "shadow-[0_0_12px_rgba(168,85,247,0.4)]" },
  legendary: { label: "Legendary", color: "text-yellow-400", bgColor: "bg-yellow-900/60", borderColor: "border-yellow-500/40", glow: "shadow-[0_0_16px_rgba(234,179,8,0.5)]" },
};

export interface StoreItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  emoji: string;
  description: string;
  rarity: Rarity;
  // Reader background specific
  readerStyle?: { bg: string; text: string; label: string };
  // Frame specific
  frameClass?: string;
  // Pet specific
  petEmoji?: string;
}

// ============ READER BACKGROUNDS ============
export const READER_BACKGROUNDS: StoreItem[] = [
  {
    id: "reader_dark",
    name: "Dark Mode",
    category: "readerBg",
    price: 0,
    emoji: "🌑",
    description: "Default dark reading mode",
    rarity: "common",
    readerStyle: { bg: "#0a0a1a", text: "#e2e8f0", label: "Dark" },
  },
  {
    id: "reader_parchment",
    name: "Parchment",
    category: "readerBg",
    price: 130,
    emoji: "📜",
    description: "Classic parchment feel",
    rarity: "common",
    readerStyle: { bg: "#f5e6c8", text: "#3d2b1f", label: "Parchment" },
  },
  {
    id: "reader_nightsky",
    name: "Night Sky",
    category: "readerBg",
    price: 140,
    emoji: "✨",
    description: "Deep navy with stars",
    rarity: "rare",
    readerStyle: { bg: "#0f172a", text: "#cbd5e1", label: "Night Sky" },
  },
  {
    id: "reader_cream",
    name: "Warm Cream",
    category: "readerBg",
    price: 130,
    emoji: "☀️",
    description: "Easy on the eyes",
    rarity: "common",
    readerStyle: { bg: "#fffbeb", text: "#451a03", label: "Cream" },
  },
  {
    id: "reader_mint",
    name: "Mint Fresh",
    category: "readerBg",
    price: 140,
    emoji: "🍃",
    description: "Fresh mint background",
    rarity: "rare",
    readerStyle: { bg: "#ecfdf5", text: "#064e3b", label: "Mint" },
  },
  {
    id: "reader_lavender",
    name: "Lavender Mist",
    category: "readerBg",
    price: 140,
    emoji: "💜",
    description: "Gentle purple haze",
    rarity: "rare",
    readerStyle: { bg: "#f5f3ff", text: "#3b0764", label: "Lavender" },
  },
  {
    id: "reader_ocean",
    name: "Ocean Depth",
    category: "readerBg",
    price: 160,
    emoji: "🌊",
    description: "Deep sea reading",
    rarity: "epic",
    readerStyle: { bg: "#0c1929", text: "#7dd3fc", label: "Ocean" },
  },
  {
    id: "reader_rose",
    name: "Rose Blush",
    category: "readerBg",
    price: 140,
    emoji: "🌹",
    description: "Soft pink warmth",
    rarity: "rare",
    readerStyle: { bg: "#fff1f2", text: "#4c0519", label: "Rose" },
  },
  {
    id: "reader_forest",
    name: "Forest Floor",
    category: "readerBg",
    price: 160,
    emoji: "🌲",
    description: "Deep woodland green",
    rarity: "epic",
    readerStyle: { bg: "#052e16", text: "#86efac", label: "Forest" },
  },
  {
    id: "reader_sand",
    name: "Desert Sand",
    category: "readerBg",
    price: 130,
    emoji: "🏜️",
    description: "Warm sandy tones",
    rarity: "common",
    readerStyle: { bg: "#fef3c7", text: "#78350f", label: "Sand" },
  },
  {
    id: "reader_slate",
    name: "Slate Gray",
    category: "readerBg",
    price: 150,
    emoji: "🪨",
    description: "Neutral and focused",
    rarity: "rare",
    readerStyle: { bg: "#1e293b", text: "#cbd5e1", label: "Slate" },
  },
  {
    id: "reader_peach",
    name: "Peach Glow",
    category: "readerBg",
    price: 150,
    emoji: "🍑",
    description: "Warm peachy comfort",
    rarity: "rare",
    readerStyle: { bg: "#fff7ed", text: "#7c2d12", label: "Peach" },
  },
  {
    id: "reader_midnight",
    name: "Midnight Blue",
    category: "readerBg",
    price: 170,
    emoji: "🌃",
    description: "Deep midnight reading",
    rarity: "epic",
    readerStyle: { bg: "#0f0f2e", text: "#a5b4fc", label: "Midnight" },
  },
];

// ============ PROFILE FRAMES ============
export const PROFILE_FRAMES: StoreItem[] = [
  {
    id: "frame_none",
    name: "No Frame",
    category: "frames",
    price: 0,
    emoji: "⭕",
    description: "Default - no frame",
    rarity: "common",
    frameClass: "border-2 border-purple-500/30",
  },
  {
    id: "frame_gold",
    name: "Gold Crown",
    category: "frames",
    price: 70,
    emoji: "👑",
    description: "Royal gold border",
    rarity: "common",
    frameClass: "border-[4px] border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6),0_0_40px_rgba(250,204,21,0.25),inset_0_0_10px_rgba(250,204,21,0.15)] ring-2 ring-yellow-300/30",
  },
  {
    id: "frame_fire",
    name: "Fire Ring",
    category: "frames",
    price: 75,
    emoji: "🔥",
    description: "Blazing fire effect",
    rarity: "rare",
    frameClass: "border-[4px] border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6),0_0_40px_rgba(239,68,68,0.3),inset_0_0_10px_rgba(249,115,22,0.15)] ring-2 ring-red-500/30",
  },
  {
    id: "frame_rainbow",
    name: "Rainbow Glow",
    category: "frames",
    price: 85,
    emoji: "🌈",
    description: "Colorful rainbow aura",
    rarity: "rare",
    frameClass: "border-[4px] border-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.5),0_0_35px_rgba(168,85,247,0.35),0_0_50px_rgba(59,130,246,0.2)] ring-2 ring-purple-400/40",
  },
  {
    id: "frame_diamond",
    name: "Diamond Border",
    category: "frames",
    price: 90,
    emoji: "💎",
    description: "Sparkling diamond edge",
    rarity: "epic",
    frameClass: "border-[4px] border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.6),0_0_50px_rgba(34,211,238,0.25),inset_0_0_12px_rgba(34,211,238,0.15)] ring-2 ring-cyan-200/40",
  },
  {
    id: "frame_angel",
    name: "Angel Wings",
    category: "frames",
    price: 90,
    emoji: "😇",
    description: "Heavenly angel frame",
    rarity: "epic",
    frameClass: "border-[4px] border-white/80 shadow-[0_0_25px_rgba(255,255,255,0.5),0_0_50px_rgba(255,255,255,0.2),inset_0_0_12px_rgba(255,255,255,0.15)] ring-2 ring-white/30",
  },
  {
    id: "frame_emerald",
    name: "Emerald Shine",
    category: "frames",
    price: 65,
    emoji: "💚",
    description: "Rich emerald border",
    rarity: "common",
    frameClass: "border-[4px] border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6),0_0_40px_rgba(16,185,129,0.25)] ring-2 ring-emerald-300/30",
  },
  {
    id: "frame_lightning",
    name: "Lightning Bolt",
    category: "frames",
    price: 75,
    emoji: "⚡",
    description: "Electric energy frame",
    rarity: "rare",
    frameClass: "border-[4px] border-yellow-300 shadow-[0_0_22px_rgba(253,224,71,0.7),0_0_45px_rgba(234,179,8,0.3)] ring-2 ring-yellow-200/40",
  },
  {
    id: "frame_ocean",
    name: "Ocean Wave",
    category: "frames",
    price: 65,
    emoji: "🌊",
    description: "Deep blue sea border",
    rarity: "common",
    frameClass: "border-[4px] border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.6),0_0_40px_rgba(59,130,246,0.25)] ring-2 ring-blue-300/30",
  },
  {
    id: "frame_sunset",
    name: "Sunset Blaze",
    category: "frames",
    price: 75,
    emoji: "🌅",
    description: "Warm sunset glow",
    rarity: "rare",
    frameClass: "border-[4px] border-orange-400 shadow-[0_0_22px_rgba(251,146,60,0.6),0_0_45px_rgba(245,158,11,0.25)] ring-2 ring-amber-300/30",
  },
  {
    id: "frame_galaxy",
    name: "Galaxy Swirl",
    category: "frames",
    price: 95,
    emoji: "🌌",
    description: "Cosmic galaxy border",
    rarity: "epic",
    frameClass: "border-[4px] border-indigo-400 shadow-[0_0_25px_rgba(129,140,248,0.5),0_0_50px_rgba(168,85,247,0.35),0_0_70px_rgba(99,102,241,0.15)] ring-2 ring-purple-400/40",
  },
  {
    id: "frame_cherry",
    name: "Cherry Blossom",
    category: "frames",
    price: 70,
    emoji: "🌸",
    description: "Delicate pink petals",
    rarity: "common",
    frameClass: "border-[4px] border-pink-300 shadow-[0_0_20px_rgba(249,168,212,0.6),0_0_40px_rgba(236,72,153,0.25)] ring-2 ring-pink-200/30",
  },
  {
    id: "frame_neon",
    name: "Neon Pulse",
    category: "frames",
    price: 80,
    emoji: "💫",
    description: "Vibrant neon glow",
    rarity: "rare",
    frameClass: "border-[4px] border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.6),0_0_50px_rgba(34,197,94,0.35),0_0_70px_rgba(22,163,74,0.15)] ring-2 ring-green-300/40",
  },
  {
    id: "frame_ice",
    name: "Frozen Crystal",
    category: "frames",
    price: 75,
    emoji: "❄️",
    description: "Icy crystal border",
    rarity: "rare",
    frameClass: "border-[4px] border-sky-200 shadow-[0_0_22px_rgba(186,230,253,0.7),0_0_45px_rgba(125,211,252,0.3)] ring-2 ring-sky-100/40",
  },
];

// ============ PETS ============
export const PETS: StoreItem[] = [
  {
    id: "pet_cat",
    name: "Coco Pet",
    category: "pets",
    price: 120,
    emoji: "🐱",
    description: "Seonguk's real-life cat",
    rarity: "rare",
    petEmoji: "🐱",
  },
  {
    id: "pet_puppy",
    name: "Hope Puppy",
    category: "pets",
    price: 120,
    emoji: "🐶",
    description: "Always hopeful and loyal",
    rarity: "rare",
    petEmoji: "🐶",
  },
  {
    id: "pet_lamb",
    name: "Joy Lamb",
    category: "pets",
    price: 150,
    emoji: "🐑",
    description: "Gentle and joyful",
    rarity: "rare",
    petEmoji: "🐑",
  },
  {
    id: "pet_lion",
    name: "Brave Lion",
    category: "pets",
    price: 180,
    emoji: "🦁",
    description: "Courageous like Daniel",
    rarity: "epic",
    petEmoji: "🦁",
  },
  {
    id: "pet_owl",
    name: "Wise Owl",
    category: "pets",
    price: 170,
    emoji: "🦉",
    description: "Wisdom of Solomon",
    rarity: "epic",
    petEmoji: "🦉",
  },
  {
    id: "pet_dove",
    name: "Peace Dove",
    category: "pets",
    price: 190,
    emoji: "🕊️",
    description: "Symbol of the Holy Spirit",
    rarity: "epic",
    petEmoji: "🕊️",
  },
  {
    id: "pet_eagle",
    name: "Soaring Eagle",
    category: "pets",
    price: 180,
    emoji: "🦅",
    description: "Mount up with wings (Isaiah 40:31)",
    rarity: "epic",
    petEmoji: "🦅",
  },
  {
    id: "pet_fox",
    name: "Swift Fox",
    category: "pets",
    price: 160,
    emoji: "🦊",
    description: "Clever and quick",
    rarity: "rare",
    petEmoji: "🦊",
  },
  {
    id: "pet_bear",
    name: "Mighty Bear",
    category: "pets",
    price: 180,
    emoji: "🐻",
    description: "Strong like Samson",
    rarity: "epic",
    petEmoji: "🐻",
  },
  {
    id: "pet_bunny",
    name: "Gentle Bunny",
    category: "pets",
    price: 150,
    emoji: "🐰",
    description: "Meek and gentle spirit",
    rarity: "rare",
    petEmoji: "🐰",
  },
  {
    id: "pet_whale",
    name: "Jonah's Whale",
    category: "pets",
    price: 200,
    emoji: "🐳",
    description: "A big adventure awaits",
    rarity: "legendary",
    petEmoji: "🐳",
  },
  {
    id: "pet_butterfly",
    name: "New Life Butterfly",
    category: "pets",
    price: 160,
    emoji: "🦋",
    description: "Transformed and beautiful",
    rarity: "rare",
    petEmoji: "🦋",
  },
  {
    id: "pet_dragon",
    name: "Fire Dragon",
    category: "pets",
    price: 220,
    emoji: "🐉",
    description: "Legendary and fierce",
    rarity: "legendary",
    petEmoji: "🐉",
  },
  {
    id: "pet_unicorn",
    name: "Holy Unicorn",
    category: "pets",
    price: 210,
    emoji: "🦄",
    description: "Pure and majestic",
    rarity: "legendary",
    petEmoji: "🦄",
  },
];

// ============ INVENTORY SYSTEM ============
const INVENTORY_KEY = "teensBibleInventory";
const EQUIPPED_KEY = "teensBibleEquipped";

export interface Inventory {
  ownedItems: string[]; // item IDs
}

export interface Equipped {
  readerBg: string;
  frame: string;
  pet: string | null;
}

const DEFAULT_EQUIPPED: Equipped = {
  readerBg: "reader_dark",
  frame: "frame_none",
  pet: null,
};

export function getInventory(): Inventory {
  return safeParseJSON<Inventory>(INVENTORY_KEY, { ownedItems: ["reader_dark", "frame_none"] });
}

export function saveInventory(inv: Inventory) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
}

export function getEquipped(): Equipped {
  return safeParseJSON<Equipped>(EQUIPPED_KEY, DEFAULT_EQUIPPED);
}

export function saveEquipped(eq: Equipped) {
  localStorage.setItem(EQUIPPED_KEY, JSON.stringify(eq));
  // Dispatch custom event so other components can react
  window.dispatchEvent(new CustomEvent("equipped-changed", { detail: eq }));
}

export function ownsItem(itemId: string): boolean {
  return getInventory().ownedItems.includes(itemId);
}

export function purchaseItem(itemId: string, price: number): { success: boolean; message: string } {
  // Check gems
  const gems = getGems();
  if (gems < price) {
    return { success: false, message: "Not enough gems!" };
  }

  // Check already owned
  if (ownsItem(itemId)) {
    return { success: false, message: "Already owned!" };
  }

  // Deduct gems
  setGems(gems - price);

  // Add to inventory
  const inv = getInventory();
  inv.ownedItems.push(itemId);
  saveInventory(inv);

  return { success: true, message: "Purchase successful!" };
}

export function equipItem(itemId: string, category: ItemCategory) {
  const eq = getEquipped();
  switch (category) {
    case "readerBg":
      eq.readerBg = itemId;
      break;
    case "frames":
      eq.frame = itemId;
      break;
    case "pets":
      eq.pet = itemId;
      break;
  }
  saveEquipped(eq);
}

export function unequipPet() {
  const eq = getEquipped();
  eq.pet = null;
  saveEquipped(eq);
}

// Gems helpers
function getGems(): number {
  const data = safeParseJSON<any>("teensBible", {});
  return data.gems || 0;
}

function setGems(amount: number) {
  try {
    const data = safeParseJSON<any>("teensBible", {});
    data.gems = amount;
    localStorage.setItem("teensBible", JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("gems-changed", { detail: amount }));
  } catch {}
}

// ============ PET MOOD SYSTEM ============
const PET_STATE_KEY = "teensBiblePetState";

export type PetMood = "happy" | "hungry" | "sad";

export interface PetState {
  lastFedDate: string; // ISO date string (YYYY-MM-DD)
  mood: PetMood;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - then.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getPetState(): PetState {
  const fallback: PetState = { lastFedDate: "2000-01-01", mood: "sad" };
  const state = safeParseJSON<PetState>(PET_STATE_KEY, fallback);
  // If fallback returned (no stored), return it
  if (state.lastFedDate === "2000-01-01" && state.mood === "sad") {
    // could be real stored sad state, still recalc days
  }
  try {
    const days = daysSince(state.lastFedDate);
    if (days === 0) state.mood = "happy";
    else if (days === 1) state.mood = "hungry";
    else state.mood = "sad";
  } catch {}
  return state;
}

export function savePetState(state: PetState) {
  localStorage.setItem(PET_STATE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("pet-state-changed", { detail: state }));
}

export function feedPet() {
  const state = getPetState();
  state.lastFedDate = getToday();
  state.mood = "happy";
  savePetState(state);
}

export function getPetMoodEmoji(mood: PetMood): string {
  switch (mood) {
    case "happy": return "😊";
    case "hungry": return "😐";
    case "sad": return "😢";
  }
}

export function getPetMoodMessage(mood: PetMood, petName: string): string {
  switch (mood) {
    case "happy": return `${petName} is happy! 🎉`;
    case "hungry": return `${petName} is hungry! Read a chapter to feed me! 📖`;
    case "sad": return `${petName} misses you... Come back and read! 💤`;
  }
}
