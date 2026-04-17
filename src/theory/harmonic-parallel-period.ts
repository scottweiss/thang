import type { Mood, Section } from '../types';

/**
 * Harmonic parallel period structure — in classical phrasing,
 * antecedent phrases (ending on half cadence) are answered by
 * consequent phrases (ending on full cadence). Boost when the
 * current chord progression mirrors earlier material, creating
 * question-answer symmetry.
 */

const periodStrength: Record<Mood, number> = {
  ambient: 0.20,
  plantasia: 0.20,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.45,
  avril: 0.55,
  xtal: 0.30,
  syro: 0.15,
  blockhead: 0.20,
  flim: 0.40,
  disco: 0.35,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.8,
  groove: 0.9,
};

/**
 * Measures how well two degree sequences mirror each other
 * (parallel period similarity). Returns 0-1.
 */
export function periodSimilarity(
  firstPhrase: number[],
  secondPhrase: number[]
): number {
  if (firstPhrase.length < 2 || secondPhrase.length < 2) return 0;
  const len = Math.min(firstPhrase.length, secondPhrase.length);
  let matches = 0;
  // Compare all but last element (cadence point differs)
  for (let i = 0; i < len - 1; i++) {
    if (firstPhrase[i] === secondPhrase[i]) {
      matches++;
    }
  }
  // Bonus if cadence points differ (true period structure)
  const cadenceDiffers = firstPhrase[len - 1] !== secondPhrase[len - 1];
  const baseScore = matches / Math.max(len - 1, 1);
  return cadenceDiffers ? Math.min(baseScore * 1.2, 1.0) : baseScore * 0.7;
}

/**
 * Returns a gain multiplier rewarding parallel period structure.
 *
 * @param firstPhrase - scale degrees of first (antecedent) phrase
 * @param secondPhrase - scale degrees of second (consequent) phrase
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function parallelPeriodGain(
  firstPhrase: number[],
  secondPhrase: number[],
  mood: Mood,
  section: Section
): number {
  const sim = periodSimilarity(firstPhrase, secondPhrase);
  if (sim < 0.2) return 1.0;

  const depth = periodStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * sim * depth;
}

export function periodStrengthValue(mood: Mood): number {
  return periodStrength[mood];
}
