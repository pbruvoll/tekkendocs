#!/usr/bin/env sh
# Usage: sh .claude/skills/promo-video/kit/setup.sh <workdir>
# Creates a promo work folder: kit files, playwright, fonts, logo, character art.
set -e
REPO=$(cd "$(dirname "$0")/../../../.." && pwd)
KIT="$REPO/.claude/skills/promo-video/kit"
W="$1"; [ -n "$W" ] || { echo "usage: setup.sh <workdir>"; exit 1; }
mkdir -p "$W/fonts" "$W/media/avatars" "$W/out"
# own package.json first, or npm walks up and adds playwright to the tekkendocs package.json
[ -f "$W/package.json" ] || echo '{"type":"module"}' > "$W/package.json"
cp "$KIT"/record.mjs "$KIT"/render.mjs "$KIT"/sfx.mjs "$KIT"/comp.html "$W/"
[ -f "$W/timeline.js" ] || cp "$KIT/timeline.example.js" "$W/timeline.js"
[ -f "$W/shots.mjs" ] || cp "$KIT/shots.example.mjs" "$W/shots.mjs"
cp "$REPO"/node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-800-italic.woff2 "$REPO"/node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-900-italic.woff2 "$W/fonts/"
cp "$REPO"/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2 "$W/fonts/"
cp "$REPO"/app/images/logo/tekkendocs-logo-large-v2.svg "$W/media/logo.svg"
cp "$REPO"/public/t8/avatars/*-brand-512.png "$W/media/avatars/"
(cd "$W" && npm i playwright@latest --silent)
echo "ready: $W"
