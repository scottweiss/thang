/**
 * Pitch center drift correction — keep melodies anchored.
 *
 * Over time, melodies can drift too high or too low from their
 * ideal register. This module tracks the average pitch and
 * provides a gentle correction that nudges melodies back
 * toward their center when they wander too far.
 */

import type { Mood } from '../types';

/**
 * Per-mood drift tolerance (higher = more drift allowed).
 */
const DRIFT_TOLERANCE: Record<Mood, number> = {
  trance:    0.35,  // low — stays centered
  avril:     0.50,  // moderate — some register exploration
  disco:     0.30,  // low — consistent
  downtempo: 0.45,  // moderate
  blockhead: 0.40,  // moderate
  lofi:      0.55,  // moderate-high — jazz wandering
  flim:      0.60,  // high — free exploration
  xtal:      0.65,  // high — atmospheric drift OK
  syro:      0.70,  // highest — maximum freedom
  ambient:   0.60,  // high — floating
};

/**
 * Calculate drift correction gain.
 * Notes far from center get gentle reduction to discourage drift.
 *
 * @param currentMidi Current MIDI note
 * @param centerMidi Center MIDI note (ideal register center)
 * @param mood Current mood
 * @returns Gain multiplier (0.90 - 1.0)
 */
export function driftCorrectionGain(
  currentMidi: number,
  centerMidi: number,
  mood: Mood
): number {
  const tolerance = DRIFT_TOLERANCE[mood];

  // Distance from center in octaves
  const distance = Math.abs(currentMidi - centerMidi) / 12;

  // Allow tolerance range without penalty
  if (distance <= tolerance) return 1.0;

  // Beyond tolerance: gentle reduction
  const excess = distance - tolerance;
  const reduction = excess * 0.10;
  return Math.max(0.90, 1.0 - reduction);
}

/**
 * Get drift tolerance for a mood (for testing).
 */
export function driftTolerance(mood: Mood): number {
  return DRIFT_TOLERANCE[mood];
}
