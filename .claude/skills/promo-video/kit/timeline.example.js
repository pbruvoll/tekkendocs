// Example timeline: the Oct 2026 overview promo (portrait 1080x1920, 25 s). Copy and adapt per video.
//
// Segment types (a/b = start/end in output seconds):
//   clip   – a game video big on screen. frames: extracted JPEG pattern, count: number of frames, from: first index,
//            fps: source frames per output second (60 fps source at 0.45× speed → 27), impact: time of the hit, tag.
//   ui     – recorded shot. shot: name in shots/, s0: shot time at `a`, rate: speed. cam: [[t, zoom, focusX, focusY], ...]
//            in UI pixels (focus point is centred in the card). noCut: continue without flash/whoosh.
//   stills – rapid cuts. stills: image paths, each: seconds per still (default: even split),
//            backgrounds: per-still images behind the card, labels: per-still badge text.
//   end    – end card. items: {kind: logo|big|sub|url|small, text, y (yellow), size, at (seconds into the segment)}.
// captions: {a, b, lines: [{t: html | (t) => html, y: yellow, at: start time | 'held' (already on screen)}]}
// overlays: {type:'box', a, b, event: name logged with r.box() | box:{x,y,w,h}} (UI pixels, inside the card)
//           {type:'badge', a, b, text, x, y (0–1 of the screen), rot}
// shakes / flashes: [[time, amount]]. cues: extra sounds [[name, time, gain]] (see sfx.mjs for names).
const AV = (c) => `media/avatars/${c}-brand-512.png`;
const CHARS = [
  'jin',
  'reina',
  'nina',
  'king',
  'bryan',
  'paul',
  'hwoarang',
  'asuka',
  'dragunov',
  'lili',
  'yoshimitsu',
  'victor',
];
const LANGS = [
  ['en', 'English'],
  ['ja', '日本語'],
  ['ko', '한국어'],
  ['es', 'Español'],
  ['de', 'Deutsch'],
  ['ru', 'Русский'],
  ['tr', 'Türkçe'],
  ['ur', 'اردو'],
];
const easeOut = (k) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;

window.VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 25,
  ui: { width: 1080, height: 1920 }, // size of recorded frames
  segments: [
    {
      id: 'hook',
      type: 'clip',
      a: 0,
      b: 2.0,
      frames: 'media/hook/%03d.jpg',
      from: 3,
      fps: 27,
      count: 60,
      impact: 0.93,
      tag: 'KAZUYA · df+2',
    },
    {
      id: 'type',
      type: 'ui',
      a: 2.0,
      b: 3.6,
      shot: 'search',
      s0: 0.45,
      cam: [
        [2.0, 1, 540, 960],
        [2.35, 1.12, 480, 860],
      ],
    },
    {
      id: 'answer',
      type: 'ui',
      a: 3.6,
      b: 5.6,
      shot: 'search',
      s0: 2.05,
      noCut: true,
      cam: [
        [3.6, 1.12, 480, 860],
        [3.75, 1.28, 432, 1000],
        [5.6, 1.32, 432, 1000],
      ],
    },
    {
      id: 'tapVideo',
      type: 'ui',
      a: 5.6,
      b: 6.0,
      shot: 'search',
      s0: 4.15,
      noCut: true,
      cam: [
        [5.6, 1.32, 432, 1000],
        [5.95, 1, 540, 960],
      ],
    },
    {
      id: 'video',
      type: 'ui',
      a: 6.0,
      b: 7.2,
      shot: 'search',
      s0: 5.45,
      noCut: true,
    }, // jump-cut past "Loading video…"
    {
      id: 'chars',
      type: 'stills',
      a: 7.2,
      b: 9.2,
      stills: CHARS.map((c) => `stills/char-${c}.jpg`),
      backgrounds: CHARS.map(AV),
    },
    {
      id: 'guides',
      type: 'ui',
      a: 9.2,
      b: 10.7,
      shot: 'guides',
      s0: 0.25,
      rate: 1.13,
    },
    {
      id: 'langs',
      type: 'stills',
      a: 10.7,
      b: 13.7,
      stills: LANGS.map(([l]) => `stills/guide-${l}.jpg`),
      labels: LANGS.map(([, n]) => n),
    },
    {
      id: 'quizA',
      type: 'ui',
      a: 13.7,
      b: 15.75,
      shot: 'quiz',
      s0: 1.0,
      cam: [
        [13.7, 1, 540, 960],
        [14.5, 1.08, 540, 1050],
      ],
    },
    {
      id: 'quizB',
      type: 'ui',
      a: 15.75,
      b: 18.45,
      shot: 'quiz',
      s0: 5.25,
      cam: [
        [15.75, 1, 540, 960],
        [17.35, 1, 540, 960],
        [17.55, 1.6, 720, 700],
        [18.45, 1.65, 720, 700],
      ],
    },
    {
      id: 'daily',
      type: 'stills',
      a: 18.45,
      b: 19.45,
      stills: ['stills/daily.jpg'],
    },
    {
      id: 'end',
      type: 'end',
      a: 19.45,
      b: 25,
      items: [
        { kind: 'logo', at: 0.17 },
        { kind: 'big', text: 'Every move', at: 0.8 },
        { kind: 'big', text: 'Every frame', y: true, at: 1.05, gap: 0 },
        {
          kind: 'sub',
          text: 'FRAME DATA <b>/</b> GUIDES <b>/</b> QUIZZES',
          at: 1.65,
        },
        { kind: 'url', text: 'TEKKENDOCS.COM', at: 2.15 },
        { kind: 'small', text: 'Free · No ads · Every character', at: 2.65 },
      ],
    },
  ],
  captions: [
    {
      a: 0,
      b: 2.0,
      lines: [
        { t: 'Is it', at: -0.12 },
        { t: 'punishable?', y: 1, at: 0.93 },
      ],
    }, // first frame already shows the hook
    { a: 2.0, b: 3.75, lines: [{ t: 'Every move.' }] },
    {
      a: 3.75,
      b: 5.6,
      lines: [
        { t: '<span class="r">-12</span> on block?' },
        { t: 'Punish it.', y: 1, at: 3.95 },
      ],
    },
    {
      a: 5.6,
      b: 7.2,
      lines: [{ t: 'Every frame.' }, { t: 'With video.', y: 1 }],
    },
    {
      a: 7.2,
      b: 9.2,
      lines: [
        { t: (t) => `All ${Math.round(1 + 41 * easeOut((t - 7.25) / 1.6))}` },
        { t: 'characters', y: 1 },
      ],
    },
    { a: 9.2, b: 10.7, lines: [{ t: 'Pro-written' }, { t: 'guides', y: 1 }] },
    { a: 10.7, b: 13.7, lines: [{ t: 'In 8' }, { t: 'languages', y: 1 }] },
    {
      a: 13.7,
      b: 15.75,
      lines: [{ t: 'How many frames' }, { t: 'on block?', y: 1 }],
    },
    {
      a: 15.75,
      b: 18.45,
      lines: [
        { t: 'Test yourself.' },
        { t: 'Climb the ranks.', y: 1, at: 16.4 },
      ],
    },
    {
      a: 18.45,
      b: 19.45,
      lines: [{ t: 'New challenge' }, { t: 'every day', y: 1 }],
    },
  ],
  overlays: [
    { type: 'box', a: 3.75, b: 5.6, shot: 'search', event: 'hlBox' },
    {
      type: 'badge',
      a: 14.86,
      b: 15.75,
      text: '+1 STREAK',
      x: 0.72,
      y: 0.46,
      rot: 5,
    },
    {
      type: 'badge',
      a: 17.5,
      b: 18.45,
      text: 'RANK UP!',
      x: 0.5,
      y: 0.65,
      rot: -6,
    },
  ],
  shakes: [
    [0.93, 26],
    [3.75, 14],
    [7.2, 8],
    [13.7, 8],
    [19.62, 30],
  ],
  flashes: [
    [0.93, 0.9],
    [19.62, 0.95],
  ],
  cues: [
    ['impact', 0.1, 0.5],
    ['impactBig', 0.93, 1],
    ['impact', 3.75, 0.9],
  ],
};
