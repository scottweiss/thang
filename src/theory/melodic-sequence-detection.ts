/**
 * Melodic sequence detection — recognize and extend repeated patterns.
 *
 * When a melodic fragment repeats at a different pitch level, it
 * creates a "sequence" — one of the most powerful tools for melodic
 * development. This module detects when a sequence is emerging and
 * biases continuation toward completing the pattern.
 *
 * Different from melodic-sequence.ts (which generates sequences from
 * motifs) — this *detects* naturally occurring sequences and reinforces
 * them.
 */

import type { Mood } from '../types';

/**
 * Per-mood sequence sensitivity (how eagerly to detect/extend).
 */
const SEQUENCE_SENSITIVITY: Record<Mood, number> = {
  trance:    0.45,  // strong sequence drive
  avril:     0.60,  // classical sequence development
  disco:     0.35,  // groove sequences
  downtempo: 0.30,  // moderate
  blockhead: 0.25,  // choppy, less sequential
  lofi:      0.50,  // jazz sequence exploration
  flim:      0.40,  // organic sequences
  xtal:      0.30,  // floating
  syro:      0.20,  // complex, less predictable
  ambient:   0.15,  // barely sequential,
  plantasia: 0.15,
};

/**
 * Detect if the last N notes form a transposed repetition of earlier notes.
 *
 * @param midiHistory Recent MIDI note history (at least 6 notes)
 * @param fragmentLen Length of fragment to check (2-4)
 * @returns Transposition interval if sequence detected, null otherwise
 */
export function detectSequence(
  midiHistory: number[],
  fragmentLen: number
): number | null {
  if (midiHistory.length < fragmentLen * 2) return null;

  const len = midiHistory.length;
  const recent = midiHistory.slice(len - fragmentLen);
  const prior = midiHistory.slice(len - fragmentLen * 2, len - fragmentLen);

  // Check if recent is a transposition of prior
  const interval = recent[0] - prior[0];
  const isSequence = recent.every((note, i) =>
    note - prior[i] === interval
  );

  return isSequence ? interval : null;
}

/**
 * Suggest the next note to continue an established sequence.
 *
 * @param midiHistory Recent MIDI note history
 * @param fragmentLen Fragment length
 * @param interval Detected transposition interval
 * @returns Suggested next MIDI note, or null
 */
export function suggestSequenceContinuation(
  midiHistory: number[],
  fragmentLen: number,
  interval: number
): number | null {
  if (midiHistory.length < fragmentLen) return null;

  // The next note should be the first note of the pattern, transposed again
  const len = midiHistory.length;
  const currentFragment = midiHistory.slice(len - fragmentLen);
  return currentFragment[0] + interval;
}

/**
 * Should sequence detection be applied?
 */
export function shouldDetectSequence(mood: Mood): boolean {
  return SEQUENCE_SENSITIVITY[mood] > 0.18;
}

/**
 * Get sequence sensitivity for a mood (for testing).
 */
export function sequenceSensitivity(mood: Mood): number {
  return SEQUENCE_SENSITIVITY[mood];
}
