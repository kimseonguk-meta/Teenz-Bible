
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
- [ ] Enable Apple Auth provider in Firebase console
- [ ] Add Sign in with Apple button alongside Google login
- [ ] Draft Apple Review response for Guideline 2.1(b) business model
- [ ] Build and deploy to Firebase
