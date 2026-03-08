/**
 * Spectral blend — layer frequency overlap control for mix clarity.
 *
 * When multiple layers occupy the same frequency range, they mask
 * each other. This module detects overlap and provides LPF/HPF
 * corrections to carve spectral space for each layer.
 *
 * Applied as LPF/HPF adjustment per layer based on frequency overlap.
 */

import type { Mood } from '../types';

/**
 * Per-mood blend sensitivity (higher = more aggressive separation).
 */
const BLEND_SENSITIVITY: Record<Mood, number> = {
  trance:    0.40,  // moderate — some blending OK
  avril:     0.50,  // strong — orchestral clarity
  disco:     0.35,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.45,  // moderate
  lofi:      0.30,  // weak — warmth from blending
  flim:      0.45,  // moderate
  xtal:      0.55,  // strongest — crystalline separation
  syro:      0.35,  // moderate
  ambient:   0.25,  // weak — blending is character
};

/**
 * Approximate center frequency per layer (Hz).
 */
const LAYER_CENTER_FREQ: Record<string, number> = {
  drone:      150,   // bass
  harmony:    800,   // mid
  melody:     1200,  // upper-mid
  texture:    4000,  // high (cymbals, hats)
  arp:        1000,  // mid
  atmosphere: 600,   // low-mid
};

/**
 * Calculate frequency overlap between two layers.
 *
 * @param layer1 First layer name
 * @param layer2 Second layer name
 * @returns Overlap score (0.0 = no overlap, 1.0 = identical range)
 */
export function frequencyOverlap(layer1: string, layer2: string): number {
  const f1 = LAYER_CENTER_FREQ[layer1] ?? 1000;
  const f2 = LAYER_CENTER_FREQ[layer2] ?? 1000;
  // Overlap based on ratio of center frequencies
  const ratio = Math.max(f1, f2) / Math.max(100, Math.min(f1, f2));
  // ratio of 1 = identical, 2 = octave apart (low overlap), 4+ = no overlap
  return Math.max(0, 1.0 - (ratio - 1) * 0.8);
}

/**
 * Calculate LPF correction for a layer based on overlap with others.
 *
 * @param layerName This layer
 * @param activeLayerNames All active layer names
 * @param mood Current mood
 * @returns LPF multiplier (0.8 - 1.1)
 */
export function blendLpfCorrection(
  layerName: string,
  activeLayerNames: string[],
  mood: Mood
): number {
  const sensitivity = BLEND_SENSITIVITY[mood];
  const myFreq = LAYER_CENTER_FREQ[layerName] ?? 1000;
  let totalOverlap = 0;
  let count = 0;

  for (const other of activeLayerNames) {
    if (other === layerName) continue;
    const otherFreq = LAYER_CENTER_FREQ[other] ?? 1000;
    totalOverlap += frequencyOverlap(layerName, other);
    count++;
  }

  if (count === 0) return 1.0;
  const avgOverlap = totalOverlap / count;

  // If this layer is higher than average overlap partner, brighten slightly
  // If lower, darken slightly — creating spectral separation
  const avgOtherFreq = activeLayerNames
    .filter(n => n !== layerName)
    .reduce((sum, n) => sum + (LAYER_CENTER_FREQ[n] ?? 1000), 0) / count;

  const direction = myFreq > avgOtherFreq ? 0.05 : -0.05;
  return Math.max(0.8, Math.min(1.1, 1.0 + direction * avgOverlap * sensitivity));
}

/**
 * Get blend sensitivity for a mood (for testing).
 */
export function blendSensitivity(mood: Mood): number {
  return BLEND_SENSITIVITY[mood];
}
