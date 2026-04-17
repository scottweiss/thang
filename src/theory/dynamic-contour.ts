/**
 * Dynamic contour — gain follows melodic pitch direction.
 *
 * Ascending melodies naturally feel like they're getting louder,
 * descending melodies quieter. This module reinforces that
 * perception with subtle gain adjustments that follow pitch
 * direction.
 *
 * Applied as gain multiplier based on melodic direction.
 */

import type { Mood } from '../types';

/**
 * Per-mood contour-dynamics coupling (higher = more gain follows pitch).
 */
const COUPLING_STRENGTH: Record<Mood, number> = {
  trance:    0.25,  // moderate
  avril:     0.50,  // strongest — expressive dynamics
  disco:     0.15,  // weak — even dynamics
  downtempo: 0.35,  // moderate
  blockhead: 0.20,  // weak
  lofi:      0.45,  // strong — jazz expression
  flim:      0.40,  // moderate
  xtal:      0.35,  // moderate
  syro:      0.15,  // weak — mechanical
  ambient:   0.30,  // moderate — gentle dynamics,
  plantasia: 0.30,
};

/**
 * Calculate gain multiplier from pitch direction.
 *
 * @param pitchDelta Semitone change from previous note (positive = up)
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.15)
 */
export function contourDynamicGain(
  pitchDelta: number,
  mood: Mood
): number {
  const strength = COUPLING_STRENGTH[mood];
  // Normalize delta to -1..1 range (±12 semitones = full range)
  const normalized = Math.max(-1, Math.min(1, pitchDelta / 12));
  // Ascending = louder, descending = softer
  const gainMod = normalized * strength * 0.15;
  return Math.max(0.85, Math.min(1.15, 1.0 + gainMod));
}

/**
 * Calculate brightness modifier from pitch direction.
 * Ascending = brighter, descending = darker.
 *
 * @param pitchDelta Semitone change
 * @param mood Current mood
 * @returns LPF multiplier (0.9 - 1.1)
 */
export function contourDynamicBrightness(
  pitchDelta: number,
  mood: Mood
): number {
  const strength = COUPLING_STRENGTH[mood];
  const normalized = Math.max(-1, Math.min(1, pitchDelta / 12));
  const brightMod = normalized * strength * 0.1;
  return Math.max(0.9, Math.min(1.1, 1.0 + brightMod));
}

/**
 * Get coupling strength for a mood (for testing).
 */
export function dynamicContourCoupling(mood: Mood): number {
  return COUPLING_STRENGTH[mood];
}
