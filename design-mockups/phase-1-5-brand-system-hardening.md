# Phase 1.5 — Brand System Hardening

This phase turns Phase 1's visual direction into implementation rules.

The goal is to make Phase 2+ stable:

> Every future screen should know which colors, typography, icons, components, and motion rules to use before design work begins.

---

## 1. Semantic Design Tokens

### Brand

| Token | Value | Usage |
|---|---:|---|
| `brand.iconNavy` | `#071426` | Deep app-icon background, app shell base |
| `brand.bookLeather` | `#342018` | Bible/book surfaces, leather cards |
| `brand.bookInk` | `#1B1012` | Deep outline and icon shadow |
| `brand.faithGold` | `#F8C94A` | Primary CTA, reward, active state |
| `brand.lightning` | `#FFE24D` | XP, charged state, completion spark |
| `brand.energyPurple` | `#8B5CF6` | Secondary action, AI, spiritual energy |
| `brand.auroraCyan` | `#22D3EE` | Progress fill, interactive accent |
| `brand.growthGreen` | `#34D399` | Success, completed chapter, correct quiz |
| `brand.parchment` | `#F3DFB8` | Reader surface |

### Surfaces

| Token | Usage |
|---|---|
| `surface.app` | App background |
| `surface.glass` | Default card surface |
| `surface.raised` | Important interactive card |
| `surface.leather` | Bible/quest/reward card base |
| `surface.reader` | Reader page |
| `surface.modal` | Dialog / sheet |

### Text

| Token | Usage |
|---|---|
| `text.primary` | Main text on dark background |
| `text.secondary` | Supporting copy |
| `text.muted` | Metadata / labels |
| `text.reader` | Reader paragraph text |
| `text.gold` | Reward/action emphasis |

---

## 2. Typography Scale

### App UI

| Role | Size | Weight | Usage |
|---|---:|---:|---|
| `display.hero` | 36-44 | 850-950 | Home greeting, major screen hero |
| `title.screen` | 28-34 | 850 | Screen title |
| `title.card` | 18-24 | 800 | Card title |
| `body.default` | 14-16 | 500-650 | Normal UI copy |
| `label.button` | 14-16 | 850-950 | Buttons |
| `label.meta` | 11-13 | 700-850 | Captions, chips |
| `stat.number` | 22-34 | 900 | XP, gems, rank |

### Reader

| Role | Size | Line Height | Usage |
|---|---:|---:|---|
| `reader.en` | 19-22 | 1.62-1.75 | English body |
| `reader.ko` | 18-21 | 1.72-1.86 | Korean body |
| `reader.heading` | 22-26 | 1.3 | Section heading |
| `reader.verse` | 11-13 | n/a | Verse marker |

### Font Guidance

- UI: Inter / Plus Jakarta Sans / Noto Sans KR
- Friendly display: optional Fredoka/Baloo-style only for rewards or pet voice
- Reader English: Georgia or a readable serif option
- Reader Korean: Noto Serif KR or Noto Sans KR depending on mode

---

## 3. Icon Tier System

All core icons must match the app icon art level.

### Tier 1 — Brand Critical

| Icon | Usage |
|---|---|
| `bible-book` | Brand, Home quest, Bible tab, loading |
| `xp-lightning` | XP, Faith Energy, reward burst |
| `gem-crystal` | Currency, store, reward |
| `luna-lamb-pet` | Companion, Home, completion reaction |

### Tier 2 — Product Core

| Icon | Usage |
|---|---|
| `flame-streak` | Streak, daily habit |
| `gold-trophy` | Ranking / achievements |
| `treasure-chest` | Store / mystery rewards |
| `shield-profile` | Profile / safety |
| `quest-scroll` | Daily Faith Quest |

### Tier 3 — Utility

| Icon | Usage |
|---|---|
| `bookmark` | Reader bookmark |
| `audio-speaker` | TTS / audio |
| `font-aa` | Reader typography |

### Rules

- Tier 1 can be large and animated.
- Tier 2 can glow when active.
- Tier 3 should remain smaller and calmer.
- Do not mix emoji with Tier 1 or Tier 2 icons.

---

## 4. Component Variants

### Buttons

| Variant | Usage | Treatment |
|---|---|---|
| `FaithButton.primary` | Main CTA | Gold bevel, leather underlayer, pressed depth |
| `FaithButton.energy` | AI / secondary CTA | Purple/cyan gradient, lower glow |
| `FaithButton.ghost` | Low-priority action | Glass surface, no heavy glow |
| `FaithButton.danger` | Destructive action | Red accent, no gold |
| `FaithButton.disabled` | Disabled | Desaturated, no glow, no depth |

### Cards

| Variant | Usage | Treatment |
|---|---|---|
| `FaithCard.glass` | Default info | Soft glass, low depth |
| `FaithCard.raised` | Interactive module | Bevel + shadow lip |
| `FaithCard.leather` | Bible/quest/reward | Leather brown base, gold accent |
| `FaithCard.reader` | Reading surface | Parchment / calm |
| `FaithCard.locked` | Locked content | Desaturated + lock state |
| `FaithCard.reward` | Completion reward | Warm glow, XP/gem assets |

### Progress

| Variant | Usage |
|---|---|
| `FaithProgress.energy` | XP / quest progress |
| `FaithProgress.reader` | Chapter read progress |
| `FaithProgress.streak` | Daily streak |
| `FaithProgress.loading` | Loading/processing |

---

## 5. Motion Tokens

Use `framer-motion` for implementation.

| Token | Value | Usage |
|---|---|---|
| `motion.tap` | `scale: .96, y: 2, 120ms` | Buttons/cards |
| `motion.cardEnter` | `y: 16 -> 0, opacity: 0 -> 1, 260ms` | Cards |
| `motion.navActive` | `y: [0, -4, 0], 220ms` | Bottom nav |
| `motion.rewardBurst` | `scale: [.82, 1.08, 1], 700ms spring` | XP/gem reward |
| `motion.petIdle` | `y: [0, -3, 0], 2400ms loop` | Luna |
| `motion.readerPage` | `opacity + y 8, 220ms` | Chapter transitions |
| `motion.countUp` | `600ms easeOut` | XP/gems |

Accessibility:

- Respect `prefers-reduced-motion`.
- Reward animation must be skippable.

---

## 6. Faith Energy Loop

```text
Open app
  -> Luna suggests Today’s Faith Quest
  -> Continue Reading
  -> Chapter progress fills
  -> Chapter Complete
  -> XP Lightning + Gem reward burst
  -> Quiz unlock
  -> Pet reaction
  -> Streak / Weekly League update
  -> Return tomorrow
```

### Screen mapping

| Loop Step | Screen |
|---|---|
| Today’s Faith Quest | Home |
| Continue Reading | Home / Bible |
| Chapter progress | Reader |
| Reward burst | Reader completion |
| Quiz unlock | Reader / Quiz |
| Pet reaction | Home / Reader |
| League update | Ranking |

---

## 7. Asset Production Rules

### Icon output

- Source: high-quality rendered/sticker style
- Export:
  - PNG 512px master
  - WebP 256px app use
  - Optional transparent PNG for overlays
- Safe padding: 10-14%
- Include glow only if icon is meant to glow by default.
- Test on dark navy and glass card backgrounds.

### Naming

```text
client/public/art-assets/brand-icons/{name}.png
client/public/art-assets/brand-icons/{name}.webp
```

### Minimum quality bar

An icon is not accepted if it:

- Looks flat next to the app icon
- Has inconsistent outline thickness
- Uses a different lighting direction
- Has unreadable small details
- Depends on text generated inside the image

---

## 8. Screen Tone Guide

| Screen | Tone |
|---|---|
| Home | Calm, motivating, guided by Luna |
| Bible | Collectible library, progress-focused |
| Reader | Quiet, premium, readable |
| Store | Energetic, desirable, rarity-driven |
| Ranking | Competitive, social, weekly |
| Profile | Identity, pride, growth history |

---

## Phase 1.5 Completion Criteria

Phase 1.5 is complete when:

- Semantic tokens are defined.
- Typography scale is defined.
- Icon tiers are defined.
- Component variants are defined.
- Motion tokens are defined.
- Faith Energy loop is defined.
- Asset production rules are defined.
- These rules are approved before Phase 2 Home redesign begins.
