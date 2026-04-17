/**
 * Inverse density — melodic activity inversely tracks harmonic rhythm.
 *
 * A fundamental compositional principle: when harmony moves slowly
 * (sustained chord), melody can be more elaborate. When harmony
 * moves quickly (frequent chord changes), melody should simplify
 * to avoid clutter.
 *
 * Similarly: when melody is busy, harmony should hold steady.
 * This push-pull creates natural breathing in the arrangement.
 *
 * Uses the time since last chord change as a proxy for harmonic rhythm.
 */

import type { Mood } from '../types';

/**
 * Compute a density multiplier based on how long the current chord
 * has been held. Longer holds → higher multiplier (more melody).
 *
 * @param ticksSinceChange  How many ticks since the last chord change
 * @param mood              Current mood (some moods respond more)
 * @returns Multiplier 0.7-1.3
 */
export function inverseDensityMultiplier(
  ticksSinceChange: number,
  mood: Mood
): number {
  const sensitivity = MOOD_INVERSE_SENSITIVITY[mood];

  // Normalize: 0 ticks = just changed, 8+ ticks = long hold
  const holdFraction = Math.min(1.0, ticksSinceChange / 8);

  // At chord change: reduce density (0.7-1.0 depending on sensitivity)
  // Long hold: increase density (1.0-1.3 depending on sensitivity)
  return 1.0 + (holdFraction - 0.5) * 2 * sensitivity * 0.3;
}

/**
 * Whether inverse density should be applied for a mood.
 */
export function shouldApplyInverseDensity(mood: Mood): boolean {
  return MOOD_INVERSE_SENSITIVITY[mood] > 0.1;
}

/**
 * Per-mood sensitivity to inverse density.
 * Higher = more responsive to harmonic rhythm.
 */
const MOOD_INVERSE_SENSITIVITY: Record<Mood, number> = {
  ambient:   0.3,   // gentle response,
  plantasia: 0.3,
  downtempo: 0.5,   // moderate
  lofi:      0.6,   // jazzy awareness
  trance:    0.2,   // minimal — trance stays driving
  avril:     0.7,   // high — intimate, responsive
  xtal:      0.4,   // moderate
  syro:      0.3,   // less — IDM does its own thing
  blockhead: 0.5,   // moderate
  flim:      0.5,   // moderate
  disco:     0.3,   // less — disco stays groovy
};
