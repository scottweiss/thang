/**
 * Melodic sequences — motifs repeated at shifting pitch levels.
 *
 * A melodic sequence is one of music's most powerful compositional
 * devices: a motif is stated, then repeated at progressively higher
 * or lower pitch levels. The ear recognises the pattern and the
 * transposition creates momentum and direction.
 *
 * Classic example: C-D-E → D-E-F → E-F-G (ascending, stepSize 1).
 *
 * This module provides tools for generating sequences from a pitch
 * ladder, flattening them into playable note arrays, and choosing
 * appropriate sequence parameters for different musical contexts.
 */

import type { Section } from '../types';

/**
 * Generate a melodic sequence by transposing a motif along a pitch ladder.
 *
 * Each repetition shifts every note in the motif by `stepSize` ladder
 * positions. If a shifted note would fall outside the ladder, it is
 * clamped to the nearest boundary.
 *
 * @param motif       Array of note names drawn from the ladder
 * @param ladder      Available pitches, sorted ascending
 * @param repetitions How many times to state the motif (including original)
 * @param stepSize    Ladder positions to shift per repetition (+/−)
 * @returns Array of motif arrays, each transposed
 */
export function generateSequence(
  motif: string[],
  ladder: string[],
  repetitions: number,
  stepSize: number
): string[][] {
  const result: string[][] = [];

  for (let rep = 0; rep < repetitions; rep++) {
    const transposed = motif.map(note => {
      const idx = ladder.indexOf(note);
      if (idx === -1) return note; // note not in ladder — keep as-is
      const shifted = idx + stepSize * rep;
      const clamped = Math.max(0, Math.min(ladder.length - 1, shifted));
      return ladder[clamped];
    });
    result.push(transposed);
  }

  return result;
}

/**
 * Flatten a sequence of motif repetitions into a single note array,
 * inserting rest tokens ('~') between repetitions.
 *
 * @param sequences    Output of generateSequence
 * @param restsBetween Number of '~' tokens to insert between repetitions
 * @returns Flat array of notes and rests
 */
export function flattenSequence(
  sequences: string[][],
  restsBetween: number
): string[] {
  const result: string[] = [];

  for (let i = 0; i < sequences.length; i++) {
    result.push(...sequences[i]);
    if (i < sequences.length - 1 && restsBetween > 0) {
      for (let r = 0; r < restsBetween; r++) {
        result.push('~');
      }
    }
  }

  return result;
}

/**
 * Recommend sequence parameters for a given section and tension level.
 *
 * The musical intuition:
 * - Build sections use ascending sequences to create momentum
 * - Peak sections use wider intervals for intensity
 * - Breakdowns descend, winding energy down
 * - Intros use gentle ascending motion
 * - Groove sections alternate direction for rhythmic interest
 *
 * Higher tension pushes toward more repetitions and wider steps.
 *
 * @param section Current section type
 * @param tension Tension level 0-1
 * @returns Recommended stepSize and repetitions
 */
export function sequenceDirection(
  section: Section,
  tension: number
): { stepSize: number; repetitions: number } {
  const tensionBoost = Math.floor(tension * 2); // 0-1 extra repetitions

  switch (section) {
    case 'build':
      return {
        stepSize: tension > 0.6 ? 2 : 1,
        repetitions: Math.min(4, 3 + tensionBoost),
      };

    case 'peak':
      return {
        stepSize: 2,
        repetitions: Math.min(3, 2 + tensionBoost),
      };

    case 'breakdown':
      return {
        stepSize: -1,
        repetitions: 2,
      };

    case 'intro':
      return {
        stepSize: 1,
        repetitions: 2,
      };

    case 'groove':
      return {
        stepSize: Math.random() < 0.5 ? 1 : -1,
        repetitions: Math.min(3, 2 + tensionBoost),
      };

    default:
      return { stepSize: 1, repetitions: 2 };
  }
}

/**
 * Decide whether a melodic sequence is appropriate in this context.
 *
 * Sequences shine in build and peak sections where momentum matters.
 * They're less common in breakdowns and intros. Very short motifs
 * (< 2 notes) don't sequence well; very long motifs (> 6 notes)
 * become unwieldy when repeated.
 *
 * @param section     Current section type
 * @param motifLength Number of notes in the candidate motif
 * @returns true if a sequence should be used
 */
export function shouldUseSequence(
  section: Section,
  motifLength: number
): boolean {
  if (motifLength < 2) return false;

  let chance: number;

  if (motifLength > 6) {
    chance = 0.1;
  } else {
    switch (section) {
      case 'build':
        chance = 0.65;
        break;
      case 'peak':
        chance = 0.65;
        break;
      case 'breakdown':
        chance = 0.2;
        break;
      case 'intro':
        chance = 0.3;
        break;
      case 'groove':
        chance = 0.4;
        break;
      default:
        chance = 0.3;
    }
  }

  return Math.random() < chance;
}
