# OTA 1.1.167 mobile polish verification

Firebase Hosting deployed `runtime-fixes-1.1.167.js`, `runtime-fixes-1.1.167.css`, and `assets/index-GemFix1167.js`. The manifest checksum is `ad2fa0ca12d0e70f81be213addb1d9eed67893631b32bda3be6243ea6359b0d1`; ZIP size is 55,339,059 bytes.

The fresh 1.1.167 first screen shows the large guide at the top, exactly three stacked example questions, and the centered fixed composer. The guide uses responsive `clamp()` typography and spacing; the choices use responsive height, padding, font size, and icon size. The composer uses responsive control sizes and remains inside the centered 480px app shell.

After clicking the first question, the guide disappears as intended, the question appears as a user bubble, and the input/composer remains fixed and proportionate. The existing graceful temporary-unavailable AI response appears after Thinking; this is an API response state, not a layout error. Three follow-up question buttons remain available in the conversation state.

The 1.1.167 CSS adds conversation-only guide hiding, responsive chat padding and gap, responsive answer typography, and responsive composer/button/input dimensions. Static JavaScript checks passed for the active Bible AI chunk and runtime.
