/**
 * Spectral warmth tracking — FM ratio warmth scoring for organic timbre.
 *
 * Simple integer FM ratios (1:1, 2:1, 3:1) produce warm, harmonic
 * timbres. Complex/detuned ratios produce cold, metallic sounds.
 * This module scores an FM ratio for warmth and provides correction
 * factors to keep timbres in the mood-appropriate warmth range.
 */

import type { Mood } from '../types';

/**
 * Per-mood warmth target (0 = cold/metallic, 1 = warm/organic).
 */
const WARMTH_TARGET: Record<Mood, number> = {
  trance:    0.50,  // moderate — clean synths
  avril:     0.70,  // high — warm classical
  disco:     0.55,  // moderate — bright but warm
  downtempo: 0.75,  // high — cozy warmth
  blockhead: 0.45,  // moderate — gritty
  lofi:      0.80,  // highest — tape warmth
  flim:      0.60,  // moderate — delicate
  xtal:      0.65,  // moderate-high — glassy warmth
  syro:      0.35,  // low — metallic OK
  ambient:   0.70,  // high — organic,
  plantasia: 0.70,
};

/**
 * Score how "warm" an FM ratio is (0 = cold, 1 = warm).
 * Integer ratios and simple fractions are warmer.
 */
function warmthScore(fmRatio: number): number {
  if (fmRatio <= 0) return 0.5;

  // Distance from nearest integer ratio
  const nearest = Math.round(fmRatio);
  const deviation = Math.abs(fmRatio - nearest);

  // Simple ratios (1, 2, 3) are warmest
  const simplicityBonus = nearest <= 3 ? 0.2 : 0;

  const warmth = 1.0 - deviation * 2.0 + simplicityBonus;
  return Math.max(0, Math.min(1, warmth));
}

/**
 * Calculate FM correction factor to nudge toward mood warmth target.
 *
 * @param fmRatio Current FM frequency ratio
 * @param mood Current mood
 * @returns FM multiplier (0.85 - 1.15) to adjust FM depth
 */
export function warmthFmCorrection(
  fmRatio: number,
  mood: Mood
): number {
  const target = WARMTH_TARGET[mood];
  const current = warmthScore(fmRatio);

  // If current warmth matches target, no correction needed
  const error = target - current;

  // Positive error = too cold, reduce FM depth (warm up)
  // Negative error = too warm, increase FM depth (cool down)
  const correction = error * 0.20;
  return Math.max(0.85, Math.min(1.15, 1.0 - correction));
}

/**
 * Get warmth target for a mood (for testing).
 */
export function warmthTarget(mood: Mood): number {
  return WARMTH_TARGET[mood];
}
