// ============================================================
// STORE ITEMS DATA & INVENTORY SYSTEM
// ============================================================

export type ItemCategory = "themes" | "readerBg" | "frames" | "pets" | "mystery";
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
    rarity: "common",
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
      "--cosmic-bg-1": "#0a0015",
      "--cosmic-bg-2": "#1a0033",
      "--cosmic-bg-3": "#0d001a",
      "--cosmic-bg-4": "#050010",
      "--neon-card-bg": "rgba(15, 5, 40, 0.75)",
    },
  },
  {
    id: "theme_ocean",
    name: "Ocean Blue",
    category: "themes",
    price: 180,
    emoji: "🌊",
    description: "Calm ocean vibes",
    rarity: "rare",
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
      "--cosmic-bg-1": "#001a1f",
      "--cosmic-bg-2": "#002a3a",
      "--cosmic-bg-3": "#001520",
      "--cosmic-bg-4": "#000a10",
      "--neon-card-bg": "rgba(0, 20, 35, 0.75)",
    },
  },
  {
    id: "theme_forest",
    name: "Forest Green",
    category: "themes",
    price: 180,
    emoji: "🌲",
    description: "Peaceful forest atmosphere",
    rarity: "rare",
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
      "--cosmic-bg-1": "#001a08",
      "--cosmic-bg-2": "#003315",
      "--cosmic-bg-3": "#001a0a",
      "--cosmic-bg-4": "#000f05",
      "--neon-card-bg": "rgba(0, 20, 10, 0.75)",
    },
  },
  {
    id: "theme_sunset",
    name: "Sunset Orange",
    category: "themes",
    price: 190,
    emoji: "🌅",
    description: "Warm sunset glow",
    rarity: "rare",
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
      "--cosmic-bg-1": "#1a0800",
      "--cosmic-bg-2": "#331500",
      "--cosmic-bg-3": "#1a0a00",
      "--cosmic-bg-4": "#0f0500",
      "--neon-card-bg": "rgba(30, 10, 0, 0.75)",
    },
  },
  {
    id: "theme_galaxy",
    name: "Galaxy Pink",
    category: "themes",
    price: 210,
    emoji: "🌌",
    description: "Cosmic pink energy",
    rarity: "epic",
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
      "--cosmic-bg-1": "#1a0012",
      "--cosmic-bg-2": "#33001f",
      "--cosmic-bg-3": "#1a0010",
      "--cosmic-bg-4": "#0f0008",
      "--neon-card-bg": "rgba(30, 0, 18, 0.75)",
    },
  },
  {
    id: "theme_crimson",
    name: "Crimson Red",
    category: "themes",
    price: 190,
    emoji: "❤️‍🔥",
    description: "Bold and passionate",
    rarity: "rare",
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
      "--cosmic-bg-1": "#1a0500",
      "--cosmic-bg-2": "#330a00",
      "--cosmic-bg-3": "#1a0300",
      "--cosmic-bg-4": "#0f0200",
      "--neon-card-bg": "rgba(30, 5, 0, 0.75)",
    },
  },
  {
    id: "theme_arctic",
    name: "Arctic Ice",
    category: "themes",
    price: 200,
    emoji: "🧊",
    description: "Cool icy blue tones",
    rarity: "epic",
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
      "--cosmic-bg-1": "#000a1a",
      "--cosmic-bg-2": "#001533",
      "--cosmic-bg-3": "#000a1a",
      "--cosmic-bg-4": "#00050f",
      "--neon-card-bg": "rgba(0, 10, 30, 0.75)",
    },
  },
  {
    id: "theme_lavender",
    name: "Lavender Dream",
    category: "themes",
    price: 190,
    emoji: "💜",
    description: "Soft lavender serenity",
    rarity: "rare",
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
      "--cosmic-bg-1": "#0f0018",
      "--cosmic-bg-2": "#1a0030",
      "--cosmic-bg-3": "#0d0018",
      "--cosmic-bg-4": "#06000d",
      "--neon-card-bg": "rgba(15, 0, 25, 0.75)",
    },
  },
  {
    id: "theme_midnight",
    name: "Midnight Black",
    category: "themes",
    price: 220,
    emoji: "🖤",
    description: "Sleek and mysterious",
    rarity: "epic",
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
      "--cosmic-bg-1": "#050505",
      "--cosmic-bg-2": "#0a0a0a",
      "--cosmic-bg-3": "#060606",
      "--cosmic-bg-4": "#020202",
      "--neon-card-bg": "rgba(8, 8, 8, 0.85)",
    },
  },
  {
    id: "theme_gold",
    name: "Royal Gold",
    category: "themes",
    price: 240,
    emoji: "👑",
    description: "Fit for a king",
    rarity: "legendary",
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
      "--cosmic-bg-1": "#0f0a00",
      "--cosmic-bg-2": "#1a1200",
      "--cosmic-bg-3": "#0f0800",
      "--cosmic-bg-4": "#080500",
      "--neon-card-bg": "rgba(20, 15, 0, 0.75)",
    },
  },
  {
    id: "theme_rose",
    name: "Rose Garden",
    category: "themes",
    price: 200,
    emoji: "🌹",
    description: "Elegant rose tones",
    rarity: "epic",
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
      "--cosmic-bg-1": "#1a0008",
      "--cosmic-bg-2": "#330010",
      "--cosmic-bg-3": "#1a0006",
      "--cosmic-bg-4": "#0f0003",
      "--neon-card-bg": "rgba(25, 0, 8, 0.75)",
    },
  },
  {
    id: "theme_ember",
    name: "Ember Glow",
    category: "themes",
    price: 210,
    emoji: "🔥",
    description: "Warm burning embers",
    rarity: "epic",
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
      "--cosmic-bg-1": "#1a0a00",
      "--cosmic-bg-2": "#2a1200",
      "--cosmic-bg-3": "#1a0800",
      "--cosmic-bg-4": "#0f0400",
      "--neon-card-bg": "rgba(25, 10, 0, 0.75)",
    },
  },
  {
    id: "theme_aurora",
    name: "Aurora Borealis",
    category: "themes",
    price: 250,
    emoji: "🌠",
    description: "Northern lights magic",
    rarity: "legendary",
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
      "--cosmic-bg-1": "#001a12",
      "--cosmic-bg-2": "#003325",
      "--cosmic-bg-3": "#001a10",
      "--cosmic-bg-4": "#000f08",
      "--neon-card-bg": "rgba(0, 20, 15, 0.75)",
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
    name: "Faithy Pet",
    category: "pets",
    price: 220,
    emoji: "🐱",
    description: "A faithful companion",
    rarity: "rare",
    petEmoji: "🐱",
  },
  {
    id: "pet_puppy",
    name: "Hope Puppy",
    category: "pets",
    price: 220,
    emoji: "🐶",
    description: "Always hopeful and loyal",
    rarity: "rare",
    petEmoji: "🐶",
  },
  {
    id: "pet_lamb",
    name: "Joy Lamb",
    category: "pets",
    price: 230,
    emoji: "🐑",
    description: "Gentle and joyful",
    rarity: "rare",
    petEmoji: "🐑",
  },
  {
    id: "pet_lion",
    name: "Brave Lion",
    category: "pets",
    price: 260,
    emoji: "🦁",
    description: "Courageous like Daniel",
    rarity: "epic",
    petEmoji: "🦁",
  },
  {
    id: "pet_owl",
    name: "Wise Owl",
    category: "pets",
    price: 250,
    emoji: "🦉",
    description: "Wisdom of Solomon",
    rarity: "epic",
    petEmoji: "🦉",
  },
  {
    id: "pet_dove",
    name: "Peace Dove",
    category: "pets",
    price: 270,
    emoji: "🕊️",
    description: "Symbol of the Holy Spirit",
    rarity: "epic",
    petEmoji: "🕊️",
  },
  {
    id: "pet_eagle",
    name: "Soaring Eagle",
    category: "pets",
    price: 260,
    emoji: "🦅",
    description: "Mount up with wings (Isaiah 40:31)",
    rarity: "epic",
    petEmoji: "🦅",
  },
  {
    id: "pet_fox",
    name: "Swift Fox",
    category: "pets",
    price: 240,
    emoji: "🦊",
    description: "Clever and quick",
    rarity: "rare",
    petEmoji: "🦊",
  },
  {
    id: "pet_bear",
    name: "Mighty Bear",
    category: "pets",
    price: 260,
    emoji: "🐻",
    description: "Strong like Samson",
    rarity: "epic",
    petEmoji: "🐻",
  },
  {
    id: "pet_bunny",
    name: "Gentle Bunny",
    category: "pets",
    price: 230,
    emoji: "🐰",
    description: "Meek and gentle spirit",
    rarity: "rare",
    petEmoji: "🐰",
  },
  {
    id: "pet_whale",
    name: "Jonah's Whale",
    category: "pets",
    price: 280,
    emoji: "🐳",
    description: "A big adventure awaits",
    rarity: "legendary",
    petEmoji: "🐳",
  },
  {
    id: "pet_butterfly",
    name: "New Life Butterfly",
    category: "pets",
    price: 240,
    emoji: "🦋",
    description: "Transformed and beautiful",
    rarity: "rare",
    petEmoji: "🦋",
  },
  {
    id: "pet_dragon",
    name: "Fire Dragon",
    category: "pets",
    price: 300,
    emoji: "🐉",
    description: "Legendary and fierce",
    rarity: "legendary",
    petEmoji: "🐉",
  },
  {
    id: "pet_unicorn",
    name: "Holy Unicorn",
    category: "pets",
    price: 290,
    emoji: "🦄",
    description: "Pure and majestic",
    rarity: "legendary",
    petEmoji: "🦄",
  },
];

// ============ MYSTERY BOX ============
export const MYSTERY_BOX: StoreItem = {
  id: "mystery_box",
  name: "Mystery Box",
  category: "mystery",
  price: 50,
  emoji: "🎁",
  description: "Open for a random reward!",
  rarity: "epic",
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
