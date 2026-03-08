/**
 * Harmonic bass clarity — HPF adjustment to prevent bass mud.
 *
 * When drone and harmony layers both have significant low-frequency
 * content, they mask each other creating "mud." This module provides
 * HPF corrections to separate the bass region: drone owns sub-bass,
 * harmony stays above it.
 */

import type { Mood } from '../types';

/**
 * Per-mood bass clarity (higher = more frequency separation).
 */
const BASS_CLARITY: Record<Mood, number> = {
  trance:    0.50,  // high — punchy bass
  avril:     0.45,  // moderate
  disco:     0.55,  // high — dance bass
  downtempo: 0.40,  // moderate
  blockhead: 0.60,  // highest — clean sub-bass
  lofi:      0.35,  // moderate — warm mud OK
  flim:      0.40,  // moderate
  xtal:      0.35,  // moderate
  syro:      0.45,  // moderate
  ambient:   0.30,  // low — bass warmth
};

/**
 * Calculate bass clarity HPF multiplier for harmony layer.
 *
 * @param droneActive Whether drone layer is currently active
 * @param mood Current mood
 * @returns HPF multiplier (1.0 - 1.30, > 1 = higher HPF cutoff)
 */
export function bassClarityHpf(
  droneActive: boolean,
  mood: Mood
): number {
  if (!droneActive) return 1.0; // no conflict without drone

  const clarity = BASS_CLARITY[mood];
  return 1.0 + clarity * 0.45;
}

/**
 * Get bass clarity for a mood (for testing).
 */
export function bassClarity(mood: Mood): number {
  return BASS_CLARITY[mood];
}
