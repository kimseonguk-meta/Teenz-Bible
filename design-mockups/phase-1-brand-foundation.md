# Phase 1 — Teenz Bible Brand Foundation

This phase defines the brand system before redesigning product screens.

## Source of truth

The current app icon stays and is the **main brand logo**. Do not replace it with a new mark.

The brand language should come from that icon:

- Dark navy atmosphere
- Dark leather Bible
- Gold book corners
- Lightning energy
- Thick friendly outline
- Warm yellow glow

## Logo hierarchy

- Main brand logo: existing Teenz Bible app icon
- Submark: simplified TB Bible mark only if needed
- XP/reward symbol: lightning icon derived from the app icon
- Navigation/store/profile icons: same chunky sticker style, but never competing with the app icon
- Premium but teen-friendly tone

## Brand concept

**Faith Energy System**

Teenz Bible is a premium Bible reading app with a motivational growth layer.

The core loop:

```text
Read chapter -> gain Faith Energy XP -> unlock quiz -> earn gems -> pet reacts -> rank updates -> return tomorrow
```

## Key tokens

- Icon Navy: `#061120`
- Book Brown: `#342018`
- Faith Gold: `#F7C84B`
- Lightning: `#FFE24D`
- Energy Purple: `#8B5CF6`
- Aurora Cyan: `#22D3EE`
- Growth Green: `#34D399`
- Parchment: `#F6E8C8`

## Icon style

Use app-owned rendered icons, not emoji and not simple line/flat SVG.

**All core icons must match the app icon's quality level.** If an icon cannot visually sit next to the Teenz Bible app icon without feeling cheaper, it is not acceptable.

Reference concept sheet:

- `phase-1-brand-icon-set-concept.png`
- `phase-1-brand-icon-sprite-no-labels.png`
- `phase-1-brand-icon-assets.png`

Style:

- Semi-3D sticker/rendered asset
- Thick dark outline
- Warm gold highlights
- Soft glow for active/reward states
- Rounded/chunky geometry
- Slight material texture / leather or bevel cues where appropriate
- Comparable material detail, lighting, shadow, glow, and polish to the existing app icon

Needed icons:

- Bible
- Lightning XP
- Gem
- Flame streak
- Trophy
- Chest
- Shield/Profile
- Quest
- Bookmark
- Audio
- Font
- Pet/Luna

## Icon production rule

Core brand icons should be produced as high-quality image/SVG assets first, then integrated into React.

Recommended output:

```text
client/public/art-assets/brand-icons/bible-book.webp
client/public/art-assets/brand-icons/xp-lightning.webp
client/public/art-assets/brand-icons/gem-crystal.webp
client/public/art-assets/brand-icons/flame-streak.webp
client/public/art-assets/brand-icons/gold-trophy.webp
client/public/art-assets/brand-icons/treasure-chest.webp
client/public/art-assets/brand-icons/shield-profile.webp
client/public/art-assets/brand-icons/quest-scroll.webp
client/public/art-assets/brand-icons/bookmark.webp
client/public/art-assets/brand-icons/audio-speaker.webp
client/public/art-assets/brand-icons/font-aa.webp
client/public/art-assets/brand-icons/luna-lamb-pet.webp
```

Only secondary utility icons may use simpler vector treatment.

## Phase 1 final icon assets

The first production-ready icon asset pass has been split into individual PNG/WebP files:

- `client/public/art-assets/brand-icons/bible-book.webp`
- `client/public/art-assets/brand-icons/xp-lightning.webp`
- `client/public/art-assets/brand-icons/gem-crystal.webp`
- `client/public/art-assets/brand-icons/flame-streak.webp`
- `client/public/art-assets/brand-icons/gold-trophy.webp`
- `client/public/art-assets/brand-icons/treasure-chest.webp`
- `client/public/art-assets/brand-icons/shield-profile.webp`
- `client/public/art-assets/brand-icons/quest-scroll.webp`
- `client/public/art-assets/brand-icons/bookmark.webp`
- `client/public/art-assets/brand-icons/audio-speaker.webp`
- `client/public/art-assets/brand-icons/font-aa.webp`
- `client/public/art-assets/brand-icons/luna-lamb-pet.webp`

These assets are extracted from a label-free high-fidelity sprite sheet so they can be used directly in Phase 2 Home and later product screens.

## UI component rules

### Buttons

- Raised with top highlight
- Bottom depth/shadow lip
- Pressed state moves down 4-5px
- Gold only for primary CTA/reward
- Purple/cyan for secondary action

### Cards

- Glass base
- Subtle bevel
- Raised only for important modules
- Reader cards must remain calm

### Progress

- Inset track
- Glowing fill
- Gold -> purple -> cyan gradient for Faith Energy

### Bottom nav

- Glass bar
- Active tab is raised gold
- Icons are brand SVGs

## Deliverables

- `phase-1-brand-foundation.html`
- `phase-1-brand-foundation.png`
- `phase-1-brand-foundation.md`

## Confirmation question

Does this brand foundation feel like the right direction for Teenz Bible before moving to Phase 2 Home redesign?
