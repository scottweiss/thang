/**
 * Tritone substitution — replace dominant chords with their tritone equivalent.
 *
 * The most important jazz reharmonization technique: a dominant 7th chord
 * can be replaced by the dominant 7th chord a tritone (6 semitones) away.
 * This works because both chords share the same tritone interval (3rd and 7th
 * are enharmonically equivalent):
 *
 *   G7  = G  B  D  F    (B-F tritone)
 *   Db7 = Db F  Ab Cb   (F-Cb=B tritone)
 *
 * The substitution creates a chromatically descending bass line:
 *   ii - V  - I  = Dm - G  - C    (bass: D → G → C, a P4 jump)
 *   ii - ♭II- I  = Dm - Db - C    (bass: D → Db → C, chromatic descent!)
 *
 * This chromatic voice leading is smoother and more sophisticated.
 * Common in jazz, bossa nova, film scoring, and sophisticated pop.
 */

import type { Mood, Section, NoteName } from '../types';
import { noteIndex, noteFromIndex } from './scales';

/** Per-mood probability of tritone substitution */
const TRITONE_SUB_PROB: Record<Mood, number> = {
  lofi:      0.25,   // jazz — loves tritone subs
  downtempo: 0.18,   // sophisticated smooth
  blockhead: 0.15,   // hip-hop jazz
  disco:     0.12,   // funky chromaticism
  flim:      0.10,   // delicate — occasional surprise
  syro:      0.12,   // IDM — harmonic complexity
  avril:     0.08,   // intimate — subtle
  xtal:      0.06,   // dreamy — rare
  trance:    0.03,   // driving — clean harmony preferred
  ambient:   0.00,   // too static
};

/** Section multiplier */
const SECTION_MULT: Record<Section, number> = {
  groove:    1.2,    // settled — great time for a sub
  build:     0.8,    // building — okay
  peak:      0.6,    // intense — keep it simple
  breakdown: 1.0,    // surprising — nice color
  intro:     0.3,    // too early
};

/**
 * Compute the tritone substitute root for a given chord root.
 * The tritone substitute is exactly 6 semitones (a tritone) away.
 *
 * @param root Original chord root
 * @returns Tritone substitute root
 */
export function tritoneSubRoot(root: NoteName): NoteName {
  const idx = noteIndex(root);
  return noteFromIndex(idx + 6); // tritone = 6 semitones
}

/**
 * Build tritone substitute chord notes (always dom7 quality).
 *
 * @param originalRoot Root of the original dominant chord
 * @param octave       Base octave for voicing
 * @returns Array of note names with octave
 */
export function tritoneSubNotes(
  originalRoot: NoteName,
  octave: number
): string[] {
  const subRoot = tritoneSubRoot(originalRoot);
  const rootIdx = noteIndex(subRoot);

  // Dom7 intervals: root, M3, P5, m7
  return [
    `${noteFromIndex(rootIdx)}${octave}`,
    `${noteFromIndex(rootIdx + 4)}${octave}`,
    `${noteFromIndex(rootIdx + 7)}${octave}`,
    `${noteFromIndex(rootIdx + 10)}${octave + 1}`,
  ];
}

/**
 * Whether to apply tritone substitution to the current dominant chord.
 *
 * Only applies to dominant-function chords (degree 4 = V in 0-indexed,
 * or quality contains '7' indicating dominant).
 *
 * @param degree         Current chord degree (0-6)
 * @param quality        Current chord quality
 * @param mood           Current mood
 * @param section        Current section
 */
export function shouldApplyTritoneSub(
  degree: number,
  quality: string,
  mood: Mood,
  section: Section
): boolean {
  // Only substitute dominant chords (degree 4 = V, or dom7 quality)
  const isDominant = degree === 4 ||
    quality === 'dom7' || quality === '7';
  if (!isDominant) return false;

  const prob = TRITONE_SUB_PROB[mood] * SECTION_MULT[section];
  return Math.random() < prob;
}

/**
 * Get the tritone sub probability for a mood (for testing).
 */
export function tritoneSubProbability(mood: Mood): number {
  return TRITONE_SUB_PROB[mood];
}
