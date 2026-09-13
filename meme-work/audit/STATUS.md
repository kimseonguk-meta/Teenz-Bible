# Meme audit — PAUSED 2026-09-13 11:06 (user asked for challenge roster update first)

## Status
- Contact sheets reviewed: all 9 (106 memes)
- Base images generated: 4/16 in meme-work/audit/new/ (r1 dog-bible, r2 run-church, r3 cat-lion, r4 kind-server)
- Remaining to generate: r5–r16 (12 images, batches of 4)
- Then: PIL caption overlay → replace 16 files → build → deploy → verify → commit/push

## Flagged for replacement (16)
| file | reason |
|---|---|
| meme_030.jpg | Pornhub-logo parody "Bible Study" shirt |
| meme_037.jpg | incest implication (Adam/Eve's sons populated world) |
| meme_042.jpg | hazing/gross (drink soda through friend's sock) |
| meme_043.jpg | churchgoers "verbally assaulting an 18yo waitress" |
| meme_046.jpeg | God giving Nick "childhood trauma" |
| meme_052.jpg | Abraham/Isaac sacrifice as "just a prank" |
| meme_058.jpg | nude woman in wheat field |
| meme_061.jpg | Eve suggestive apple-biting innuendo |
| meme_062.png | God giving Steve "a tumor" |
| meme_073.jpg | masked profanity "OH @#%&" + OMG (Jonah) |
| meme_081.jpeg | "loneliness will last for all eternity" (depression-adjacent) |
| meme_083.jpg | "God who put the World on Autopilot" (God doesn't care) |
| meme_085.jpg | "What the hell is this?" profanity (Noah cartoon) |
| meme_098.jpg | duplicate of 043 (waitress assault) |
| meme_099.jpg | contains the ORIGINAL tattooed-mothers meme |
| meme_102.jpeg | duplicate of 052 (prank sacrifice) |

## Borderline — DELETED per user instruction 2026-09-13 11:19
- meme_012.jpg, meme_078.jpg: "Jesus didn't actually walk on water" miracle-denial jokes — DELETED
- meme_020.jpg: R/CHRISTIANITY vs R/ATHEISM tribal warfare meme — DELETED
- meme_057.jpg: classical Adam/Eve painting with nudity — DELETED
Removed from memeUrls array in client/src/pages/Home.tsx (102 entries now). Do NOT regenerate r17–r20 bases sitting in new/ — user said delete, not replace. Committed 260f7f1.

## Replacement concepts (r1–r16) with captions
- r1→030: dog head-tilt at Bible / "WHEN THE VERSE YOU JUST READ" / "STARTS DESCRIBING YOUR WHOLE LIFE"
- r2→037: kid sprinting to church / "ME RUNNING TO YOUTH GROUP" / "LIKE THEY'RE GIVING OUT FREE CHICKEN"
- r3→042: cat in lion costume / "DANIEL IN THE LIONS' DEN" / "THE LIONS: 'HE GIVES TOO MANY BELLY RUBS'"
- r4→043: barista + teen / "BE KIND TO YOUR SERVER" / "THEY'RE SOMEBODY'S ANSWERED PRAYER TOO"
- r5→046: sleepy owl + coffee sunrise / "PRAYED FOR PATIENCE" / "GOD GAVE ME A LITTLE BROTHER"
- r6→052: two friends sunset / "JONATHAN AND DAVID" / "THE ORIGINAL BEST FRIENDS"
- r7→058: sunrise mountains + coffee / "'THIS IS THE DAY THE LORD HAS MADE'" / "ME: *ACTUALLY REJOICING FOR ONCE*"
- r8→061: frog with leaf umbrella / "NOAH SAID TWO OF EVERY ANIMAL" / "HE DIDN'T SAY ANYTHING ABOUT UMBRELLAS"
- r9→062: T-Rex reaching for Bible on shelf / "WANT TO HIGHLIGHT MY BIBLE" / "ARMS TOO SHORT. FAITH STILL STRONG."
- r10→073: cheerful whale spouting / "JONAH: 'I'M NOT GOING TO NINEVEH'" / "THE WHALE: 'BET.'"
- r11→081: warm hug sunrise / "FEELING LONELY?" / "'I AM WITH YOU ALWAYS' — MATT 28:20"
- r12→083: farmer planting seeds / "GOD'S NOT ON AUTOPILOT" / "HE'S IN THE FIELD WITH YOU"
- r13→085: Noah's ark animals lining up cheerful / "NOAH'S BOARDING CALL" / "EVERYONE HAS A TICKET. NO EXCEPTIONS."
- r14→098: teens laughing at lunch table / "SUNDAY LUNCH WITH THE YOUTH GROUP" / "THE FELLOWSHIP IS THE DESSERT"
- r15→099: cat sleeping on open Bible / "FELL ASLEEP READING AGAIN" / "THE WORD STILL COUNTS. GRACE COVERS NAPS."
- r16→102: kids building pillow fort laughing / "ABRAHAM TRUSTED GOD" / "AND GOD PROVIDED. EVERY. SINGLE. TIME."

## PIL overlay script pattern (reuse from meme_045_new.jpg build)
meme-work/audit/new/*.jpg base → overlay top/bottom Impact-style white text w/ black stroke → save with original filename+ext into client/public/memes/
