/**
 * Web Audio API synthesized Klaxon Siren Sound Hook.
 * Generates an authentic dual-tone emergency convective siren without needing external MP3/WAV assets.
 */

let audioCtx = null;
let sirenOscillator = null;
let sirenGain = null;
let sirenModulator = null;
let isPlayingSiren = false;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playEmergencySirenKlaxon(durationSeconds = 6) {
  if (isMuted || isPlayingSiren) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    isPlayingSiren = true;

    // Carrier oscillator (High-frequency klaxon warble)
    sirenOscillator = ctx.createOscillator();
    sirenOscillator.type = 'sawtooth';
    sirenOscillator.frequency.setValueAtTime(880, ctx.currentTime);

    // Modulator oscillator for siren wail frequency sweep (0.6 Hz LFO)
    sirenModulator = ctx.createOscillator();
    sirenModulator.type = 'sine';
    sirenModulator.frequency.setValueAtTime(0.6, ctx.currentTime);

    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(140, ctx.currentTime); // Pitch swing ±140 Hz (740Hz - 1020Hz)

    sirenModulator.connect(modGain);
    modGain.connect(sirenOscillator.frequency);

    // Main Volume Gain
    sirenGain = ctx.createGain();
    sirenGain.gain.setValueAtTime(0.01, ctx.currentTime);
    sirenGain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.3);

    sirenOscillator.connect(sirenGain);
    sirenGain.connect(ctx.destination);

    sirenModulator.start();
    sirenOscillator.start();

    // Auto-stop after duration
    setTimeout(() => {
      stopEmergencySirenKlaxon();
    }, durationSeconds * 1000);
  } catch (err) {
    console.warn('[Siren Audio Warning]: Web Audio not ready or user interaction needed.', err.message);
    isPlayingSiren = false;
  }
}

export function stopEmergencySirenKlaxon() {
  if (!isPlayingSiren) return;

  try {
    if (sirenGain && audioCtx) {
      sirenGain.gain.setValueAtTime(sirenGain.gain.value, audioCtx.currentTime);
      sirenGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    }

    setTimeout(() => {
      if (sirenOscillator) {
        try { sirenOscillator.stop(); sirenOscillator.disconnect(); } catch (e) {}
        sirenOscillator = null;
      }
      if (sirenModulator) {
        try { sirenModulator.stop(); sirenModulator.disconnect(); } catch (e) {}
        sirenModulator = null;
      }
      isPlayingSiren = false;
    }, 450);
  } catch (e) {
    isPlayingSiren = false;
  }
}

export function toggleSirenMute() {
  isMuted = !isMuted;
  if (isMuted && isPlayingSiren) {
    stopEmergencySirenKlaxon();
  }
  return isMuted;
}

export function getSirenMuteState() {
  return isMuted;
}

export function isSirenActive() {
  return isPlayingSiren;
}
