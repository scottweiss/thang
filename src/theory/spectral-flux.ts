/**
 * Spectral flux — rate of timbral change controls engagement.
 *
 * Too little timbral change = boring. Too much = fatiguing.
 * This module tracks the rate of spectral change (LPF/FM movement)
 * and provides corrections to maintain optimal engagement.
 *
 * Applied as FM/LPF movement rate adjustment.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood target flux rate (higher = more timbral movement).
 */
const TARGET_FLUX: Record<Mood, number> = {
  trance:    0.35,  // moderate — evolving but stable
  avril:     0.40,  // moderate — orchestral color
  disco:     0.25,  // low — consistent brightness
  downtempo: 0.45,  // moderate-high
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // high — warm movement
  flim:      0.55,  // high — delicate shifts
  xtal:      0.60,  // highest — crystalline shimmer
  syro:      0.45,  // moderate-high — IDM movement
  ambient:   0.50,  // high — evolving textures
};

/**
 * Section multipliers for flux target.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.6,   // calm
  build:     1.0,   // normal
  peak:      1.2,   // most movement
  breakdown: 0.8,   // calmer
  groove:    1.1,   // active
};

/**
 * Calculate flux correction factor.
 * If current flux is below target, encourage more movement.
 * If above, encourage stability.
 *
 * @param currentFlux Current rate of timbral change (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Correction multiplier for FM/LPF modulation depth (0.5 - 2.0)
 */
export function fluxCorrection(
  currentFlux: number,
  mood: Mood,
  section: Section
): number {
  const target = TARGET_FLUX[mood] * SECTION_MULT[section];
  const ratio = currentFlux / Math.max(0.01, target);
  // If flux is too low, boost modulation. If too high, reduce.
  if (ratio < 0.5) return 1.5; // significantly below target
  if (ratio < 0.8) return 1.2; // below target
  if (ratio > 2.0) return 0.5; // way above target
  if (ratio > 1.3) return 0.8; // above target
  return 1.0; // near target
}

/**
 * Estimate spectral flux from LPF history.
 *
 * @param lpfHistory Recent LPF values (at least 2)
 * @returns Flux rate (0.0 - 1.0)
 */
export function estimateFlux(lpfHistory: number[]): number {
  if (lpfHistory.length < 2) return 0.5;
  let totalChange = 0;
  for (let i = 1; i < lpfHistory.length; i++) {
    totalChange += Math.abs(lpfHistory[i] - lpfHistory[i - 1]) / Math.max(100, lpfHistory[i - 1]);
  }
  return Math.min(1.0, totalChange / (lpfHistory.length - 1));
}

/**
 * Get target flux for a mood (for testing).
 */
export function targetFlux(mood: Mood): number {
  return TARGET_FLUX[mood];
}
