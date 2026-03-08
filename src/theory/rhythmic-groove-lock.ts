/**
 * Rhythmic groove lock — quantize timing drift on strong beats.
 *
 * Even with humanized timing, strong beats should be relatively
 * tight to maintain groove feel. This module provides a timing
 * correction strength that pulls notes toward the grid on strong
 * beats while allowing more freedom on weak beats.
 */

import type { Mood } from '../types';

/**
 * Per-mood groove lock tightness (higher = tighter grid).
 */
const LOCK_TIGHTNESS: Record<Mood, number> = {
  trance:    0.70,  // highest — machine-tight
  avril:     0.35,  // low — rubato freedom
  disco:     0.65,  // high — dance grid
  downtempo: 0.40,  // moderate
  blockhead: 0.55,  // moderate — pocket groove
  lofi:      0.30,  // low — lazy timing
  flim:      0.25,  // low — IDM freedom
  xtal:      0.20,  // lowest — floating
  syro:      0.15,  // lowest — anti-grid
  ambient:   0.10,  // lowest — timeless
};

/**
 * Calculate groove lock correction strength.
 *
 * @param position Beat position (0-15)
 * @param mood Current mood
 * @returns Lock strength (0 = free, 1 = locked to grid)
 */
export function grooveLockStrength(
  position: number,
  mood: Mood
): number {
  const tightness = LOCK_TIGHTNESS[mood];
  const pos = ((position % 16) + 16) % 16;

  // Strong beats lock tighter
  let beatStrength = 0.2;
  if (pos === 0) beatStrength = 1.0;
  else if (pos === 8) beatStrength = 0.8;
  else if (pos === 4 || pos === 12) beatStrength = 0.6;
  else if (pos % 2 === 0) beatStrength = 0.4;

  return beatStrength * tightness;
}

/**
 * Calculate groove lock gain (reward for grid alignment).
 *
 * @param position Beat position (0-15)
 * @param mood Current mood
 * @returns Gain multiplier (0.96 - 1.05)
 */
export function grooveLockGain(
  position: number,
  mood: Mood
): number {
  const strength = grooveLockStrength(position, mood);
  const boost = strength * 0.06;
  return Math.max(0.96, Math.min(1.05, 1.0 + boost));
}

/**
 * Get lock tightness for a mood (for testing).
 */
export function lockTightness(mood: Mood): number {
  return LOCK_TIGHTNESS[mood];
}
