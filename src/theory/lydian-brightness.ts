/**
 * Lydian brightness — raised 4th scale degree for luminous color.
 *
 * The Lydian mode (major with #4) creates a floating, bright quality
 * that adds sparkle without tension. This module biases melody note
 * selection toward the #4 when the mood/section calls for luminosity.
 *
 * Applied as a pitch substitution probability.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood Lydian brightness probability.
 */
const LYDIAN_PROBABILITY: Record<Mood, number> = {
  trance:    0.15,  // occasional sparkle
  avril:     0.30,  // moderate — Debussy
  disco:     0.10,  // rare
  downtempo: 0.25,  // moderate
  blockhead: 0.08,  // rare — hip-hop is usually Mixolydian
  lofi:      0.20,  // moderate — jazz Lydian
  flim:      0.25,  // moderate — Aphex floaty
  xtal:      0.35,  // strong — ambient luminosity
  syro:      0.18,  // moderate
  ambient:   0.40,  // strongest — floating brightness
};

/**
 * Section multiplier on Lydian probability.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // bright entrances
  build:     0.8,
  peak:      0.6,   // less Lydian at peak — dramatic tension preferred
  breakdown: 1.3,   // most Lydian — floating dreamy
  groove:    0.9,
};

/**
 * Should the natural 4th be raised to #4 (Lydian)?
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to use #4 instead of natural 4
 */
export function shouldUseLydian(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const prob = LYDIAN_PROBABILITY[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 8191) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Get the Lydian (#4) pitch class from a given root.
 *
 * @param rootPc Root pitch class (0-11)
 * @returns Lydian 4th pitch class (root + 6 semitones)
 */
export function lydianFourth(rootPc: number): number {
  return (rootPc + 6) % 12;
}

/**
 * Get the natural 4th pitch class from a given root.
 *
 * @param rootPc Root pitch class (0-11)
 * @returns Natural 4th pitch class (root + 5 semitones)
 */
export function naturalFourth(rootPc: number): number {
  return (rootPc + 5) % 12;
}

/**
 * Get Lydian probability for a mood (for testing).
 */
export function lydianProbability(mood: Mood): number {
  return LYDIAN_PROBABILITY[mood];
}
