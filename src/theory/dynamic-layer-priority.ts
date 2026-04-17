/**
 * Dynamic layer priority — melody gets priority when active.
 *
 * When melody is playing, supporting layers (harmony, arp, texture)
 * should defer slightly in gain to let melody cut through.
 * When melody rests, other layers can come forward.
 */

import type { Mood } from '../types';

/**
 * Per-mood priority strength (higher = more melody dominance).
 */
const PRIORITY_STRENGTH: Record<Mood, number> = {
  trance:    0.35,  // moderate
  avril:     0.55,  // high — melody is king
  disco:     0.30,  // low — groove is shared
  downtempo: 0.45,  // moderate
  blockhead: 0.40,  // moderate
  lofi:      0.50,  // high — melody prominence
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.25,  // low — democracy
  ambient:   0.30,  // low — layers are equal,
  plantasia: 0.30,
};

/**
 * Calculate priority gain adjustment for a supporting layer.
 *
 * @param melodyActive Whether melody is currently playing
 * @param mood Current mood
 * @returns Gain multiplier for supporting layers (0.88 - 1.05)
 */
export function layerPriorityGain(
  melodyActive: boolean,
  mood: Mood
): number {
  const strength = PRIORITY_STRENGTH[mood];

  if (!melodyActive) {
    // Melody absent — supporting layers can come forward
    return Math.min(1.05, 1.0 + strength * 0.08);
  }

  // Melody active — supporting layers defer
  return Math.max(0.88, 1.0 - strength * 0.15);
}

/**
 * Get priority strength for a mood (for testing).
 */
export function priorityStrength(mood: Mood): number {
  return PRIORITY_STRENGTH[mood];
}
