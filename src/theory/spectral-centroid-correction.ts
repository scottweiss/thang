/**
 * Spectral centroid correction — auto-correct brightness per layer.
 *
 * Each mood has an ideal spectral centroid (brightness center).
 * When the combined brightness drifts too far from target,
 * this module provides LPF corrections to pull back toward balance.
 *
 * Applied as LPF multiplier per layer based on centroid deviation.
 */

import type { Mood } from '../types';

/**
 * Target spectral centroid per mood (Hz).
 * Higher = brighter overall sound.
 */
const TARGET_CENTROID: Record<Mood, number> = {
  trance:    2800,  // bright — cutting leads
  avril:     2200,  // warm-bright — orchestral
  disco:     3000,  // brightest — sparkly
  downtempo: 1800,  // warm
  blockhead: 2400,  // medium-bright — punchy
  lofi:      1600,  // warm — tape character
  flim:      2000,  // medium — delicate
  xtal:      2200,  // medium-bright — crystalline
  syro:      2600,  // bright — electronic
  ambient:   1400,  // warmest — soft,
  plantasia: 1400,
};

/**
 * Per-mood correction strength (higher = more aggressive correction).
 */
const CORRECTION_STRENGTH: Record<Mood, number> = {
  trance:    0.35,
  avril:     0.45,
  disco:     0.25,
  downtempo: 0.40,
  blockhead: 0.30,
  lofi:      0.50,
  flim:      0.40,
  xtal:      0.45,
  syro:      0.30,
  ambient:   0.55,
  plantasia: 0.55,
};

/**
 * Calculate LPF correction multiplier based on centroid deviation.
 *
 * @param currentLpf Current LPF value for this layer
 * @param mood Current mood
 * @returns LPF multiplier (0.7 - 1.3)
 */
export function centroidCorrectionLpf(
  currentLpf: number,
  mood: Mood
): number {
  const target = TARGET_CENTROID[mood];
  const strength = CORRECTION_STRENGTH[mood];
  // How far is current LPF from target centroid?
  const deviation = (currentLpf - target) / target;
  // Pull toward target: if too bright (deviation > 0), reduce LPF
  // if too dark (deviation < 0), increase LPF
  const correction = 1.0 - deviation * strength * 0.5;
  return Math.max(0.7, Math.min(1.3, correction));
}

/**
 * Get target centroid for a mood (for testing).
 */
export function targetCentroid(mood: Mood): number {
  return TARGET_CENTROID[mood];
}

/**
 * Get correction strength for a mood (for testing).
 */
export function centroidCorrectionStrength(mood: Mood): number {
  return CORRECTION_STRENGTH[mood];
}
