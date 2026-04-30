/**
 * Lightweight, professional sound effects using the Web Audio API.
 * No external files needed — all sounds are synthesized in-browser.
 *
 * Usage:
 *   import { playSound } from "./sounds";
 *   playSound("success");
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

type SoundType =
  | "success"    // Task completed / moved to done
  | "pop"        // Modal open, card click
  | "whoosh"     // Navigation, page transition
  | "ding"       // Notification
  | "toggle"     // Theme toggle
  | "error";     // Error feedback

export function playSound(type: SoundType, volume = 0.15) {
  // Check if user has opted out
  if (localStorage.getItem("flowboard_sounds") === "off") return;

  try {
    const ctx = getCtx();

    switch (type) {
      case "success":
        synthesizeSuccess(ctx, volume);
        break;
      case "pop":
        synthesizePop(ctx, volume);
        break;
      case "whoosh":
        synthesizeWhoosh(ctx, volume);
        break;
      case "ding":
        synthesizeDing(ctx, volume);
        break;
      case "toggle":
        synthesizeToggle(ctx, volume);
        break;
      case "error":
        synthesizeError(ctx, volume);
        break;
    }
  } catch {
    // Silently fail if Web Audio isn't available
  }
}

// ─── Success: two ascending tones ──────────────────────
function synthesizeSuccess(ctx: AudioContext, vol: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(587, now); // D5
  osc1.connect(gain);
  osc1.start(now);
  osc1.stop(now + 0.15);

  const gain2 = ctx.createGain();
  gain2.connect(ctx.destination);
  gain2.gain.setValueAtTime(vol, now + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(880, now + 0.12); // A5
  osc2.connect(gain2);
  osc2.start(now + 0.12);
  osc2.stop(now + 0.4);
}

// ─── Pop: quick pitch rise ─────────────────────────────
function synthesizePop(ctx: AudioContext, vol: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol * 0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.12);
}

// ─── Whoosh: filtered noise sweep ──────────────────────
function synthesizeWhoosh(ctx: AudioContext, vol: number) {
  const now = ctx.currentTime;
  const duration = 0.2;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.exponentialRampToValueAtTime(500, now + duration);
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);
}

// ─── Ding: bright bell-like tone ───────────────────────
function synthesizeDing(ctx: AudioContext, vol: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol * 0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1047, now); // C6
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.5);

  // Harmonic
  const gain2 = ctx.createGain();
  gain2.connect(ctx.destination);
  gain2.gain.setValueAtTime(vol * 0.2, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(2094, now); // C7
  osc2.connect(gain2);
  osc2.start(now);
  osc2.stop(now + 0.3);
}

// ─── Toggle: quick click sound ─────────────────────────
function synthesizeToggle(ctx: AudioContext, vol: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol * 0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.08);
}

// ─── Error: two descending tones ───────────────────────
function synthesizeError(ctx: AudioContext, vol: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol * 0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.25);
}
