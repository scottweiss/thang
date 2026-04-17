/**
 * Extension color temperature — chord extensions map to warm/cool timbres.
 *
 * Different chord extensions have characteristic "temperatures":
 * - 9ths and 6ths feel warm (golden, mellow)
 * - #11 and 13ths feel cool (bright, crystalline)
 * - Plain triads are neutral
 * This module maps extension content to LPF/FM adjustments.
 *
 * Applied as LPF/FM multiplier based on chord extension content.
 */

import type { Mood } from '../types';

/**
 * Per-mood color sensitivity (higher = more timbral response to extensions).
 */
const COLOR_SENSITIVITY: Record<Mood, number> = {
  trance:    0.25,  // low — simple chords
  avril:     0.45,  // moderate — refined
  disco:     0.30,  // moderate
  downtempo: 0.50,  // high — textured
  blockhead: 0.20,  // low
  lofi:      0.60,  // highest — jazz extensions matter
  flim:      0.50,  // high
  xtal:      0.55,  // high — crystalline colors
  syro:      0.40,  // moderate
  ambient:   0.55,  // high — atmospheric,
  plantasia: 0.55,
};

/**
 * Temperature score from chord intervals.
 * Negative = warm, positive = cool.
 *
 * @param intervals Intervals present in the chord (in semitones from root)
 * @returns Temperature (-1.0 = very warm, 1.0 = very cool)
 */
export function chordTemperature(intervals: number[]): number {
  let temperature = 0;
  let count = 0;

  for (const interval of intervals) {
    const normalized = ((interval % 12) + 12) % 12;
    switch (normalized) {
      case 2:  temperature -= 0.4; count++; break;  // 9th — warm
      case 9:  temperature -= 0.3; count++; break;  // 6th — warm
      case 10: temperature -= 0.2; count++; break;  // b7 — warm
      case 6:  temperature += 0.5; count++; break;  // #11 — cool
      case 11: temperature += 0.3; count++; break;  // maj7 — cool
      case 1:  temperature += 0.4; count++; break;  // b9 — cool/tense
      default: break;
    }
  }

  return count > 0 ? Math.max(-1, Math.min(1, temperature / count)) : 0;
}

/**
 * LPF multiplier from extension temperature.
 * Warm = darken slightly, cool = brighten.
 *
 * @param intervals Chord intervals
 * @param mood Current mood
 * @returns LPF multiplier (0.85 - 1.15)
 */
export function extensionColorLpf(
  intervals: number[],
  mood: Mood
): number {
  const sensitivity = COLOR_SENSITIVITY[mood];
  const temp = chordTemperature(intervals);
  // Warm (negative temp) = lower LPF, cool (positive) = higher
  const shift = temp * sensitivity * 0.3;
  return Math.max(0.85, Math.min(1.15, 1.0 + shift));
}

/**
 * Get color sensitivity for a mood (for testing).
 */
export function colorSensitivity(mood: Mood): number {
  return COLOR_SENSITIVITY[mood];
}
