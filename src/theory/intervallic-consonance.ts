/**
 * Intervallic consonance — nuanced harmonic weighting for note selection.
 *
 * Binary "chord tone / not chord tone" selection misses the rich spectrum
 * of intervallic relationships. A note forming a perfect 5th with a chord
 * tone is far more consonant than one forming a minor 2nd, even though
 * neither is technically a chord tone.
 *
 * This module scores each candidate note against ALL sounding chord tones
 * using psychoacoustic consonance rankings. The result is melodies that
 * naturally avoid harsh dissonances while allowing expressive passing tones.
 *
 * Consonance hierarchy (from music theory / Hindemith):
 *   unison > octave > P5 > P4 > M3 > m3 > M6 > m6 > M2 > m7 > M7 > m2 > tritone
 *
 * Tension parameter controls how much dissonance is tolerated:
 * - Low tension: strongly favor consonant intervals
 * - High tension: allow dissonant intervals for color
 */

/**
 * Consonance score for each interval class (0-11 semitones).
 * Higher = more consonant. Derived from Hindemith's interval hierarchy
 * with adjustments for practical melodic use.
 */
const INTERVAL_CONSONANCE: number[] = [
  1.0,   // 0: unison (perfect consonance)
  0.15,  // 1: minor 2nd (strong dissonance)
  0.5,   // 2: major 2nd (mild dissonance, common passing tone)
  0.8,   // 3: minor 3rd (consonant)
  0.8,   // 4: major 3rd (consonant)
  0.7,   // 5: perfect 4th (consonant)
  0.2,   // 6: tritone (strong dissonance)
  0.9,   // 7: perfect 5th (very consonant)
  0.6,   // 8: minor 6th (mild consonance)
  0.65,  // 9: major 6th (consonance)
  0.35,  // 10: minor 7th (mild dissonance)
  0.2,   // 11: major 7th (strong dissonance)
];

/**
 * Compute the consonance of a candidate note against a set of chord tones.
 *
 * Evaluates the interval between the candidate and each chord tone,
 * then returns the average consonance weighted toward the most consonant
 * relationship (a note only needs to sound good with ONE chord tone
 * to be usable).
 *
 * @param candidatePitch  MIDI-like pitch value of candidate note
 * @param chordPitches    MIDI-like pitch values of sounding chord tones
 * @returns Consonance score 0-1 (higher = more consonant)
 */
export function noteConsonance(
  candidatePitch: number,
  chordPitches: number[]
): number {
  if (chordPitches.length === 0) return 0.5; // no context, neutral

  let bestConsonance = 0;
  let totalConsonance = 0;

  for (const cp of chordPitches) {
    const interval = Math.abs(candidatePitch - cp) % 12;
    const consonance = INTERVAL_CONSONANCE[interval];
    bestConsonance = Math.max(bestConsonance, consonance);
    totalConsonance += consonance;
  }

  // Weight toward best relationship (70%) with average context (30%)
  const avgConsonance = totalConsonance / chordPitches.length;
  return bestConsonance * 0.7 + avgConsonance * 0.3;
}

/**
 * Compute consonance-based weights for a pitch ladder against chord tones.
 *
 * Unlike binary chord-tone matching, this gives every note a weight
 * based on its intervallic relationship to the chord. Tension controls
 * how strongly dissonance is penalized.
 *
 * @param ladderSize    Number of notes in the pitch ladder
 * @param ladderPitches MIDI-like pitch for each ladder position
 * @param chordPitches  MIDI-like pitch for each chord tone
 * @param tension       0-1 (higher = more dissonance tolerated)
 * @returns Weight array (same length as ladder)
 */
export function consonanceWeights(
  ladderSize: number,
  ladderPitches: number[],
  chordPitches: number[],
  tension: number
): number[] {
  if (ladderSize <= 0) return [];
  if (chordPitches.length === 0) return new Array(ladderSize).fill(1.0);

  const weights = new Array(ladderSize);

  // Tension modulates the influence: at high tension, consonance matters less
  // At tension=0: weights range from 0.3 to 1.0 (strong preference)
  // At tension=1: weights range from 0.7 to 1.0 (mild preference)
  const minWeight = 0.3 + tension * 0.4; // 0.3 at low tension, 0.7 at high

  for (let i = 0; i < ladderSize; i++) {
    const consonance = noteConsonance(ladderPitches[i], chordPitches);
    // Map consonance (0-1) to weight range (minWeight - 1.0)
    weights[i] = minWeight + consonance * (1.0 - minWeight);
  }

  return weights;
}

/**
 * Convert a note name like "C4" or "F#5" to a MIDI-like pitch number.
 */
export function noteToPitch(note: string): number {
  const match = note.match(/^([A-G][b#]?)(\d)$/);
  if (!match) return 60;

  const names: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };

  return parseInt(match[2]) * 12 + (names[match[1]] ?? 0);
}
