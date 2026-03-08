/**
 * Melodic step preference — stepwise motion preferred for singability.
 *
 * Melodies that move mostly by step (1-2 semitones) with occasional
 * leaps are more singable and memorable. This module provides a gain
 * bonus for stepwise intervals and a slight penalty for large leaps,
 * scaled by mood (trance likes leaps for energy, lofi prefers steps).
 */

import type { Mood } from '../types';

/**
 * Per-mood step preference (higher = stronger preference for steps).
 */
const STEP_PREFERENCE: Record<Mood, number> = {
  trance:    0.25,  // low — leaps are exciting
  avril:     0.55,  // high — classical stepwise motion
  disco:     0.30,  // moderate
  downtempo: 0.50,  // high — smooth melodies
  blockhead: 0.20,  // low — angular is fine
  lofi:      0.60,  // highest — smooth jazz
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.15,  // lowest — leaps welcome
  ambient:   0.50,  // high — gentle motion
};

/**
 * Calculate step preference gain.
 *
 * @param intervalSemitones Absolute interval in semitones
 * @param mood Current mood
 * @returns Gain multiplier (0.93 - 1.06)
 */
export function stepPreferenceGain(
  intervalSemitones: number,
  mood: Mood
): number {
  const preference = STEP_PREFERENCE[mood];
  const interval = Math.abs(intervalSemitones);

  // Steps (1-2): bonus, small leaps (3-4): neutral, large leaps (5+): penalty
  let score = 0;
  if (interval <= 2) score = 0.8;
  else if (interval <= 4) score = 0.2;
  else if (interval <= 7) score = -0.3;
  else score = -0.6;

  const adjustment = score * preference * 0.08;
  return Math.max(0.93, Math.min(1.06, 1.0 + adjustment));
}

/**
 * Get step preference for a mood (for testing).
 */
export function stepPref(mood: Mood): number {
  return STEP_PREFERENCE[mood];
}
