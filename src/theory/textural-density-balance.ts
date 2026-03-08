/**
 * Textural density balance — overall texture adapts to note count.
 *
 * When many layers are playing many notes simultaneously, the
 * texture becomes muddy. This module counts total active notes
 * across all layers and applies gain/filter corrections to maintain
 * clarity. Conversely, when texture is sparse, it allows more
 * body/warmth.
 *
 * Different from density-balance.ts (which degradeBy thins patterns)
 * — this adjusts *timbral parameters* (gain, LPF) without removing notes.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood clarity sensitivity.
 */
const CLARITY_SENSITIVITY: Record<Mood, number> = {
  trance:    0.30,  // dense but clear
  avril:     0.45,  // orchestral clarity
  disco:     0.25,  // groove density OK
  downtempo: 0.40,  // spacious clarity
  blockhead: 0.30,  // choppy density
  lofi:      0.50,  // jazz clarity
  flim:      0.45,  // organic spacing
  xtal:      0.55,  // maximum clarity desire
  syro:      0.25,  // dense complexity accepted
  ambient:   0.60,  // maximum spaciousness
};

/**
 * Calculate total density across all active layers.
 *
 * @param layerDensities Record of layer name → density (0-1)
 * @returns Total density (0-6 for 6 layers)
 */
export function totalDensity(layerDensities: Record<string, number>): number {
  return Object.values(layerDensities).reduce((sum, d) => sum + d, 0);
}

/**
 * Calculate gain correction based on total density.
 * Dense textures get quieter, sparse textures stay full.
 *
 * @param total Total density from totalDensity()
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.6-1.0)
 */
export function densityGainCorrection(
  total: number,
  mood: Mood,
  section: Section
): number {
  const sensitivity = CLARITY_SENSITIVITY[mood];
  const sectionMult: Record<Section, number> = {
    intro: 0.6, build: 0.8, peak: 0.5, breakdown: 1.2, groove: 1.0,
  };

  // Above 3.0 total density, start reducing gain
  const excess = Math.max(0, total - 3.0);
  const reduction = excess * sensitivity * (sectionMult[section] ?? 1.0) * 0.1;
  return Math.max(0.6, 1.0 - reduction);
}

/**
 * Calculate LPF correction for dense textures.
 * Dense = tighter filter to prevent mud.
 *
 * @param total Total density
 * @param mood Current mood
 * @returns LPF multiplier (0.7-1.0)
 */
export function densityLpfCorrection(total: number, mood: Mood): number {
  const sensitivity = CLARITY_SENSITIVITY[mood];
  const excess = Math.max(0, total - 3.0);
  return Math.max(0.7, 1.0 - excess * sensitivity * 0.08);
}

/**
 * Should textural density balance be applied?
 */
export function shouldApplyTexturalBalance(mood: Mood): boolean {
  return CLARITY_SENSITIVITY[mood] > 0.20;
}

/**
 * Get clarity sensitivity for a mood (for testing).
 */
export function claritySensitivity(mood: Mood): number {
  return CLARITY_SENSITIVITY[mood];
}
