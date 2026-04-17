/**
 * Intra-bar density modulation — vary event density within bars.
 *
 * Rather than uniform density across a bar, natural music has
 * more events at the start of bars and phrases, thinning toward
 * the end. This creates rhythmic breathing within the bar itself.
 *
 * Applied as gain multiplier that creates density contour within bars.
 */

import type { Mood } from '../types';

/**
 * Per-mood density contour strength (higher = more variation within bars).
 */
const CONTOUR_STRENGTH: Record<Mood, number> = {
  trance:    0.25,  // low — steady
  avril:     0.50,  // high — expressive
  disco:     0.20,  // low — locked
  downtempo: 0.45,  // moderate
  blockhead: 0.35,  // moderate — choppy
  lofi:      0.40,  // moderate
  flim:      0.55,  // high — delicate
  xtal:      0.50,  // high
  syro:      0.30,  // moderate
  ambient:   0.60,  // highest — breathing,
  plantasia: 0.60,
};

/**
 * Calculate density multiplier for a position within a bar.
 *
 * @param barPosition Position within bar (0.0 = bar start, 1.0 = bar end)
 * @param mood Current mood
 * @returns Density gain multiplier (0.85 - 1.10)
 */
export function intraBarDensity(
  barPosition: number,
  mood: Mood
): number {
  const strength = CONTOUR_STRENGTH[mood];
  const pos = Math.max(0, Math.min(1, barPosition));

  // Front-weighted: higher density at start, lower at end
  // With a slight pickup at the very end (anacrusis into next bar)
  const contour = pos < 0.85
    ? 1.0 - pos * 0.3  // gradual decrease
    : 0.75 + (pos - 0.85) * 1.67; // pickup at end

  const deviation = (contour - 0.85) * strength * 0.6;
  return Math.max(0.85, Math.min(1.10, 1.0 + deviation));
}

/**
 * Get contour strength for a mood (for testing).
 */
export function contourStrength(mood: Mood): number {
  return CONTOUR_STRENGTH[mood];
}
