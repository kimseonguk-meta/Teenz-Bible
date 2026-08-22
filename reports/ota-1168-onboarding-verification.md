# OTA 1.1.168 onboarding verification

Hosting deployment succeeded with manifest checksum `82c5e6e65068c98461731f377e3bea395a29e98f973f0eb076bb7468adcce884` and ZIP size 56,145,016 bytes.

Active core inspection found the real onboarding source in `client/src/components/Onboarding.tsx` markers. Step 3 select is `data-loc="client/src/components/Onboarding.tsx:558"`; JOIN is `:597`. The active core has no literal `년생`, because the optgroup labels are data-driven.

OTA 1.1.168 adds runtime normalization for any optgroup label matching `YYYY년생`, converting it to `Born in YYYY`, and changes the select placeholder to `-- Select Class --`. It adds compact mobile CSS: select height 50px, 13px horizontal padding, 14px font, compact wrapper spacing, JOIN minimum height 46px. JS syntax and checksum checks passed.

Live 1.1.168 onboarding was reproduced. Normal skip flow correctly completes as an individual user, so the class dropdown only appears on the Nasum Teenz member path in Step 2. A fresh Sandbox reset is in progress to test that path directly.

## OTA 1.1.169 correction

Live 1.1.168 Step 3 was reproduced on the actual `Nasum Teenz member` path. The select had the compact placeholder `-- Select Class --`, but its optgroups still contained `2010년생`, `2011년생`, `2012년생`, and `2013년생`. This showed that the normalizer was defined but never called by the live timer.

OTA 1.1.169 adds `normalizeOnboardingClassDropdown()` to the recurring direct UI timer at runtime line 1532. JavaScript syntax checks passed for the new runtime and active core. Firebase Hosting deployment completed successfully. Manifest: version `1.1.169`, checksum `42a1e34df333318190479db8749724179e6f75c7c8b294957c0758e5a942c04e`, size `56,951,032` bytes.

A live 1.1.169 runtime test inserted a select with the exact onboarding `data-loc` and Korean optgroup labels, waited for the recurring timer, and observed: `Born in 2010`, `Born in 2011`, `Born in 2012`. `englishOnly: true`.

The compact select is visible in the actual Step 3 screenshot with the `-- Select Class --` placeholder and reduced height. The real device Galaxy retest remains the final user confirmation.
