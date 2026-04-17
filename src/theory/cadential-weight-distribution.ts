/**
 * Cadential weight distribution — harmonic weight at phrase boundaries.
 *
 * In classical music, the most important harmonies appear at cadence
 * points. This module increases harmonic "weight" (gain, sustain,
 * voicing thickness) at phrase boundaries while keeping mid-phrase
 * material lighter.
 *
 * Applied as gain/sustain multiplier based on cadential position.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood cadential weight (higher = more weight at cadences).
 */
const CADENTIAL_WEIGHT: Record<Mood, number> = {
  trance:    0.35,  // moderate
  avril:     0.60,  // strongest — classical phrasing
  disco:     0.25,  // weak — even groove
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // strong — jazz endings
  flim:      0.45,  // moderate
  xtal:      0.50,  // strong — crystalline arrivals
  syro:      0.15,  // weakest — even weight
  ambient:   0.40,  // moderate — gentle arrivals,
  plantasia: 0.40,
};

/**
 * Calculate harmonic weight at a phrase position.
 * Weight peaks at 0 (phrase start), dips mid-phrase, peaks at 1 (phrase end).
 *
 * @param phrasePosition 0.0-1.0 position within phrase
 * @param mood Current mood
 * @returns Weight multiplier (0.85 - 1.2)
 */
export function cadentialWeight(
  phrasePosition: number,
  mood: Mood
): number {
  const strength = CADENTIAL_WEIGHT[mood];
  const pos = Math.max(0, Math.min(1, phrasePosition));
  // U-shaped curve: high at boundaries, low in middle
  const boundaryProximity = Math.min(pos, 1 - pos) * 2; // 0 at edges, 1 at center
  const weight = 1.0 - boundaryProximity * strength * 0.2 + (1 - boundaryProximity) * strength * 0.1;
  return Math.max(0.85, Math.min(1.2, weight));
}

/**
 * Calculate sustain multiplier at cadential points.
 * Cadence = longer sustain.
 *
 * @param phrasePosition 0.0-1.0 position within phrase
 * @param mood Current mood
 * @returns Sustain multiplier (0.8 - 1.4)
 */
export function cadentialSustain(
  phrasePosition: number,
  mood: Mood
): number {
  const strength = CADENTIAL_WEIGHT[mood];
  const pos = Math.max(0, Math.min(1, phrasePosition));
  // More sustain at phrase end (resolution)
  const endProximity = Math.pow(pos, 2); // increases toward end
  return Math.max(0.8, Math.min(1.4, 1.0 + endProximity * strength * 0.4));
}

/**
 * Get cadential weight for a mood (for testing).
 */
export function cadentialWeightStrength(mood: Mood): number {
  return CADENTIAL_WEIGHT[mood];
}
