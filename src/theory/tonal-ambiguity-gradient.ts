/**
 * Tonal ambiguity gradient — measure how far harmony wanders from tonic.
 *
 * Chords close to tonic (I, IV, V) feel stable and grounded.
 * Distant chords (♭II, ♭VI, borrowed chords) create ambiguity.
 * This module maps tonal distance to spatial effects — more ambiguous
 * harmony gets more reverb/space for a dreamy, unmoored quality.
 *
 * Applied as reverb/room multiplier based on harmonic distance.
 */

import type { Mood } from '../types';

/**
 * Per-mood ambiguity sensitivity (higher = more spatial response to distance).
 */
const AMBIGUITY_SENSITIVITY: Record<Mood, number> = {
  trance:    0.30,  // moderate — stays grounded
  avril:     0.45,  // moderate — classical wandering
  disco:     0.20,  // low — functional harmony
  downtempo: 0.50,  // high — dreamy
  blockhead: 0.25,  // low
  lofi:      0.55,  // high — jazz exploration
  flim:      0.45,  // moderate
  xtal:      0.50,  // high — crystalline distance
  syro:      0.35,  // moderate — already chaotic
  ambient:   0.60,  // highest — space mirrors distance
};

/**
 * Circle-of-fifths distance between two pitch classes.
 *
 * @param pc1 First pitch class (0-11)
 * @param pc2 Second pitch class (0-11)
 * @returns Distance (0-6, where 6 = tritone = furthest)
 */
export function fifthsDistance(pc1: number, pc2: number): number {
  // Map to position on circle of fifths
  const fifths = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
  const pos1 = fifths.indexOf(((pc1 % 12) + 12) % 12);
  const pos2 = fifths.indexOf(((pc2 % 12) + 12) % 12);
  const raw = Math.abs(pos1 - pos2);
  return Math.min(raw, 12 - raw);
}

/**
 * Reverb multiplier based on tonal distance from tonic.
 *
 * @param rootPc Current chord root pitch class (0-11)
 * @param tonicPc Tonic pitch class (0-11)
 * @param mood Current mood
 * @returns Reverb multiplier (0.9 - 1.3)
 */
export function ambiguityReverbMultiplier(
  rootPc: number,
  tonicPc: number,
  mood: Mood
): number {
  const distance = fifthsDistance(rootPc, tonicPc);
  const sensitivity = AMBIGUITY_SENSITIVITY[mood];
  const normalized = distance / 6; // 0-1
  const boost = normalized * sensitivity * 0.7;
  return Math.max(0.9, Math.min(1.3, 1.0 + boost));
}

/**
 * Get ambiguity sensitivity for a mood (for testing).
 */
export function ambiguitySensitivity(mood: Mood): number {
  return AMBIGUITY_SENSITIVITY[mood];
}
