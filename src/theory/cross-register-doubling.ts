/**
 * Cross-register doubling — reinforce key notes at octave distances.
 *
 * When a melody note is important (phrase peak, cadential arrival),
 * doubling it in another octave in the arp or harmony creates a
 * sense of weight and importance without adding new pitch content.
 *
 * Applied as an octave shift suggestion for arp/harmony.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood doubling probability.
 */
const DOUBLING_PROB: Record<Mood, number> = {
  trance:    0.35,  // moderate — synth leads get doubled
  avril:     0.40,  // strong — orchestral doubling
  disco:     0.30,  // moderate
  downtempo: 0.20,  // weak — sparse
  blockhead: 0.25,  // moderate
  lofi:      0.15,  // weak — less is more
  flim:      0.20,  // weak
  xtal:      0.10,  // minimal — sparse ambient
  syro:      0.30,  // moderate — IDM density
  ambient:   0.05,  // rare — purity
};

/**
 * Section multiplier on doubling probability.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.5,   // sparse — no doubling
  build:     1.0,
  peak:      1.4,   // most doubling — maximum impact
  breakdown: 0.6,
  groove:    1.1,
};

/**
 * Should a melody note be doubled in another register?
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @param isImportantNote Whether this is a phrase peak/cadential note
 * @returns Whether to double
 */
export function shouldDouble(
  tick: number,
  mood: Mood,
  section: Section,
  isImportantNote: boolean
): boolean {
  if (!isImportantNote) return false;
  const prob = DOUBLING_PROB[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 11213) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Select which octave to double in.
 *
 * @param tick Current tick
 * @returns Octave offset (-1 or +1)
 */
export function doublingOctave(tick: number): number {
  const hash = ((tick * 1597334677 + 7919) >>> 0) / 4294967296;
  return hash < 0.6 ? -1 : 1; // slightly prefer lower doubling
}

/**
 * Get doubling probability for a mood (for testing).
 */
export function doublingProbability(mood: Mood): number {
  return DOUBLING_PROB[mood];
}
