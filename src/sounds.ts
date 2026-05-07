let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function play(fn: (ctx: AudioContext) => void) {
  try { fn(getCtx()); } catch { /* ignore */ }
}

export const sounds = {
  click() {
    play((ctx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 600;
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      o.start(); o.stop(ctx.currentTime + 0.06);
    });
  },
  whoosh() {
    play((ctx) => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      src.buffer = buf;
      f.type = 'bandpass'; f.frequency.value = 800;
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      g.gain.value = 0.12;
      src.start();
    });
  },
  chime() {
    play((ctx) => {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.value = freq;
        const t = ctx.currentTime + i * 0.12;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.15, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        o.start(t); o.stop(t + 0.4);
      });
    });
  },
  error() {
    play((ctx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sawtooth'; o.frequency.value = 180;
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start(); o.stop(ctx.currentTime + 0.15);
    });
  },
};
