/**
 * Sequence recognition — detect transposed melodic repeats.
 *
 * When a melodic fragment repeats at a different pitch level,
 * it creates a sequence — one of the most powerful tools for
 * melodic coherence. This module detects sequences and provides
 * gain emphasis to reinforce their presence.
 *
 * Applied as gain boost for recognized sequential patterns.
 */

import type { Mood } from '../types';

/**
 * Per-mood sequence appreciation (higher = more emphasis on sequences).
 */
const SEQUENCE_APPRECIATION: Record<Mood, number> = {
  trance:    0.50,  // strong — repetitive is good
  avril:     0.60,  // strongest — classical sequences
  disco:     0.40,  // moderate
  downtempo: 0.35,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.45,  // moderate — jazz sequences
  flim:      0.35,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.15,  // weakest — avoid repetition
  ambient:   0.25,  // low — flowing,
  plantasia: 0.25,
};

/**
 * Detect if a pitch sequence contains transposed repetition.
 *
 * @param pitches Array of pitch classes or MIDI notes
 * @param windowSize Size of the pattern to look for (2-4)
 * @returns Sequence detection score (0.0 - 1.0)
 */
export function sequenceDetectionScore(
  pitches: number[],
  windowSize: number = 3
): number {
  if (pitches.length < windowSize * 2) return 0;

  const size = Math.max(2, Math.min(4, windowSize));
  let bestScore = 0;

  for (let offset = size; offset <= pitches.length - size; offset++) {
    // Extract intervals for the window and the comparison
    const intervals1: number[] = [];
    const intervals2: number[] = [];

    for (let i = 1; i < size; i++) {
      intervals1.push(pitches[i] - pitches[i - 1]);
      intervals2.push(pitches[offset + i] - pitches[offset + i - 1]);
    }

    // Compare interval patterns
    let matches = 0;
    for (let i = 0; i < intervals1.length; i++) {
      if (intervals1[i] === intervals2[i]) matches++;
    }

    const score = matches / intervals1.length;
    if (score > bestScore) bestScore = score;
  }

  return bestScore;
}

/**
 * Gain emphasis for detected sequences.
 *
 * @param pitches Recent melody pitches
 * @param mood Current mood
 * @returns Gain multiplier (0.95 - 1.10)
 */
export function sequenceGainEmphasis(
  pitches: number[],
  mood: Mood
): number {
  const appreciation = SEQUENCE_APPRECIATION[mood];
  const score = sequenceDetectionScore(pitches);
  const boost = score * appreciation * 0.2;
  return Math.max(0.95, Math.min(1.10, 1.0 + boost));
}

/**
 * Get sequence appreciation for a mood (for testing).
 */
export function sequenceAppreciation(mood: Mood): number {
  return SEQUENCE_APPRECIATION[mood];
}
