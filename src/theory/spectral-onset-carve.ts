/**
 * Spectral onset carve — preemptive frequency carving at layer entry.
 *
 * When a new layer fades in during a section transition, there's a
 * brief "muddiness spike" as its frequencies overlap existing layers.
 * This module applies extra HPF/LPF narrowing during the first few
 * ticks of a layer's entry, gradually widening to full bandwidth.
 *
 * Applied as HPF boost and LPF reduction during layer fade-in.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood carving intensity (how aggressively new layers are carved).
 */
const CARVE_INTENSITY: Record<Mood, number> = {
  trance:    0.40,  // moderate — needs energy
  avril:     0.50,  // strong — classical clarity
  disco:     0.35,  // moderate
  downtempo: 0.45,  // smooth
  blockhead: 0.40,  // moderate
  lofi:      0.50,  // clean entry
  flim:      0.45,  // organic
  xtal:      0.55,  // maximum clarity
  syro:      0.35,  // IDM — some chaos OK
  ambient:   0.60,  // very clean transitions
};

/**
 * Calculate HPF boost for a newly entering layer.
 * Returns additional HPF offset (Hz) that decays over ticks.
 *
 * @param layerGainMultiplier Current layer gain multiplier (0-1, low = just entering)
 * @param mood Current mood
 * @param activeLayerCount Total active layers
 * @returns HPF offset to add (0 = no change, positive = cut more bass)
 */
export function onsetHpfBoost(
  layerGainMultiplier: number,
  mood: Mood,
  activeLayerCount: number
): number {
  // Only apply during fade-in (multiplier < 0.7 means still entering)
  if (layerGainMultiplier >= 0.7) return 0;

  const intensity = CARVE_INTENSITY[mood];
  const fadeProgress = layerGainMultiplier; // 0 = just started, 0.7 = almost done
  const carveAmount = (1.0 - fadeProgress / 0.7) * intensity;

  // More active layers = more aggressive carving needed
  const layerPenalty = Math.max(1, activeLayerCount - 2) * 0.15;

  return Math.round(carveAmount * (80 + layerPenalty * 40));
}

/**
 * Calculate LPF reduction for a newly entering layer.
 * Returns LPF multiplier (< 1.0 = darker during entry).
 *
 * @param layerGainMultiplier Current layer gain multiplier (0-1)
 * @param mood Current mood
 * @returns LPF multiplier (0.7 - 1.0)
 */
export function onsetLpfReduction(
  layerGainMultiplier: number,
  mood: Mood
): number {
  if (layerGainMultiplier >= 0.7) return 1.0;

  const intensity = CARVE_INTENSITY[mood];
  const fadeProgress = layerGainMultiplier / 0.7;
  const reduction = (1.0 - fadeProgress) * intensity * 0.3;

  return Math.max(0.7, 1.0 - reduction);
}

/**
 * Is this layer currently in onset phase?
 */
export function isInOnsetPhase(layerGainMultiplier: number): boolean {
  return layerGainMultiplier > 0.01 && layerGainMultiplier < 0.7;
}

/**
 * Should onset carving be applied?
 */
export function shouldCarveOnset(mood: Mood): boolean {
  return CARVE_INTENSITY[mood] > 0.25;
}

/**
 * Get carve intensity for a mood (for testing).
 */
export function carveIntensity(mood: Mood): number {
  return CARVE_INTENSITY[mood];
}
