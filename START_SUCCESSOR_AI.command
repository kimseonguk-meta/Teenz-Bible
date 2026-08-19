#!/bin/bash
# Teenz Bible successor-AI bootstrapper for macOS.
# Double-click this file after downloading the GitHub repository, or run it in Terminal.
# It never deletes or resets an existing dirty working directory.

set -Eeuo pipefail

REPOSITORY_URL="https://github.com/kimseonguk-meta/Teenz-Bible.git"
DEFAULT_TARGET="$HOME/Teenz-Bible"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

say_error() {
  printf '\nERROR: %s\n' "$1" >&2
  printf 'No files were deleted. Fix the issue and run this script again.\n' >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || say_error "Required command is missing: $1"
}

require_command git

printf '\n=== Teenz Bible successor-AI setup ===\n\n'

# If the script is being run from a cloned repository, keep that exact folder.
if [ -d "$SCRIPT_DIR/.git" ]; then
  TARGET="$SCRIPT_DIR"
  printf 'Using the repository containing this script:\n%s\n\n' "$TARGET"
else
  TARGET="$DEFAULT_TARGET"
  printf 'This script is outside a Git repository.\n'
  printf 'Target clone folder: %s\n\n' "$TARGET"
fi

if [ -d "$TARGET/.git" ]; then
  cd "$TARGET"

  # Do not overwrite local work. This is intentional because the old recovered
  # working folder can contain thousands of historical artifacts.
  if [ -n "$(git status --porcelain)" ]; then
    say_error "The target repository has local changes. Do not use it as the successor baseline. Create a fresh clone instead, for example: git clone $REPOSITORY_URL \"$HOME/Teenz-Bible-clean\""
  fi

  git fetch origin main --quiet
  git switch main --quiet
  git pull --ff-only origin main
else
  if [ -e "$TARGET" ]; then
    say_error "The target path already exists but is not a Git repository: $TARGET"
  fi

  git clone "$REPOSITORY_URL" "$TARGET"
  cd "$TARGET"
fi

MASTER="docs/TEENZ_BIBLE_MASTER_HANDOFF.md"
for required_file in \
  "$MASTER" \
  "docs/AI_FINAL_SUMMARY.md" \
  "docs/AI_CONTINUITY_GUIDE.md" \
  "docs/ENVIRONMENT.md" \
  "docs/NEW_DEVELOPER_CHECKLIST.md" \
  "docs/NEXT_AI_TROUBLESHOOTING.md" \
  "docs/META_AI_PROJECT_HATCH_CONVERSATIONAL_PROMPT.txt" \
  "app/ota/latest.json" \
  "firebase.json" \
  ".firebaserc"; do
  [ -f "$required_file" ] || say_error "Required handoff file is missing: $required_file"
done

CURRENT_COMMIT="$(git log -1 --format='%h %s')"
FIREBASE_PROJECT="$(sed -n 's/.*"default"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' .firebaserc | head -n 1)"
OTA_VERSION="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' app/ota/latest.json | head -n 1)"

PROMPT_DIR="$HOME/Documents"
[ -d "$PROMPT_DIR" ] || PROMPT_DIR="$HOME"
mkdir -p "$PROMPT_DIR"
PROMPT_FILE="$PROMPT_DIR/Teenz_Bible_Next_AI_Prompt.txt"
cp "docs/META_AI_PROJECT_HATCH_CONVERSATIONAL_PROMPT.txt" "$PROMPT_FILE"

if command -v pbcopy >/dev/null 2>&1; then
  pbcopy < "$PROMPT_FILE"
  CLIPBOARD_NOTE="The successor-AI prompt has also been copied to your clipboard."
else
  CLIPBOARD_NOTE="Open Teenz_Bible_Next_AI_Prompt.txt and copy its contents into Meta.AI or Project Hatch."
fi

printf '\nSuccess. Clean successor baseline is ready.\n\n'
printf 'Repository: %s\n' "$TARGET"
printf 'GitHub commit: %s\n' "$CURRENT_COMMIT"
printf 'Firebase project: %s\n' "${FIREBASE_PROJECT:-not parsed}"
printf 'OTA manifest version: %s\n' "${OTA_VERSION:-not parsed}"
printf 'Master handoff: %s/%s\n' "$TARGET" "$MASTER"
printf 'AI prompt: %s\n\n' "$PROMPT_FILE"
printf '%s\n' "$CLIPBOARD_NOTE"
printf '\nImportant: do not put Firebase service-account JSON, Apple .p8/.p12 files, OAuth secrets, or passwords into GitHub or an AI chat.\n'
printf 'Before any deployment, the successor AI must read the master handoff and verify the current App Store Connect status.\n\n'

if [ "$(uname -s)" = "Darwin" ] && command -v open >/dev/null 2>&1; then
  open "$MASTER"
  open -R "$PROMPT_FILE"
fi
