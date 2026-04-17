/**
 * Rhythmic hocket — cross-layer density anticorrelation.
 *
 * When one melodic layer is dense (many notes), others should thin
 * out. This creates rhythmic "negative space" — layers take turns
 * shining rather than all playing densely at once. The result is
 * clarity, bounce, and conversational texture.
 *
 * Applied as a density multiplier: layers check how active the
 * "speaking" layers are and reduce their own density accordingly.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood hocket strength.
 * Higher = more aggressive density anticorrelation.
 */
const HOCKET_STRENGTH: Record<Mood, number> = {
  trance:    0.15,  // mostly locked together
  avril:     0.30,  // some independence
  disco:     0.35,  // groove conversation
  downtempo: 0.40,  // breathing space
  blockhead: 0.45,  // choppy independence
  lofi:      0.55,  // jazz conversation
  flim:      0.60,  // organic trading
  xtal:      0.50,  // floating independence
  syro:      0.35,  // complex but coordinated
  ambient:   0.25,  // gentle separation,
  plantasia: 0.25,
};

/**
 * Section multiplier for hocket effect.
 */
const SECTION_HOCKET: Record<Section, number> = {
  intro:     0.4,   // sparse anyway
  build:     0.8,   // growing independence
  peak:      0.6,   // some lock for power
  breakdown: 1.2,   // maximum breathing
  groove:    1.0,   // normal
};

/**
 * Calculate density reduction for a layer based on other layers' activity.
 *
 * @param layerDensity This layer's current density (0-1)
 * @param otherDensities Other active layers' densities
 * @param mood Current mood
 * @param section Current section
 * @returns Density multiplier (0.5-1.0)
 */
export function hocketDensityMultiplier(
  layerDensity: number,
  otherDensities: number[],
  mood: Mood,
  section: Section
): number {
  if (otherDensities.length === 0) return 1.0;

  const strength = HOCKET_STRENGTH[mood] * SECTION_HOCKET[section];
  const avgOther = otherDensities.reduce((a, b) => a + b, 0) / otherDensities.length;

  // When others are dense, reduce this layer
  const reduction = avgOther * strength;
  return Math.max(0.5, 1.0 - reduction);
}

/**
 * Should hocket be applied?
 */
export function shouldApplyHocket(mood: Mood, section: Section): boolean {
  return HOCKET_STRENGTH[mood] * SECTION_HOCKET[section] > 0.10;
}

/**
 * Get hocket strength for a mood (for testing).
 */
export function hocketStrength(mood: Mood): number {
  return HOCKET_STRENGTH[mood];
}
