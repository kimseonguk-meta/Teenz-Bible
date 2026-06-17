# Aurora Sanctuary Redesign Concept

This is a fresh design direction for Teenz Bible, independent of the previous mockup images.

## Concept

**Premium Bible reader + teen-friendly growth system**

The app should feel modern, calm, and premium first. RPG/growth elements should motivate reading, not dominate the entire UI.

## Files

- `teenz-bible-aurora-sanctuary-concept.html`
- `teenz-bible-aurora-sanctuary-concept.png`

## Design principles

1. **Aurora background instead of heavy game pattern**
   - Deep navy/violet base
   - Soft aurora glow
   - Low-noise star/particle layer

2. **Gold as reward accent, not everywhere**
   - Gold is used for CTA, XP, level, reward moments
   - Normal navigation/cards stay glassy and modern

3. **Modern depth**
   - Raised buttons with bevel and pressed states
   - Cards use layer depth, not heavy borders
   - Bottom nav is glass + raised active tab

4. **Reader-first quality**
   - Reader screen has a calm parchment-like sheet
   - Text contrast and line-height are prioritized
   - Toolbar floats like a premium iOS control

5. **Implementable**
   - Pure HTML/CSS
   - Uses CSS variables and reusable classes
   - Maps directly to React/Tailwind components

## React implementation mapping

### Shared

- `PremiumCard`
- `RaisedCard`
- `StatPill`
- `PrimaryButton`
- `BottomNav`
- `ProgressBar`
- `AppIcon`

### Home

- `HomeHero`
- `ContinueReadingCard`
- `PetStatusCard`
- `QuickActionGrid`
- `BibleAIShortcut`

### Bible

- `BookLibraryHeader`
- `TestamentSegment`
- `BookCard`

### Reader

- `ReaderHeader`
- `ReaderSheet`
- `ReaderToolbar`

### Store

- `StoreTabs`
- `StoreItemCard`
- `RarityBadge`

### Profile

- `ProfileHero`
- `ProfileStats`
- `AchievementRail`

## Notes

This design intentionally avoids using screenshot backgrounds. It can be implemented with app-owned SVG icons, CSS gradients, and existing data models.
