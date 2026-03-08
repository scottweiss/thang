import type { Mood, Section } from '../types';

/**
 * Melodic sequence transposition — when a melodic pattern
 * repeats at a different pitch level (real or tonal sequence),
 * it creates satisfying expectation fulfillment. Reward gain
 * when the current motif direction mirrors a transposition.
 */

const seqStrength: Record<Mood, number> = {
  ambient: 0.15,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.40,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.45,
  blockhead: 0.20,
  flim: 0.50,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 0.9,
  peak: 1.2,
  breakdown: 0.6,
  groove: 1.0,
};

/**
 * Measures how well two interval arrays match (transposition similarity).
 * Returns 0-1 where 1 = exact transposition.
 */
export function transpositionSimilarity(
  intervalsA: number[],
  intervalsB: number[]
): number {
  if (intervalsA.length === 0 || intervalsB.length === 0) return 0;
  const len = Math.min(intervalsA.length, intervalsB.length);
  let matches = 0;
  for (let i = 0; i < len; i++) {
    if (intervalsA[i] === intervalsB[i]) {
      matches++;
    } else if (Math.abs(intervalsA[i] - intervalsB[i]) <= 1) {
      matches += 0.5; // tonal (approximate) transposition
    }
  }
  return matches / len;
}

/**
 * Returns a gain multiplier rewarding transposed sequence repetition.
 *
 * @param motifIntervals - intervals of the original motif
 * @param currentIntervals - intervals of the current melodic fragment
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function sequenceTranspositionGain(
  motifIntervals: number[],
  currentIntervals: number[],
  mood: Mood,
  section: Section
): number {
  const sim = transpositionSimilarity(motifIntervals, currentIntervals);
  if (sim < 0.3) return 1.0;

  const depth = seqStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * sim * depth;
}

export function seqStrengthValue(mood: Mood): number {
  return seqStrength[mood];
}
