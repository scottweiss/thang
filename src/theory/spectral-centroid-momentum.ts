/**
 * Spectral centroid momentum — brightness changes with inertia.
 *
 * Real instruments don't jump between bright and dark instantly.
 * Timbral changes have physical momentum. This module smooths LPF
 * transitions by applying inertia — large brightness changes are
 * slowed down, small changes pass through.
 *
 * Applied as LPF correction that resists sudden brightness jumps.
 */

import type { Mood } from '../types';

/**
 * Per-mood inertia strength (higher = more resistance to brightness change).
 */
const INERTIA_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate — steady brightness
  avril:     0.50,  // moderate — orchestral transitions
  disco:     0.30,  // low — responsive
  downtempo: 0.55,  // high — smooth
  blockhead: 0.25,  // low — punchy changes OK
  lofi:      0.45,  // moderate — warm transitions
  flim:      0.50,  // moderate
  xtal:      0.55,  // high — slow shimmer
  syro:      0.20,  // low — rapid changes OK
  ambient:   0.65,  // highest — glacial transitions
};

/**
 * Calculate smoothed LPF value given previous and target LPF.
 *
 * @param previousLpf Previous LPF cutoff (Hz)
 * @param targetLpf Desired new LPF cutoff (Hz)
 * @param mood Current mood
 * @returns Smoothed LPF value (Hz)
 */
export function smoothedCentroid(
  previousLpf: number,
  targetLpf: number,
  mood: Mood
): number {
  const inertia = INERTIA_STRENGTH[mood];
  const diff = targetLpf - previousLpf;

  // Small changes pass through, large changes are damped
  const absDiff = Math.abs(diff);
  const dampingFactor = absDiff > 500
    ? 1.0 - inertia * 0.8  // heavy damping for large jumps
    : absDiff > 200
      ? 1.0 - inertia * 0.4  // moderate damping
      : 1.0;                   // no damping for small changes

  return previousLpf + diff * dampingFactor;
}

/**
 * LPF correction multiplier based on centroid momentum.
 *
 * @param previousLpf Previous LPF (Hz)
 * @param currentLpf Current target LPF (Hz)
 * @param mood Current mood
 * @returns Correction multiplier (0.7 - 1.3)
 */
export function centroidMomentumCorrection(
  previousLpf: number,
  currentLpf: number,
  mood: Mood
): number {
  if (currentLpf <= 0) return 1.0;
  const smoothed = smoothedCentroid(previousLpf, currentLpf, mood);
  const ratio = smoothed / currentLpf;
  return Math.max(0.7, Math.min(1.3, ratio));
}

/**
 * Get inertia strength for a mood (for testing).
 */
export function centroidInertia(mood: Mood): number {
  return INERTIA_STRENGTH[mood];
}
