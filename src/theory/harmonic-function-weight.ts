import type { Mood } from '../types';

/**
 * Harmonic function weight — tonic chords get stability emphasis,
 * dominant chords get forward-drive emphasis, subdominant chords
 * are neutral. Models the perceptual weight of harmonic function.
 */

const moodFunctionDepth: Record<Mood, number> = {
  ambient: 0.40,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.55,
  avril: 0.60,
  xtal: 0.35,
  syro: 0.15,
  blockhead: 0.40,
  flim: 0.35,
  disco: 0.45,
};

/**
 * Gain multiplier based on chord degree (harmonic function).
 * degree: 1-7 scale degree
 * I (tonic) → warm emphasis, V (dominant) → bright emphasis.
 */
export function functionWeightGain(
  degree: number,
  mood: Mood,
): number {
  const depth = moodFunctionDepth[mood];
  let weight: number;
  switch (degree) {
    case 1: weight = 0.8; break;   // tonic: stable emphasis
    case 5: weight = 0.6; break;   // dominant: forward drive
    case 4: weight = 0.3; break;   // subdominant: moderate
    case 6: weight = 0.2; break;   // submediant
    case 2: weight = 0.1; break;   // supertonic
    case 3: weight = 0.0; break;   // mediant: neutral
    case 7: weight = -0.2; break;  // leading tone: tension
    default: weight = 0.0;
  }
  const adjustment = weight * depth * 0.05;
  return Math.max(0.97, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood function depth for testing */
export function functionDepth(mood: Mood): number {
  return moodFunctionDepth[mood];
}
