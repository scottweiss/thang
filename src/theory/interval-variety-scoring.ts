/**
 * Interval variety scoring — reward diverse interval use in melodies.
 *
 * Melodies that use many different intervals are more interesting
 * than those stuck on one interval. This module scores melodic
 * passages for interval diversity and provides a weight adjustment.
 *
 * Applied as gain emphasis for interval-diverse passages.
 */

import type { Mood } from '../types';

/**
 * Per-mood variety appetite (higher = more diversity preferred).
 */
const VARIETY_APPETITE: Record<Mood, number> = {
  trance:    0.25,  // low — repetitive is OK
  avril:     0.55,  // high — classical variety
  disco:     0.20,  // low — simple grooves
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // high — jazz vocabulary
  flim:      0.55,  // high — delicate variety
  xtal:      0.50,  // high
  syro:      0.60,  // highest — maximal variety
  ambient:   0.35,  // moderate — stepwise OK
};

/**
 * Score interval variety in a sequence.
 * Uses unique interval count / total interval count ratio.
 *
 * @param intervals Array of absolute interval sizes (in semitones)
 * @returns Variety score (0.0 - 1.0)
 */
export function intervalVarietyScore(intervals: number[]): number {
  if (intervals.length <= 1) return 0.5;

  const absIntervals = intervals.map(i => Math.abs(i));
  const unique = new Set(absIntervals);
  const ratio = unique.size / absIntervals.length;

  // Bonus for using both small and large intervals
  const hasSmall = absIntervals.some(i => i <= 2);
  const hasLarge = absIntervals.some(i => i >= 5);
  const rangeBonus = (hasSmall && hasLarge) ? 0.15 : 0;

  return Math.min(1.0, ratio * 0.85 + rangeBonus);
}

/**
 * Gain multiplier based on interval variety.
 *
 * @param intervals Recent melody intervals
 * @param mood Current mood
 * @returns Gain multiplier (0.92 - 1.08)
 */
export function varietyGainMultiplier(
  intervals: number[],
  mood: Mood
): number {
  const appetite = VARIETY_APPETITE[mood];
  const score = intervalVarietyScore(intervals);
  const deviation = (score - 0.5) * appetite * 0.3;
  return Math.max(0.92, Math.min(1.08, 1.0 + deviation));
}

/**
 * Get variety appetite for a mood (for testing).
 */
export function varietyAppetite(mood: Mood): number {
  return VARIETY_APPETITE[mood];
}
