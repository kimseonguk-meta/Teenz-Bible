
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
- [x] Add reading progress bar for each Bible book in the book list view

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
- [x] Set up Android platform (capacitor add android) — already configured
- [x] Configure Android project (icons, package name, signing) — keystore generated, icons set
- [x] Build iOS zip (Build 13 final)
- [x] Build Android project zip for Google Play Store — requires Android SDK (use Android Studio locally to run gradlew assembleRelease)

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
- [x] Fix Bible AI 'temporarily unavailable' error - switch to server-side invokeLLM (Manus Forge API primary, Gemini fallback)
- [x] Ensure native app (Android/iOS) also uses server proxy via Manus hosting (teenzbible.manus.space)

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

## Store Pet Search & Hover Effects (Jun 11, 2026)
- [x] Add pet name search input at top of Pets tab
- [x] Add smooth scale-up hover effect on pet cards (already implemented with hover:scale-105)

## Bug Fixes — Galaxy Phone (Jun 12, 2026)
- [x] Fix Bible Map location popup not closing (X button causes popup to glitch back open)
- [x] Hide FloatingPet when modal/popup is open (pet overlaps popup content and X button)

## Bug Fix — Leaderboard Infinite Loading (Jun 12, 2026)
- [x] Fix Leaderboard page stuck on "Loading..." (reported by Apple app user CafePilo)

## Capgo Live Update (OTA) Integration (Jun 12, 2026)
- [x] Install @capgo/capacitor-updater plugin
- [x] Configure capacitor.config.ts for Capgo
- [x] Initialize Capgo app via CLI
- [x] Upload first bundle to Capgo
- [x] Create deploy script for future OTA updates
- [x] Document new deployment workflow

## Bug Fixes — Build 44 OTA (Jun 12, 2026)
- [x] Remove font size indicator toast ("Font: 28px" box) when changing font size in Bible reader
- [x] Change share link to App Store URL (https://apps.apple.com/sg/app/teenz-bible/id6769426651) when running as native iOS app instead of PWA link

## Bible Reading Page Redesign — Option A: Minimal Reader (Jun 14, 2026)
- [x] Remove top toolbar icons (6 large buttons) from header area
- [x] Remove cross icon and diamond decorations from header
- [x] Simplify header to: ← Back (left) + page indicator (right)
- [x] Keep chapter title (MATTHEW 1) and subtitle centered below header
- [x] Add bottom floating toolbar bar with tools (language, font size, audio, theme, verse toggle)
- [x] Maximize reading card area for better content focus

## Korean Bible Translation Audit & Fix (Jun 14, 2026)
- [x] Fix **bold** markdown showing as raw text (141 → 0)
- [x] Fix internet slang ㅇㅇ, ㄱㄱ, 갑분싸 (76 → 0)
- [x] Translate English § section markers to Korean (249 → 0)
- [x] Replace vulgar expressions: 빡치, 오지게, 막장, 개- prefix (161 → 0)
- [x] Remove embedded verse numbers from paragraph text (159 → 0)
- [x] Replace 쌤 → 선생님 (130 → 0)
- [x] Replace 미친 → 엄청나게/말도 안 되는 짓 (59 → 0)
- [x] Reduce 대박 frequency (516 → 166)
- [x] Reduce 전설급 frequency (198 → 45)
- [x] Deploy Korean translation fixes to Firebase + Capgo OTA (v1.0.4)
- [x] Convert Jesus's speech from 반말 to 존댓말 (111 chapters in 5 books: Matthew, Mark, Luke, John, Revelation)
- [x] Fix duplicate verse numbers in paragraph text (1030 paragraphs fixed)
- [x] Deploy Jesus 존댓말 + verse number fix to Firebase + Capgo OTA (v1.0.8)

## English Bible Re-translation (Jun 15, 2026)
- [x] Re-translate 23 summarized chapters from The Message Bible into proper teen-friendly English
- [x] Mark: chapters 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
- [x] Matthew: chapters 6, 7, 8, 9, 10, 12, 13, 19
- [x] 2 Kings 9 (data missing), 3 John 1, Song of Solomon 6, John 3, Luke 12
- [x] Deploy re-translated chapters to Firebase + Capgo OTA (v1.0.9)

## Korean Bible Re-translation (Summarized Chapters) - Jun 15, 2026
- [x] Re-translate 12 summarized Korean chapters from English full version
- [x] Isaiah 14, Revelation 8, Acts 7, Acts 10, Proverbs 27, Ezekiel 17, Jeremiah 44
- [x] Mark 6, 7, 10, 11, 13
- [x] Deploy Korean re-translation to Firebase + Capgo OTA (v1.0.10)

## Group System Feature (Jun 15, 2026)
- [x] Group CRUD: create group (name + auto-generated code), join via code, leave group
- [x] Group admin powers: rename group, remove members
- [x] Multi-group support: one user can belong to multiple groups
- [x] Nasum Teenz classes treated as pre-built groups
- [x] Update onboarding: Nasum Teenz / Group Code / Skip options
- [x] Ranking tab: [My Groups] + [Global] sub-tabs
- [x] Group management UI in Profile/Settings (create, join, view members)
- [x] Preserve all existing user data (XP, gems, streak, chaptersRead, etc.)

## Bug Fix — Group Manager Modal (Jun 15, 2026)
- [x] Fix: Group Manager modal buttons cut off by bottom nav bar on mobile

## Group Join UX Redesign (Jun 15, 2026)
- [x] Remove invite code system from Join Group flow
- [x] Join Group shows dropdown list of all available groups from Firebase
- [x] Nasum Teenz always appears as pre-built group in the list
- [x] Newly created groups automatically appear in the dropdown

## Ranking Tab Redesign for Group System (Jun 15, 2026)
- [x] Add "My Groups" / "Global" tab switcher at top of Ranking page
- [x] My Groups tab: show dropdown of joined groups, display group-specific ranking
- [x] Global tab: show all users across all groups (existing behavior)
- [x] Replace class badge (11C, 13B) with group name badge for non-Nasum groups

## In-App Feedback Page for Google Play Review (Jun 15, 2026)
- [x] Create /feedback route with professional feedback submission form
- [x] Store feedback in Firebase (feedbacks node)
- [x] Show public feedback log with timestamps and categories
- [x] Add developer response capability (admin can reply to feedback)
- [x] Add feedback link in app navigation (Profile/Settings)
- [x] Deploy to Firebase Hosting

## V2 UI Redesign — Clash Royale Premium Style (Jun 15, 2026)
- [x] CSS theme system: dark purple (#1a0a2e) diamond quilted background, gold metallic variables
- [x] Bottom Navigation: 5-tab metallic bar (Home, Bible, Ranking, Store, Profile) with active glow
- [x] Home dashboard redesign: gold ribbon banner, XP/gems pills, streak card, quest cards, pet display
- [x] Bible book selection: 3-column grid, progress bars, locked/unlocked states, Old/New Testament tabs
- [x] Bible reading page: cream/ivory parchment reading area, dark brown text, minimal game UI header/footer
- [x] Ranking page: gold/silver/bronze podium with circular photo frames, real user photos, group tabs
- [x] Quiz page: question card with gold border, 4 answer buttons, correct/wrong feedback, XP reward
- [x] Store/Pet page: featured pet banner, 2-column pet grid, accessories section, gem balance
- [x] Profile page: avatar frame, level badge, stats grid, settings menu with gold accents
- [x] Onboarding: TB shield logo, nickname input, group selection buttons, START ADVENTURE CTA
- [x] Feedback page: category pills, form fields, device info, recent feedback list
- [x] Deploy V2 redesign to Firebase Hosting (Capgo OTA requires API key login - will deploy with next native build)

## V2 Pixel-Perfect Rebuild (Jun 16, 2026)
- [x] Generate illustrated nav icons: castle, bible book, trophy, treasure chest, shield with face
- [x] Generate quick action icons: brain, candle, people group (gold-ringed circles)
- [x] Generate 3D gold ribbon banner image for "Welcome Back!"
- [x] Rebuild stat pills with thick 4-5px 3D beveled gold borders + illustrated icons
- [x] Rebuild Today's Mission card: thick gold frame, corner ornaments
- [x] Make progress bar much thicker with 3D metallic gold gradient
- [x] Change CTA button to PURPLE with gold text
- [x] Replace emoji icons with generated illustrated assets
- [x] Rebuild bottom nav with illustrated icon images + dark charcoal tab backgrounds
- [x] Make diamond quilted background subtle
- [x] Add proper depth/shadows throughout for 3D quality

## V2 CDN URL Fix (Jun 16, 2026)
- [x] Replace all /manus-storage/ paths with direct CDN URLs in AppLayout.tsx (bottom nav icons)
- [x] Replace all /manus-storage/ paths with direct CDN URLs in Home.tsx (stat icons, ribbon, quick actions)
- [x] Generate missing icon assets (fire, gem, XP, brain, candle, friends)
- [x] Verify zero /manus-storage/ references remain in client code
- [x] Save checkpoint and deploy to Firebase

## V2 Full Image-Based UI Redesign (Jun 16, 2026)
- [x] Generate bottom nav icons (castle, bible book, trophy, treasure chest, shield+boy face)
- [x] Generate gold ribbon banners (Welcome Back, BIBLE, RANKING, STORE, PROFILE, DAILY QUIZ)
- [x] Generate Home assets (stat pill frames with icons, mission card gold frame, quick action circle icons)
- [x] Generate Bible page assets (unlocked book card with gold frame, locked book card with silver frame, progress bar)
- [x] Generate Ranking assets (gold/silver/bronze trophy podiums, hexagonal rank badges)
- [x] Generate Store assets (featured pet gold frame, pet card frames, accessory circle icons)
- [x] Generate Profile assets (gold oval avatar frame, achievement hexagon badges, settings circle icons)
- [x] Generate Quiz assets (question card ornate frame, answer button gold frames, XP/gem reward icons)
- [x] Generate Onboarding assets (TB shield logo, gold input frame, gold button frame, START ADVENTURE button)
- [x] Upload all assets to CDN
- [x] Rebuild AppLayout bottom nav with image assets
- [x] Rebuild Home page with image assets
- [x] Rebuild Bible page with image assets
- [x] Rebuild Ranking page with image assets
- [x] Rebuild Store page with image assets
- [x] Rebuild Profile page with image assets
- [x] Rebuild Quiz page with image assets
- [x] Rebuild Bible Reader page with parchment style
- [x] Rebuild Onboarding page with image assets
- [x] Test all pages and deploy

## Firebase-Only Deployment Fix (Jun 16, 2026)
- [x] Copy all generated PNG assets to dist/public/assets/ for Firebase deploy
- [x] Update all /manus-storage/ paths in source code to /assets/ paths
- [x] Build and redeploy to Firebase Hosting
- [x] Deploy to Capgo OTA with API key (v1.0.11)
- [x] Verify all images load correctly on Firebase

## V3 CSS-Only Redesign - Duolingo/Flat Style (Jun 16, 2026)
- [ ] Define new design system (colors, typography, component patterns)
- [ ] Rebuild AppLayout bottom nav with CSS-only colorful icons
- [ ] Rebuild Home page (flat colorful gamification, no image dependencies)
- [ ] Rebuild Bible page with colorful book cards
- [ ] Rebuild Leaderboard with CSS podium
- [ ] Rebuild Store with colorful pet cards
- [ ] Rebuild Profile page
- [ ] Build and deploy to Firebase + Capgo
