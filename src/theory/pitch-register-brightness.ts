import type { Mood } from '../types';

/**
 * Pitch register brightness — higher register melodies get brighter
 * LPF (open filter), lower register gets warmer (closed filter).
 * Models how acoustic instruments project differently across registers.
 */

const moodSensitivity: Record<Mood, number> = {
  ambient: 0.45,
  downtempo: 0.35,
  lofi: 0.50,
  trance: 0.30,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.25,
  blockhead: 0.35,
  flim: 0.40,
  disco: 0.30,
};

/**
 * LPF multiplier based on pitch register.
 * midiNote: center pitch in MIDI (48-84 typical range)
 * Higher → slight LPF boost, lower → slight reduction.
 */
export function registerBrightnessLpf(
  midiNote: number,
  mood: Mood,
): number {
  const sensitivity = moodSensitivity[mood];
  const center = 64; // E4 reference
  const octaveOffset = (midiNote - center) / 12;
  const adjustment = octaveOffset * sensitivity * 0.06;
  return Math.max(0.94, Math.min(1.06, 1.0 + adjustment));
}

/** Per-mood sensitivity for testing */
export function registerBrightnessSensitivity(mood: Mood): number {
  return moodSensitivity[mood];
}
