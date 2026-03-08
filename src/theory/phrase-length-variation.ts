/**
 * Phrase length variation — varied lengths prevent monotony.
 *
 * If all phrases are the same length (e.g., always 4 bars),
 * the music becomes predictable. Slight variation in phrase
 * length keeps the listener engaged. This module provides
 * gain emphasis when phrase lengths vary from the norm.
 */

import type { Mood } from '../types';

/**
 * Per-mood variation appetite (higher = more length variation desired).
 */
const VARIATION_APPETITE: Record<Mood, number> = {
  trance:    0.20,  // low — regular phrases
  avril:     0.50,  // high — classical phrase asymmetry
  disco:     0.15,  // low — regular 4/8 bar phrases
  downtempo: 0.40,  // moderate
  blockhead: 0.35,  // moderate
  lofi:      0.55,  // high — jazz phrase irregularity
  flim:      0.60,  // highest — IDM asymmetry
  xtal:      0.55,  // high
  syro:      0.65,  // highest — maximum irregularity
  ambient:   0.45,  // moderate — organic flow
};

/**
 * Calculate phrase length variation gain.
 *
 * @param currentLength Current phrase length (beats)
 * @param averageLength Average phrase length (beats)
 * @param mood Current mood
 * @returns Gain multiplier (0.96 - 1.06)
 */
export function phraseLengthGain(
  currentLength: number,
  averageLength: number,
  mood: Mood
): number {
  const appetite = VARIATION_APPETITE[mood];
  const avg = Math.max(1, averageLength);

  // How different from average (0 = same, 1 = very different)
  const variation = Math.abs(currentLength - avg) / avg;
  const clamped = Math.min(1, variation);

  // Variation-hungry moods boost varied lengths
  const adjustment = clamped * appetite * 0.08;
  return Math.max(0.96, Math.min(1.06, 1.0 + adjustment));
}

/**
 * Get variation appetite for a mood (for testing).
 */
export function variationAppetite(mood: Mood): number {
  return VARIATION_APPETITE[mood];
}
