
## localStorage → Server DB Migration
- [x] Analyzed: Firebase already syncs all data. Real issue is anonymous auth losing UID on device change.
- [x] Solution: Added Google account linking instead of full DB migration (more efficient)

## Firebase Google Login + Account Linking
- [x] Enable Google Auth provider in Firebase console
- [x] Add Google sign-in and anonymous account linking logic (googleAuth.ts)
- [x] Add "Link Account" UI to Profile page (Account & Sync section)
- [x] Handle cross-device login and data restoration (credential conflict + data migration)
- [x] Test login flow (30 tests passing)

## Home Banner + Firebase Deploy
- [x] Add Google linking banner to Home page for unlinked users
- [x] Build and deploy to Firebase Hosting

## 3 Improvements (Round 2)
- [x] Gem economy balance: increase Mystery Box gem rewards (5~50 → 15~80), lower pet prices (220~300 → 120~220)
- [x] Chapter completion celebration animation: 40-piece confetti + popup with bounce
- [x] Bible AI chat history: already implemented (localStorage bibleAI_chatHistory + geminiHistory)

## Apple App Store Rejection Fix
- [x] Enable Apple Auth provider in Firebase console
- [x] Add Sign in with Apple button alongside Google login
- [x] Draft Apple Review response for Guideline 2.1(b) business model
- [x] Build and deploy to Firebase

## Old Testament Quizzes + Verse References
- [x] Generate Old Testament quizzes for all 929 chapters (English + Korean)
- [x] Add verse reference explanations to all quizzes (shown after answering)

## Quiz Improvements Phase 2
- [x] Verify OT quiz accuracy (sample key chapters)
- [x] Add verse text preview popup after quiz answer
- [x] Build quiz statistics tracking (localStorage-based with Firebase sync)
- [x] Build quiz statistics dashboard UI (accuracy rate, streaks, per-book breakdown, history)

## Profile Photo Improvements
- [x] Profile photo S3 upload and Firebase sync (cross-device)
- [x] Photo crop and filter UI before saving
- [x] Display profile photos on leaderboard

## Leaderboard & Profile Frame Improvements
- [x] Leaderboard mini profile card popup on member tap (photo, nickname, stats)
- [x] Store frame/badge applied to profile photo (purchasable frames overlay on photo)

## Profile Photo UX Fix
- [x] Remove the "Remove" button from profile photo section
- [x] Implement proper "Take Photo" (camera) option when tapping Change Photo

## Profile Photo Cloud Sync Improvements
- [x] Take Photo auto-upload to Firebase Storage (same as Gallery flow)
- [x] Profile photo auto-restore on new device login (Google/Apple sign-in downloads photo from Firebase Storage)

## UX Improvements
- [x] Add loading spinner during profile photo upload (camera/gallery)

## Profile Page Cleanup
- [x] Remove Language setting from Profile (already in Bible Reader)
- [x] Remove Font Size setting from Profile (already in Bible Reader)
- [x] Remove duplicate Leaderboard button from Profile (already in bottom nav as Ranking)

## Bible Reader Bug Fixes
- [x] Stop auto-advancing to next chapter after completion (let user take quiz first)
- [x] Add minimum reading time before marking chapter as read (prevent scroll-through cheating)

## Reading Progress Visualization
- [ ] Add reading progress bar for each Bible book in the book list view

## Apple Review Fix (May 2026)
- [x] Fix Apple Sign-in blank screen bug (Guideline 2.1a)
- [x] Remove redeem code feature from Store (Guideline 3.1.1 - IAP compliance)

## Apple Review Fix Round 2 (May 21, 2026)
- [x] Fix camera crash on iPad when taking profile photo (Guideline 2.1a - Performance)
- [x] Fix Sign in with Apple error message (Guideline 2.1a - App Completeness)

## Apple App Store Review Fixes — Build 9 (May 25, 2026)
- [x] Add account deletion feature (delete Firebase data + auth account)
- [x] Fix AI safety settings (BLOCK_NONE → BLOCK_MEDIUM_AND_ABOVE)
- [x] Move Gemini API calls to server-side endpoint (remove client-side API key exposure)
- [x] Add privacy policy link in Profile page Settings section
- [x] Add NSMicrophoneUsageDescription and NSSpeechRecognitionUsageDescription to Info.plist

## Bible Book Video Visibility Improvement
- [x] Redesign introduction video section to be more prominent and naturally visible

## TestFlight Build 12 Bug Fixes (May 28, 2026)
- [x] Bug Fix: TTS button clipped at top of screen on iOS (safe area padding)
- [x] Bug Fix: YouTube error 153 - videos won't play in WKWebView iframe (must play in-app)
- [x] Bug Fix: Bible AI "temporarily unavailable" error on iOS device
- [x] Build 13: Rebuild, clean, and prepare iOS zip

## YouTube Fix + Android Build (May 28, 2026)
- [x] Install @capgo/capacitor-youtube-player plugin
- [x] Replace YouTube iframe embed with native plugin in Bible.tsx
- [x] Configure patchRefererHeader in capacitor.config.ts
- [ ] Set up Android platform (capacitor add android)
- [ ] Configure Android project (icons, package name, signing)
- [x] Build iOS zip (Build 13 final)
- [ ] Build Android project zip for Google Play Store

## Build 14 Fixes (May 28, 2026)
- [x] YouTube error 152-4 fixed: replaced @capgo/capacitor-youtube-player with @capacitor/browser In-App Browser (SFSafariViewController)
- [x] Bible AI "temporarily unavailable" fixed: updated model priority to gemini-2.5-flash-lite → gemini-3.1-flash-lite → gemini-3-flash-preview (higher free tier quotas)
- [x] Improved Gemini error handling: proper 429 detection, console warnings, model skip on any error
- [x] Removed manus debug scripts from iOS bundle
- [x] Build 14 zip created and delivered

## Nickname Edit Feature (Jun 4, 2026)
- [x] Add nickname/display name edit on Profile page (tap name to change)
- [x] Duplicate nickname check within same class group
- [x] Sync nickname change to Firebase leaderboard

## Bible AI Fix (Jun 4, 2026)
- [ ] Fix Bible AI 'temporarily unavailable' error - switch to server-side invokeLLM
- [ ] Ensure native app (Android/iOS) also uses server proxy via Manus hosting

## Build 23 — Apple Sign-In Fix + Single Provider UI (Jun 8, 2026)
- [x] Rewrite appleAuth.ts: get credential once, reuse in conflict handler (no double Apple popup)
- [x] skipNativeAuth: true confirmed in capacitor.config.ts
- [x] Profile UI: show only ONE linked account (last sign-in provider) using teensBibleLastSignInProvider localStorage key
- [x] Fix Package.swift paths (relative paths for ZIP)
- [x] Bump build number to 23
- [x] Package and deliver Build 23 ZIP

## Build 34 Bug Fixes (Jun 9, 2026)
- [x] Fix Home screen auth state not updating after Apple Sign-In (banner stays after successful login)
- [x] Fix Meme save failing ("Could not save meme" error)
- [x] Fix Meme share to use native iOS Share Sheet instead of clipboard copy

## Build 35 Bug Fix (Jun 9, 2026)
- [x] Fix font size A+/A- buttons becoming unresponsive when audio player bar is active in Bible reader

## Build 36 Bug Fix (Jun 9, 2026)
- [x] Fix Meme Save button to directly save to Photos instead of opening Share Sheet (same as Share)
- [x] Fix font size A+/A- buttons completely unresponsive (regardless of TTS state) - find real root cause (FloatingPet z-[100] overlapping)

## Build 37 Bug Fix (Jun 9, 2026)
- [x] Fix font size A+/A- buttons in Bible reader - FloatingPet hidden on /bible page (was capturing touch events)
- [x] Fix Meme Save button - created SaveToPhotos as proper SPM package (was in App target, not auto-discovered)
- [x] Fix Invite Friends button - uses @capacitor/share plugin for native iOS Share Sheet

## Bible Map UX Improvements (Jun 11, 2026)
- [x] Add grid/icon view (3-column) as default for intuitive browsing
- [x] Add list/grid view toggle button
- [x] Replace inline detail expansion with modal popup overlay (preserves scroll position)
- [x] Modal includes photo, description, verse links, and "Show on Map" button

## Pet System & UX Improvements (Jun 11, 2026)

- [x] Pet #1: Bible page peek mode - pet peeks from right edge with messages
- [x] Pet #2: Scroll speed reaction - too fast / idle detection
- [x] Pet #3: Text blocking prank - pet sits on text, tap to move
- [x] Pet #4: Swipe petting gesture - swipe on pet to pet it
- [x] Pet #5: Expression animation - multiple face states (normal, excited, sleepy, love, angry, peek, dance)
- [x] Pet #6: Sulking when absent 24h+ - angry expression for 8 seconds
- [x] Pet #7: Celebration dance on chapter complete
- [x] Pet #8: Quiz result reactions (correct/wrong)
- [x] UX #9: Reading progress bar at top of chapter
- [x] UX #11: Haptic feedback (navigator.vibrate) on quiz correct
- [x] UX #13: Next chapter prompt after quiz completion
- [x] UX #14: Weekly leaderboard as default + resets every Monday message

## Pet Character Redesign — All 14 Pets in Modern KakaoTalk Style (Jun 11, 2026)
- [x] Generate 14 pet normal/default sprites (cat, puppy, lamb, lion, owl, dove, eagle, fox, bear, bunny, whale, butterfly, dragon, unicorn)
- [x] Generate 7 additional expressions per pet (excited, sleepy, love, angry, dance, peek, cool) = 98 images
- [x] Upload all 112 sprites as webdev static assets
- [x] Create pet sprite mapping module (petSprites.ts)
- [x] Update FloatingPet.tsx to use character images instead of emoji
- [x] Update Store pet cards to show new character images
- [x] Deploy to Firebase Hosting

## Pet Interaction & Animation Improvements (Jun 11, 2026)
- [x] Click floating pet → random expression change + short greeting speech bubble
- [x] Fade in/out animation when pet expression changes (smooth transition, no flicker)

## Store Pet UX Improvements (Jun 11, 2026)
- [x] Skeleton UI while pet images are loading in Store
- [x] Sort/filter pets by price and rarity tier
- [x] Pet detail popup with description and stats on image click
