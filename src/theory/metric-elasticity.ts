/**
 * Metric elasticity — bar lengths subtly vary for organic phrasing.
 *
 * Instead of perfectly equal bars, bars can stretch or compress slightly:
 * the first bar of a phrase is slightly longer (establishing),
 * the last bar slightly shorter (driving to resolution).
 * This mimics how conductors shape phrases.
 *
 * Applied as a CPS multiplier per bar position within phrases.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood elasticity range (max deviation from 1.0).
 */
const ELASTICITY_RANGE: Record<Mood, number> = {
  trance:    0.008, // minimal — machine precision
  avril:     0.035, // strong — conductor-like
  disco:     0.005, // minimal — dance needs consistency
  downtempo: 0.025, // moderate
  blockhead: 0.015, // moderate
  lofi:      0.030, // strong — jazz rubato
  flim:      0.020, // moderate
  xtal:      0.018, // moderate
  syro:      0.012, // moderate
  ambient:   0.040, // strongest — time breathes
};

/**
 * Section multiplier.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // more elastic — settling in
  build:     0.8,
  peak:      0.6,   // tightest — locked in
  breakdown: 1.4,   // most elastic — reflective
  groove:    1.0,
};

/**
 * Calculate bar-level tempo elasticity.
 *
 * @param barPosition Position within phrase (0 = first bar, 1 = last bar)
 * @param mood Current mood
 * @param section Current section
 * @returns CPS multiplier (0.96 - 1.04)
 */
export function barElasticity(
  barPosition: number,
  mood: Mood,
  section: Section
): number {
  const range = ELASTICITY_RANGE[mood] * SECTION_MULT[section];
  // First bar slightly slow, middle normal, last bar slightly fast
  const curve = (barPosition - 0.3) * 2; // peaks positive at end
  return 1.0 + curve * range;
}

/**
 * Get elasticity range for a mood (for testing).
 */
export function metricElasticityRange(mood: Mood): number {
  return ELASTICITY_RANGE[mood];
}

/**
 * Should metric elasticity be applied?
 */
export function shouldApplyMetricElasticity(mood: Mood, section: Section): boolean {
  return ELASTICITY_RANGE[mood] * SECTION_MULT[section] > 0.004;
}
