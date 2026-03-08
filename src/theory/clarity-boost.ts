/**
 * Clarity boost — spectral gap EQ lift for masked layers.
 *
 * When multiple layers compete in the same frequency range, the
 * quieter/secondary ones get masked. Rather than just cutting their
 * frequencies (which thins them), this module identifies spectral
 * gaps where the layer can "poke through" and boosts those ranges.
 *
 * Applied as targeted LPF/gain adjustments for masked layers.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood clarity boost strength.
 */
const CLARITY_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate — wall of sound OK
  avril:     0.50,  // strong — classical clarity
  disco:     0.35,  // moderate
  downtempo: 0.45,  // smooth clarity
  blockhead: 0.40,  // moderate
  lofi:      0.50,  // clean jazz separation
  flim:      0.45,  // organic
  xtal:      0.55,  // high clarity
  syro:      0.35,  // IDM — some chaos OK
  ambient:   0.60,  // maximum clarity
};

/**
 * Estimate a layer's spectral "weight" (center frequency tendency).
 * Lower = bass-heavy, higher = treble-heavy.
 */
const LAYER_SPECTRAL_CENTER: Record<string, number> = {
  drone:      200,   // low
  harmony:    800,   // mid-low
  melody:     2000,  // mid-high
  texture:    4000,  // high
  arp:        1500,  // mid
  atmosphere: 500,   // low-mid
};

/**
 * Calculate clarity gain boost for a secondary layer.
 * Layers far from the dominant layer's frequency get less boost.
 *
 * @param layerName The layer needing clarity
 * @param dominantLayer The currently loudest/most prominent layer
 * @param mood Current mood
 * @returns Gain multiplier (1.0 - 1.15)
 */
export function clarityGainBoost(
  layerName: string,
  dominantLayer: string,
  mood: Mood
): number {
  if (layerName === dominantLayer) return 1.0;

  const strength = CLARITY_STRENGTH[mood];
  const myCenter = LAYER_SPECTRAL_CENTER[layerName] ?? 1000;
  const domCenter = LAYER_SPECTRAL_CENTER[dominantLayer] ?? 1000;

  // Closer centers = more masking = more boost needed
  const distance = Math.abs(myCenter - domCenter);
  const proximity = Math.max(0, 1.0 - distance / 3000); // 0=far, 1=same freq

  const boost = proximity * strength * 0.15;
  return Math.min(1.15, 1.0 + boost);
}

/**
 * Calculate LPF boost to help a masked layer cut through.
 * Opens up the filter slightly for layers being masked.
 *
 * @param layerName The masked layer
 * @param dominantLayer The dominant layer
 * @param mood Current mood
 * @returns LPF multiplier (1.0 - 1.2)
 */
export function clarityLpfBoost(
  layerName: string,
  dominantLayer: string,
  mood: Mood
): number {
  if (layerName === dominantLayer) return 1.0;

  const strength = CLARITY_STRENGTH[mood];
  const myCenter = LAYER_SPECTRAL_CENTER[layerName] ?? 1000;
  const domCenter = LAYER_SPECTRAL_CENTER[dominantLayer] ?? 1000;

  // If the layer is lower than the dominant, open its LPF
  const needsOpening = domCenter > myCenter;
  if (!needsOpening) return 1.0;

  const proximity = Math.max(0, 1.0 - Math.abs(myCenter - domCenter) / 3000);
  return Math.min(1.2, 1.0 + proximity * strength * 0.2);
}

/**
 * Find the dominant (loudest/most prominent) layer by gain.
 *
 * @param layerGains Record of layer name → gain value
 * @returns Name of the dominant layer
 */
export function findDominantLayer(
  layerGains: Record<string, number>
): string {
  let max = -1;
  let dominant = 'melody';
  for (const [name, gain] of Object.entries(layerGains)) {
    if (gain > max) {
      max = gain;
      dominant = name;
    }
  }
  return dominant;
}

/**
 * Should clarity boost be applied?
 */
export function shouldApplyClarity(
  mood: Mood,
  activeLayerCount: number
): boolean {
  return activeLayerCount >= 3 && CLARITY_STRENGTH[mood] > 0.30;
}

/**
 * Get clarity strength for a mood (for testing).
 */
export function clarityStrengthForMood(mood: Mood): number {
  return CLARITY_STRENGTH[mood];
}
