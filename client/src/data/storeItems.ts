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
];

// ============ PETS ============
export const PETS: StoreItem[] = [
  {
    id: "pet_cat",
    name: "Faithy Cat",
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
