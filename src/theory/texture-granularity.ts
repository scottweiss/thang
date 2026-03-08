/**
 * Texture granularity — grain density control for atmospheric layers.
 *
 * Atmospheric textures can range from smooth (few, long grains)
 * to granular (many, short grains). This module controls that
 * density based on section and mood for textural variety.
 *
 * Applied as pattern density and decay adjustment for atmosphere.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood granularity range (higher = more granular tendency).
 */
const GRANULARITY_RANGE: Record<Mood, number> = {
  trance:    0.30,  // low — smooth textures
  avril:     0.35,  // low-moderate — smooth orchestral
  disco:     0.25,  // low — smooth grooves
  downtempo: 0.40,  // moderate
  blockhead: 0.45,  // moderate — some grain
  lofi:      0.55,  // high — vinyl crackle character
  flim:      0.60,  // high — micro-detail
  xtal:      0.65,  // highest — crystalline grains
  syro:      0.50,  // moderate — IDM texture
  ambient:   0.45,  // moderate — evolving textures
};

/**
 * Section-specific granularity bias.
 */
const SECTION_BIAS: Record<Section, number> = {
  intro:     0.3,   // smooth intro
  build:     0.5,   // moderate
  peak:      0.8,   // most granular at peak
  breakdown: 0.4,   // smooth breakdown
  groove:    0.6,   // moderate-high
};

/**
 * Calculate grain density (0.0 smooth - 1.0 granular).
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Grain density (0.0 - 1.0)
 */
export function grainDensity(mood: Mood, section: Section): number {
  const range = GRANULARITY_RANGE[mood];
  const bias = SECTION_BIAS[section];
  return Math.max(0.0, Math.min(1.0, range * bias));
}

/**
 * Calculate decay multiplier for grain character.
 * More granular = shorter decay.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Decay multiplier (0.5 - 1.5)
 */
export function grainDecayMultiplier(mood: Mood, section: Section): number {
  const density = grainDensity(mood, section);
  // High density = short decay (0.5), low density = long decay (1.5)
  return 1.5 - density;
}

/**
 * Get granularity range for a mood (for testing).
 */
export function granularityRange(mood: Mood): number {
  return GRANULARITY_RANGE[mood];
}
