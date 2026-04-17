/**
 * Chord root motion quality — evaluate root motion patterns for bass line quality.
 *
 * Strong root motion (4ths, 5ths) creates functional harmonic drive.
 * Weak root motion (half steps, whole steps) creates chromatic color.
 * This module scores root motion and adjusts bass layer gain to
 * emphasize strong harmonic progressions.
 *
 * Applied as gain multiplier for drone/bass layers.
 */

import type { Mood } from '../types';

/**
 * Per-mood preference for strong root motion (higher = prefer 4ths/5ths).
 */
const STRONG_MOTION_PREFERENCE: Record<Mood, number> = {
  trance:    0.55,  // strong — functional harmony
  avril:     0.60,  // strongest — classical bass
  disco:     0.50,  // strong — groove bass
  downtempo: 0.35,  // moderate — chromatic OK
  blockhead: 0.30,  // moderate — sample-based
  lofi:      0.45,  // moderate — jazz motion
  flim:      0.25,  // weak — floating
  xtal:      0.30,  // weak — ambient motion
  syro:      0.20,  // weakest — any motion
  ambient:   0.40,  // moderate — flowing bass,
  plantasia: 0.40,
};

/**
 * Quality score for root motion interval.
 *
 * @param interval Root motion in semitones (0-11)
 * @returns Quality score (0.0 - 1.0)
 */
export function rootMotionQuality(interval: number): number {
  const normalized = ((interval % 12) + 12) % 12;
  const qualities: Record<number, number> = {
    0: 0.3,   // unison — static
    1: 0.4,   // half step — chromatic
    2: 0.5,   // whole step — modal
    3: 0.6,   // minor third — relative
    4: 0.55,  // major third — chromatic mediant
    5: 0.9,   // perfect fourth — strong
    6: 0.35,  // tritone — disruptive
    7: 0.95,  // perfect fifth — strongest
    8: 0.55,  // minor sixth
    9: 0.6,   // major sixth
    10: 0.5,  // minor seventh
    11: 0.45, // major seventh — leading tone
  };
  return qualities[normalized] ?? 0.5;
}

/**
 * Gain multiplier for bass based on root motion quality.
 *
 * @param rootInterval Current root motion (semitones)
 * @param mood Current mood
 * @returns Gain multiplier (0.90 - 1.12)
 */
export function rootMotionGainMultiplier(
  rootInterval: number,
  mood: Mood
): number {
  const preference = STRONG_MOTION_PREFERENCE[mood];
  const quality = rootMotionQuality(rootInterval);
  const deviation = (quality - 0.5) * preference * 0.5;
  return Math.max(0.90, Math.min(1.12, 1.0 + deviation));
}

/**
 * Get strong motion preference for a mood (for testing).
 */
export function strongMotionPreference(mood: Mood): number {
  return STRONG_MOTION_PREFERENCE[mood];
}
