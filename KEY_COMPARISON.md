# localStorage Key Comparison: Old App vs New App

## SHARED KEYS (Same key, compatible)
| Key | Old App | New App | Status |
|-----|---------|---------|--------|
| `teensBible` | Main state: {xp, streak, chaptersRead, questions, lastRead, lastDate, books, badges, readingHistory, notes, gems} | Reads gems, books from it | ✅ Compatible |
| `playerName` | Player name string | Player name string | ✅ Compatible |
| `totalXP` | Total XP number | Total XP number | ✅ Compatible |
| `dayStreak` | Streak count | Streak count | ✅ Compatible |
| `readerLang` | "en" or "ko" | "en" or "ko" | ✅ Compatible |
| `readerFontSize` | Font size number | Font size number | ✅ Compatible |
| `geminiApiKey` | Gemini API key | Gemini API key | ✅ Compatible |

## OLD APP ONLY (Not read by new app - DATA LOSS RISK)
| Key | Purpose | Risk |
|-----|---------|------|
| `teensBibleProfile` | {nickname, class, avatar} | ⚠️ Class info lost |
| `bibleBookmarks` | Bookmarked verses | ⚠️ Bookmarks lost |
| `bibleHighlights` | Highlighted verses | ⚠️ Highlights lost |
| `chapterReactions` | Reactions on chapters | Low risk |
| `dailyChallenge` | Daily challenge state | Low risk |
| `defaultSpeed` | TTS speed | ⚠️ New app uses `ttsRate` |
| `myMemeReactions` | Meme reactions | ⚠️ New app uses `memeReactions` |
| `notifEnabled` | Notification on/off | ⚠️ New app uses `notifSettings` |
| `reminderTime` | Reminder time | ⚠️ New app uses `notifSettings` |
| `readerLineHeight` | Line height setting | Low risk |
| `readerMode` | Reader mode | Low risk |
| `showVerseNumbers` | Show verse numbers | Low risk |
| `scrollBookmarks` | Scroll position bookmarks | Low risk |
| `weeklyGoal` | Weekly reading goal | Low risk |
| `weeklyReadLog` | Weekly reading log | Low risk |
| `usedCodes` | Redeemed codes | ⚠️ Codes lost |
| `teensBibleVoice` | TTS voice preference | Low risk |

## NEW APP ONLY (New keys not in old app)
| Key | Purpose |
|-----|---------|
| `className` | Class name (old app uses teensBibleProfile.class) |
| `badges` | Badges list (old app uses teensBible.badges) |
| `loginDay` | Login reward day counter |
| `loginRewardClaimed` | Login reward claimed today |
| `dailyMissionDone` | Daily mission completed |
| `equippedPet/Frame/Theme` | Equipped store items |
| `ownedPets/Frames/Themes` | Owned store items |
| `totalQuizzes` | Quiz count |
| `correctQuizzes` | Correct quiz count |
| `bestQuizStreak` | Best quiz streak |
| `fastestQuiz` | Fastest quiz time |
| `booksQuizzed` | Books quizzed |
| `invitesAccepted` | Invites accepted count |
| `notifSettings` | Notification settings JSON |
| `ttsRate` | TTS speed |
| `memeReactions/memeReactionCounts` | Meme reaction data |

## CRITICAL MIGRATION NEEDED
1. `teensBibleProfile.class` → `className`
2. `teensBible.badges` → `badges`
3. `defaultSpeed` → `ttsRate`
4. `notifEnabled` + `reminderTime` → `notifSettings`
5. `myMemeReactions` → `memeReactions`
6. `bibleBookmarks` → preserve for future use
7. `bibleHighlights` → preserve for future use
8. `usedCodes` → preserve for future use
