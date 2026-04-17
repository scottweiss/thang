/**
 * Melodic interval momentum — consecutive same-direction intervals build momentum.
 *
 * After a run of ascending intervals, a descent creates a satisfying arc.
 * Larger leaps need more "recovery" — stepwise motion afterward.
 * This module scores melodic passages for momentum quality and
 * provides gain emphasis for well-shaped contours.
 *
 * Applied as gain multiplier favoring momentum-aware melodies.
 */

import type { Mood } from '../types';

/**
 * Per-mood momentum sensitivity (higher = more momentum-aware).
 */
const MOMENTUM_SENSITIVITY: Record<Mood, number> = {
  trance:    0.40,  // moderate — steady motion
  avril:     0.60,  // strong — classical phrase shaping
  disco:     0.30,  // moderate
  downtempo: 0.45,  // moderate
  blockhead: 0.25,  // weak — choppy is OK
  lofi:      0.50,  // strong — smooth jazz lines
  flim:      0.55,  // strong — delicate contour
  xtal:      0.50,  // strong
  syro:      0.20,  // weak — erratic is fine
  ambient:   0.55,  // strong — flowing lines,
  plantasia: 0.55,
};

/**
 * Score a sequence of melodic intervals for momentum quality.
 *
 * Consecutive same-direction intervals score higher.
 * Large leaps followed by step recovery also score well.
 *
 * @param intervals Array of signed intervals (positive = up, negative = down)
 * @returns Quality score (0.0 - 1.0)
 */
export function momentumScore(intervals: number[]): number {
  if (intervals.length < 2) return 0.5;

  let score = 0;
  let runLength = 1;

  for (let i = 1; i < intervals.length; i++) {
    const prev = intervals[i - 1];
    const curr = intervals[i];

    // Same direction continues momentum
    if ((prev > 0 && curr > 0) || (prev < 0 && curr < 0)) {
      runLength++;
      score += Math.min(runLength * 0.15, 0.45);
    } else {
      // Direction change — good if recovering from leap
      const prevSize = Math.abs(prev);
      const currSize = Math.abs(curr);
      if (prevSize > 4 && currSize <= 2) {
        score += 0.3; // leap recovery
      } else if (prevSize <= 2 && currSize <= 2) {
        score += 0.1; // step-to-step
      }
      runLength = 1;
    }
  }

  return Math.max(0, Math.min(1, score / intervals.length));
}

/**
 * Gain multiplier based on momentum quality.
 *
 * @param intervals Recent melodic intervals
 * @param mood Current mood
 * @returns Gain multiplier (0.90 - 1.10)
 */
export function momentumGainMultiplier(
  intervals: number[],
  mood: Mood
): number {
  const sensitivity = MOMENTUM_SENSITIVITY[mood];
  const score = momentumScore(intervals);
  const deviation = (score - 0.5) * sensitivity * 0.4;
  return Math.max(0.90, Math.min(1.10, 1.0 + deviation));
}

/**
 * Get momentum sensitivity for a mood (for testing).
 */
export function momentumSensitivity(mood: Mood): number {
  return MOMENTUM_SENSITIVITY[mood];
}
