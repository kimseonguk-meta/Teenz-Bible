# Teenz Bible App - Complete Feature Audit

## Screens (Main Navigation)
1. **Home** (`screen-home`) - Dashboard with widgets
2. **Bible** (`screen-bible`) - Book list with categories
3. **Book** (`screen-book`) - Chapter list for selected book
4. **Chapter** (`screen-chapter`) - Reading view with TTS
5. **AI Chat** (`screen-chat`) - Bible Q&A chatbot
6. **Bible Map** (`screen-biblemap`) - Interactive map
7. **Settings** (`screen-settings`) - App configuration

## Home Screen Sections
- Header with app logo + settings gear
- Reading progress bar (chapters read / total)
- Streak card (day streak, calendar view S-M-T-W-T-F-S)
- Stats grid (Day Streak, Chapters, Total XP, Gems)
- Gem Store button (NEW badge)
- Level/XP bar (Newbie → Reader → etc.)
- Verse of the Day card
- Daily Mission card (+30 XP)
- Daily Login Rewards (7-day grid with gem rewards)
- Weekly Challenges (Read 5/10/20 chapters, 3/5/7 day streak)
- Start Reading CTA card
- Continue Reading card (if in progress)

## Home Sub-tabs (Profile area at bottom of home)
- Overview: Badges grid, player name, stats
- Stats: Reading statistics
- Saved: Bookmarks, highlights, notes

## Bible Screen
- Search bar
- Category sections: Gospels, History, Paul's Letters, General Letters, Prophecy
- Book cards with: emoji icon, name, chapter count, description, progress bar
- Weekly reading goal banner

## Book Screen
- Book header with emoji + name
- Chapter grid buttons (numbered)
- Progress indicator
- Read/unread status per chapter

## Chapter Reading Screen
- Chapter text content (modern teen retelling)
- Korean translation toggle (switchLang)
- TTS (Text-to-Speech) with speed control
- Font size adjustment
- Reader mode (light/dark/sepia)
- Verse numbers toggle
- Focus mode
- Highlights (color marking text)
- Bookmarks
- Notes per chapter
- Chapter quiz at end
- Next chapter navigation
- Chapter reactions

## AI Chat Screen
- Chat interface with message bubbles
- Quick question suggestions
- Bible-focused AI responses
- Ask about specific chapters

## Bible Map Screen
- Interactive map with pins
- Location details
- Journey routes
- Map search
- Multiple map views/tabs
- Language toggle for map labels

## Gem Store
- Themes (buy visual themes)
- Avatar frames
- Reader backgrounds
- Effects
- Titles
- Streak freeze
- AI question packs
- Quiz hints
- Mission reroll
- Wishlist functionality

## Settings
- Reading preferences (font size, line height)
- Audio (playback speed, narrator voice)
- Notifications (daily reminder, reminder time)
- AI & Data settings
- Redeem code
- Level roadmap
- How to enjoy guide

## Gamification System
- XP points (earned by reading, quizzes, missions)
- Gems (currency for store)
- Levels (Newbie → Reader → Explorer → etc.)
- Day streaks
- Badges (10 types: First Step, On Fire, Unstoppable, etc.)
- Weekly challenges with gem rewards
- Daily missions
- Daily login rewards (7-day cycle)
- Season pass rewards
- Leaderboard
- Level-up celebrations

## Social Features
- Share profile card
- Share invite link
- Share weekly stats
- Send gifts
- Friend invite system (+15 gems)

## localStorage Keys (Data Compatibility)
- teensBible (main app data object)
- teensBibleProfile (profile data)
- playerName
- totalXP
- dayStreak
- chaptersRead_{bookName}
- weeklyReadLog
- weeklyGoal
- dailyChallenge
- bibleBookmarks
- bibleHighlights
- scrollBookmarks
- chapterReactions
- readerMode, readerFontSize, readerLineHeight, readerLang
- showVerseNumbers, showVerses
- defaultSpeed
- teensBibleVoice
- notifEnabled, reminderTime
- gemStoreLastOpened
- usedCodes
- onboardingDone
- Various UI state flags

## Bible Content
- 27 New Testament books
- Korean translation available (teen-friendly style)
- Modern retelling format
- Verse-by-verse structure
