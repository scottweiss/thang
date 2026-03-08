/**
 * Harmonic velocity — rate of chord root movement affects energy.
 *
 * Large root movements (e.g. IV→V, a fifth apart) feel energetic,
 * while small movements (e.g. I→ii, one step) feel gentle.
 * This module adjusts gain/brightness based on how far the chord
 * root just moved, rewarding dramatic movements with emphasis.
 *
 * Applied as gain/LPF boost on chord changes.
 */

import type { Mood } from '../types';

/**
 * Per-mood velocity sensitivity (higher = more emphasis on large movements).
 */
const VELOCITY_SENSITIVITY: Record<Mood, number> = {
  trance:    0.35,  // moderate
  avril:     0.50,  // strong — dramatic Romantic harmony
  disco:     0.30,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.25,  // weak — hip-hop is less harmonically dramatic
  lofi:      0.45,  // strong — jazz chord movement
  flim:      0.35,  // moderate
  xtal:      0.30,  // moderate
  syro:      0.40,  // strong — IDM dramatic shifts
  ambient:   0.20,  // weak — smooth transitions preferred
};

/**
 * Calculate root movement distance in semitones (pitch class space).
 *
 * @param prevRoot Previous root pitch class (0-11)
 * @param currRoot Current root pitch class (0-11)
 * @returns Distance (0-6, folded at tritone)
 */
export function rootDistance(prevRoot: number, currRoot: number): number {
  const raw = Math.abs(((currRoot - prevRoot) % 12 + 12) % 12);
  return Math.min(raw, 12 - raw); // fold at tritone
}

/**
 * Calculate gain boost from harmonic velocity (root movement).
 *
 * @param distance Root movement distance (0-6)
 * @param mood Current mood
 * @returns Gain multiplier (1.0 - 1.1)
 */
export function velocityGainBoost(distance: number, mood: Mood): number {
  const sensitivity = VELOCITY_SENSITIVITY[mood];
  // Large movement (5-6) = max boost, small (0-1) = no boost
  const normalized = Math.max(0, (distance - 1) / 5);
  return 1.0 + normalized * sensitivity * 0.1;
}

/**
 * Calculate brightness boost from harmonic velocity.
 *
 * @param distance Root movement distance (0-6)
 * @param mood Current mood
 * @returns LPF multiplier (1.0 - 1.08)
 */
export function velocityBrightnessBoost(distance: number, mood: Mood): number {
  const sensitivity = VELOCITY_SENSITIVITY[mood];
  const normalized = Math.max(0, (distance - 1) / 5);
  return 1.0 + normalized * sensitivity * 0.08;
}

/**
 * Get velocity sensitivity for a mood (for testing).
 */
export function velocitySensitivity(mood: Mood): number {
  return VELOCITY_SENSITIVITY[mood];
}
