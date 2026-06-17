# Phase 2 — Home Redesign

Phase 2 applies the Phase 1 / Phase 1.5 brand system to the Home screen.

## Goal

Home should become the daily starting point of the Faith Energy loop.

```text
Open app -> Luna guides -> Today’s Faith Quest -> Continue Reading -> Reward -> Return tomorrow
```

## Structure

1. App header
   - Teenz Bible app icon
   - Small status copy
   - Settings

2. Faith Energy stats
   - Flame streak
   - XP lightning
   - Gem crystal

3. Greeting card
   - Today’s path
   - Welcome back
   - Short contextual guidance

4. Luna guide
   - Luna icon
   - Dialogue bubble
   - Daily encouragement

5. Today’s Faith Quest
   - Quest scroll icon
   - Chapter target
   - Progress bar
   - Reward preview
   - Continue CTA

6. Quick actions
   - Quiz
   - Devotion
   - Group

7. Bible AI
   - Contextual shortcut

8. Bottom navigation
   - Brand icons
   - Raised active state

## Components to implement

- `HomeStats`
- `HomeHero`
- `PetGuide`
- `FaithQuestCard`
- `QuickActionGrid`
- `BibleAIShortcut`
- `BottomNav`

## Data mapping

| Component | Data |
|---|---|
| HomeStats | `teensBible.streak`, `totalXP`, `teensBible.gems` |
| HomeHero | `playerName`, `lastReadBook`, `lastReadChapter` |
| PetGuide | equipped pet, mood, dialogue |
| FaithQuestCard | daily quest, chapter progress, reward preview |
| QuickActionGrid | routes: Bible/Quiz, Devotion, Group/Ranking |
| BibleAIShortcut | `/bible-ai` |
| BottomNav | current route |

## Confirmation question

Does this Home direction feel strong enough to become the actual Phase 2 implementation target?
