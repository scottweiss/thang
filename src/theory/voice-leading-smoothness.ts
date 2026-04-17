/**
 * Voice leading smoothness — gain reward for small intervallic motion.
 *
 * Good voice leading minimizes the distance each voice moves
 * between chords. This module scores the total voice motion
 * and provides a gain boost for smooth transitions (small steps)
 * and a slight reduction for large jumps.
 */

import type { Mood } from '../types';

/**
 * Per-mood smoothness preference (higher = more reward for smooth leading).
 */
const SMOOTHNESS_PREFERENCE: Record<Mood, number> = {
  trance:    0.35,  // moderate — power chords OK
  avril:     0.65,  // highest — classical voice leading
  disco:     0.30,  // low — root motion is fine
  downtempo: 0.50,  // high
  blockhead: 0.25,  // low — parallel motion OK
  lofi:      0.55,  // high — jazz smoothness
  flim:      0.50,  // high
  xtal:      0.45,  // moderate
  syro:      0.20,  // lowest — jagged is fine
  ambient:   0.40,  // moderate,
  plantasia: 0.40,
};

/**
 * Calculate voice leading smoothness gain.
 *
 * @param totalSemitones Total semitones moved across all voices
 * @param voiceCount Number of voices
 * @param mood Current mood
 * @returns Gain multiplier (0.94 - 1.06)
 */
export function voiceLeadingGain(
  totalSemitones: number,
  voiceCount: number,
  mood: Mood
): number {
  const preference = SMOOTHNESS_PREFERENCE[mood];
  const count = Math.max(1, voiceCount);

  // Average motion per voice
  const avgMotion = totalSemitones / count;

  // Ideal: 1-2 semitones per voice
  const ideal = 1.5;
  const deviation = Math.abs(avgMotion - ideal);

  // Close to ideal = boost, far = reduction
  const adjustment = (2.0 - Math.min(4, deviation)) * preference * 0.03 - preference * 0.03;

  return Math.max(0.94, Math.min(1.06, 1.0 + adjustment));
}

/**
 * Get smoothness preference for a mood (for testing).
 */
export function smoothnessPreference(mood: Mood): number {
  return SMOOTHNESS_PREFERENCE[mood];
}
