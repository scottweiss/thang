/**
 * Characteristic interval preferences — mood-specific melodic interval DNA.
 *
 * Different musical styles favor different melodic intervals:
 * - Jazz/lofi: minor 3rds, major 6ths — vocal, soulful
 * - Trance: perfect 4ths/5ths, octaves — anthemic, powerful
 * - Ambient: 2nds, 7ths — cluster-like, Eno-esque wash
 * - IDM/syro: tritones, major 7ths — angular, unexpected
 *
 * This module provides per-mood interval weight multipliers that
 * bias melodic note selection toward characteristic intervals,
 * giving each mood its own melodic vocabulary beyond scale/chord choice.
 */

import type { Mood } from '../types';

/**
 * Interval preference profile: weight multiplier for each semitone distance (0-12).
 * 1.0 = neutral, >1.0 = preferred, <1.0 = avoided.
 */
type IntervalProfile = readonly [
  number, number, number, number, number, number,
  number, number, number, number, number, number, number
];

//                              P1  m2   M2   m3   M3   P4   TT   P5   m6   M6   m7   M7   P8
const MOOD_INTERVALS: Record<Mood, IntervalProfile> = {
  lofi:      [0.5, 0.8, 1.0, 1.6, 1.2, 1.4, 0.7, 1.1, 0.9, 1.3, 1.0, 0.8, 0.6],
  blockhead: [0.5, 0.7, 0.9, 1.3, 1.1, 1.2, 1.5, 1.0, 0.8, 0.9, 1.4, 1.0, 0.8],
  downtempo: [0.5, 0.9, 1.2, 1.4, 1.1, 1.3, 0.6, 1.3, 0.9, 1.1, 1.0, 0.8, 0.7],
  ambient:   [0.6, 1.4, 1.3, 1.0, 0.8, 1.0, 0.7, 1.0, 0.9, 0.9, 1.2, 1.3, 0.6],
  plantasia: [0.6, 1.4, 1.3, 1.0, 0.8, 1.0, 0.7, 1.0, 0.9, 0.9, 1.2, 1.3, 0.6],
  trance:    [0.4, 0.6, 0.8, 0.9, 1.2, 1.5, 0.7, 1.5, 0.8, 1.0, 0.9, 0.7, 1.4],
  avril:     [0.6, 1.3, 1.4, 1.3, 1.0, 1.0, 0.5, 0.9, 0.8, 1.0, 0.8, 0.9, 0.5],
  xtal:      [0.5, 1.0, 1.0, 1.1, 0.9, 1.4, 0.6, 1.4, 1.0, 1.0, 1.1, 1.0, 0.8],
  syro:      [0.4, 1.0, 0.8, 0.9, 1.0, 1.1, 1.5, 1.0, 1.1, 0.8, 1.0, 1.4, 0.9],
  flim:      [0.5, 1.3, 1.1, 1.0, 0.9, 1.3, 0.8, 1.1, 1.0, 0.9, 0.9, 1.1, 0.6],
  disco:     [0.4, 0.6, 1.0, 1.0, 1.4, 1.2, 0.6, 1.3, 0.8, 1.1, 0.9, 0.7, 1.2],
};

/**
 * Get the interval preference weight for a given semitone distance.
 *
 * @param semitones  Absolute semitone distance (0-12+)
 * @param mood       Current mood
 * @returns Weight multiplier (>1 = preferred, <1 = avoided)
 */
export function intervalWeight(semitones: number, mood: Mood): number {
  const profile = MOOD_INTERVALS[mood];
  // Wrap into 0-12 range (octave equivalence)
  const normalized = Math.abs(semitones) % 13;
  return profile[Math.min(normalized, 12)];
}

/**
 * Compute interval character weights for an entire pitch ladder.
 * Given a previous pitch, weights each candidate by the mood's
 * interval preference for the semitone distance.
 *
 * @param ladderSize    Number of notes in the ladder
 * @param ladderPitches MIDI-like pitch for each ladder position
 * @param prevPitch     Pitch of the previous note
 * @param mood          Current mood
 * @returns Array of weight multipliers (1.0 = neutral)
 */
export function intervalCharacterWeights(
  ladderSize: number,
  ladderPitches: number[],
  prevPitch: number,
  mood: Mood
): number[] {
  const weights = new Array(ladderSize).fill(1.0);

  for (let i = 0; i < ladderSize; i++) {
    if (i < ladderPitches.length) {
      const semitones = Math.abs(ladderPitches[i] - prevPitch);
      weights[i] = intervalWeight(semitones, mood);
    }
  }

  return weights;
}
