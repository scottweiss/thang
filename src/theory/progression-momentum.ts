/**
 * Progression momentum — sequences of strong root motions build energy.
 *
 * A ii-V-I progression has more momentum than I-I-I. Consecutive
 * strong root motions (4ths, 5ths) create a sense of harmonic drive.
 * This module tracks recent root motions and provides a momentum
 * score that can boost gain and brightness.
 *
 * Applied as gain/brightness multiplier for building progressions.
 */

import type { Mood } from '../types';

/**
 * Per-mood momentum sensitivity (higher = more response to strong progressions).
 */
const MOMENTUM_SENSITIVITY: Record<Mood, number> = {
  trance:    0.50,  // strong — functional drive
  avril:     0.60,  // strongest — classical momentum
  disco:     0.45,  // moderate — groove
  downtempo: 0.35,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.55,  // strong — jazz ii-V-I
  flim:      0.25,  // weak
  xtal:      0.30,  // weak
  syro:      0.20,  // weakest
  ambient:   0.15,  // weakest
};

/**
 * Root motion strength score.
 */
function rootMotionStrength(interval: number): number {
  const norm = ((interval % 12) + 12) % 12;
  if (norm === 5 || norm === 7) return 1.0;  // 4th/5th
  if (norm === 3 || norm === 9) return 0.6;  // 3rd/6th
  if (norm === 2 || norm === 10) return 0.5; // 2nd/7th
  if (norm === 1 || norm === 11) return 0.4; // half step
  if (norm === 4 || norm === 8) return 0.5;  // M3/m6
  if (norm === 6) return 0.3;                 // tritone
  return 0.2;                                  // unison
}

/**
 * Calculate progression momentum from recent root motions.
 *
 * @param recentMotions Array of root motion intervals (semitones), most recent last
 * @param mood Current mood
 * @returns Momentum score (0.0 - 1.0)
 */
export function progressionMomentum(
  recentMotions: number[],
  mood: Mood
): number {
  if (recentMotions.length === 0) return 0;

  let total = 0;
  for (let i = 0; i < recentMotions.length; i++) {
    const weight = (i + 1) / recentMotions.length; // recent motions weight more
    total += rootMotionStrength(recentMotions[i]) * weight;
  }

  const avg = total / recentMotions.length;
  return Math.min(1, avg * MOMENTUM_SENSITIVITY[mood] * 2);
}

/**
 * Gain multiplier from progression momentum.
 *
 * @param recentMotions Recent root motions
 * @param mood Current mood
 * @returns Gain multiplier (0.95 - 1.12)
 */
export function momentumDriveGain(
  recentMotions: number[],
  mood: Mood
): number {
  const momentum = progressionMomentum(recentMotions, mood);
  return Math.max(0.95, Math.min(1.12, 1.0 + momentum * 0.2));
}

/**
 * Get momentum sensitivity for a mood (for testing).
 */
export function progressionSensitivity(mood: Mood): number {
  return MOMENTUM_SENSITIVITY[mood];
}
