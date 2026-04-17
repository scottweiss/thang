/**
 * Dynamic orchestral weight — perceived mass from combined layer activity.
 *
 * When many layers play simultaneously, the sonic "weight" increases.
 * Low-register layers (drone, bass) contribute more perceived mass
 * than high-register layers (arp, atmosphere). This module provides
 * a weight score that can modulate gain and filter to maintain clarity
 * as weight builds — heavier weight slightly reduces upper layer gain
 * and opens LPF on lower layers.
 */

import type { Mood } from '../types';

/**
 * Per-mood weight sensitivity (higher = more weight-aware mixing).
 */
const WEIGHT_SENSITIVITY: Record<Mood, number> = {
  trance:    0.45,  // moderate — powerful layers
  avril:     0.55,  // high — orchestral dynamics
  disco:     0.35,  // moderate — steady groove
  downtempo: 0.50,  // high — careful balance
  blockhead: 0.60,  // highest — heavy beats
  lofi:      0.50,  // high — intimate balance
  flim:      0.40,  // moderate
  xtal:      0.35,  // moderate — airy
  syro:      0.30,  // low — dense is OK
  ambient:   0.55,  // high — space is precious,
  plantasia: 0.55,
};

/**
 * Layer weight contributions (low register = heavier).
 */
const LAYER_WEIGHT: Record<string, number> = {
  drone:      0.30,
  harmony:    0.25,
  melody:     0.15,
  texture:    0.20,
  arp:        0.10,
  atmosphere: 0.05,
};

/**
 * Calculate orchestral weight gain adjustment for a layer.
 *
 * @param layerName Name of the layer being adjusted
 * @param activeLayers Names of currently active layers
 * @param mood Current mood
 * @returns Gain multiplier (0.88 - 1.05)
 */
export function orchestralWeightGain(
  layerName: string,
  activeLayers: string[],
  mood: Mood
): number {
  const sensitivity = WEIGHT_SENSITIVITY[mood];
  const layerW = LAYER_WEIGHT[layerName] ?? 0.15;

  // Sum weight of all active layers
  let totalWeight = 0;
  for (const l of activeLayers) {
    totalWeight += LAYER_WEIGHT[l] ?? 0.15;
  }

  // Normalize: 1 layer = light, 6 layers = heavy
  const heaviness = Math.min(1.0, totalWeight / 0.9);

  // Heavy layers (drone, harmony) get slight boost when weight is high
  // Light layers (arp, atmosphere) get slight reduction
  const isHeavy = layerW >= 0.20;
  const adjustment = isHeavy
    ? heaviness * sensitivity * 0.06   // boost heavy layers slightly
    : -heaviness * sensitivity * 0.10; // reduce light layers slightly

  return Math.max(0.88, Math.min(1.05, 1.0 + adjustment));
}

/**
 * Get weight sensitivity for a mood (for testing).
 */
export function weightSensitivity(mood: Mood): number {
  return WEIGHT_SENSITIVITY[mood];
}
