/**
 * Harmonic motion type — parallel/contrary/oblique detection and emphasis.
 *
 * Voice leading quality depends on motion type between outer voices:
 * - Contrary motion (voices move in opposite directions): strongest
 * - Oblique (one stays, one moves): moderate
 * - Parallel (both move same direction): weakest
 *
 * This module rewards good voice leading motion.
 */

import type { Mood } from '../types';

/**
 * Per-mood motion preference strength.
 */
const MOTION_PREFERENCE: Record<Mood, number> = {
  trance:    0.30,  // low — parallel power chords OK
  avril:     0.60,  // highest — classical counterpoint
  disco:     0.25,  // low
  downtempo: 0.45,  // moderate
  blockhead: 0.20,  // low
  lofi:      0.50,  // high — jazz voice leading
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.15,  // lowest
  ambient:   0.35,  // moderate,
  plantasia: 0.35,
};

export type MotionType = 'contrary' | 'oblique' | 'parallel' | 'static';

/**
 * Detect motion type between two voice movements.
 */
export function detectMotion(
  voice1Delta: number,
  voice2Delta: number
): MotionType {
  if (voice1Delta === 0 && voice2Delta === 0) return 'static';
  if (voice1Delta === 0 || voice2Delta === 0) return 'oblique';
  if (Math.sign(voice1Delta) !== Math.sign(voice2Delta)) return 'contrary';
  return 'parallel';
}

/**
 * Calculate motion type gain emphasis.
 *
 * @param motion Detected motion type
 * @param mood Current mood
 * @returns Gain multiplier (0.95 - 1.06)
 */
export function motionTypeGain(
  motion: MotionType,
  mood: Mood
): number {
  const preference = MOTION_PREFERENCE[mood];

  const scores: Record<MotionType, number> = {
    contrary: 1.0,
    oblique:  0.5,
    parallel: -0.3,
    static:   0.0,
  };

  const score = scores[motion];
  const adjustment = score * preference * 0.08;
  return Math.max(0.95, Math.min(1.06, 1.0 + adjustment));
}

/**
 * Get motion preference for a mood (for testing).
 */
export function motionPreference(mood: Mood): number {
  return MOTION_PREFERENCE[mood];
}
