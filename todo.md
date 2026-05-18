
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
