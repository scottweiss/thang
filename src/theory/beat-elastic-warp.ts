/**
 * Beat-elastic warp — section-progressive time stretching.
 *
 * Builds should feel slightly rushed (compressed time), breakdowns
 * should feel elongated (stretched time). This creates perceived
 * acceleration/deceleration without changing the actual BPM,
 * adding organic breathing to the rhythmic feel.
 *
 * Applied as a tempo multiplier that varies with section progress.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood warp range (maximum ± percentage of tempo change).
 */
const WARP_RANGE: Record<Mood, number> = {
  trance:    0.03,  // ±3% — tight
  avril:     0.05,  // ±5% — expressive
  disco:     0.03,  // ±3% — tight groove
  downtempo: 0.06,  // ±6% — lazy
  blockhead: 0.04,  // ±4% — moderate
  lofi:      0.07,  // ±7% — maximum jazz breathing
  flim:      0.05,  // ±5% — organic
  xtal:      0.04,  // ±4% — ambient
  syro:      0.03,  // ±3% — tight IDM
  ambient:   0.02,  // ±2% — minimal
};

/**
 * Section warp direction and amount.
 * Positive = speed up, negative = slow down.
 */
const SECTION_WARP: Record<Section, number> = {
  intro:     -0.3,  // slightly slow — setting the scene
  build:     0.5,   // speed up — building energy
  peak:      0.2,   // slightly fast — riding the energy
  breakdown: -0.7,  // slow down — breathing
  groove:    0.0,   // neutral — steady
};

/**
 * Calculate beat-elastic tempo multiplier.
 *
 * @param sectionProgress 0-1 progress through section
 * @param mood Current mood
 * @param section Current section
 * @returns Tempo multiplier (0.93 - 1.07)
 */
export function beatWarpMultiplier(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const range = WARP_RANGE[mood];
  const direction = SECTION_WARP[section];

  // Warp increases with section progress
  const warp = direction * range * sectionProgress;
  return Math.max(1.0 - range, Math.min(1.0 + range, 1.0 + warp));
}

/**
 * Should beat-elastic warp be applied?
 */
export function shouldApplyBeatWarp(mood: Mood): boolean {
  return WARP_RANGE[mood] > 0.015;
}

/**
 * Get warp range for a mood (for testing).
 */
export function warpRange(mood: Mood): number {
  return WARP_RANGE[mood];
}
