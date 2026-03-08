/**
 * Frequency masking avoidance — reduce gain when layers share frequency ranges.
 *
 * When two layers occupy similar frequency bands, they mask each
 * other and neither sounds clear. This module scores frequency
 * overlap between layers and provides gain reduction for the
 * less important layer in the overlap region.
 */

import type { Mood } from '../types';

/**
 * Per-mood masking sensitivity (higher = more separation).
 */
const MASKING_SENSITIVITY: Record<Mood, number> = {
  trance:    0.40,  // moderate
  avril:     0.55,  // high — clarity important
  disco:     0.35,  // moderate
  downtempo: 0.50,  // high
  blockhead: 0.45,  // moderate
  lofi:      0.55,  // high — intimate clarity
  flim:      0.50,  // high
  xtal:      0.45,  // moderate
  syro:      0.35,  // low — density OK
  ambient:   0.60,  // highest — pristine clarity
};

/**
 * Approximate center frequencies for each layer.
 */
const LAYER_CENTER_HZ: Record<string, number> = {
  drone:      120,
  harmony:    400,
  melody:     800,
  texture:    2000,
  arp:        1200,
  atmosphere: 3000,
};

/**
 * Calculate frequency masking gain correction.
 *
 * @param layerName Name of layer being adjusted
 * @param otherLayerName Name of potentially masking layer
 * @param mood Current mood
 * @returns Gain multiplier (0.88 - 1.0)
 */
export function maskingAvoidanceGain(
  layerName: string,
  otherLayerName: string,
  mood: Mood
): number {
  const sensitivity = MASKING_SENSITIVITY[mood];
  const center1 = LAYER_CENTER_HZ[layerName] ?? 500;
  const center2 = LAYER_CENTER_HZ[otherLayerName] ?? 500;

  // Frequency distance in octaves
  const ratio = Math.max(center1, center2) / Math.min(center1, center2);
  const octaveDistance = Math.log2(ratio);

  // Close layers mask each other
  if (octaveDistance > 1.5) return 1.0; // well separated

  const overlap = 1.0 - octaveDistance / 1.5;
  const reduction = overlap * sensitivity * 0.15;
  return Math.max(0.88, 1.0 - reduction);
}

/**
 * Get masking sensitivity for a mood (for testing).
 */
export function maskingSensitivity(mood: Mood): number {
  return MASKING_SENSITIVITY[mood];
}
