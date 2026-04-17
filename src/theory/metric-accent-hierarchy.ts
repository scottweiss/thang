/**
 * Metric accent hierarchy — nested weight from bar to sixteenth level.
 *
 * Musical meter is hierarchical: bar-level downbeats are strongest,
 * half-bar beats next, quarters next, eighths weakest. This creates
 * a nested grid of emphasis that drives musical phrasing.
 *
 * Applied as gain multiplier based on metric position weight.
 */

import type { Mood } from '../types';

/**
 * Per-mood hierarchy depth (higher = more contrast between levels).
 */
const HIERARCHY_DEPTH: Record<Mood, number> = {
  trance:    0.55,  // strong — clear metric structure
  avril:     0.50,  // strong — classical phrasing
  disco:     0.45,  // moderate — groove emphasis
  downtempo: 0.35,  // moderate — relaxed
  blockhead: 0.60,  // strongest — punchy metric feel
  lofi:      0.30,  // weak — even feel
  flim:      0.25,  // weak — floating
  xtal:      0.30,  // weak — ethereal
  syro:      0.15,  // weakest — no hierarchy
  ambient:   0.20,  // weak — drifting,
  plantasia: 0.20,
};

/**
 * Base metric weight for a position in a 16-step grid.
 * Returns 0.0 (weakest) to 1.0 (strongest).
 *
 * @param position Position (0-15)
 * @returns Base weight (0.0 - 1.0)
 */
export function metricWeight(position: number): number {
  const pos = ((position % 16) + 16) % 16;

  if (pos === 0) return 1.0;         // bar downbeat
  if (pos === 8) return 0.75;        // half-bar
  if (pos === 4 || pos === 12) return 0.55; // quarter
  if (pos % 2 === 0) return 0.35;    // eighth
  return 0.15;                        // sixteenth
}

/**
 * Gain multiplier based on metric hierarchy position.
 *
 * @param position Beat position (0-15)
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.15)
 */
export function hierarchyGainMultiplier(
  position: number,
  mood: Mood
): number {
  const depth = HIERARCHY_DEPTH[mood];
  const weight = metricWeight(position);
  const deviation = (weight - 0.5) * depth * 0.6;
  return Math.max(0.85, Math.min(1.15, 1.0 + deviation));
}

/**
 * Get hierarchy depth for a mood (for testing).
 */
export function hierarchyDepth(mood: Mood): number {
  return HIERARCHY_DEPTH[mood];
}
