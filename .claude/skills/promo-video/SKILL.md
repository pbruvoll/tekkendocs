---
name: promo-video
description: Make a promo video of tekkendocs (the whole site or one feature) from real footage of the live site, for X, TikTok, YouTube Shorts, or landscape and square formats.
---

A promo is real footage of tekkendocs.com, recorded in a browser and cut into a short, punchy edit: big captions, zooms, tap ripples, highlight boxes, flashes and synthesized sound effects. The kit in [kit/](kit/) does the mechanics; your job is choosing what to show and making every shot true to how the site works.

[site.md](site.md) says where to find pages, data, claims and brand assets. Read it while scouting.

## Steps

1. **Brief.** Settle with the user: which feature(s), format(s) and platforms (see Formats), length, style, and audio (generated SFX, or silent so they can add music on the platform). Ask only for what the request leaves open. Done when all five are known.
2. **Set up.** `sh .claude/skills/promo-video/kit/setup.sh <scratchpad>/promo-<name>`. Run all later commands in that folder. It holds copies of the kit, so edits there never touch the skill.
3. **Scout.** Screenshot candidate pages at the recording viewport (Formats), and read the feature's code to learn how a user really uses it: URL params, view modes, what a tap opens, where the value the video points at is shown. Pick content that is **truthful**: current-season content, the interaction a real user would do (type the same input that appears on screen; point at a value where the user would read it), claims checked against live data. Done when every planned shot has a concrete URL, interaction and verified data.
4. **Storyboard.** A table of time, shot and caption, approved by the user before recording. Shape: a hook in the first second (the first frame is the thumbnail and plays muted, so the hook text is already on it), 3–5 s per feature, an end card of at least 3 s with the URL.
5. **Record.** Write `shots.mjs` (start from the copied example; helpers are documented in `record.mjs`) and run `node shots.mjs`. Check each shot with a contact sheet of its frames at its event times (`ffmpeg ... -filter_complex hstack`). Done when every shot shows the intended state at full recording resolution.
6. **Compose.** Write `timeline.js` (the copied example documents the schema). Render test frames at every segment boundary and key moment with `node render.mjs test <t1> <t2> ...`, tile them, and look. Fix cropped content, overlapping text, taps or highlights outside the card. Done when every test frame looks right.
7. **Render.**
   ```sh
   node render.mjs full && node sfx.mjs
   ffmpeg -y -framerate 30 -i out/frames/%04d.jpg -i out/sfx.wav -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
     -profile:v high -movflags +faststart -c:a aac -b:a 192k -shortest <name>.mp4
   ffmpeg -y -i <name>.mp4 -an -c:v copy <name>-no-audio.mp4
   ```
8. **Verify.** A 1–2 fps contact sheet of the final MP4 (`-vf "fps=2,scale=160:-1,tile=17x3"`) and a waveform (`showwavespic`) to check that sounds sit on the cuts. You can't hear the audio, so tell the user to listen before posting.
9. **Deliver.** Clickable links to both MP4s, a short summary of the cut, and an offer of post copy for each platform.

## Formats

| Format | Video | Record at (viewport × scale → frames) | Layout |
|---|---|---|---|
| Portrait 9:16: TikTok, Shorts, Reels, X mobile | 1080×1920 | phone 400×711 × 2.7 → 1080×1920 | captions on top, phone below |
| Landscape 16:9: YouTube, X desktop | 1920×1080 | desktop 1280×720 × 1.5 → 1920×1080; zoom in (`cam`) so text is readable | captions on top, page below |
| | | or phone 400×711 × 2.7 | captions left, phone right |
| Square 1:1 | 1080×1080 | either | captions on top |

The engine picks the layout from the two aspect ratios; set `VIDEO.ui` to the recorded frame size. Several formats from one storyboard need one recording per UI size, but can share a timeline with different `width`/`height`.

Portrait platforms cover the edges with their own buttons: keep captions and key UI between about 130 px from the top and 1500 px down, clear of the right 140 px.

## Recording notes

- **Move videos** on the CDN are 426×240. Take the URL from the page's `<video src>`, extract frames with an upscale (`-vf "scale=1080:-1:flags=lanczos,unsharp=5:5:0.8"`), and show them in a `clip` segment, not full-screen. The clips are 60 fps, so half speed stays smooth. Find the hit frame with a time-labelled contact sheet and put `impact`, a shake and a flash on it.
- **Popups that load** (the move video preview) show "Loading video…" for about a second: jump-cut over it with a `noCut` segment.
- **Random content** (quiz questions): look up the answer through the API while recording and log an event, as in the quiz shot of `shots.example.mjs`.
- **Scroll shots**: call `warmLazyImages()` first, or the scroll shows image placeholders.
- **Static periods** produce no screencast frames; the engine holds the last frame, so pauses cost nothing.
- **Record production** (`BASE`), so the data is real. Content that isn't merged and deployed (a new translation, say) isn't there yet: check before planning it into a shot.
