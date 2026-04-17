/**
 * Intervallic variety — prevent melodic interval monotony.
 *
 * Tracks recent melodic intervals and ensures variety. If the
 * melody has been stepping by 2nds for too long, encourage a
 * leap. If it's been leaping constantly, encourage steps.
 *
 * Based on Narmour's implication-realization: listeners expect
 * variety in interval sizes for maintained interest.
 */

import type { Mood } from '../types';

/**
 * Per-mood appetite for intervallic variety.
 * Higher = more diverse interval sizes wanted.
 */
const VARIETY_APPETITE: Record<Mood, number> = {
  trance:    0.20,  // repetitive motifs OK
  avril:     0.40,  // balanced
  disco:     0.25,  // groove-oriented
  downtempo: 0.35,  // moderate
  blockhead: 0.45,  // likes contrast
  lofi:      0.50,  // jazz — maximum variety
  flim:      0.45,  // organic
  xtal:      0.55,  // floating, varied
  syro:      0.60,  // maximum variety
  ambient:   0.30,  // slow, moderate variety,
  plantasia: 0.30,
};

/**
 * Classify intervals into size categories.
 */
export type IntervalSize = 'unison' | 'step' | 'skip' | 'leap' | 'wide-leap';

/**
 * Classify an interval by its absolute size.
 *
 * @param semitones Absolute interval in semitones
 * @returns Interval size category
 */
export function classifyInterval(semitones: number): IntervalSize {
  const abs = Math.abs(semitones);
  if (abs === 0) return 'unison';
  if (abs <= 2) return 'step';
  if (abs <= 4) return 'skip';
  if (abs <= 7) return 'leap';
  return 'wide-leap';
}

/**
 * Calculate variety score from recent interval history.
 * Returns 0-1 where 0 = all same size, 1 = maximum variety.
 *
 * @param intervals Recent absolute interval sizes
 * @returns Variety score
 */
export function intervalVariety(intervals: number[]): number {
  if (intervals.length < 3) return 0.5; // neutral

  const categories = intervals.map(i => classifyInterval(i));
  const unique = new Set(categories);
  return Math.min(1, (unique.size - 1) / 3); // 4 categories possible
}

/**
 * Should the next interval be biased toward a specific size?
 *
 * @param intervals Recent interval sizes (absolute semitones)
 * @param mood Current mood
 * @returns Suggested direction: 'larger', 'smaller', or 'any'
 */
export function suggestIntervalBias(
  intervals: number[],
  mood: Mood
): 'larger' | 'smaller' | 'any' {
  const variety = intervalVariety(intervals);
  const appetite = VARIETY_APPETITE[mood];

  if (variety < appetite - 0.15) {
    // Too monotonous — what's the dominant interval type?
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (avg <= 3) return 'larger'; // too many steps → encourage leap
    return 'smaller'; // too many leaps → encourage step
  }

  if (variety > appetite + 0.20) {
    // Too varied — settle into the dominant pattern
    return 'any';
  }

  return 'any';
}

/**
 * Calculate a pitch offset to encourage the suggested interval size.
 *
 * @param bias Suggested bias direction
 * @param currentInterval The interval being considered (semitones)
 * @returns Offset to add (positive = wider, negative = narrower)
 */
export function biasOffset(
  bias: 'larger' | 'smaller' | 'any',
  currentInterval: number
): number {
  if (bias === 'any') return 0;
  if (bias === 'larger' && Math.abs(currentInterval) < 3) return currentInterval >= 0 ? 3 : -3;
  if (bias === 'smaller' && Math.abs(currentInterval) > 5) return currentInterval >= 0 ? -3 : 3;
  return 0;
}

/**
 * Get variety appetite for a mood (for testing).
 */
export function varietyAppetite(mood: Mood): number {
  return VARIETY_APPETITE[mood];
}
