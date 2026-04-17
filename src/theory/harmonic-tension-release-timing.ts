import type { Mood } from '../types';

/**
 * Harmonic tension release timing — when tension drops significantly
 * (resolution moment), a coordinated gain and FM surge emphasizes
 * the release. Models the satisfying "arrival" of harmonic resolution.
 */

const moodSurgeDepth: Record<Mood, number> = {
  ambient: 0.40,
  plantasia: 0.40,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.55,
  avril: 0.60,
  xtal: 0.40,
  syro: 0.20,
  blockhead: 0.35,
  flim: 0.40,
  disco: 0.45,
};

/**
 * Gain multiplier during tension release.
 * tensionDrop: how much tension decreased (0-1 scale)
 * Returns > 1.0 for significant drops.
 */
export function tensionReleaseGain(
  tensionDrop: number,
  mood: Mood,
): number {
  if (tensionDrop <= 0.05) return 1.0; // not a significant drop
  const depth = moodSurgeDepth[mood];
  const surge = Math.min(tensionDrop, 0.5) * depth * 0.10;
  return Math.min(1.05, 1.0 + surge);
}

/**
 * FM multiplier during tension release — brief brightness flash.
 */
export function tensionReleaseFm(
  tensionDrop: number,
  mood: Mood,
): number {
  if (tensionDrop <= 0.05) return 1.0;
  const depth = moodSurgeDepth[mood];
  const flash = Math.min(tensionDrop, 0.5) * depth * 0.08;
  return Math.min(1.04, 1.0 + flash);
}

/** Per-mood surge depth for testing */
export function surgeDepth(mood: Mood): number {
  return moodSurgeDepth[mood];
}
