# Modal and overlay audit — 2026-08-21

## Scope

The audit covers Home, Bible, Bible AI, Bible Map, Ranking, Gem Store, Onboarding, and Profile in the Firebase Hosting runtime.

## Shared overlay markers found in runtime/CSS

The common runtime includes explicit handling for crew/ranking overlays, Profile photo overlay selectors (`Profile.tsx:907` and `Profile.tsx:914`), secure account deletion, safety report dialogs, and Bible AI action popovers. The CSS includes several historical modal viewport rules, the Profile photo modal isolation class, and guarded delete/report dialogs.

## Profile 1.1.172 live verification

On Profile entry, the live DOM reported runtime version `1.1.172`, no `Profile.tsx:907` overlay, no `Profile.tsx:914` dialog, no `tb-photo-modal-open` body class, zero hidden Profile children, and no Profile root filter. After an intentional avatar click, the `Change Profile Photo` sheet appeared with `Take Photo`, `Choose from Gallery`, and avatar options. The sheet measured within the app shell and was closed successfully with Cancel.

## Current audit status

The remaining tabs still require interaction checks for orphan overlays, backdrop blur, dialog bounds, and close behavior. The Profile photo fix is implemented in the shared runtime and therefore applies to both Firebase web/PWA and iOS OTA sessions that load the runtime.

## Live tab checks so far

Home at 1.1.172 showed the expected anonymous Google/Apple backup card, Bible AI card, meme controls, and bottom navigation. The DOM scan found only the intended floating pet and bottom navigation as fixed elements; no modal or full-screen blur overlay was present.

The first direct navigation to `/bible` and `/bible/genesis` showed the existing Error Boundary once. Clicking `Reload App` recovered both the Bible list and Genesis detail, which indicates a transient lazy-loading/startup race rather than a modal overlay. This remains a separate regression to monitor during the remaining tab audit.
