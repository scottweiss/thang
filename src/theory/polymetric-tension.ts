/**
 * Polymetric tension — tension from conflicting metric groupings.
 *
 * When layers imply different meters (e.g., 3-feel against 4-feel),
 * the conflict creates rhythmic tension. This module quantifies
 * that tension and provides modulation based on metric alignment.
 *
 * Applied as gain/FM modulation at points of metric conflict.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood polymetric tolerance (higher = more conflict accepted).
 */
const POLYMETRIC_TOLERANCE: Record<Mood, number> = {
  trance:    0.15,  // low — steady 4/4
  avril:     0.30,  // moderate — some hemiola
  disco:     0.10,  // very low — steady groove
  downtempo: 0.35,  // moderate
  blockhead: 0.25,  // moderate
  lofi:      0.40,  // moderate — swing/shuffle
  flim:      0.50,  // high — metric play
  xtal:      0.55,  // high — crystalline asymmetry
  syro:      0.65,  // highest — polymetric IDM
  ambient:   0.45,  // moderate — floating meters
};

/**
 * Calculate metric conflict level between two groupings.
 *
 * @param grouping1 First metric grouping (e.g., 3 for 3/4 feel)
 * @param grouping2 Second metric grouping (e.g., 4 for 4/4 feel)
 * @returns Conflict level (0.0 = aligned, 1.0 = maximum conflict)
 */
export function metricConflict(grouping1: number, grouping2: number): number {
  if (grouping1 === grouping2) return 0;
  const g1 = Math.max(2, Math.min(7, grouping1));
  const g2 = Math.max(2, Math.min(7, grouping2));
  // GCD determines alignment frequency
  const gcd = gcdCalc(g1, g2);
  const lcm = (g1 * g2) / gcd;
  // Higher LCM = less frequent alignment = more conflict
  return Math.min(1.0, (lcm - Math.max(g1, g2)) / 12);
}

function gcdCalc(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * Calculate tension modifier from polymetric conflict.
 *
 * @param tick Current tick
 * @param grouping1 Layer 1 grouping
 * @param grouping2 Layer 2 grouping
 * @param mood Current mood
 * @returns Tension modifier (0.0 - 0.3)
 */
export function polymetricTension(
  tick: number,
  grouping1: number,
  grouping2: number,
  mood: Mood
): number {
  const tolerance = POLYMETRIC_TOLERANCE[mood];
  const conflict = metricConflict(grouping1, grouping2);
  // Tension peaks when neither grouping aligns
  const pos1 = tick % grouping1;
  const pos2 = tick % grouping2;
  const aligned = (pos1 === 0 || pos2 === 0) ? 0.3 : 1.0;
  return conflict * tolerance * aligned * 0.3;
}

/**
 * Get polymetric tolerance for a mood (for testing).
 */
export function polymetricTolerance(mood: Mood): number {
  return POLYMETRIC_TOLERANCE[mood];
}
