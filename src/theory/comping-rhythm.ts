/**
 * Comping rhythm — rhythmic chord articulation patterns.
 *
 * Sustained pad chords sound static. Real keyboard/guitar players "comp"
 * by playing chords in rhythmic patterns — syncopated stabs, repeated
 * hits, and rhythmic figures that lock into the groove.
 *
 * This module generates comping patterns as arrays of velocity values
 * (0 = rest, >0 = play at that velocity). The pattern replaces the
 * sustained `.slow()` approach with per-step gain values.
 *
 * Classic comping patterns:
 * - Charleston: hit on 1 and the "and" of 2 (jazz standard)
 * - Anticipation: hits before strong beats (funk)
 * - Backbeat stabs: accents on 2 and 4 (R&B/soul)
 * - Sparse: occasional hits with lots of space (ambient)
 */

import type { Mood, Section } from '../types';

export type CompingStyle = 'sustained' | 'charleston' | 'stabs' | 'offbeat' | 'sparse';

/**
 * Generate a comping velocity pattern for chord articulation.
 *
 * @param steps  Number of steps (typically 8 or 16)
 * @param mood   Current mood
 * @param section Current section
 * @returns Array of velocity multipliers (0 = silent, 1 = full)
 */
export function compingPattern(
  steps: number,
  mood: Mood,
  section: Section
): number[] {
  const style = pickCompingStyle(mood, section);

  switch (style) {
    case 'charleston':
      return charlestonPattern(steps);
    case 'stabs':
      return stabsPattern(steps);
    case 'offbeat':
      return offbeatPattern(steps);
    case 'sparse':
      return sparsePattern(steps);
    case 'sustained':
    default:
      return new Array(steps).fill(1.0);
  }
}

/**
 * Whether comping should replace sustained chords.
 */
export function shouldComp(mood: Mood, section: Section): boolean {
  return COMP_PROBABILITY[mood] * SECTION_COMP_MULT[section] > 0.15;
}

/**
 * Deterministic probability for testing.
 */
export function compProbability(mood: Mood, section: Section): number {
  return COMP_PROBABILITY[mood] * SECTION_COMP_MULT[section];
}

/**
 * Pick a comping style based on mood and section.
 */
export function pickCompingStyle(mood: Mood, section: Section): CompingStyle {
  const prob = COMP_PROBABILITY[mood] * SECTION_COMP_MULT[section];
  if (prob < 0.15) return 'sustained';

  const styles = MOOD_COMP_STYLES[mood];
  if (!styles || styles.length === 0) return 'sustained';

  // Random selection from mood's preferred styles
  return styles[Math.floor(Math.random() * styles.length)];
}

/**
 * Charleston pattern: hit on 1 and "and" of 2 (classic jazz comping).
 * In 8 steps: [1, 0, 0, 1, 0, 0, 0, 0] — beat 1 and offbeat of 2
 */
function charlestonPattern(steps: number): number[] {
  const pattern = new Array(steps).fill(0);
  if (steps >= 8) {
    pattern[0] = 1.0;  // beat 1
    pattern[3] = 0.85; // "and" of 2
  } else if (steps >= 4) {
    pattern[0] = 1.0;
    pattern[1] = 0.85;
  }
  return pattern;
}

/**
 * Stabs pattern: accented hits on beats 2 and 4 (funk/soul).
 * In 8 steps: [0, 0, 1, 0, 0, 0, 1, 0] — backbeat stabs
 */
function stabsPattern(steps: number): number[] {
  const pattern = new Array(steps).fill(0);
  if (steps >= 8) {
    pattern[2] = 1.0;  // beat 2
    pattern[6] = 0.9;  // beat 4
  } else if (steps >= 4) {
    pattern[1] = 1.0;
    pattern[3] = 0.9;
  }
  return pattern;
}

/**
 * Offbeat pattern: hits on upbeats for reggae/ska feel.
 * In 8 steps: [0, 1, 0, 1, 0, 1, 0, 1]
 */
function offbeatPattern(steps: number): number[] {
  const pattern = new Array(steps).fill(0);
  for (let i = 1; i < steps; i += 2) {
    pattern[i] = 0.85 + (i % 4 === 1 ? 0.15 : 0); // slight accent on "and" of 1 and 3
  }
  return pattern;
}

/**
 * Sparse pattern: occasional hits with space.
 * In 8 steps: [1, 0, 0, 0, 0, 0, 0.7, 0]
 */
function sparsePattern(steps: number): number[] {
  const pattern = new Array(steps).fill(0);
  if (steps >= 8) {
    pattern[0] = 1.0;
    pattern[6] = 0.7;
  } else if (steps >= 4) {
    pattern[0] = 1.0;
  }
  return pattern;
}

/** Per-mood comping probability (0 = always sustained, 1 = always rhythmic) */
const COMP_PROBABILITY: Record<Mood, number> = {
  disco:     0.70,   // funk stabs are essential
  blockhead: 0.55,   // hip-hop chord stabs
  lofi:      0.45,   // jazzy comping
  downtempo: 0.35,   // occasional rhythmic chords
  syro:      0.30,   // angular stabs
  flim:      0.20,   // mostly sustained, occasional plucks
  avril:     0.15,   // piano — mostly sustained
  trance:    0.10,   // pads dominate
  xtal:      0.10,   // dreamy sustained
  ambient:   0.05,   // almost always sustained
};

/** Section multiplier for comping */
const SECTION_COMP_MULT: Record<Section, number> = {
  groove:    1.3,    // settled groove — rhythmic chords shine
  peak:      1.1,    // full energy — rhythmic drive
  build:     0.9,    // building — some rhythmic interest
  breakdown: 0.5,    // intimate — sustained chords
  intro:     0.4,    // establishing — mostly sustained
};

/** Preferred comping styles per mood */
const MOOD_COMP_STYLES: Record<Mood, CompingStyle[]> = {
  disco:     ['stabs', 'offbeat', 'charleston'],
  blockhead: ['stabs', 'charleston', 'sparse'],
  lofi:      ['charleston', 'sparse', 'stabs'],
  downtempo: ['charleston', 'sparse'],
  syro:      ['stabs', 'offbeat'],
  flim:      ['sparse', 'charleston'],
  avril:     ['sparse'],
  trance:    ['sustained'],
  xtal:      ['sparse'],
  ambient:   ['sustained'],
};
