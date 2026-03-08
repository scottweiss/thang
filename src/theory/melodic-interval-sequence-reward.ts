import type { Mood, Section } from '../types';

/**
 * Melodic interval sequence reward — rewards sequential patterns where
 * a melodic fragment's interval pattern is repeated at a different pitch level.
 * When interval similarity is detected, gain is boosted to highlight the pattern.
 */

const rewardSensitivity: Record<Mood, number> = {
  ambient: 0.15,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.40,
  avril: 0.50,
  xtal: 0.35,
  syro: 0.45,
  blockhead: 0.30,
  flim: 0.40,
  disco: 0.35,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.7,
  build: 1.0,
  peak: 1.1,
  breakdown: 0.6,
  groove: 0.9,
};

/**
 * Returns a gain multiplier that rewards melodic interval sequence patterns.
 * Higher similarity between consecutive interval patterns = more boost.
 *
 * @param intervalSimilarity - 0 (no match) to 1 (exact sequence)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function intervalSequenceRewardGain(
  intervalSimilarity: number,
  mood: Mood,
  section: Section
): number {
  if (intervalSimilarity <= 0) return 1.0;
  const clamped = Math.min(intervalSimilarity, 1.0);
  const depth = rewardSensitivity[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * clamped * depth;
}

export function rewardSensitivityValue(mood: Mood): number {
  return rewardSensitivity[mood];
}
