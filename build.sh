#!/usr/bin/env bash
# Packages the extension into a versioned zip for Chrome / Edge submission.
#
# Usage:  ./build.sh
# Output: dist/shortcut-blocker-v<version>.zip  (version read from manifest.json)
# Files are staged first so $exclude patterns (e.g. source .svg) are kept in the
# repo but never shipped, and dev files never leak into the package.

set -euo pipefail
cd "$(dirname "$0")"

include=(
  manifest.json
  background.js
  content.js
  popup.css
  popup.html
  popup.js
  icons
  _locales
)
# Filenames to drop from the staged copy before zipping.
exclude=('*.svg')

missing=()
for f in "${include[@]}"; do
  [[ -e "$f" ]] || missing+=("$f")
done
if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing files, aborting: ${missing[*]}" >&2
  exit 1
fi

version=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' manifest.json | head -n1)
if [[ -z "$version" ]]; then
  echo 'manifest.json has no "version" field.' >&2
  exit 1
fi

out="dist/shortcut-blocker-v${version}.zip"
outabs="$(pwd)/$out"
stage="dist/_stage"

mkdir -p dist
rm -rf "$stage"
mkdir -p "$stage"

# Stage the included files, preserving directory structure.
for f in "${include[@]}"; do
  mkdir -p "$stage/$(dirname "$f")"
  cp -r "$f" "$stage/$f"
done

# Drop excluded patterns from the staged copy (kept in the repo, not shipped).
for pat in "${exclude[@]}"; do
  find "$stage" -name "$pat" -type f -delete
done

rm -f "$outabs"

# Git for Windows' bash usually has no `zip`; fall back to PowerShell, then Python.
if command -v zip >/dev/null 2>&1; then
  ( cd "$stage" && zip -rqX "$outabs" . )
elif command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -Command \
    "Compress-Archive -Path '$stage/*' -DestinationPath '$out' -Force"
elif PYBIN=$(command -v python3 || command -v python); then
  "$PYBIN" - "$outabs" "$stage" <<'PY'
import os, sys, zipfile
out, stage = sys.argv[1:3]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(stage):
        for f in files:
            p = os.path.join(root, f)
            arc = os.path.relpath(p, stage).replace(os.sep, "/")
            z.write(p, arc)
PY
else
  rm -rf "$stage"
  echo "Need one of: zip, powershell.exe, or python to build the archive." >&2
  exit 1
fi

rm -rf "$stage"
size=$(du -h "$out" | cut -f1)
echo "Built $out ($size)"
