# OTA 1.1.166 Bible AI Meta-style layout verification

Firebase Hosting deployed `runtime-fixes-1.1.166.js`, `runtime-fixes-1.1.166.css`, and `assets/index-GemFix1166.js`. Manifest checksum is `f39ca4b9d52c388b4462dc91eae106d6a1662e9e43dd7116f849df103f467be6` and package size is 54,533,513 bytes.

The fresh Bible AI route `/bible-ai?ota=1.1.166-meta-layout-final` shows the revised first screen: a visible `NOT SURE WHERE TO BEGIN?` heading directly under the header, a short supporting sentence, exactly three stacked example questions (`Who is Jesus?`, `What are parables?`, `Why 4 Gospels?`), and a centered bottom composer within the 480px app shell. The previous large floating list of many questions is no longer shown on the first screen.

A first example question was clicked successfully. It appeared as a user message, the UI entered Thinking, and then displayed the existing graceful `Bible AI is temporarily unavailable` fallback. This confirms the selection interaction still works; the fallback is an API response state, not a layout exception.

Static checks passed for `node --check app/assets/BibleAI-GemFix1166.js` and `node --check app/runtime-fixes-1.1.166.js`. The runtime tracks `tb-ai-empty-screen`, the guide is inserted after the AI header, and the CSS centers the composer at `width:min(100vw,480px)` so the wide Sandbox preview matches the mobile app shell.
