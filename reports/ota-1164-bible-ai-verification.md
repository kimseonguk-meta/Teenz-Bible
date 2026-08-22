# OTA 1.1.164 Bible AI verification

Firebase Hosting now points to `runtime-fixes-1.1.164.js` and `assets/index-GemFix1164.js`. The OTA manifest reports version 1.1.164 with checksum `2989cb9e4e0c9a797600368403c8a9ab2ae1dbbf3c225ccfc7800aea77e55ad1` and size 52,923,652 bytes.

The live Bible AI route `/bible-ai?ota=1.1.164-final-layout` loaded successfully after the initial loading state. The header is visible with the in-flow back button, Bible AI title, help subtitle, Threads and New Thread actions. The large list of suggested questions is present, the helper message is visible, the lower recommended-question strip and microphone/input/send controls are present, and no Reveal Thy Visage or ProfilePhotoPrompt text appears.

Static checks passed for `node --check app/assets/BibleAI-GemFix1164.js` and `node --check app/runtime-fixes-1.1.164.js`. The runtime no longer calls `removePageHeader(aiHeader)`, the old fixed back-button class is absent, and the compact body, answer-width, and horizontally scrollable quick-question styles are present.

Live DOM measurement at the 480px app viewport shows a visible 65px header from y=2–67, a 444px scrollable message area from y=499–943, a 62px horizontal quick-question strip from y=943–1005, and a 95px input area from y=1005–1100. These sections are separate and do not overlap; the header is no longer collapsed to zero height.

A suggested question button was clicked successfully. The user question appeared in the conversation and the UI transitioned to Thinking, then displayed the existing graceful fallback message that Bible AI was temporarily unavailable. This confirms the redesigned click/submit path still executes; the fallback is an API availability response rather than a layout exception.

Regression checks on 1.1.164 passed in the sandbox: Home shows the Google/Apple backup card, the Bible AI card, the Original Leather surfaces, and no profile-photo prompt. Store shows only My Items, Reader, Frames, and Pets; Themes remains absent.

The Bible regression check loaded all book groups through Malachi, and clicking Genesis opened its overview with chapters 1–50. No Error Boundary or loading failure appeared.
