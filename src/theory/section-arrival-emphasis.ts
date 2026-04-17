/**
 * Section arrival emphasis — gain/brightness surge at section boundaries.
 *
 * The moment a new section begins is a key structural event.
 * A brief gain and brightness boost at the arrival point
 * marks the transition and gives it impact, similar to how
 * an orchestra emphasizes the first beat of a new section.
 */

import type { Mood } from '../types';

/**
 * Per-mood arrival emphasis (higher = more impact at boundaries).
 */
const ARRIVAL_EMPHASIS: Record<Mood, number> = {
  trance:    0.60,  // highest — dramatic drops
  avril:     0.55,  // high — classical arrivals
  disco:     0.50,  // high — beat drops
  downtempo: 0.35,  // moderate
  blockhead: 0.45,  // moderate
  lofi:      0.25,  // low — subtle transitions
  flim:      0.30,  // moderate
  xtal:      0.30,  // moderate
  syro:      0.20,  // low — seamless
  ambient:   0.15,  // lowest — drifting,
  plantasia: 0.15,
};

/**
 * Calculate arrival emphasis gain.
 *
 * @param sectionProgress Progress through section (0-1)
 * @param mood Current mood
 * @returns Gain multiplier (1.0 - 1.10)
 */
export function arrivalEmphasisGain(
  sectionProgress: number,
  mood: Mood
): number {
  const emphasis = ARRIVAL_EMPHASIS[mood];
  const t = Math.max(0, Math.min(1, sectionProgress));

  // Exponential decay from section start
  if (t > 0.15) return 1.0; // only in first 15% of section

  const boost = emphasis * 0.15 * Math.exp(-t * 20);
  return Math.min(1.10, 1.0 + boost);
}

/**
 * Get arrival emphasis for a mood (for testing).
 */
export function arrivalEmph(mood: Mood): number {
  return ARRIVAL_EMPHASIS[mood];
}
