/**
 * Secondary dominants — chromatic chords that tonicize non-tonic scale degrees.
 *
 * A secondary dominant is the V (or V7) of a diatonic chord other than I.
 * For example, in C major:
 *   V/V  = D major (resolves to G)
 *   V/vi = E major (resolves to Am)
 *   V/IV = C7     (resolves to F — rare since it's the tonic with added ♭7)
 *   V/ii = A major (resolves to Dm)
 *
 * These create momentary key-center shifts that add chromatic color and
 * harmonic pull without leaving the key. They're fundamental to:
 * - Jazz (ii-V patterns in every key area)
 * - Pop (pre-chorus lift)
 * - Classical (applied dominants in sequences)
 *
 * This module probabilistically inserts secondary dominants before
 * target chords, creating forward harmonic momentum.
 */

import type { Mood, Section, NoteName } from '../types';
import { noteIndex, noteFromIndex } from './scales';

/**
 * Get the secondary dominant root for a given target scale degree.
 * The secondary dominant is a perfect 5th above the target root.
 *
 * @param targetRoot  Root note of the target chord
 * @returns Root of the secondary dominant (a P5 above target)
 */
export function secondaryDominantRoot(targetRoot: NoteName): NoteName {
  const idx = noteIndex(targetRoot);
  return noteFromIndex(idx + 7); // P5 above = secondary dominant root
}

/**
 * Build secondary dominant chord notes (always dom7 quality).
 *
 * @param targetRoot  Root of the chord being tonicized
 * @param octave      Base octave for voicing
 * @returns Array of note names with octave (e.g., ['D4', 'F#4', 'A4', 'C5'])
 */
export function secondaryDominantNotes(
  targetRoot: NoteName,
  octave: number
): string[] {
  const root = secondaryDominantRoot(targetRoot);
  const rootIdx = noteIndex(root);

  // Dom7 intervals: root, M3, P5, m7
  return [
    `${noteFromIndex(rootIdx)}${octave}`,
    `${noteFromIndex(rootIdx + 4)}${octave}`,
    `${noteFromIndex(rootIdx + 7)}${octave}`,
    `${noteFromIndex(rootIdx + 10)}${octave + 1}`,
  ];
}

/**
 * Should a secondary dominant be inserted before the next chord?
 *
 * @param nextDegree     Scale degree of the upcoming chord (0-6)
 * @param mood           Current mood
 * @param section        Current section
 * @param sectionProgress How far through the section (0-1)
 * @returns Whether to insert a secondary dominant
 */
export function shouldInsertSecondaryDominant(
  nextDegree: number,
  mood: Mood,
  section: Section,
  sectionProgress: number
): boolean {
  const prob = secondaryDominantProbability(nextDegree, mood, section, sectionProgress);
  return Math.random() < prob;
}

/**
 * Probability of inserting a secondary dominant.
 */
export function secondaryDominantProbability(
  nextDegree: number,
  mood: Mood,
  section: Section,
  sectionProgress: number
): number {
  // Can't have V/I (that's just V, already handled by progressions)
  if (nextDegree === 0) return 0;

  const moodBase = MOOD_SECONDARY_DOMINANT[mood];
  if (moodBase === 0) return 0;

  // Some degrees are better targets for secondary dominants
  const degreeMult = DEGREE_TARGET_STRENGTH[nextDegree] ?? 0.5;

  const sectionMult = SECTION_SECONDARY_DOMINANT[section];

  // More likely as section progresses (builds harmonic momentum)
  const progressMult = 0.5 + sectionProgress * 0.5;

  return Math.min(0.3, moodBase * degreeMult * sectionMult * progressMult);
}

/**
 * Get the secondary dominant symbol for display/voicing.
 *
 * @param targetRoot  Root of the target chord
 * @returns Chord symbol (e.g., "D7" for V/V in C major)
 */
export function secondaryDominantSymbol(targetRoot: NoteName): string {
  const root = secondaryDominantRoot(targetRoot);
  return `${root}7`; // Always dom7
}

/** Per-mood base probability of secondary dominants */
const MOOD_SECONDARY_DOMINANT: Record<Mood, number> = {
  lofi:      0.20,   // jazz loves secondary dominants
  downtempo: 0.15,   // sophisticated harmonic color
  blockhead: 0.12,   // hip-hop jazz influence
  disco:     0.15,   // funky chromatic movement
  syro:      0.12,   // chromatic complexity
  flim:      0.08,   // occasional surprise
  trance:    0.05,   // rare — simple harmony preferred
  avril:     0.08,   // subtle color
  xtal:      0.06,   // dreamy — keep it diatonic mostly
  ambient:   0.0,    // too static for chromatic movement
};

/** How strong each scale degree is as a secondary dominant target */
const DEGREE_TARGET_STRENGTH: number[] = [
  0,     // I — can't tonicize tonic
  0.8,   // ii — V/ii is common (A7 → Dm in C)
  0.5,   // iii — V/iii less common but valid
  1.0,   // IV — V/IV (C7 → F) is very common
  1.2,   // V — V/V (D7 → G) is the most common secondary dominant
  0.7,   // vi — V/vi (E7 → Am) is common in pop
  0.3,   // vii° — V/vii° is rare and dissonant
];

/** Section multiplier for secondary dominants */
const SECTION_SECONDARY_DOMINANT: Record<Section, number> = {
  groove:    1.2,    // adds color to settled grooves
  build:     1.0,    // forward momentum
  peak:      0.8,    // already intense
  breakdown: 0.5,    // simpler harmony
  intro:     0.3,    // too early for chromaticism
};
