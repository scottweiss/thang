/**
 * Isorhythm — phase-based pattern generation from independent cycles.
 *
 * Medieval technique revived by minimalism (Steve Reich) and IDM:
 * A rhythmic pattern (talea) of length N combines with a pitch pattern
 * (color) of length M. When N and M are coprime, the full cycle is
 * N × M steps before repeating, creating constant evolution from simple
 * ingredients.
 *
 * Example with talea [hit, rest, hit] (3) and color [C, E, G, B] (4):
 *   Step 0: C hit    Step 3: B hit    Step 6: G rest   Step 9:  E hit
 *   Step 1: E rest   Step 4: C rest   Step 7: B hit    Step 10: G rest
 *   Step 2: G hit    Step 5: E hit    Step 8: C hit    Step 11: B hit
 *   Full cycle: 12 steps (3 × 4)
 */

import type { Mood, Section } from '../types';

/** A talea entry: gain multiplier (0 = rest, >0 = play) */
export type TaleaStep = number;

/**
 * Generate an isorhythmic pattern by combining talea and color.
 *
 * @param color   Pitch sequence (note names)
 * @param talea   Rhythmic gain sequence (0 = rest, 0.3-1.0 = velocity)
 * @param length  Desired output length
 * @returns Array of { note, gain } where gain 0 means rest
 */
export function isorhythmicPattern(
  color: string[],
  talea: TaleaStep[],
  length: number
): { note: string; gain: number }[] {
  if (color.length === 0 || talea.length === 0 || length <= 0) return [];

  const result: { note: string; gain: number }[] = [];
  for (let i = 0; i < length; i++) {
    result.push({
      note: color[i % color.length],
      gain: talea[i % talea.length],
    });
  }
  return result;
}

/**
 * Generate a talea (rhythmic pattern) for a given mood.
 * Different moods get different rhythmic characters:
 * - ambient: sparse, spacious (lots of rests)
 * - syro/blockhead: dense, syncopated
 * - trance: driving, regular
 */
export function moodTalea(mood: Mood): TaleaStep[] {
  switch (mood) {
    case 'ambient':
      return [0.6, 0, 0, 0.4, 0];               // 5-step, very sparse
    case 'downtempo':
      return [0.7, 0, 0.5, 0, 0.4, 0, 0.3];     // 7-step, gentle
    case 'lofi':
      return [0.6, 0.4, 0, 0.5, 0, 0.3, 0];     // 7-step, jazzy gaps
    case 'trance':
      return [0.8, 0.5, 0.7, 0.5, 0.6];          // 5-step, driving
    case 'avril':
      return [0.5, 0, 0.4, 0, 0.3, 0, 0];        // 7-step, delicate
    case 'xtal':
      return [0.5, 0, 0, 0.4, 0, 0.3, 0, 0, 0];  // 9-step, crystalline
    case 'syro':
      return [0.8, 0.6, 0, 0.7, 0.5, 0, 0.6];   // 7-step, complex
    case 'blockhead':
      return [0.8, 0.5, 0, 0.7, 0, 0.6, 0.4];   // 7-step, hip-hop
    case 'flim':
      return [0.5, 0, 0.4, 0, 0, 0.3, 0, 0, 0];  // 9-step, sparse clicks
    case 'disco':
      return [0.7, 0.5, 0.6, 0.4, 0.7];          // 5-step, funky pulse
  }
}

/**
 * Get coprime pair lengths (talea, color) for a mood.
 * Coprime lengths ensure maximum phase cycle before repetition.
 * Returns [taleaLen, colorLen] where GCD = 1.
 */
export function moodCoprimePair(mood: Mood): [number, number] {
  const talea = moodTalea(mood);
  // Color lengths chosen to be coprime with talea length
  const taleaLen = talea.length;
  switch (taleaLen) {
    case 5:  return [5, 8];  // cycle = 40 steps
    case 7:  return [7, 8];  // cycle = 56 steps
    case 9:  return [9, 8];  // cycle = 72 steps
    default: return [taleaLen, 8];
  }
}

/**
 * Should isorhythmic patterning be used in this context?
 * Works best in sustained sections where the phasing effect
 * has time to develop.
 */
export function shouldUseIsorhythm(
  mood: Mood,
  section: Section,
  sectionProgress: number
): boolean {
  const prob = isorhythmProbability(mood, section, sectionProgress);
  return Math.random() < prob;
}

/**
 * Probability of using isorhythmic pattern.
 */
export function isorhythmProbability(
  mood: Mood,
  section: Section,
  sectionProgress: number
): number {
  const moodBase = MOOD_ISORHYTHM[mood];
  if (moodBase === 0) return 0;

  const sectionMult = SECTION_ISORHYTHM[section];

  // More likely once section is established (needs time to develop)
  const progressMult = sectionProgress > 0.2 ? 1.0 : sectionProgress / 0.2;

  return Math.min(0.6, moodBase * sectionMult * progressMult);
}

/**
 * Convert isorhythmic pattern to Strudel note and gain strings.
 */
export function isorhythmToStrudel(
  pattern: { note: string; gain: number }[]
): { noteStr: string; gainStr: string } {
  const notes: string[] = [];
  const gains: string[] = [];

  for (const step of pattern) {
    if (step.gain <= 0) {
      notes.push('~');
      gains.push('0.0000');
    } else {
      notes.push(step.note);
      gains.push(step.gain.toFixed(4));
    }
  }

  return {
    noteStr: notes.join(' '),
    gainStr: gains.join(' '),
  };
}

/** Per-mood base probability of isorhythmic patterning */
const MOOD_ISORHYTHM: Record<Mood, number> = {
  ambient:   0.30,   // phasing is core to ambient
  xtal:      0.25,   // crystalline evolving patterns
  flim:      0.20,   // delicate phase music
  syro:      0.25,   // IDM complexity
  downtempo: 0.15,   // gentle evolution
  lofi:      0.10,   // occasional surprise
  avril:     0.15,   // subtle phasing
  blockhead: 0.10,   // rhythmic complexity
  trance:    0.05,   // too regular usually
  disco:     0.05,   // funk doesn't need phasing
};

/** Section multiplier for isorhythm */
const SECTION_ISORHYTHM: Record<Section, number> = {
  groove:    1.3,    // sustained feel, time to develop
  breakdown: 1.5,    // sparse texture highlights phasing
  build:     0.7,    // building energy, less contemplative
  peak:      0.5,    // too much going on
  intro:     1.0,    // establishing patterns
};
