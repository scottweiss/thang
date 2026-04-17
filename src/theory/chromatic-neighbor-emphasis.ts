/**
 * Chromatic neighbor emphasis — chromatic passing tones get timbral emphasis.
 *
 * When a melody note is a chromatic neighbor (half-step away from
 * a chord tone), it creates a momentary "squeeze" that sounds
 * expressive. This module detects chromatic proximity and provides
 * a brightness/FM boost for those moments.
 */

import type { Mood } from '../types';

/**
 * Per-mood chromatic emphasis (higher = more emphasis on chromatic neighbors).
 */
const CHROMATIC_EMPHASIS: Record<Mood, number> = {
  trance:    0.30,  // low — clean
  avril:     0.55,  // high — expressive
  disco:     0.20,  // low — diatonic
  downtempo: 0.40,  // moderate
  blockhead: 0.35,  // moderate
  lofi:      0.60,  // highest — jazz chromaticism
  flim:      0.50,  // high
  xtal:      0.45,  // moderate
  syro:      0.65,  // highest — loves chromaticism
  ambient:   0.25,  // low — smooth,
  plantasia: 0.25,
};

/**
 * Check if a note is a chromatic neighbor to any chord tone.
 *
 * @param notePc Note pitch class (0-11)
 * @param chordPcs Array of chord tone pitch classes
 * @returns true if within 1 semitone of a chord tone but not a chord tone
 */
function isChromaticNeighbor(notePc: number, chordPcs: number[]): boolean {
  const pc = ((notePc % 12) + 12) % 12;
  for (const cpc of chordPcs) {
    const chord = ((cpc % 12) + 12) % 12;
    if (pc === chord) return false; // it's a chord tone, not a neighbor
    const dist = Math.min(
      Math.abs(pc - chord),
      12 - Math.abs(pc - chord)
    );
    if (dist === 1) return true;
  }
  return false;
}

/**
 * Calculate chromatic neighbor FM emphasis.
 *
 * @param notePc Note pitch class (0-11)
 * @param chordPcs Array of chord tone pitch classes
 * @param mood Current mood
 * @returns FM multiplier (1.0 - 1.15)
 */
export function chromaticNeighborFm(
  notePc: number,
  chordPcs: number[],
  mood: Mood
): number {
  const emphasis = CHROMATIC_EMPHASIS[mood];

  if (!isChromaticNeighbor(notePc, chordPcs)) return 1.0;

  return 1.0 + emphasis * 0.20;
}

/**
 * Get chromatic emphasis for a mood (for testing).
 */
export function chromaticEmphasis(mood: Mood): number {
  return CHROMATIC_EMPHASIS[mood];
}
