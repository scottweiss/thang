/**
 * Voicing weight distribution — weight lower voices heavier for grounding.
 *
 * In orchestration, lower voices carry more harmonic weight.
 * A well-grounded voicing has its root and fifth in the bass,
 * with upper extensions lighter. This module scores voicing
 * weight distribution and adjusts gain per register band.
 *
 * Applied as gain multiplier for harmonic grounding quality.
 */

import type { Mood } from '../types';

/**
 * Per-mood grounding preference (higher = prefer bottom-heavy voicings).
 */
const GROUNDING_PREFERENCE: Record<Mood, number> = {
  trance:    0.50,  // strong — solid bass
  avril:     0.55,  // strong — classical grounding
  disco:     0.45,  // moderate — funk bass
  downtempo: 0.40,  // moderate
  blockhead: 0.60,  // strongest — heavy bass
  lofi:      0.35,  // moderate — jazz open
  flim:      0.25,  // weak — floating
  xtal:      0.20,  // weak — ethereal
  syro:      0.15,  // weakest — ungrounded OK
  ambient:   0.30,  // moderate — some grounding,
  plantasia: 0.30,
};

/**
 * Score voicing weight distribution.
 * Well-grounded voicings have root/5th low and color tones high.
 *
 * @param midiNotes Sorted MIDI notes (low to high)
 * @returns Grounding score (0.0 = top-heavy, 1.0 = well-grounded)
 */
export function groundingScore(midiNotes: number[]): number {
  if (midiNotes.length <= 1) return 0.5;

  const sorted = [...midiNotes].sort((a, b) => a - b);
  const range = sorted[sorted.length - 1] - sorted[0];
  if (range === 0) return 0.5;

  // Calculate center of gravity
  const midpoint = (sorted[0] + sorted[sorted.length - 1]) / 2;
  const avgPitch = sorted.reduce((a, b) => a + b, 0) / sorted.length;

  // Lower center of gravity = better grounding
  const offset = (midpoint - avgPitch) / range; // positive = bottom-heavy
  return Math.max(0, Math.min(1, 0.5 + offset));
}

/**
 * Gain multiplier based on grounding quality.
 *
 * @param midiNotes Voicing MIDI notes
 * @param mood Current mood
 * @returns Gain multiplier (0.92 - 1.08)
 */
export function groundingGainMultiplier(
  midiNotes: number[],
  mood: Mood
): number {
  const preference = GROUNDING_PREFERENCE[mood];
  const score = groundingScore(midiNotes);
  const deviation = (score - 0.5) * preference * 0.3;
  return Math.max(0.92, Math.min(1.08, 1.0 + deviation));
}

/**
 * Get grounding preference for a mood (for testing).
 */
export function groundingPreference(mood: Mood): number {
  return GROUNDING_PREFERENCE[mood];
}
