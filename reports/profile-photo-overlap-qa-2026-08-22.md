

## Reproduction and root cause

Public 1.1.189 Profile was opened and the avatar was clicked. `Choose from Gallery` was used with the supplied screenshot upload, which opened the crop dialog.

The crop dialog is React-owned at `Profile.tsx:1141` (overlay) and `Profile.tsx:1142` (panel), while the photo-choice sheet is at `Profile.tsx:907` and `Profile.tsx:914`. The existing runtime only selected 907/914, so it never applied its isolation and layout corrections to the crop dialog. Before the new fix, the crop overlay had a 40px-tall bounding box at x=424/y=211 despite `position:fixed; z-index:9999`; the This Week card at `Profile.tsx:1283` remained hit-testable and visually in front.

The crop overlay's parent is the relative zero-size host `Profile.tsx:903`, nested inside the Profile page stacking context. A non-destructive browser test showed the stable strategy is to make this host the app-shell-sized fixed layer, put the crop overlay inside it as an absolute full-layer element, and keep the crop panel as a centered relative child. Background Profile surfaces received `tb-photo-modal-background-hidden` and became visibility hidden/opacity 0/pointer-events none when the modal-open body class was set.

In the temporary test the desired shell geometry was x=400, width=480, y=0. The host approach must set the host's actual fixed position from the shell rect, rather than relying on the old child-level fixed offset calculations. The test also showed that the prior runtime's direct child coordinate logic can leave the crop panel off-center; the new version must branch for crop locs 1141/1142 and avoid the old `photoDialog` left arithmetic for that branch.


## Final public verification after 1.1.189 redeploy

The public runtime reported `1.1.189`. After avatar → Choose from Gallery → upload, the crop state reported `body.tb-photo-modal-open`. The crop host (`Profile.tsx:903`) measured x=400, y=0, width=480, height=1100, position fixed, z-index 2147483646. The crop overlay (`Profile.tsx:1141`) measured x=400, y=0, width=480, height=1100, position absolute, z-index 2147483646. The crop panel (`Profile.tsx:1142`) measured x=424, y=351, width=432, height=399, position relative, opacity 1 and visibility visible. The This Week surface (`Profile.tsx:1283`) and Recent Badges surface (`Profile.tsx:1333`) were visibility hidden, opacity 0, and non-interactive. Hit testing at the app center returned the crop overlay and at the viewport center returned an element inside the crop overlay, confirming the profile cards no longer sit in front of the crop UI.
