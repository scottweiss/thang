/**
 * Bass register gravity — low notes have more weight and sustain.
 *
 * Lower pitches naturally carry more perceived weight and benefit
 * from longer sustain. This module provides gain and decay
 * adjustments based on a note's register position, giving bass
 * notes more presence and higher notes more agility.
 */

import type { Mood } from '../types';

/**
 * Per-mood gravity strength (higher = more register-dependent behavior).
 */
const GRAVITY_STRENGTH: Record<Mood, number> = {
  trance:    0.50,  // moderate — solid bass
  avril:     0.45,  // moderate — balanced
  disco:     0.55,  // high — bass-driven
  downtempo: 0.60,  // high — deep bass
  blockhead: 0.65,  // highest — heavy bass
  lofi:      0.55,  // high — warm bass
  flim:      0.40,  // moderate
  xtal:      0.35,  // low — airy bass
  syro:      0.30,  // low — anything goes
  ambient:   0.45,  // moderate — natural bass
};

/**
 * Calculate bass gravity gain multiplier.
 *
 * @param midiNote MIDI note number (lower = more gravity)
 * @param mood Current mood
 * @returns Gain multiplier (0.90 - 1.10)
 */
export function bassGravityGain(
  midiNote: number,
  mood: Mood
): number {
  const strength = GRAVITY_STRENGTH[mood];

  // Reference: middle C = 60. Below = heavier, above = lighter
  const register = (midiNote - 60) / 24; // -1 to +1 for 2 octave range
  const clamped = Math.max(-1, Math.min(1, register));

  // Low notes get boost, high notes get slight reduction
  const adjustment = -clamped * strength * 0.12;
  return Math.max(0.90, Math.min(1.10, 1.0 + adjustment));
}

/**
 * Calculate bass gravity decay multiplier.
 *
 * @param midiNote MIDI note number
 * @param mood Current mood
 * @returns Decay multiplier (0.85 - 1.20, > 1 = longer sustain)
 */
export function bassGravityDecay(
  midiNote: number,
  mood: Mood
): number {
  const strength = GRAVITY_STRENGTH[mood];
  const register = (midiNote - 60) / 24;
  const clamped = Math.max(-1, Math.min(1, register));

  // Low notes sustain longer
  const adjustment = -clamped * strength * 0.25;
  return Math.max(0.85, Math.min(1.20, 1.0 + adjustment));
}

/**
 * Get gravity strength for a mood (for testing).
 */
export function gravityStrength(mood: Mood): number {
  return GRAVITY_STRENGTH[mood];
}
