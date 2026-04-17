/**
 * Hemiola — cross-rhythm accent patterns.
 *
 * A hemiola superimposes a grouping of 3 over a grouping of 2 (or vice versa).
 * In 4/4 time, this means accenting every 3rd beat, creating a momentary
 * sense of 3/4 within 4/4. The effect is a rhythmic "tug" that adds
 * tension and release.
 *
 * Common uses:
 * - Pre-cadential hemiola (classical): 3-beat grouping before a resolution
 * - Clave patterns (Afro-Cuban): 3+3+2 grouping in 8 beats
 * - Breakdown polyrhythm (EDM): cross-accents during breakdowns
 *
 * This module generates accent masks that can be applied to any layer's
 * velocity or gain pattern to create hemiola effects.
 */

import type { Mood, Section } from '../types';

/**
 * Generate a hemiola accent mask — positions where cross-rhythm
 * accents should occur.
 *
 * For a 3-over-4 hemiola in an 8-step pattern:
 * Normal 4/4: X . . . X . . .  (accents on 0, 4)
 * Hemiola 3s: X . . X . . X .  (accents on 0, 3, 6)
 *
 * @param length     Pattern length (typically 8 or 16)
 * @param grouping   Beat grouping for the cross-rhythm (3 = triplet feel)
 * @returns Array of accent multipliers (1.0 = normal, >1.0 = accented)
 */
export function hemiolaAccentMask(
  length: number,
  grouping: number = 3
): number[] {
  const mask = new Array(length).fill(1.0);
  if (grouping <= 0 || length <= 0) return mask;

  // Place accents at every `grouping` positions
  for (let i = 0; i < length; i += grouping) {
    mask[i] = 1.3; // 30% accent boost
  }

  return mask;
}

/**
 * Generate a 3+3+2 clave-inspired accent pattern.
 * This is one of the most fundamental rhythmic cells in world music:
 * X . . X . . X .  (groups of 3, 3, and 2 within 8 beats)
 *
 * @param length  Pattern length (will be tiled if > 8)
 * @returns Accent multipliers
 */
export function claveAccentMask(length: number): number[] {
  const basePattern = [1.3, 1.0, 1.0, 1.3, 1.0, 1.0, 1.3, 1.0]; // 3+3+2
  const mask: number[] = [];
  for (let i = 0; i < length; i++) {
    mask.push(basePattern[i % basePattern.length]);
  }
  return mask;
}

/**
 * Whether to apply hemiola in the current context.
 * Hemiola works best in specific musical moments:
 * - Breakdowns (rhythmic interest in sparse textures)
 * - Pre-cadential (building tension before resolution)
 * - Groove sections (adding swing and complexity)
 *
 * @param mood     Current mood
 * @param section  Current section
 * @param progress Section progress (0-1)
 * @returns Whether hemiola should be active
 */
export function shouldApplyHemiola(
  mood: Mood,
  section: Section,
  progress: number
): boolean {
  const prob = hemiolaProbability(mood, section, progress);
  return Math.random() < prob;
}

/**
 * Probability of hemiola in a given context.
 */
export function hemiolaProbability(
  mood: Mood,
  section: Section,
  progress: number
): number {
  const moodBase = MOOD_HEMIOLA[mood] ?? 0;
  if (moodBase === 0) return 0;

  const sectionMult = SECTION_HEMIOLA[section] ?? 0;

  // Hemiola is more likely in the middle/end of a section (settled into the groove)
  const progressMult = progress > 0.3 ? 1.0 : progress / 0.3;

  return Math.min(0.5, moodBase * sectionMult * progressMult);
}

/**
 * Get the appropriate hemiola type for a mood.
 * Returns 'clave' for groove-oriented moods, 'triplet' for others.
 */
export function hemiolaType(mood: Mood): 'clave' | 'triplet' {
  switch (mood) {
    case 'disco':
    case 'blockhead':
    case 'lofi':
    case 'syro':
      return 'clave';    // 3+3+2 groove
    default:
      return 'triplet';  // simple 3-grouping
  }
}

/**
 * Apply hemiola accents to a gain pattern string.
 * Multiplies gain values at accent positions.
 */
export function applyHemiolaToGain(
  gainValues: number[],
  mood: Mood
): number[] {
  const type = hemiolaType(mood);
  const mask = type === 'clave'
    ? claveAccentMask(gainValues.length)
    : hemiolaAccentMask(gainValues.length, 3);

  return gainValues.map((g, i) => g * mask[i]);
}

/** Per-mood base probability of hemiola */
const MOOD_HEMIOLA: Record<Mood, number> = {
  blockhead: 0.25,   // hip-hop loves cross-rhythms
  disco:     0.20,   // funk syncopation
  syro:      0.20,   // rhythmic complexity
  lofi:      0.15,   // subtle swing
  downtempo: 0.10,   // gentle
  trance:    0.05,   // rare — mostly straight
  flim:      0.10,   // delicate cross-accents
  xtal:      0.08,   // occasional
  avril:     0.05,   // very rare
  ambient:   0.0,    // never — too static,
  plantasia: 0.0,
};

/** Section multiplier for hemiola */
const SECTION_HEMIOLA: Record<Section, number> = {
  breakdown: 1.5,    // most effective here
  groove:    1.2,    // adds swing
  build:     0.8,    // building complexity
  peak:      0.5,    // can get chaotic
  intro:     0.3,    // too early usually
};
