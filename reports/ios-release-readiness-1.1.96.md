# Teenz Bible iOS Release Readiness Review

**Review date:** 17 August 2026 (GMT+8)  
**Candidate web/OTA release:** 1.1.96  
**Native iOS project version:** 1.2.1 (build 5)  
**GitHub baseline:** `41b4990` on `main`

## Executive recommendation

> **Conditional no-go for App Store submission today.** The source code, hosted PWA, OTA package, and iOS configuration pass the static checks completed in this review. However, a new archive should not be uploaded until the short physical-iPad smoke test below passes. This is not an indication of a known defect; it is the final confirmation that native Google and Apple sign-in, real Firebase data writes, and the current device UI still work together in the release archive.

The one concrete release-preparation action discovered during the audit is important: the embedded Capacitor iOS `public` folder was still serving the prior web references until the current `web` folder was copied into it. The source project has now been copied successfully in this environment and the embedded index points to 1.1.96. The same Capacitor synchronization must be run on the Mac that will produce the Xcode archive, immediately before opening or archiving the project.

| Area | Current result | Release interpretation |
| --- | --- | --- |
| Live PWA | The hosted site loads `runtime-fixes-1.1.96.js` and `.css`. | Ready. |
| OTA package | `latest.json` points to 1.1.96; the ZIP checksum, recorded file size, ZIP integrity, and embedded 1.1.96 runtime all match. | Ready. |
| iOS embedded web bundle | The current `web` source was copied successfully into `ios/App/App/public`; that generated folder is ignored by Git. | Run the same sync on the release Mac before archive. |
| Apple sign-in | The App entitlement, nonce-based native plugin method, and callback setup are present. | Static pass; physical-device confirmation remains required. |
| Google sign-in | `GoogleService-Info.plist`, URL scheme, custom native bridge, and both app/scene callback handlers are present. | Static pass; physical-device confirmation remains required. |
| Cheer delivery | Firebase rules enforce sender identity, target UID, type, and numeric timestamp. The Profile inbox and one-time celebratory treatment are in OTA 1.1.96. | Real two-account confirmation remains required. |
| Bible AI and Ranking fixes | The latest runtime contains the compact composer, explicit Back control, ranking portal actions, and friendly error copy. | Mobile-device interaction confirmation remains required. |

## Checks completed in this review

The release candidate passed JavaScript syntax checks for both PWA and iOS web copies. The 1.1.96 ZIP was verified to be readable, to include the matching 1.1.96 index/runtime files, and to match the SHA-256 checksum and byte size published in the live OTA manifest. The project contains the custom `TeenzFirebaseAuthenticationPlugin.swift` source in the Xcode target, `GoogleService-Info.plist` in target resources, the Google callback URL scheme in `Info.plist`, and the Sign in with Apple entitlement.

The latest web source was copied to the native Capacitor `public` directory with the equivalent of the following command. This ensures a newly installed binary begins with the same 1.1.96 interface even before its first OTA check.

```bash
cd native-ios
pnpm exec cap sync ios
```

## Mandatory physical-iPad smoke test

Use a physical iPad, not the simulator. Install the Release candidate from Xcode or TestFlight, then complete the following sequence before uploading the archive. Record only **pass/fail** and a screenshot or screen recording for any failure.

| Test | Expected result | Why it is release-critical |
| --- | --- | --- |
| Clean launch | The app opens without a blank screen or crash; Home, Bible, Ranking, Store, and Profile can all be opened. | Confirms the embedded web bundle is valid in the real Capacitor shell. |
| Apple sign-in | Apple’s native sheet opens; completing login returns to Teenz Bible with the signed-in profile. | Confirms entitlement, nonce flow, and Firebase credential hand-off. |
| Google sign-in | Google’s native account picker opens; completing login returns to Teenz Bible with the signed-in profile. | Confirms GoogleService configuration and Scene/App URL callback handling. |
| Existing-account conflict | Using an already-linked social account shows the English account-conflict choice rather than a raw Firebase error or a stuck loading state. | Protects an important recovery path found during prior testing. |
| New-user Crew flow | With a clean/local test profile, complete onboarding, select the initial context, then create or join a Crew. Ranking should show the resulting Crew selection correctly. | This is the highest-risk first-session Firebase flow. |
| Ranking and Cheer | Open one member, close the modal, then open a second member. Send a Cheer to an eligible second account. The recipient opens Profile and sees the card, sender name, relative time, and one brief confetti treatment. | Confirms touch layers, Firebase rules, cross-account data delivery, and new UI together. |
| Cheer rate limit | Attempt a second Cheer to the same recipient. The app shows the friendly 24-hour message; it never displays a raw `401` or Firebase response. | Confirms the anti-spam rule and friendly failure handling. |
| Bible AI | Open Bible AI, use the fixed Back control, send one typed question, and test the microphone only if the iPad allows the permission. The compact composer must remain usable. | Confirms the mobile layout that previously had obstruction issues. |
| Restart / OTA behavior | Quit and reopen once. The app remains stable after the OTA bridge checks the public 1.1.96 manifest. | Confirms that the native updater does not destabilize the release candidate. |

## Xcode versioning and archive decision

The Xcode project currently declares **Marketing Version 1.2.1** and **Build 5**. The next uploaded archive must use a new build number, so set the build to **6** before archiving.

Keep Marketing Version at **1.2.1** only if the App Store Connect version currently being prepared is still 1.2.1. If 1.2.1 has already been released to the public, create the next App Store Connect version first and use **1.2.2** with build 6. Do not upload another archive with build 5.

## Final pre-submission housekeeping

After the device smoke test passes, archive using the workspace rather than the bare Xcode project if CocoaPods are involved. In App Store Connect, ensure the screenshots still represent the current app, the privacy policy URL is reachable, account deletion remains discoverable in Profile, and the reviewer can access the core experience without a private invitation or undocumented test credential. If Apple review requires authentication to inspect a specific path, include an active review account and exact steps in App Review Notes.

## Conclusion

There is no new source-code blocker found in this review. The release is **ready to build after the Mac-side Capacitor sync**, but it is not responsible to claim that every feature is confirmed until the physical-iPad smoke test passes. Once those checks are green, the appropriate next action is an archive with build 6, TestFlight installation, and then App Store submission.
