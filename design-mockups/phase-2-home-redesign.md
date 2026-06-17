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

4. Bible Meme of the Day
   - Uses the existing app meme feature
   - Opens fullscreen
   - Supports reactions/share/save

5. Today’s Faith Quest
   - Quest scroll icon
   - Chapter target
   - Progress bar
   - Reward preview
   - Continue CTA

6. Quick actions
   - Bible AI
   - Bible Map
   - Quiz Stats

7. Bottom navigation
   - Brand icons
   - Raised active state

## Components to implement

- `HomeStats`
- `HomeHero`
- `MemeCard`
- `FaithQuestCard`
- `QuickActionGrid`
- `BottomNav`

## Data mapping

| Component | Data |
|---|---|
| HomeStats | `teensBible.streak`, `totalXP`, `teensBible.gems` |
| HomeHero | `playerName`, time of day, `lastReadBook`, `lastReadChapter`, daily quest status |
| MemeCard | `getDailyMemeUrl()`, meme reactions, fullscreen/share/save state |
| FaithQuestCard | last-read state, daily quest, chapter progress, reward preview |
| QuickActionGrid | routes: `/bible-ai`, `/bible-map`, `/quiz-stats` |
| BottomNav | current route |

## H3 Home Hero dynamic copy logic

H3 should not be static marketing copy. It should be generated from user state.

Suggested logic:

```ts
const greeting = getTimeGreeting(); // Morning / Afternoon / Evening
const name = playerName || "friend";
const lastRead = getLastRead();
const quest = getTodayFaithQuest();

if (lastRead) {
  title = `${greeting}, ${name}`;
  body = `Continue ${lastRead.book} ${lastRead.chapter}. Today's quest is ready.`;
} else if (quest) {
  title = `${greeting}, ${name}`;
  body = `Start today's Faith Quest: ${quest.book} ${quest.chapter}.`;
} else {
  title = `${greeting}, ${name}`;
  body = "Choose a chapter and begin your Faith Energy streak.";
}
```

Possible body inputs:

- `lastReadBook`
- `lastReadChapter`
- `chaptersRead_*`
- `teensBibleDailyStreak`
- daily quest seed
- time of day

## H5 Faith Quest behavior

H5 is the main Home action card.

It should resolve in this order:

1. If user has last-read chapter: continue that chapter.
2. Else if daily quest exists: show daily quest chapter.
3. Else default to a recommended chapter.

Progress:

- If reading same chapter: use chapter scroll/read progress.
- If already partially completed: show section count or percent.
- If completed: show completed state and link to quiz/reward.

CTA:

- `Continue` if in progress.
- `Start` if new.
- `Claim Reward` if completed but reward not claimed.
- `Take Quiz` if reward claimed and quiz available.

Reward preview:

- XP from chapter completion
- Gems from quest or quiz
- Streak impact if applicable

## Confirmation question

Does this Home direction feel strong enough to become the actual Phase 2 implementation target?
