/**
 * Registral balance — distribute layers across the frequency spectrum evenly.
 *
 * When multiple layers cluster in the same octave, the mix becomes muddy.
 * This module detects register crowding and suggests gain adjustments
 * to maintain clarity — boosting isolated layers and reducing clustered ones.
 *
 * Applied as a gain correction per layer.
 */

import type { Mood } from '../types';

/**
 * Per-mood sensitivity to registral crowding (higher = more correction).
 */
const BALANCE_SENSITIVITY: Record<Mood, number> = {
  trance:    0.35,  // moderate
  avril:     0.50,  // strong — classical voicing clarity
  disco:     0.30,  // moderate
  downtempo: 0.45,  // strong
  blockhead: 0.40,  // moderate
  lofi:      0.55,  // strong — jazz clarity
  flim:      0.40,  // moderate
  xtal:      0.50,  // strong — ambient space
  syro:      0.25,  // weak — IDM likes density
  ambient:   0.60,  // strongest — space between voices
};

/**
 * Calculate how crowded a register is given layer center frequencies.
 *
 * @param layerCenters Array of approximate center frequencies (Hz) per layer
 * @returns Crowding score 0-1 (0 = well separated, 1 = fully overlapping)
 */
export function registerCrowding(layerCenters: number[]): number {
  if (layerCenters.length < 2) return 0;
  // Convert to log space for perceptual distance
  const logs = layerCenters.map(f => Math.log2(Math.max(20, f)));
  let totalOverlap = 0;
  let pairs = 0;
  for (let i = 0; i < logs.length; i++) {
    for (let j = i + 1; j < logs.length; j++) {
      const dist = Math.abs(logs[i] - logs[j]);
      // Within 1 octave = crowded, 2+ octaves = fine
      const overlap = Math.max(0, 1 - dist);
      totalOverlap += overlap;
      pairs++;
    }
  }
  return pairs > 0 ? totalOverlap / pairs : 0;
}

/**
 * Calculate gain correction for a layer based on registral balance.
 *
 * @param layerCenter This layer's center frequency (Hz)
 * @param allCenters All layer center frequencies
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.15)
 */
export function registralGainCorrection(
  layerCenter: number,
  allCenters: number[],
  mood: Mood
): number {
  const sensitivity = BALANCE_SENSITIVITY[mood];
  const logCenter = Math.log2(Math.max(20, layerCenter));
  const otherLogs = allCenters
    .map(f => Math.log2(Math.max(20, f)))
    .filter(l => Math.abs(l - logCenter) > 0.01);
  if (otherLogs.length === 0) return 1.0;
  // Average proximity to other layers
  const avgProx = otherLogs.reduce((sum, l) => sum + Math.max(0, 1 - Math.abs(l - logCenter)), 0) / otherLogs.length;
  // Crowded → reduce, isolated → boost
  const correction = -avgProx * sensitivity * 0.15 + (1 - avgProx) * sensitivity * 0.05;
  return Math.max(0.85, Math.min(1.15, 1.0 + correction));
}

/**
 * Get balance sensitivity for a mood (for testing).
 */
export function balanceSensitivity(mood: Mood): number {
  return BALANCE_SENSITIVITY[mood];
}
