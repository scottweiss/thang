/**
 * Spectral density control — FM depth inversely tracks active layers.
 *
 * With many active layers, each layer's harmonics compete for
 * spectral space. Reducing FM depth when many layers play keeps
 * timbres cleaner. When few layers play, richer FM is welcome.
 */

import type { Mood } from '../types';

/**
 * Per-mood density control strength.
 */
const CONTROL_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate
  avril:     0.50,  // high
  disco:     0.35,  // moderate
  downtempo: 0.55,  // high
  blockhead: 0.45,  // moderate
  lofi:      0.50,  // high
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.30,  // low — density welcome
  ambient:   0.60,  // highest — purity important
};

/**
 * Calculate spectral density FM multiplier.
 *
 * @param activeLayerCount Number of active layers (1-6)
 * @param mood Current mood
 * @returns FM multiplier (0.75 - 1.15)
 */
export function spectralDensityFm(
  activeLayerCount: number,
  mood: Mood
): number {
  const strength = CONTROL_STRENGTH[mood];
  const count = Math.max(1, Math.min(6, activeLayerCount));

  // Reference: 3 layers = neutral
  const deviation = count - 3;
  // More layers = reduce FM, fewer = boost FM
  const adjustment = -deviation * strength * 0.10;

  return Math.max(0.75, Math.min(1.15, 1.0 + adjustment));
}

/**
 * Get control strength for a mood (for testing).
 */
export function controlStrength(mood: Mood): number {
  return CONTROL_STRENGTH[mood];
}
