/**
 * Phrase cadence timing — phrase endings align with metrically strong positions.
 *
 * Musical phrases tend to end on strong beats (downbeat, beat 3).
 * A phrase ending on a weak beat feels unresolved or awkward.
 * This module scores beat positions for cadential fitness,
 * providing a gain boost when endings land on strong beats.
 */

import type { Mood } from '../types';

/**
 * Per-mood cadence timing strictness (higher = stricter alignment).
 */
const CADENCE_STRICTNESS: Record<Mood, number> = {
  trance:    0.60,  // high — locked grid
  avril:     0.55,  // high — classical phrasing
  disco:     0.50,  // moderate — on the beat
  downtempo: 0.40,  // moderate — relaxed
  blockhead: 0.45,  // moderate — hip-hop phrasing
  lofi:      0.35,  // low — lazy endings OK
  flim:      0.30,  // low — IDM flexibility
  xtal:      0.25,  // low — floating
  syro:      0.15,  // lowest — any position
  ambient:   0.20,  // low — timeless,
  plantasia: 0.20,
};

/**
 * Metric strength at each position in a 16-step grid.
 * 0 = downbeat (strongest), 8 = beat 3 (next strongest), etc.
 */
function metricStrength(position: number): number {
  const pos = ((position % 16) + 16) % 16;
  if (pos === 0) return 1.0;         // downbeat
  if (pos === 8) return 0.8;         // beat 3
  if (pos === 4 || pos === 12) return 0.6; // beats 2 and 4
  if (pos % 2 === 0) return 0.3;     // eighth notes
  return 0.1;                         // sixteenth notes
}

/**
 * Calculate cadence timing gain for a phrase ending at given position.
 *
 * @param position Beat position (0-15)
 * @param mood Current mood
 * @returns Gain multiplier (0.92 - 1.10)
 */
export function cadenceTimingGain(
  position: number,
  mood: Mood
): number {
  const strictness = CADENCE_STRICTNESS[mood];
  const strength = metricStrength(position);

  // Strong positions get boost, weak positions get slight reduction
  const boost = (strength - 0.5) * strictness * 0.20;
  return Math.max(0.92, Math.min(1.10, 1.0 + boost));
}

/**
 * Get cadence strictness for a mood (for testing).
 */
export function cadenceStrictness(mood: Mood): number {
  return CADENCE_STRICTNESS[mood];
}
