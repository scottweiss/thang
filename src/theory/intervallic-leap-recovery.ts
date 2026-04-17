/**
 * Intervallic leap recovery — melodic leaps followed by stepwise contrary motion.
 *
 * A fundamental principle of melody writing: after a large leap (>4 semitones),
 * the melody should "recover" by stepping back in the opposite direction.
 * This creates balanced, singable melodic lines.
 *
 * Applied as a note selection bias after leaps.
 */

import type { Mood } from '../types';

/**
 * Per-mood recovery strength (higher = more disciplined leap recovery).
 */
const RECOVERY_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // strong — predictable hooks
  avril:     0.70,  // strongest — classical voice leading
  disco:     0.50,  // strong — singable
  downtempo: 0.45,  // moderate
  blockhead: 0.35,  // moderate — some angular melody OK
  lofi:      0.50,  // strong — jazz conventions
  flim:      0.30,  // moderate — Aphex defies convention
  xtal:      0.25,  // weak — ambient wanders
  syro:      0.15,  // weakest — IDM angular melody
  ambient:   0.20,  // weak — floating,
  plantasia: 0.20,
};

/**
 * Threshold for what counts as a "leap" (semitones).
 */
const LEAP_THRESHOLD = 4;

/**
 * Calculate recovery weight for a candidate interval after a leap.
 *
 * @param prevInterval Previous interval (signed semitones)
 * @param candidateInterval Proposed next interval (signed semitones)
 * @param mood Current mood
 * @returns Weight multiplier (0.5 - 2.0)
 */
export function leapRecoveryWeight(
  prevInterval: number,
  candidateInterval: number,
  mood: Mood
): number {
  const absPrev = Math.abs(prevInterval);
  if (absPrev < LEAP_THRESHOLD) return 1.0; // not a leap — no recovery needed

  const strength = RECOVERY_STRENGTH[mood];
  const isContrary = Math.sign(candidateInterval) !== Math.sign(prevInterval);
  const absCandidate = Math.abs(candidateInterval);
  const isStep = absCandidate <= 2;

  if (isContrary && isStep) {
    // Perfect recovery: stepwise contrary motion
    return 1.0 + strength;
  } else if (isContrary && absCandidate <= 4) {
    // Good recovery: contrary motion, small interval
    return 1.0 + strength * 0.5;
  } else if (!isContrary && absCandidate > LEAP_THRESHOLD) {
    // Bad: continuing in same direction with another leap
    return Math.max(0.5, 1.0 - strength * 0.5);
  }
  return 1.0; // neutral
}

/**
 * Was the previous interval a leap?
 */
export function wasLeap(prevInterval: number): boolean {
  return Math.abs(prevInterval) >= LEAP_THRESHOLD;
}

/**
 * Get recovery strength for a mood (for testing).
 */
export function recoveryStrength(mood: Mood): number {
  return RECOVERY_STRENGTH[mood];
}
