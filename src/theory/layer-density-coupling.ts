/**
 * Layer density coupling — active layer count modulates density.
 *
 * When many layers are active, each should thin out slightly
 * to prevent sonic clutter. When few layers play, each can
 * be denser. This inverse relationship keeps the overall
 * texture consistent regardless of active layer count.
 */

import type { Mood } from '../types';

/**
 * Per-mood coupling strength (higher = more thinning with more layers).
 */
const COUPLING_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate — some thinning
  avril:     0.50,  // high — orchestral balance
  disco:     0.35,  // moderate — consistent groove
  downtempo: 0.55,  // high — careful balance
  blockhead: 0.45,  // moderate
  lofi:      0.50,  // high — intimate clarity
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.30,  // low — density OK
  ambient:   0.60,  // highest — space crucial,
  plantasia: 0.60,
};

/**
 * Calculate density coupling gain multiplier.
 *
 * @param activeLayerCount Number of active layers (1-6)
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.10)
 */
export function densityCouplingGain(
  activeLayerCount: number,
  mood: Mood
): number {
  const strength = COUPLING_STRENGTH[mood];
  const count = Math.max(1, Math.min(6, activeLayerCount));

  // Reference: 3 layers = neutral. More = thin, fewer = boost
  const deviation = count - 3;
  const adjustment = -deviation * strength * 0.06;

  return Math.max(0.85, Math.min(1.10, 1.0 + adjustment));
}

/**
 * Get coupling strength for a mood (for testing).
 */
export function couplingStrength(mood: Mood): number {
  return COUPLING_STRENGTH[mood];
}
