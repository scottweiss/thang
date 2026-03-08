/**
 * Phrase breathing — real melodies have silence between phrases.
 *
 * Without breathing, melodies feel relentless and machine-like. This module
 * ensures melodic phrases have gaps that let the listener absorb what they
 * just heard. It provides three tools:
 *
 * - insertBreaths: probabilistically adds rests after note runs
 * - breathingRate: context-aware breath density for each section
 * - ensurePhraseBoundary: hard limit on consecutive notes
 */

import type { Section } from '../types';

const REST = '~';

/**
 * Insert rests into a step array to create natural phrase breathing.
 *
 * Scans through the array counting consecutive notes. After minPhraseLength
 * consecutive notes, probabilistically replaces notes with rests. The
 * probability scales with breathDensity and how long the current run has been.
 *
 * Rules:
 * - breathDensity 0 returns the array unchanged
 * - The first note of each phrase (first note after one or more rests, or
 *   the very first note) is never replaced
 * - Rests replace notes in-place; the array length is preserved
 * - The rest token is '~'
 *
 * @param elements       Step array of notes and rests
 * @param breathDensity  0-1, how aggressively to insert breaths
 * @param minPhraseLength  Minimum consecutive notes before a breath may appear
 * @returns Modified array (same length) with breaths inserted
 */
export function insertBreaths(
  elements: string[],
  breathDensity: number,
  minPhraseLength: number
): string[] {
  if (breathDensity <= 0) return [...elements];

  const result = [...elements];
  let consecutiveNotes = 0;
  let phraseStarted = false;

  for (let i = 0; i < result.length; i++) {
    if (result[i] === REST) {
      consecutiveNotes = 0;
      phraseStarted = false;
      continue;
    }

    // This is a note
    consecutiveNotes++;

    // Never modify the first note of a phrase
    if (!phraseStarted) {
      phraseStarted = true;
      continue;
    }

    // Only consider inserting breaths after minPhraseLength consecutive notes
    if (consecutiveNotes > minPhraseLength) {
      // Probability increases the longer the run continues
      const overshoot = consecutiveNotes - minPhraseLength;
      const probability = breathDensity * (overshoot / (overshoot + 2));

      // Deterministic seeding from position for reproducibility
      const hash = ((i * 2654435761) >>> 0) / 4294967296;
      if (hash < probability) {
        result[i] = REST;
        consecutiveNotes = 0;
        phraseStarted = false;
      }
    }
  }

  return result;
}

/**
 * Returns an appropriate breathDensity (0-1) for the given section and tension.
 *
 * Base densities by section:
 * - breakdown: 0.7  (sparse, contemplative)
 * - intro:     0.5  (moderate breathing)
 * - groove:    0.35 (moderate, conversational)
 * - build:     0.3  (less breathing as energy increases)
 * - peak:      0.15 (minimal breathing, continuous energy)
 *
 * Higher tension reduces breathing: baseDensity * (1.0 - tension * 0.3)
 *
 * @param section  Current section type
 * @param tension  0-1 tension level
 * @returns breathDensity 0-1
 */
export function breathingRate(section: Section, tension: number): number {
  const baseDensities: Record<Section, number> = {
    breakdown: 0.7,
    intro: 0.5,
    groove: 0.35,
    build: 0.3,
    peak: 0.15,
  };

  const base = baseDensities[section] ?? 0.35;
  return base * (1.0 - tension * 0.3);
}

/**
 * Hard limit on consecutive notes — ensures no phrase runs longer than
 * maxConsecutive without a rest.
 *
 * If the limit is reached, the note at the limit position is replaced
 * with a rest. This is a safety valve to prevent runaway phrases.
 *
 * @param elements        Step array of notes and rests
 * @param maxConsecutive  Maximum allowed consecutive notes (typically 8-12)
 * @returns Modified array (same length) with forced rests
 */
export function ensurePhraseBoundary(
  elements: string[],
  maxConsecutive: number
): string[] {
  const result = [...elements];
  let consecutive = 0;

  for (let i = 0; i < result.length; i++) {
    if (result[i] === REST) {
      consecutive = 0;
      continue;
    }

    consecutive++;
    if (consecutive > maxConsecutive) {
      result[i] = REST;
      consecutive = 0;
    }
  }

  return result;
}
