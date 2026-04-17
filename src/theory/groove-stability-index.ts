/**
 * Groove stability index — rhythmic consistency for reliable grooves.
 *
 * A stable groove has consistent rhythmic patterns that the listener
 * can lock onto. This module scores rhythmic consistency and provides
 * gain emphasis for patterns that maintain stability, encouraging
 * groove reliability over rhythmic chaos.
 */

import type { Mood } from '../types';

/**
 * Per-mood stability preference (higher = more consistent grooves).
 */
const STABILITY_PREFERENCE: Record<Mood, number> = {
  trance:    0.65,  // highest — locked grooves
  avril:     0.40,  // moderate — rubato OK
  disco:     0.60,  // high — dance groove
  downtempo: 0.45,  // moderate
  blockhead: 0.55,  // high — hip-hop pocket
  lofi:      0.35,  // low — lazy grooves OK
  flim:      0.25,  // low — IDM instability
  xtal:      0.20,  // low — floating
  syro:      0.15,  // lowest — chaos welcome
  ambient:   0.10,  // lowest — no groove,
  plantasia: 0.10,
};

/**
 * Calculate groove stability gain.
 *
 * @param patternConsistency How consistent the rhythm is (0 = chaotic, 1 = locked)
 * @param mood Current mood
 * @returns Gain multiplier (0.94 - 1.06)
 */
export function grooveStabilityGain(
  patternConsistency: number,
  mood: Mood
): number {
  const preference = STABILITY_PREFERENCE[mood];
  const consistency = Math.max(0, Math.min(1, patternConsistency));

  // High consistency in stability-preferring mood = boost
  const adjustment = (consistency - 0.5) * preference * 0.12;
  return Math.max(0.94, Math.min(1.06, 1.0 + adjustment));
}

/**
 * Get stability preference for a mood (for testing).
 */
export function stabilityPreference(mood: Mood): number {
  return STABILITY_PREFERENCE[mood];
}
