// ============================================================
// STORE ITEMS DATA & INVENTORY SYSTEM
// ============================================================

export type ItemCategory = "themes" | "readerBg" | "frames" | "pets" | "mystery";

export interface StoreItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  emoji: string;
  description: string;
  // Theme-specific
  cssVars?: Record<string, string>;
  // Reader background specific
  readerStyle?: { bg: string; text: string; label: string };
  // Frame specific
  frameClass?: string;
  // Pet specific
  petEmoji?: string;
}

// ============ THEMES ============
// Each theme defines full OKLCH CSS variables that override :root
export const THEMES: StoreItem[] = [
  {
    id: "theme_twilight",
    name: "Twilight Purple",
    category: "themes",
    price: 0,
    emoji: "🌙",
    description: "Default dark purple theme",
    cssVars: {
      "--primary": "oklch(0.55 0.25 285)",
      "--accent": "oklch(0.55 0.25 285)",
      "--ring": "oklch(0.6 0.25 285)",
      "--border": "oklch(0.3 0.08 285)",
      "--input": "oklch(0.18 0.05 285)",
      "--card": "oklch(0.13 0.04 285)",
      "--secondary": "oklch(0.18 0.04 285)",
      "--muted": "oklch(0.2 0.03 285)",
      "--neon-hue": "285",
      "--neon-rgb": "139, 92, 246",
    },
  },
  {
    id: "theme_ocean",
    name: "Ocean Blue",
    category: "themes",
    price: 35,
    emoji: "🌊",
    description: "Calm ocean vibes",
    cssVars: {
      "--primary": "oklch(0.6 0.15 195)",
      "--accent": "oklch(0.6 0.15 195)",
      "--ring": "oklch(0.65 0.15 195)",
      "--border": "oklch(0.3 0.06 195)",
      "--input": "oklch(0.18 0.04 195)",
      "--card": "oklch(0.13 0.03 195)",
      "--secondary": "oklch(0.18 0.03 195)",
      "--muted": "oklch(0.2 0.02 195)",
      "--neon-hue": "195",
      "--neon-rgb": "6, 182, 212",
    },
  },
  {
    id: "theme_forest",
    name: "Forest Green",
    category: "themes",
    price: 35,
    emoji: "🌲",
    description: "Peaceful forest atmosphere",
    cssVars: {
      "--primary": "oklch(0.6 0.2 145)",
      "--accent": "oklch(0.6 0.2 145)",
      "--ring": "oklch(0.65 0.2 145)",
      "--border": "oklch(0.3 0.06 145)",
      "--input": "oklch(0.18 0.04 145)",
      "--card": "oklch(0.13 0.03 145)",
      "--secondary": "oklch(0.18 0.03 145)",
      "--muted": "oklch(0.2 0.02 145)",
      "--neon-hue": "145",
      "--neon-rgb": "34, 197, 94",
    },
  },
  {
    id: "theme_sunset",
    name: "Sunset Orange",
    category: "themes",
    price: 40,
    emoji: "🌅",
    description: "Warm sunset glow",
    cssVars: {
      "--primary": "oklch(0.65 0.2 45)",
      "--accent": "oklch(0.65 0.2 45)",
      "--ring": "oklch(0.7 0.2 45)",
      "--border": "oklch(0.3 0.06 45)",
      "--input": "oklch(0.18 0.04 45)",
      "--card": "oklch(0.13 0.03 45)",
      "--secondary": "oklch(0.18 0.03 45)",
      "--muted": "oklch(0.2 0.02 45)",
      "--neon-hue": "45",
      "--neon-rgb": "249, 115, 22",
    },
  },
  {
    id: "theme_galaxy",
    name: "Galaxy Pink",
    category: "themes",
    price: 50,
    emoji: "🌌",
    description: "Cosmic pink energy",
    cssVars: {
      "--primary": "oklch(0.6 0.22 330)",
      "--accent": "oklch(0.6 0.22 330)",
      "--ring": "oklch(0.65 0.22 330)",
      "--border": "oklch(0.3 0.07 330)",
      "--input": "oklch(0.18 0.04 330)",
      "--card": "oklch(0.13 0.03 330)",
      "--secondary": "oklch(0.18 0.03 330)",
      "--muted": "oklch(0.2 0.02 330)",
      "--neon-hue": "330",
      "--neon-rgb": "236, 72, 153",
    },
  },
  {
    id: "theme_crimson",
    name: "Crimson Red",
    category: "themes",
    price: 40,
    emoji: "❤️‍🔥",
    description: "Bold and passionate",
    cssVars: {
      "--primary": "oklch(0.55 0.22 25)",
      "--accent": "oklch(0.55 0.22 25)",
      "--ring": "oklch(0.6 0.22 25)",
      "--border": "oklch(0.3 0.07 25)",
      "--input": "oklch(0.16 0.04 25)",
      "--card": "oklch(0.12 0.03 25)",
      "--secondary": "oklch(0.16 0.03 25)",
      "--muted": "oklch(0.18 0.02 25)",
      "--neon-hue": "25",
      "--neon-rgb": "220, 38, 38",
    },
  },
  {
    id: "theme_arctic",
    name: "Arctic Ice",
    category: "themes",
    price: 45,
    emoji: "🧊",
    description: "Cool icy blue tones",
    cssVars: {
      "--primary": "oklch(0.7 0.12 220)",
      "--accent": "oklch(0.7 0.12 220)",
      "--ring": "oklch(0.75 0.12 220)",
      "--border": "oklch(0.3 0.05 220)",
      "--input": "oklch(0.16 0.03 220)",
      "--card": "oklch(0.12 0.02 220)",
      "--secondary": "oklch(0.16 0.02 220)",
      "--muted": "oklch(0.18 0.02 220)",
      "--neon-hue": "220",
      "--neon-rgb": "56, 189, 248",
    },
  },
  {
    id: "theme_lavender",
    name: "Lavender Dream",
    category: "themes",
    price: 40,
    emoji: "💜",
    description: "Soft lavender serenity",
    cssVars: {
      "--primary": "oklch(0.65 0.18 300)",
      "--accent": "oklch(0.65 0.18 300)",
      "--ring": "oklch(0.7 0.18 300)",
      "--border": "oklch(0.3 0.06 300)",
      "--input": "oklch(0.17 0.04 300)",
      "--card": "oklch(0.12 0.03 300)",
      "--secondary": "oklch(0.17 0.03 300)",
      "--muted": "oklch(0.19 0.02 300)",
      "--neon-hue": "300",
      "--neon-rgb": "192, 132, 252",
    },
  },
  {
    id: "theme_midnight",
    name: "Midnight Black",
    category: "themes",
    price: 55,
    emoji: "🖤",
    description: "Sleek and mysterious",
    cssVars: {
      "--primary": "oklch(0.5 0.02 260)",
      "--accent": "oklch(0.5 0.02 260)",
      "--ring": "oklch(0.55 0.02 260)",
      "--border": "oklch(0.25 0.01 260)",
      "--input": "oklch(0.12 0.01 260)",
      "--card": "oklch(0.08 0.005 260)",
      "--secondary": "oklch(0.12 0.005 260)",
      "--muted": "oklch(0.15 0.005 260)",
      "--neon-hue": "260",
      "--neon-rgb": "148, 163, 184",
    },
  },
  {
    id: "theme_gold",
    name: "Royal Gold",
    category: "themes",
    price: 60,
    emoji: "👑",
    description: "Fit for a king",
    cssVars: {
      "--primary": "oklch(0.7 0.16 85)",
      "--accent": "oklch(0.7 0.16 85)",
      "--ring": "oklch(0.75 0.16 85)",
      "--border": "oklch(0.35 0.06 85)",
      "--input": "oklch(0.18 0.04 85)",
      "--card": "oklch(0.13 0.03 85)",
      "--secondary": "oklch(0.18 0.03 85)",
      "--muted": "oklch(0.2 0.02 85)",
      "--neon-hue": "85",
      "--neon-rgb": "234, 179, 8",
    },
  },
  {
    id: "theme_rose",
    name: "Rose Garden",
    category: "themes",
    price: 45,
    emoji: "🌹",
    description: "Elegant rose tones",
    cssVars: {
      "--primary": "oklch(0.6 0.18 350)",
      "--accent": "oklch(0.6 0.18 350)",
      "--ring": "oklch(0.65 0.18 350)",
      "--border": "oklch(0.3 0.06 350)",
      "--input": "oklch(0.17 0.04 350)",
      "--card": "oklch(0.12 0.03 350)",
      "--secondary": "oklch(0.17 0.03 350)",
      "--muted": "oklch(0.19 0.02 350)",
      "--neon-hue": "350",
      "--neon-rgb": "244, 63, 94",
    },
  },
  {
    id: "theme_ember",
    name: "Ember Glow",
    category: "themes",
    price: 50,
    emoji: "🔥",
    description: "Warm burning embers",
    cssVars: {
      "--primary": "oklch(0.6 0.2 35)",
      "--accent": "oklch(0.6 0.2 35)",
      "--ring": "oklch(0.65 0.2 35)",
      "--border": "oklch(0.3 0.06 35)",
      "--input": "oklch(0.16 0.04 35)",
      "--card": "oklch(0.12 0.03 35)",
      "--secondary": "oklch(0.16 0.03 35)",
      "--muted": "oklch(0.18 0.02 35)",
      "--neon-hue": "35",
      "--neon-rgb": "251, 146, 60",
    },
  },
  {
    id: "theme_aurora",
    name: "Aurora Borealis",
    category: "themes",
    price: 65,
    emoji: "🌠",
    description: "Northern lights magic",
    cssVars: {
      "--primary": "oklch(0.65 0.2 165)",
      "--accent": "oklch(0.65 0.2 165)",
      "--ring": "oklch(0.7 0.2 165)",
      "--border": "oklch(0.3 0.06 165)",
      "--input": "oklch(0.16 0.04 165)",
      "--card": "oklch(0.12 0.03 165)",
      "--secondary": "oklch(0.16 0.03 165)",
      "--muted": "oklch(0.18 0.02 165)",
      "--neon-hue": "165",
      "--neon-rgb": "45, 212, 191",
    },
  },
];

// ============ READER BACKGROUNDS ============
export const READER_BACKGROUNDS: StoreItem[] = [
  {
    id: "reader_dark",
    name: "Dark Mode",
    category: "readerBg",
    price: 0,
    emoji: "🌑",
    description: "Default dark reading mode",
    readerStyle: { bg: "#0a0a1a", text: "#e2e8f0", label: "Dark" },
  },
  {
    id: "reader_parchment",
    name: "Parchment",
    category: "readerBg",
    price: 25,
    emoji: "📜",
    description: "Classic parchment feel",
    readerStyle: { bg: "#f5e6c8", text: "#3d2b1f", label: "Parchment" },
  },
  {
    id: "reader_nightsky",
    name: "Night Sky",
    category: "readerBg",
    price: 30,
    emoji: "✨",
    description: "Deep navy with stars",
    readerStyle: { bg: "#0f172a", text: "#cbd5e1", label: "Night Sky" },
  },
  {
    id: "reader_cream",
    name: "Warm Cream",
    category: "readerBg",
    price: 25,
    emoji: "☀️",
    description: "Easy on the eyes",
    readerStyle: { bg: "#fffbeb", text: "#451a03", label: "Cream" },
  },
  {
    id: "reader_mint",
    name: "Mint Fresh",
    category: "readerBg",
    price: 30,
    emoji: "🍃",
    description: "Fresh mint background",
    readerStyle: { bg: "#ecfdf5", text: "#064e3b", label: "Mint" },
  },
  {
    id: "reader_lavender",
    name: "Lavender Mist",
    category: "readerBg",
    price: 30,
    emoji: "💜",
    description: "Gentle purple haze",
    readerStyle: { bg: "#f5f3ff", text: "#3b0764", label: "Lavender" },
  },
  {
    id: "reader_ocean",
    name: "Ocean Depth",
    category: "readerBg",
    price: 35,
    emoji: "🌊",
    description: "Deep sea reading",
    readerStyle: { bg: "#0c1929", text: "#7dd3fc", label: "Ocean" },
  },
  {
    id: "reader_rose",
    name: "Rose Blush",
    category: "readerBg",
    price: 30,
    emoji: "🌹",
    description: "Soft pink warmth",
    readerStyle: { bg: "#fff1f2", text: "#4c0519", label: "Rose" },
  },
  {
    id: "reader_forest",
    name: "Forest Floor",
    category: "readerBg",
    price: 35,
    emoji: "🌲",
    description: "Deep woodland green",
    readerStyle: { bg: "#052e16", text: "#86efac", label: "Forest" },
  },
  {
    id: "reader_sand",
    name: "Desert Sand",
    category: "readerBg",
    price: 25,
    emoji: "🏜️",
    description: "Warm sandy tones",
    readerStyle: { bg: "#fef3c7", text: "#78350f", label: "Sand" },
  },
  {
    id: "reader_slate",
    name: "Slate Gray",
    category: "readerBg",
    price: 25,
    emoji: "🪨",
    description: "Neutral and focused",
    readerStyle: { bg: "#1e293b", text: "#cbd5e1", label: "Slate" },
  },
  {
    id: "reader_peach",
    name: "Peach Glow",
    category: "readerBg",
    price: 30,
    emoji: "🍑",
    description: "Warm peachy comfort",
    readerStyle: { bg: "#fff7ed", text: "#7c2d12", label: "Peach" },
  },
  {
    id: "reader_midnight",
    name: "Midnight Blue",
    category: "readerBg",
    price: 35,
    emoji: "🌃",
    description: "Deep midnight reading",
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
    frameClass: "border-2 border-purple-500/30",
  },
  {
    id: "frame_gold",
    name: "Gold Crown",
    category: "frames",
    price: 50,
    emoji: "👑",
    description: "Royal gold border",
    frameClass: "border-3 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]",
  },
  {
    id: "frame_fire",
    name: "Fire Ring",
    category: "frames",
    price: 60,
    emoji: "🔥",
    description: "Blazing fire effect",
    frameClass: "border-3 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]",
  },
  {
    id: "frame_rainbow",
    name: "Rainbow Glow",
    category: "frames",
    price: 70,
    emoji: "🌈",
    description: "Colorful rainbow aura",
    frameClass: "border-3 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4),0_0_30px_rgba(168,85,247,0.3)]",
  },
  {
    id: "frame_diamond",
    name: "Diamond Border",
    category: "frames",
    price: 80,
    emoji: "💎",
    description: "Sparkling diamond edge",
    frameClass: "border-3 border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]",
  },
  {
    id: "frame_angel",
    name: "Angel Wings",
    category: "frames",
    price: 80,
    emoji: "😇",
    description: "Heavenly angel frame",
    frameClass: "border-3 border-white/70 shadow-[0_0_20px_rgba(255,255,255,0.4)]",
  },
  {
    id: "frame_emerald",
    name: "Emerald Shine",
    category: "frames",
    price: 55,
    emoji: "💚",
    description: "Rich emerald border",
    frameClass: "border-3 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]",
  },
  {
    id: "frame_lightning",
    name: "Lightning Bolt",
    category: "frames",
    price: 65,
    emoji: "⚡",
    description: "Electric energy frame",
    frameClass: "border-3 border-yellow-300 shadow-[0_0_18px_rgba(253,224,71,0.6)]",
  },
  {
    id: "frame_ocean",
    name: "Ocean Wave",
    category: "frames",
    price: 55,
    emoji: "🌊",
    description: "Deep blue sea border",
    frameClass: "border-3 border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]",
  },
  {
    id: "frame_sunset",
    name: "Sunset Blaze",
    category: "frames",
    price: 60,
    emoji: "🌅",
    description: "Warm sunset glow",
    frameClass: "border-3 border-orange-400 shadow-[0_0_18px_rgba(251,146,60,0.5)]",
  },
  {
    id: "frame_galaxy",
    name: "Galaxy Swirl",
    category: "frames",
    price: 75,
    emoji: "🌌",
    description: "Cosmic galaxy border",
    frameClass: "border-3 border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.4),0_0_35px_rgba(168,85,247,0.3)]",
  },
  {
    id: "frame_cherry",
    name: "Cherry Blossom",
    category: "frames",
    price: 60,
    emoji: "🌸",
    description: "Delicate pink petals",
    frameClass: "border-3 border-pink-300 shadow-[0_0_15px_rgba(249,168,212,0.5)]",
  },
  {
    id: "frame_neon",
    name: "Neon Pulse",
    category: "frames",
    price: 70,
    emoji: "💫",
    description: "Vibrant neon glow",
    frameClass: "border-3 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5),0_0_40px_rgba(34,197,94,0.3)]",
  },
  {
    id: "frame_ice",
    name: "Frozen Crystal",
    category: "frames",
    price: 65,
    emoji: "❄️",
    description: "Icy crystal border",
    frameClass: "border-3 border-sky-200 shadow-[0_0_18px_rgba(186,230,253,0.6)]",
  },
];

// ============ PETS ============
export const PETS: StoreItem[] = [
  {
    id: "pet_cat",
    name: "Faithy Pet",
    category: "pets",
    price: 50,
    emoji: "🐱",
    description: "A faithful companion",
    petEmoji: "🐱",
  },
  {
    id: "pet_puppy",
    name: "Hope Puppy",
    category: "pets",
    price: 50,
    emoji: "🐶",
    description: "Always hopeful and loyal",
    petEmoji: "🐶",
  },
  {
    id: "pet_lamb",
    name: "Joy Lamb",
    category: "pets",
    price: 50,
    emoji: "🐑",
    description: "Gentle and joyful",
    petEmoji: "🐑",
  },
  {
    id: "pet_lion",
    name: "Brave Lion",
    category: "pets",
    price: 70,
    emoji: "🦁",
    description: "Courageous like Daniel",
    petEmoji: "🦁",
  },
  {
    id: "pet_owl",
    name: "Wise Owl",
    category: "pets",
    price: 70,
    emoji: "🦉",
    description: "Wisdom of Solomon",
    petEmoji: "🦉",
  },
  {
    id: "pet_dove",
    name: "Peace Dove",
    category: "pets",
    price: 80,
    emoji: "🕊️",
    description: "Symbol of the Holy Spirit",
    petEmoji: "🕊️",
  },
  {
    id: "pet_eagle",
    name: "Soaring Eagle",
    category: "pets",
    price: 75,
    emoji: "🦅",
    description: "Mount up with wings (Isaiah 40:31)",
    petEmoji: "🦅",
  },
  {
    id: "pet_fox",
    name: "Swift Fox",
    category: "pets",
    price: 60,
    emoji: "🦊",
    description: "Clever and quick",
    petEmoji: "🦊",
  },
  {
    id: "pet_bear",
    name: "Mighty Bear",
    category: "pets",
    price: 70,
    emoji: "🐻",
    description: "Strong like Samson",
    petEmoji: "🐻",
  },
  {
    id: "pet_bunny",
    name: "Gentle Bunny",
    category: "pets",
    price: 50,
    emoji: "🐰",
    description: "Meek and gentle spirit",
    petEmoji: "🐰",
  },
  {
    id: "pet_whale",
    name: "Jonah's Whale",
    category: "pets",
    price: 85,
    emoji: "🐳",
    description: "A big adventure awaits",
    petEmoji: "🐳",
  },
  {
    id: "pet_butterfly",
    name: "New Life Butterfly",
    category: "pets",
    price: 60,
    emoji: "🦋",
    description: "Transformed and beautiful",
    petEmoji: "🦋",
  },
  {
    id: "pet_dragon",
    name: "Fire Dragon",
    category: "pets",
    price: 100,
    emoji: "🐉",
    description: "Legendary and fierce",
    petEmoji: "🐉",
  },
  {
    id: "pet_unicorn",
    name: "Holy Unicorn",
    category: "pets",
    price: 90,
    emoji: "🦄",
    description: "Pure and majestic",
    petEmoji: "🦄",
  },
];

// ============ MYSTERY BOX ============
export const MYSTERY_BOX: StoreItem = {
  id: "mystery_box",
  name: "Mystery Box",
  category: "mystery",
  price: 15,
  emoji: "🎁",
  description: "Open for a random reward!",
};

// ============ INVENTORY SYSTEM ============
const INVENTORY_KEY = "teensBibleInventory";
const EQUIPPED_KEY = "teensBibleEquipped";

export interface Inventory {
  ownedItems: string[]; // item IDs
}

export interface Equipped {
  theme: string;
  readerBg: string;
  frame: string;
  pet: string | null;
}

const DEFAULT_EQUIPPED: Equipped = {
  theme: "theme_twilight",
  readerBg: "reader_dark",
  frame: "frame_none",
  pet: null,
};

export function getInventory(): Inventory {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ownedItems: ["theme_twilight", "reader_dark", "frame_none"] };
}

export function saveInventory(inv: Inventory) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
}

export function getEquipped(): Equipped {
  try {
    const raw = localStorage.getItem(EQUIPPED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_EQUIPPED;
}

export function saveEquipped(eq: Equipped) {
  localStorage.setItem(EQUIPPED_KEY, JSON.stringify(eq));
  // Apply theme immediately when equipped theme changes
  applyTheme(eq.theme);
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
    case "themes":
      eq.theme = itemId;
      break;
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

// Mystery box rewards
export function openMysteryBox(): { success: boolean; reward?: StoreItem | { type: "gems"; amount: number }; message: string } {
  const gems = getGems();
  if (gems < MYSTERY_BOX.price) {
    return { success: false, message: "Not enough gems!" };
  }

  setGems(gems - MYSTERY_BOX.price);

  // 30% chance of bonus gems
  if (Math.random() < 0.3) {
    const bonusGems = [5, 10, 15, 20, 25, 50][Math.floor(Math.random() * 6)];
    setGems(getGems() + bonusGems);
    return { success: true, reward: { type: "gems", amount: bonusGems }, message: `You won ${bonusGems} gems!` };
  }

  // 70% chance of random item
  const allItems = [...THEMES, ...READER_BACKGROUNDS, ...PROFILE_FRAMES, ...PETS].filter(
    (item) => item.price > 0 && !ownsItem(item.id)
  );

  if (allItems.length === 0) {
    // All items owned, give gems instead
    const bonusGems = 30;
    setGems(getGems() + bonusGems);
    return { success: true, reward: { type: "gems", amount: bonusGems }, message: `You own everything! Here's ${bonusGems} gems!` };
  }

  const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
  const inv = getInventory();
  inv.ownedItems.push(randomItem.id);
  saveInventory(inv);

  return { success: true, reward: randomItem, message: `You won ${randomItem.name}!` };
}

// ============ THEME APPLICATION ============
export function applyTheme(themeId?: string) {
  const equipped = getEquipped();
  const activeThemeId = themeId || equipped.theme;
  const theme = THEMES.find(t => t.id === activeThemeId);
  if (!theme?.cssVars) return;

  const root = document.documentElement;
  
  // Apply CSS variables from theme
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Update neon-card and cosmic-bg colors dynamically
  const neonRgb = theme.cssVars["--neon-rgb"] || "139, 92, 246";
  root.style.setProperty("--neon-rgb", neonRgb);

  // Store the active theme for persistence
  localStorage.setItem("teensBibleActiveTheme", activeThemeId);
}

// Initialize theme on app load
export function initTheme() {
  const equipped = getEquipped();
  applyTheme(equipped.theme);
}

// Gems helpers
function getGems(): number {
  try {
    const raw = localStorage.getItem("teensBible");
    const data = raw ? JSON.parse(raw) : {};
    return data.gems || 0;
  } catch {
    return 0;
  }
}

function setGems(amount: number) {
  try {
    const raw = localStorage.getItem("teensBible");
    const data = raw ? JSON.parse(raw) : {};
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
  try {
    const raw = localStorage.getItem(PET_STATE_KEY);
    if (raw) {
      const state: PetState = JSON.parse(raw);
      // Recalculate mood based on days since last fed
      const days = daysSince(state.lastFedDate);
      if (days === 0) state.mood = "happy";
      else if (days === 1) state.mood = "hungry";
      else state.mood = "sad";
      return state;
    }
  } catch {}
  // Default: never fed, sad
  return { lastFedDate: "2000-01-01", mood: "sad" };
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
