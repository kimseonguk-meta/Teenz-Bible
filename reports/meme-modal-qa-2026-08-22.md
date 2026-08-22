# Meme modal QA notes — 2026-08-22

Source pages checked: `https://teens-bible-94271.web.app/?v=1188&audit=meme-layout` and local `http://localhost:4177/?audit=meme-final-1188`.

The live DOM places the meme detail overlay at `data-loc="client/src/pages/Home.tsx:566"`. The close button is an overlay sibling at `data-loc="client/src/pages/Home.tsx:567"`; the image host is `:568`; the action rail is `:571`; the inner Share/Save row is `:572`; Share is `:573`; Save is `:599`.

Before the final correction, the overlay used a 42px close column plus a 406px action rail, and the rail's two-column grid caused Share and Save to render as approximately 163px and 64px because the overlay and inner row selectors targeted different levels. The final 1.1.188 CSS puts the overlay itself in a three-column grid: 64px close, flexible Share, flexible Save, with 10px gaps. All three action controls are 44px high. The close button is a 64px layout column but retains a restrained glyph; Share and Save occupy the two equal flexible columns. A max-width 520px rule reduces the close column to 56px and gap to 8px for narrow phones.

The local package was rebuilt and served from `/tmp/teenz-ota-1188-final`. The 1.1.188 build script verified the stable `assets/index-GemFix1184.js`, rejected React 1185–1188 chunk names, and rejected the prohibited Loading DOM guard markers. The package was then deployed to Firebase Hosting. The browser page was later checked again after cache-busting; the live page loaded and exposed the expected meme card and action elements.

The browser session then moved to local first-run state while preparing the next profile-photo audit. This is test-state behavior, not a production code finding.

## OTA 1.1.190 — quiet close redesign

The user rejected the prominent three-column close/share/save rail. In 1.1.190, the close control remains the same React action at `Home.tsx:567`, but is visually demoted to a 32×32px transparent/subtle dark circular target positioned at the upper-right of the meme image. The glyph is rendered as a thin 16px `×`, with no gold border, no embossed panel, and `aria-label="Close meme"` plus `title="Close"` added by the runtime. The close control is no longer part of the bottom action row.

Share and Save remain the only bottom actions in a clean equal two-column row. Public browser verification after deployment reported runtime `1.1.190`, close `[830,300,32,32]`, image `[424,312,432,426]`, rail `[424,1032,432,56]`, Share `[424,1040,211,44]`, and Save `[645,1040,211,44]` at the 1280×1100 browser viewport. Both buttons use the same background, border, height, and width. Clicking the close control was also verified to dismiss the modal. Profile crop isolation selectors and logic from 1.1.189 were retained.
