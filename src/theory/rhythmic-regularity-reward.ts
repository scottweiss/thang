import type { Mood, Section } from '../types';

/**
 * Rhythmic regularity reward — consistent rhythmic patterns (like steady
 * 8th notes or regular quarter notes) get a subtle gain emphasis.
 * This rewards groove and punishes erratic timing.
 */

const moodRewardStrength: Record<Mood, number> = {
  ambient: 0.10,
  plantasia: 0.10,
  downtempo: 0.30,
  lofi: 0.40,
  trance: 0.60,
  avril: 0.35,
  xtal: 0.20,
  syro: 0.10,
  blockhead: 0.45,
  flim: 0.25,
  disco: 0.55,
};

const sectionMult: Record<Section, number> = {
  intro: 0.7,
  build: 1.1,
  peak: 1.2,
  breakdown: 0.6,
  groove: 1.3,
};

/**
 * Gain multiplier rewarding rhythmic regularity.
 * regularityScore: 0-1 how regular the pattern is (1 = perfectly even)
 * High regularity → slight boost, low → slight reduction.
 */
export function regularityRewardGain(
  regularityScore: number,
  mood: Mood,
  section: Section,
): number {
  const strength = moodRewardStrength[mood] * sectionMult[section];
  const deviation = (regularityScore - 0.5) * 2; // -1 to 1
  const adjustment = deviation * strength * 0.04;
  return Math.max(0.97, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood reward strength for testing */
export function rewardStrength(mood: Mood): number {
  return moodRewardStrength[mood];
}
