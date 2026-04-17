/**
 * Register handoff — complementary register occupancy between layers.
 *
 * When melody moves to a high register, arp/harmony should favor
 * lower registers to maintain spectral coverage. When melody drops
 * low, other layers can rise. This prevents layers from clustering
 * in the same register.
 */

import type { Mood } from '../types';

/**
 * Per-mood handoff strength (higher = more complementary behavior).
 */
const HANDOFF_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate
  avril:     0.55,  // high — orchestral register management
  disco:     0.35,  // moderate
  downtempo: 0.45,  // moderate
  blockhead: 0.50,  // high — clear separation
  lofi:      0.55,  // high — intimate clarity
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.30,  // low — clustering OK
  ambient:   0.50,  // moderate — space,
  plantasia: 0.50,
};

/**
 * Calculate register handoff gain adjustment.
 * Penalizes layers occupying the same register as the reference layer.
 *
 * @param layerMidi MIDI note of this layer's current register center
 * @param referenceMidi MIDI note of the reference layer (melody)
 * @param mood Current mood
 * @returns Gain multiplier (0.90 - 1.06)
 */
export function registerHandoffGain(
  layerMidi: number,
  referenceMidi: number,
  mood: Mood
): number {
  const strength = HANDOFF_STRENGTH[mood];

  // Distance in octaves
  const distance = Math.abs(layerMidi - referenceMidi) / 12;

  // Close = penalty (same register), far = bonus (complementary)
  const separation = Math.min(2, distance); // cap at 2 octaves
  const adjustment = (separation - 0.5) * strength * 0.08;

  return Math.max(0.90, Math.min(1.06, 1.0 + adjustment));
}

/**
 * Get handoff strength for a mood (for testing).
 */
export function handoffStrength(mood: Mood): number {
  return HANDOFF_STRENGTH[mood];
}
