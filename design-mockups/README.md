# Teenz Bible Premium Growth Concept

This mockup intentionally does **not** depend on the previous Google Drive mockup.
It is a new, implementable direction for Teenz Bible:

> Premium Bible reader + teen-friendly growth/RPG layer.

The visual prototype is in:

- `design-mockups/teenz-bible-premium-growth-concept.html`

It is pure HTML/CSS so the design can be translated directly into React + Tailwind.

## Design direction

### Core idea

Teenz Bible should not feel like a generic game skin placed on top of a Bible app.
It should feel like a premium reading app where growth mechanics help teens keep reading.

### Visual language

- Deep navy / violet background
- Soft glass cards
- Gold, violet, cyan accents
- Premium glow, not heavy casino/game UI
- Minimal emoji usage in production; replace with app-owned SVG icons
- Reader screen prioritized for legibility and calm

## Implementation map

### App shell

Mockup sections:

- `.phone`
- `.tabbar`
- `.tab`

React mapping:

- `components/AppLayout.tsx`
- `components/FantasyIcon.tsx`

Tailwind/CSS tokens:

- `--bg-0`, `--bg-1`, `--ink`, `--muted`
- `--violet`, `--cyan`, `--gold`
- `--radius-xl`, `--shadow`

### Home

Mockup sections:

- `.hero-card`
- `.mission`
- `.pet-strip`
- `.action-grid`

React mapping:

- `pages/Home.tsx`
- `components/DailyMissionCard.tsx` (recommended extraction)
- `components/PetStatusCard.tsx` (recommended extraction)

Data mapping:

- `playerName`
- `lastReadBook`
- `lastReadChapter`
- `totalXP`
- `teensBible.gems`
- `teensBibleDailyStreak`

### Bible list

Mockup sections:

- `.book-grid`
- `.book-card`
- `.book-icon`

React mapping:

- `pages/Bible.tsx`
- `components/BibleBookCard.tsx` (recommended extraction)

Data mapping:

- `otBooks`
- `ntBooks`
- `allBibleData`
- `game.getChaptersRead(bookName)`

### Reader

Mockup sections:

- `.reader-sheet`
- `.reader-toolbar`

React mapping:

- `ChapterReader` inside `pages/Bible.tsx`
- Recommended extraction: `components/ReaderToolbar.tsx`

Implementation notes:

- Reader text color must stay high contrast.
- Keep paper/dark theme selectable, but default should be calm and premium.
- Bottom toolbar should not block text controls.

### Store

Mockup sections:

- `.store-grid`
- `.item-card`
- `.item-art`
- `.price`

React mapping:

- `pages/Store.tsx`
- `components/StoreItemCard.tsx` (recommended extraction)

Data mapping:

- `THEMES`
- `READER_BACKGROUNDS`
- `PROFILE_FRAMES`
- `PETS`
- `RARITY_CONFIG`
- `getInventory()`
- `getEquipped()`

### Profile

Mockup sections:

- `.profile-hero`
- `.avatar`
- `.stat-row`
- `.stat-card`

React mapping:

- `pages/Profile.tsx`
- `components/ProfileHero.tsx` (recommended extraction)

## What to avoid

- Do not rely on screenshots as UI backgrounds for production screens.
- Do not use heavy decorative frames where dynamic text needs flexible layout.
- Do not reduce Reader legibility for visual style.
- Do not use emojis as primary UI art in final production; use SVG or WebP icon assets.

## Recommended build order

1. Create design tokens in `client/src/index.css`.
2. Create reusable components:
   - `PremiumCard`
   - `StatPill`
   - `PrimaryCTA`
   - `BottomNav`
   - `ProgressBar`
3. Rebuild Home first.
4. Rebuild Reader second.
5. Rebuild Bible list.
6. Rebuild Store/Profile/Ranking.

## Preview

Open:

```text
design-mockups/teenz-bible-premium-growth-concept.html
```

or use a local static server.
