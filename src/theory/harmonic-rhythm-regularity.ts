/**
 * Harmonic rhythm regularity — detect regularity of chord change timing.
 *
 * Regular harmonic rhythm (chords change every N beats) creates
 * predictability and drive. Irregular changes create interest but
 * can feel disorienting. This module scores regularity and adjusts
 * gain to frame regular moments.
 *
 * Applied as gain multiplier that emphasizes regular harmonic rhythm.
 */

import type { Mood } from '../types';

/**
 * Per-mood regularity preference (higher = prefer regular changes).
 */
const REGULARITY_PREFERENCE: Record<Mood, number> = {
  trance:    0.65,  // highest — driving pulse
  avril:     0.45,  // moderate — classical phrasing
  disco:     0.60,  // high — dance groove
  downtempo: 0.35,  // moderate
  blockhead: 0.50,  // moderate — hip-hop bars
  lofi:      0.40,  // moderate — jazz rubato
  flim:      0.25,  // low — irregular is fine
  xtal:      0.30,  // low — floating
  syro:      0.15,  // lowest — erratic preferred
  ambient:   0.20,  // low — free timing
};

/**
 * Score the regularity of chord changes.
 *
 * @param changeIntervals Array of ticks between recent chord changes
 * @returns Regularity score (0.0 = irregular, 1.0 = perfectly regular)
 */
export function regularityScore(changeIntervals: number[]): number {
  if (changeIntervals.length < 2) return 0.5;

  const avg = changeIntervals.reduce((a, b) => a + b, 0) / changeIntervals.length;
  if (avg === 0) return 0.5;

  let variance = 0;
  for (const interval of changeIntervals) {
    variance += Math.pow(interval - avg, 2);
  }
  variance /= changeIntervals.length;

  const cv = Math.sqrt(variance) / avg; // coefficient of variation
  return Math.max(0, Math.min(1, 1.0 - cv));
}

/**
 * Gain multiplier based on harmonic rhythm regularity.
 *
 * @param changeIntervals Recent chord change intervals
 * @param mood Current mood
 * @returns Gain multiplier (0.93 - 1.07)
 */
export function regularityGainMultiplier(
  changeIntervals: number[],
  mood: Mood
): number {
  const preference = REGULARITY_PREFERENCE[mood];
  const score = regularityScore(changeIntervals);
  const deviation = (score - 0.5) * preference * 0.3;
  return Math.max(0.93, Math.min(1.07, 1.0 + deviation));
}

/**
 * Get regularity preference for a mood (for testing).
 */
export function regularityPreference(mood: Mood): number {
  return REGULARITY_PREFERENCE[mood];
}
