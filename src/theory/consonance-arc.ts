/**
 * Consonance arc — phrase-level consonance trajectory.
 *
 * Musical phrases typically move from tension to resolution.
 * This module shapes a consonance curve within each phrase:
 * beginning with mild dissonance, peaking in tension at ~60%,
 * and resolving to consonance at the phrase end.
 *
 * Applied as FM depth and gain modulation within phrases.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood arc intensity (higher = more pronounced consonance journey).
 */
const ARC_INTENSITY: Record<Mood, number> = {
  trance:    0.35,  // moderate — clear harmonic arcs
  avril:     0.60,  // strongest — dramatic tension/release
  disco:     0.20,  // weak — stays consonant
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // strong — jazz-like tension play
  flim:      0.45,  // strong — delicate arcs
  xtal:      0.55,  // strong — crystalline tension
  syro:      0.20,  // weak — constant tension
  ambient:   0.35,  // moderate — gentle arcs
};

/**
 * Section multipliers for arc intensity.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.6,   // gentle arcs
  build:     1.0,   // normal
  peak:      1.3,   // most dramatic arcs
  breakdown: 0.8,   // relaxed
  groove:    1.1,   // slightly elevated
};

/**
 * Calculate consonance level at a point in the phrase.
 * Returns 0.0 (most dissonant) to 1.0 (most consonant).
 *
 * The arc shape: starts at ~0.7, dips to ~0.3 at 60%, returns to ~1.0.
 *
 * @param phrasePosition 0.0-1.0 position within phrase
 * @param mood Current mood
 * @param section Current section
 * @returns Consonance level (0.0 - 1.0)
 */
export function consonanceLevel(
  phrasePosition: number,
  mood: Mood,
  section: Section
): number {
  const intensity = ARC_INTENSITY[mood] * SECTION_MULT[section];
  const pos = Math.max(0, Math.min(1, phrasePosition));
  // Bell-shaped tension curve peaking at 60%
  const tensionPeak = 0.6;
  const tension = Math.exp(-Math.pow((pos - tensionPeak) / 0.25, 2));
  // Consonance is inverse of tension, scaled by intensity
  const consonance = 1.0 - tension * intensity * 0.7;
  return Math.max(0.0, Math.min(1.0, consonance));
}

/**
 * FM depth multiplier from consonance arc.
 * More dissonant = more FM for richer harmonics.
 *
 * @param phrasePosition 0.0-1.0 position within phrase
 * @param mood Current mood
 * @param section Current section
 * @returns FM multiplier (0.8 - 1.4)
 */
export function consonanceArcFm(
  phrasePosition: number,
  mood: Mood,
  section: Section
): number {
  const cons = consonanceLevel(phrasePosition, mood, section);
  // Low consonance = more FM, high consonance = less FM
  return 0.8 + (1.0 - cons) * 0.6;
}

/**
 * Get arc intensity for a mood (for testing).
 */
export function consonanceArcIntensity(mood: Mood): number {
  return ARC_INTENSITY[mood];
}
