/**
 * Cross-fade texture — smooth timbral transitions on chord changes.
 *
 * When chords change, the FM parameters and filter settings shouldn't
 * snap instantly. This module computes intermediate timbral values
 * that bridge old and new settings, creating a brief "morph" zone
 * where the sound gradually transforms.
 *
 * Applied as FM/LPF interpolation multipliers in the ticks after
 * a chord change.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood crossfade speed (0 = instant, 1 = very slow morph).
 */
const CROSSFADE_SPEED: Record<Mood, number> = {
  trance:    0.15,  // fast changes — energy
  avril:     0.50,  // slow, classical morph
  disco:     0.20,  // snappy
  downtempo: 0.45,  // smooth jazz
  blockhead: 0.25,  // moderate
  lofi:      0.55,  // very smooth — Rhodes
  flim:      0.45,  // organic morph
  xtal:      0.50,  // ambient transition
  syro:      0.20,  // IDM — quick
  ambient:   0.60,  // slowest morph
};

/**
 * Calculate blend factor for timbral crossfade.
 * Returns 0 (fully new) to 1 (still old).
 *
 * @param ticksSinceChange Ticks since last chord change
 * @param mood Current mood
 * @returns Blend factor (0-1, exponentially decaying toward 0)
 */
export function crossfadeBlend(
  ticksSinceChange: number,
  mood: Mood
): number {
  const speed = CROSSFADE_SPEED[mood];
  if (speed < 0.05 || ticksSinceChange <= 0) return 0;
  // Exponential decay: blend = speed^ticksSinceChange
  return Math.pow(speed, ticksSinceChange);
}

/**
 * Interpolate an FM value during crossfade.
 *
 * @param oldFm Previous FM depth
 * @param newFm Target FM depth
 * @param blend Crossfade blend factor (0-1)
 * @returns Interpolated FM value
 */
export function crossfadeFm(
  oldFm: number,
  newFm: number,
  blend: number
): number {
  return newFm + (oldFm - newFm) * blend;
}

/**
 * Interpolate an LPF value during crossfade.
 *
 * @param oldLpf Previous LPF cutoff
 * @param newLpf Target LPF cutoff
 * @param blend Crossfade blend factor (0-1)
 * @returns Interpolated LPF value
 */
export function crossfadeLpf(
  oldLpf: number,
  newLpf: number,
  blend: number
): number {
  return Math.round(newLpf + (oldLpf - newLpf) * blend);
}

/**
 * Should crossfade be applied?
 */
export function shouldCrossfade(
  ticksSinceChange: number,
  mood: Mood
): boolean {
  return ticksSinceChange > 0 && ticksSinceChange <= 3 && CROSSFADE_SPEED[mood] > 0.10;
}

/**
 * Get crossfade speed for a mood (for testing).
 */
export function crossfadeSpeed(mood: Mood): number {
  return CROSSFADE_SPEED[mood];
}
