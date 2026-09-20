#!/usr/bin/env python3
"""
Ensure GoogleService-Info.plist is bundled with the iOS app.

Why this exists
--------------
FirebaseApp.configure() crashes on launch (black screen) when
GoogleService-Info.plist is missing from the app bundle. `cap add ios`
generates a fresh Xcode project that knows nothing about this file, and
`--clean` rebuilds delete any manual Xcode-side fix. So bootstrap must
install + register the file every time, or fail loudly instead of
producing a black-screen app.

What it does (idempotent - safe to run repeatedly)
-------------------------------------------------
1. Requires ios-release/GoogleService-Info.plist to exist (local-only file,
   gitignored, downloaded once from Firebase Console). Missing -> exit 1
   with instructions. Never silently continue.
2. Copies it to ios/App/App/GoogleService-Info.plist.
3. Registers it in project.pbxproj if not already there:
   PBXFileReference + PBXBuildFile + App group child + Resources phase.
   If Xcode already registered it (e.g. manual Add Files), does nothing.

Run from the repo root:  python3 ios-release/scripts/ensure-firebase-plist.py
"""
import os
import re
import secrets
import shutil
import sys

REPO = os.getcwd()
PLIST = "GoogleService-Info.plist"
SRC = os.path.join(REPO, "ios-release", PLIST)
DEST_DIR = os.path.join(REPO, "ios-release", "ios", "App", "App")
DEST = os.path.join(DEST_DIR, PLIST)
PBXPROJ = os.path.join(
    REPO, "ios-release", "ios", "App", "App.xcodeproj", "project.pbxproj"
)


def fail(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def new_id(used):
    while True:
        cand = secrets.token_hex(12).upper()  # 24-char uppercase hex, Xcode style
        if cand not in used:
            return cand


def main():
    if not os.path.isfile(SRC):
        fail(
            "ios-release/GoogleService-Info.plist not found.\n"
            "Download it from Firebase Console (project teens-bible-94271 >\n"
            "Project settings > iOS app com.teenzbible.app > GoogleService-Info.plist)\n"
            "and save it as ios-release/GoogleService-Info.plist, then re-run.\n"
            "Refusing to build an app that would crash on launch."
        )
    if not os.path.isfile(PBXPROJ):
        fail(f"{PBXPROJ} not found. Run bootstrap-ios.sh first (cap add ios).")

    os.makedirs(DEST_DIR, exist_ok=True)
    shutil.copy2(SRC, DEST)
    print(f"Installed {PLIST} -> ios/App/App/{PLIST}")

    with open(PBXPROJ, "r", encoding="utf-8") as f:
        content = f.read()

    # Already registered (Xcode's own comment format for a resource build file)?
    if re.search(r"/\* " + re.escape(PLIST) + r" in Resources \*/", content):
        print(f"{PLIST} already registered in Xcode project. Nothing to do.")
        return

    used = set(re.findall(r"\b[0-9A-F]{24}\b", content))
    ref_id = new_id(used)
    used.add(ref_id)
    build_id = new_id(used)

    # 1. PBXFileReference entry, appended at end of its section.
    ref_entry = (
        f"\t\t{ref_id} /* {PLIST} */ = {{isa = PBXFileReference; "
        f"lastKnownFileType = text.plist.xml; path = {PLIST}; "
        f'sourceTree = "<group>"; }};\n'
    )
    m = re.search(r"/\* End PBXFileReference section \*/", content)
    if not m:
        fail("PBXFileReference section not found in project.pbxproj")
    content = content[: m.start()] + ref_entry + content[m.start() :]

    # 2. PBXBuildFile entry, appended at end of its section.
    build_entry = (
        f"\t\t{build_id} /* {PLIST} in Resources */ = {{isa = PBXBuildFile; "
        f"fileRef = {ref_id} /* {PLIST} */; }};\n"
    )
    m = re.search(r"/\* End PBXBuildFile section \*/", content)
    if not m:
        fail("PBXBuildFile section not found in project.pbxproj")
    content = content[: m.start()] + build_entry + content[m.start() :]

    # 3. Add to the App group's children (the PBXGroup with path = App
    #    that contains AppDelegate.swift - structural match, no hardcoded IDs).
    gm = re.search(
        r"[0-9A-F]{24} /\* App \*/ = \{\s*isa = PBXGroup;\s*"
        r"children = \((.*?)\);\s*path = App;",
        content,
        re.DOTALL,
    )
    if not gm:
        fail("App PBXGroup not found in project.pbxproj")
    if "AppDelegate.swift" not in gm.group(1):
        fail("App PBXGroup does not contain AppDelegate.swift; refusing to edit")
    new_children = (
        gm.group(1).rstrip() + f"\n\t\t\t\t{ref_id} /* {PLIST} */,\n\t\t\t"
    )
    content = content[: gm.start(1)] + new_children + content[gm.end(1) :]

    # 4. Add to the Resources build phase's files.
    rm = re.search(
        r"isa = PBXResourcesBuildPhase;\s*buildActionMask = \d+;\s*files = \((.*?)\);",
        content,
        re.DOTALL,
    )
    if not rm:
        fail("PBXResourcesBuildPhase not found in project.pbxproj")
    new_files = (
        rm.group(1).rstrip()
        + f"\n\t\t\t\t{build_id} /* {PLIST} in Resources */,\n\t\t\t"
    )
    content = content[: rm.start(1)] + new_files + content[rm.end(1) :]

    # Verify before writing: entries present, braces balanced.
    for needle in (
        f"{ref_id} /* {PLIST} */ = {{isa = PBXFileReference",
        f"{build_id} /* {PLIST} in Resources */ = {{isa = PBXBuildFile",
    ):
        if needle not in content:
            fail("verification failed after edit; project.pbxproj left unchanged")
    if content.count("{") != content.count("}"):
        fail("brace imbalance after edit; project.pbxproj left unchanged")

    shutil.copy2(PBXPROJ, PBXPROJ + ".bak-coco")
    with open(PBXPROJ, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Registered {PLIST} in Xcode project (backup: project.pbxproj.bak-coco)")


if __name__ == "__main__":
    main()
