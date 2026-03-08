/**
 * Harmonic partials reinforcement — boost FM coherence when chord tones
 * align with the overtone series.
 *
 * When a chord's intervals match natural harmonics (octave, fifth, fourth,
 * major third), the voicing reinforces the fundamental's partials. This
 * creates a more resonant, unified sound. This module detects overtone
 * alignment and suggests FM ratio adjustments.
 *
 * Applied as FM depth multiplier for harmonically coherent voicings.
 */

import type { Mood } from '../types';

/**
 * Per-mood reinforcement sensitivity (higher = more FM boost for aligned voicings).
 */
const REINFORCEMENT_SENSITIVITY: Record<Mood, number> = {
  trance:    0.45,  // moderate — clean harmonics
  avril:     0.55,  // strong — orchestral resonance
  disco:     0.30,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.25,  // weak — compressed
  lofi:      0.35,  // moderate
  flim:      0.50,  // strong
  xtal:      0.60,  // strongest — crystalline harmonics
  syro:      0.20,  // weak — inharmonicity OK
  ambient:   0.55,  // strong — pure resonance
};

/**
 * Intervals that align with the overtone series (in semitones).
 * Weight reflects how closely they match natural harmonics.
 */
const OVERTONE_WEIGHTS: Record<number, number> = {
  0: 1.0,   // unison (1st harmonic)
  12: 0.95, // octave (2nd)
  7: 0.85,  // perfect fifth (3rd)
  5: 0.70,  // perfect fourth (4th, inverted 5th)
  4: 0.60,  // major third (5th harmonic)
  3: 0.40,  // minor third (6th harmonic approx)
  9: 0.50,  // major sixth
  10: 0.30, // minor seventh (7th harmonic)
};

/**
 * Score how well chord intervals align with the overtone series.
 *
 * @param pitchClasses Array of pitch classes (0-11)
 * @returns Alignment score (0.0 - 1.0)
 */
export function partialsAlignmentScore(pitchClasses: number[]): number {
  if (pitchClasses.length <= 1) return 0.5;

  let totalWeight = 0;
  let count = 0;

  for (let i = 0; i < pitchClasses.length; i++) {
    for (let j = i + 1; j < pitchClasses.length; j++) {
      const interval = ((pitchClasses[j] - pitchClasses[i]) % 12 + 12) % 12;
      const weight = OVERTONE_WEIGHTS[interval] ?? 0.1;
      totalWeight += weight;
      count++;
    }
  }

  return count > 0 ? Math.min(1, totalWeight / count) : 0.5;
}

/**
 * FM depth multiplier based on overtone alignment.
 *
 * @param pitchClasses Chord pitch classes
 * @param mood Current mood
 * @returns FM multiplier (0.90 - 1.15)
 */
export function partialsReinforcementFm(
  pitchClasses: number[],
  mood: Mood
): number {
  const sensitivity = REINFORCEMENT_SENSITIVITY[mood];
  const alignment = partialsAlignmentScore(pitchClasses);
  const boost = (alignment - 0.5) * sensitivity * 0.5;
  return Math.max(0.90, Math.min(1.15, 1.0 + boost));
}

/**
 * Get reinforcement sensitivity for a mood (for testing).
 */
export function reinforcementSensitivity(mood: Mood): number {
  return REINFORCEMENT_SENSITIVITY[mood];
}
