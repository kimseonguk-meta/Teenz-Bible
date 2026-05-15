
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
