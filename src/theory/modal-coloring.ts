/**
 * Modal coloring — characteristic tones define each mode's flavor.
 *
 * Each mode has signature intervals that distinguish it from plain major/minor.
 * Dorian has the bright 6th, Mixolydian the flat 7th, Phrygian the flat 2nd.
 * This module biases melody toward these characteristic tones based on
 * the current scale context, adding modal flavor without full modulation.
 *
 * Applied as a note selection weight in melody generation.
 */

import type { Mood } from '../types';

/**
 * Per-mood modal coloring strength (0 = no bias, 1 = strong characteristic tone preference).
 */
const COLORING_STRENGTH: Record<Mood, number> = {
  trance:    0.20,  // moderate — modal but not adventurous
  avril:     0.50,  // strong — Debussy modal colors
  disco:     0.15,  // weak — straightforward major/minor
  downtempo: 0.40,  // strong — dorian/mixolydian vibes
  blockhead: 0.35,  // moderate — minor pentatonic with blue notes
  lofi:      0.55,  // strongest — jazz modal emphasis
  flim:      0.45,  // strong — Aphex modal play
  xtal:      0.50,  // strong — ambient modes
  syro:      0.30,  // moderate — IDM chromatic > modal
  ambient:   0.45,  // strong — Lydian/Dorian pads
};

/**
 * Scale type → characteristic degree intervals (semitones from root).
 * These are the "color tones" that define each mode's sound.
 */
const CHARACTERISTIC_TONES: Record<string, number[]> = {
  major:       [4, 11],    // M3, M7 — bright
  minor:       [3, 10],    // m3, m7 — dark
  dorian:      [3, 9],     // m3, M6 — bright minor
  mixolydian:  [4, 10],    // M3, m7 — bluesy major
  phrygian:    [1, 3],     // m2, m3 — dark, Spanish
  lydian:      [6, 4],     // #4, M3 — floating
  aeolian:     [3, 8],     // m3, m6 — natural minor
  pentatonic:  [2, 7],     // M2, P5 — open
  blues:       [3, 6],     // m3, b5 — tension
  chromatic:   [1, 6],     // m2, TT — all tension
  wholetone:   [2, 6],     // M2, TT — dreamlike
};

/**
 * Get weight boost for a pitch class if it's a characteristic tone.
 *
 * @param pitchClass Pitch class (0-11) of the candidate note
 * @param rootPc Root pitch class (0-11)
 * @param scaleType Current scale type
 * @param mood Current mood
 * @returns Weight multiplier (1.0 = no boost, up to 2.0)
 */
export function characteristicToneWeight(
  pitchClass: number,
  rootPc: number,
  scaleType: string,
  mood: Mood
): number {
  const interval = ((pitchClass - rootPc) % 12 + 12) % 12;
  const charTones = CHARACTERISTIC_TONES[scaleType] ?? CHARACTERISTIC_TONES['major'];
  const isCharacteristic = charTones.includes(interval);
  if (!isCharacteristic) return 1.0;
  return 1.0 + COLORING_STRENGTH[mood];
}

/**
 * Get coloring strength for a mood (for testing).
 */
export function coloringStrength(mood: Mood): number {
  return COLORING_STRENGTH[mood];
}

/**
 * Get characteristic tones for a scale type (for testing).
 */
export function getCharacteristicTones(scaleType: string): number[] {
  return CHARACTERISTIC_TONES[scaleType] ?? CHARACTERISTIC_TONES['major'];
}
