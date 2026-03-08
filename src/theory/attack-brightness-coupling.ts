import type { Mood } from '../types';

/**
 * Attack-brightness coupling — notes with short attacks (percussive character)
 * naturally sound brighter. This module boosts FM on layers with short attack
 * values to reinforce the acoustic expectation.
 */

const moodCoupling: Record<Mood, number> = {
  ambient: 0.20,
  downtempo: 0.35,
  lofi: 0.40,
  trance: 0.45,
  avril: 0.35,
  xtal: 0.50,
  syro: 0.55,
  blockhead: 0.60,
  flim: 0.45,
  disco: 0.40,
};

/**
 * FM multiplier based on attack time.
 * attackMs: attack time in seconds (0.001 to 0.1 typical)
 * Short attack (< 0.01) → FM boost, long attack (> 0.05) → FM reduction.
 */
export function attackBrightnessFm(
  attackSec: number,
  mood: Mood,
): number {
  const coupling = moodCoupling[mood];
  // Reference point: 0.02s is neutral
  const ref = 0.02;
  const ratio = Math.log(ref / Math.max(0.001, attackSec));
  // Positive ratio means short attack (brighter), negative means long
  const adjustment = ratio * coupling * 0.04;
  return Math.max(0.94, Math.min(1.06, 1.0 + adjustment));
}

/** Per-mood coupling strength for testing */
export function couplingStrength(mood: Mood): number {
  return moodCoupling[mood];
}
