/**
 * Spectral masking avoidance — prevent frequency band collisions.
 *
 * When two layers occupy the same frequency range, the louder one
 * masks the quieter one (it becomes inaudible). This module
 * calculates HPF/LPF adjustments to carve frequency space for
 * each layer, ensuring everything remains audible.
 *
 * Different from frequency-band.ts (static per-layer bands).
 * This module dynamically adjusts based on which layers are
 * actually sounding and their relative volumes.
 */

import type { Mood } from '../types';

/**
 * Approximate center frequency per layer (Hz).
 */
const LAYER_CENTER_FREQ: Record<string, number> = {
  drone: 120,
  harmony: 350,
  melody: 800,
  texture: 4000,
  arp: 1200,
  atmosphere: 500,
};

/**
 * Per-mood sensitivity to masking.
 * Higher = more aggressive anti-masking EQ.
 */
const MASKING_SENSITIVITY: Record<Mood, number> = {
  trance:    0.30,  // some masking OK (wall of sound)
  avril:     0.40,  // moderate clarity
  disco:     0.35,  // moderate
  downtempo: 0.45,  // clear
  blockhead: 0.30,  // dense is fine
  lofi:      0.50,  // jazz clarity
  flim:      0.45,  // clear
  xtal:      0.55,  // crystalline clarity
  syro:      0.35,  // complex, some overlap
  ambient:   0.60,  // maximum clarity,
  plantasia: 0.60,
};

/**
 * Calculate the overlap between two frequency bands.
 * Returns 0-1 where 1 = complete overlap.
 *
 * @param center1 Center frequency of layer 1
 * @param center2 Center frequency of layer 2
 * @returns Overlap amount 0-1
 */
export function frequencyOverlap(center1: number, center2: number): number {
  // Use octave distance — closer octaves = more overlap
  const octDist = Math.abs(Math.log2(center1 / center2));
  // Within 1 octave = significant overlap
  if (octDist < 0.5) return 1.0 - octDist * 2;
  if (octDist < 1.5) return Math.max(0, 0.5 - (octDist - 0.5));
  return 0;
}

/**
 * Calculate HPF adjustment for a layer to reduce masking.
 * Returns an additive offset to the layer's HPF (in Hz).
 *
 * @param layerName This layer
 * @param activeLayers Names of all active layers
 * @param mood Current mood
 * @returns HPF offset (positive = raise HPF to clear low-end masking)
 */
export function antiMaskingHpf(
  layerName: string,
  activeLayers: string[],
  mood: Mood
): number {
  const myCenter = LAYER_CENTER_FREQ[layerName] ?? 500;
  const sensitivity = MASKING_SENSITIVITY[mood];

  let maxOverlap = 0;
  let maskingBelow = false;

  for (const other of activeLayers) {
    if (other === layerName) continue;
    const otherCenter = LAYER_CENTER_FREQ[other] ?? 500;
    const overlap = frequencyOverlap(myCenter, otherCenter);
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      maskingBelow = otherCenter < myCenter;
    }
  }

  // Only raise HPF if another layer is below and overlapping
  if (maskingBelow && maxOverlap > 0.2) {
    return maxOverlap * sensitivity * 200; // up to ~120 Hz boost
  }
  return 0;
}

/**
 * Calculate LPF adjustment for a layer to reduce masking.
 *
 * @param layerName This layer
 * @param activeLayers Names of all active layers
 * @param mood Current mood
 * @returns LPF offset (negative = lower LPF to clear high-end masking)
 */
export function antiMaskingLpf(
  layerName: string,
  activeLayers: string[],
  mood: Mood
): number {
  const myCenter = LAYER_CENTER_FREQ[layerName] ?? 500;
  const sensitivity = MASKING_SENSITIVITY[mood];

  let maxOverlap = 0;
  let maskingAbove = false;

  for (const other of activeLayers) {
    if (other === layerName) continue;
    const otherCenter = LAYER_CENTER_FREQ[other] ?? 500;
    const overlap = frequencyOverlap(myCenter, otherCenter);
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      maskingAbove = otherCenter > myCenter;
    }
  }

  // Only lower LPF if another layer is above and overlapping
  if (maskingAbove && maxOverlap > 0.2) {
    return -(maxOverlap * sensitivity * 300); // up to ~180 Hz drop
  }
  return 0;
}

/**
 * Should anti-masking be applied?
 *
 * @param activeLayers Number of active layers
 * @param mood Current mood
 * @returns Whether to apply
 */
export function shouldApplyAntiMasking(activeLayers: number, mood: Mood): boolean {
  return activeLayers >= 3 && MASKING_SENSITIVITY[mood] > 0.25;
}

/**
 * Get masking sensitivity for a mood (for testing).
 */
export function maskingSensitivity(mood: Mood): number {
  return MASKING_SENSITIVITY[mood];
}
