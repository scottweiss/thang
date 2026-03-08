import type { Mood, Section } from '../types';

/**
 * Melodic interval variety — reward melodic lines that use
 * diverse intervals rather than repeating the same interval.
 * Monotonous motion (all steps or all leaps of same size)
 * gets less boost than lines with mixed intervals.
 */

const varietyStrength: Record<Mood, number> = {
  ambient: 0.20,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.35,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.50,
  blockhead: 0.35,
  flim: 0.45,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 0.9,
  peak: 1.2,
  breakdown: 0.7,
  groove: 1.0,
};

/**
 * Measures interval variety in a sequence of intervals.
 * Returns 0-1 where 1 = maximum variety (all different).
 */
export function intervalVariety(intervals: number[]): number {
  if (intervals.length < 2) return 0;
  const unique = new Set(intervals.map(i => Math.abs(i)));
  return Math.min(unique.size / intervals.length, 1.0);
}

/**
 * Returns a gain multiplier rewarding interval variety.
 *
 * @param intervals - recent melodic intervals
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function intervalVarietyGain(
  intervals: number[],
  mood: Mood,
  section: Section
): number {
  const variety = intervalVariety(intervals);
  if (variety < 0.2) return 1.0;

  const depth = varietyStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * variety * depth;
}

export function varietyStrengthValue(mood: Mood): number {
  return varietyStrength[mood];
}
