// Synthesizes the SFX track from out/cues.json ({duration, cues: [[name, time, gain]]}) → out/sfx.wav (48 kHz stereo).
// Sounds: impact, impactBig, boom, whoosh, click, key, punch, thump, ding, sparkle, riser.
import fs from 'node:fs';

const { duration: DUR, cues } = JSON.parse(
  fs.readFileSync('out/cues.json', 'utf8'),
);
const SR = 48000,
  N = Math.round(SR * DUR);
const L = new Float32Array(N),
  R = new Float32Array(N);
let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
};
const TAU = Math.PI * 2;

// add mono generator g(i, tSec) at time t0 with pan (-1..1)
const add = (t0, len, gain, pan, g) => {
  const s0 = Math.round(t0 * SR),
    n = Math.round(len * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4),
    gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n; i++) {
    const j = s0 + i;
    if (j < 0 || j >= N) continue;
    const v = g(i, i / SR);
    L[j] += v * gl;
    R[j] += v * gr;
  }
};
// chirp sine with exponential frequency glide
const glide = (f0, f1, glideT) => {
  let ph = 0;
  return (t) => {
    const f = t < glideT ? f0 * (f1 / f0) ** (t / glideT) : f1;
    ph += (TAU * f) / SR;
    return Math.sin(ph);
  };
};
// state-variable filter
const svf = () => {
  let lo = 0,
    bp = 0;
  return (x, f, q = 0.7) => {
    const F = 2 * Math.sin((Math.PI * Math.min(f, SR / 6)) / SR);
    const hp = x - lo - q * bp;
    bp += F * hp;
    lo += F * bp;
    return { lo, bp, hp };
  };
};

const S = {
  impact: (t0, g) => {
    const o = glide(170, 42, 0.22);
    const f = svf();
    add(
      t0,
      0.7,
      g,
      0,
      (_i, t) =>
        Math.tanh(1.6 * o(t) * Math.exp(-t / 0.2)) * 0.9 +
        f(rnd(), 2500).lo * Math.exp(-t / 0.012) * 0.8,
    );
  },
  impactBig: (t0, g) => {
    const o = glide(190, 36, 0.35);
    const f = svf(),
      f2 = svf();
    add(
      t0,
      1.6,
      g,
      0,
      (_i, t) =>
        Math.tanh(2.2 * o(t) * Math.exp(-t / 0.42)) * 0.95 +
        f(rnd(), 3200).lo * Math.exp(-t / 0.02) * 0.9 +
        f2(rnd(), 5000).hp * Math.exp(-t / 0.35) * 0.22,
    );
  },
  boom: (t0, g) => {
    S.impactBig(t0, g);
    const o = glide(60, 30, 1.0);
    add(t0, 2.5, g * 0.7, 0, (_i, t) => o(t) * Math.exp(-t / 0.9));
  },
  whoosh: (t0, g) => {
    const f = svf(),
      len = 0.38;
    add(t0 - 0.2, len, g * 0.9, -0.5, (_i, t) => {
      const k = t / len;
      const env = k < 0.75 ? (k / 0.75) ** 2 : (1 - k) / 0.25;
      return f(rnd(), 400 + 3600 * k ** 1.5, 0.35).bp * env * 0.9;
    });
    const f2 = svf();
    add(t0 - 0.2, len, g * 0.9, 0.5, (_i, t) => {
      const k = t / len;
      const env = k < 0.75 ? (k / 0.75) ** 2 : (1 - k) / 0.25;
      return f2(rnd(), 450 + 3400 * k ** 1.5, 0.35).bp * env * 0.9;
    });
  },
  click: (t0, g) => {
    const f = svf();
    const o = glide(260, 150, 0.03);
    add(
      t0,
      0.08,
      g * 0.8,
      0.1,
      (_i, t) =>
        f(rnd(), 4500).hp * Math.exp(-t / 0.004) * 0.9 +
        o(t) * Math.exp(-t / 0.018) * 0.7,
    );
  },
  key: (t0, g) => {
    const f = svf();
    const p = 2600 + 900 * rnd();
    add(
      t0,
      0.04,
      g * 0.45,
      rnd() * 0.4,
      (_i, t) => f(rnd(), p, 0.3).bp * Math.exp(-t / 0.006) * 1.4,
    );
  },
  punch: (t0, g) => {
    const o = glide(140, 55, 0.07);
    const f = svf();
    add(
      t0,
      0.22,
      g,
      0,
      (_i, t) =>
        Math.tanh(1.5 * o(t) * Math.exp(-t / 0.07)) +
        f(rnd(), 6000).hp * Math.exp(-t / 0.008) * 0.6,
    );
  },
  thump: (t0, g) => {
    const o = glide(120, 60, 0.1);
    add(t0, 0.3, g, 0, (_i, t) => o(t) * Math.exp(-t / 0.09));
  },
  ding: (t0, g) => {
    for (const [f, d, a] of [
      [1046.5, 0, 0.5],
      [1568, 0.07, 0.45],
      [2093, 0.14, 0.3],
    ]) {
      add(
        t0 + d,
        0.9,
        g * a,
        0.2 - d * 2,
        (_i, t) =>
          (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * f * 2.01 * t)) *
          Math.exp(-t / 0.28) *
          Math.min(1, t / 0.003),
      );
    }
  },
  sparkle: (t0, g) => {
    for (let k = 0; k < 7; k++) {
      const f = 2200 + k * 420 + 200 * rnd();
      add(
        t0 + k * 0.035,
        0.4,
        g * 0.18,
        rnd() * 0.8,
        (_i, t) => Math.sin(TAU * f * t) * Math.exp(-t / 0.12),
      );
    }
  },
  riser: (t0, g) => {
    const len = 1.1,
      f = svf();
    const o = (() => {
      let ph = 0;
      return (t) => {
        ph += (TAU * (110 * 6 ** (t / len))) / SR;
        return Math.sin(ph);
      };
    })();
    add(t0, len, g, 0, (_i, t) => {
      const k = t / len;
      return (
        (f(rnd(), 300 + 7000 * k ** 2, 0.4).bp * 0.8 + o(t) * 0.25) * k ** 2.2
      );
    });
  },
};

for (const [name, t, g] of cues) {
  if (!g) continue;
  if (!S[name]) throw new Error(name);
  S[name](t, g);
}

// light room reverb (parallel combs) for glue
const verb = (x) => {
  const y = new Float32Array(N);
  for (const [d, fb] of [
    [1559, 0.78],
    [1803, 0.76],
    [2011, 0.74],
    [2251, 0.72],
  ]) {
    const buf = new Float32Array(d);
    let lp = 0;
    for (let i = 0; i < N; i++) {
      const o = buf[i % d];
      lp = lp * 0.6 + o * 0.4;
      buf[i % d] = x[i] + lp * fb;
      y[i] += o * 0.06;
    }
  }
  return y;
};
const vL = verb(L),
  vR = verb(R);
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh((L[i] + vL[i]) * 1.1);
  R[i] = Math.tanh((R[i] + vR[i]) * 1.1);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
// fade out the last 0.6 s
for (let i = 0; i < N; i++) {
  const k = Math.min(1, (N - i) / (0.6 * SR));
  L[i] *= norm * k;
  R[i] *= norm * k;
}

const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(L[i] * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * 32767), 46 + i * 4);
}
fs.writeFileSync('out/sfx.wav', buf);
console.log('cues', cues.length, 'peak', peak.toFixed(2));
