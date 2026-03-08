/**
 * Chord inversion selection — choose inversions for smooth bass motion.
 *
 * In root position, every chord change creates a bass leap (often a 4th
 * or 5th). By using inversions, the bass can move by steps instead:
 *
 *   Root position: C(C-E-G) → F(F-A-C) → G(G-B-D)  bass: C→F→G (leaps)
 *   With inversions: C(C-E-G) → F/C(C-F-A) → G/B(B-D-G)  bass: C→C→B (smooth!)
 *
 * Rules:
 * - **Root position**: bass = root. Strong, grounded. Default for beat 1.
 * - **First inversion** (6): bass = 3rd. Lighter, forward motion.
 * - **Second inversion** (6/4): bass = 5th. Unstable, leads to resolution.
 *
 * The algorithm minimizes bass interval size while respecting:
 * - Cadential chords (V, I at phrase ends) prefer root position
 * - First chord of a section is always root position
 * - Higher tension allows more inversions (less grounded = more movement)
 * - Per-mood inversion tendency (jazz = frequent, trance = rare)
 */

import type { Mood, Section, NoteName } from '../types';
import { noteIndex } from './scales';

export type Inversion = 0 | 1 | 2;

/** Per-mood probability of allowing non-root inversions */
const INVERSION_TENDENCY: Record<Mood, number> = {
  lofi:      0.45,   // jazz — inversions are bread and butter
  downtempo: 0.35,   // smooth — flowing bass lines
  blockhead: 0.25,   // hip-hop — some movement
  flim:      0.30,   // delicate — elegant voice leading
  disco:     0.20,   // funk — mostly root for groove
  syro:      0.25,   // IDM — some inversions
  avril:     0.30,   // intimate — smooth bass
  xtal:      0.20,   // dreamy — some movement
  trance:    0.08,   // driving — root position for power
  ambient:   0.10,   // static — minimal movement
};

/**
 * Compute the semitone distance between two notes (modular, 0-6).
 */
function bassDistance(a: NoteName, b: NoteName): number {
  const ai = noteIndex(a);
  const bi = noteIndex(b);
  const dist = Math.abs(bi - ai);
  return Math.min(dist, 12 - dist);
}

/**
 * Given chord notes, compute the bass note for each inversion.
 *
 * @param notes  Chord notes as NoteName[] (e.g., ['C', 'E', 'G'])
 * @returns Array of [inversion, bassNote] pairs
 */
export function inversionBassNotes(
  notes: NoteName[]
): [Inversion, NoteName][] {
  if (notes.length === 0) return [];
  const result: [Inversion, NoteName][] = [[0, notes[0]]];
  if (notes.length >= 2) result.push([1, notes[1]]);
  if (notes.length >= 3) result.push([2, notes[2]]);
  return result;
}

/**
 * Select the best inversion for smooth bass motion.
 *
 * Minimizes the interval between the previous bass note and each
 * possible inversion's bass note, weighted by inversion stability.
 *
 * @param chordNotes      Notes of the chord (root, 3rd, 5th, ...)
 * @param prevBassNote    Previous chord's bass note (or null for first chord)
 * @param degree          Chord degree (0-6) — V and I prefer root position
 * @param mood            Current mood
 * @param section         Current section
 * @param sectionProgress Progress within section (0-1)
 * @returns Selected inversion (0, 1, or 2)
 */
export function selectInversion(
  chordNotes: NoteName[],
  prevBassNote: NoteName | null,
  degree: number,
  mood: Mood,
  section: Section,
  sectionProgress: number
): Inversion {
  // First chord or section start: always root position
  if (prevBassNote === null || sectionProgress < 0.05) return 0;

  // Cadential chords prefer root position (I and V)
  if (degree === 0 || degree === 4) {
    // Allow inversion only with low probability
    if (Math.random() > INVERSION_TENDENCY[mood] * 0.3) return 0;
  }

  // Get possible inversions and their bass notes
  const options = inversionBassNotes(chordNotes);
  if (options.length <= 1) return 0;

  // Score each inversion: lower distance = better, with stability penalty
  const STABILITY_PENALTY: Record<Inversion, number> = {
    0: 0,    // root position: no penalty
    1: 1.5,  // first inversion: slight instability
    2: 3.0,  // second inversion: more unstable
  };

  let bestInversion: Inversion = 0;
  let bestScore = Infinity;

  for (const [inv, bassNote] of options) {
    const dist = bassDistance(prevBassNote, bassNote);
    const penalty = STABILITY_PENALTY[inv];
    // Score combines distance (want small) + stability penalty
    // Mood tendency reduces the penalty (jazz cares less about stability)
    const tendencyDiscount = INVERSION_TENDENCY[mood];
    const score = dist + penalty * (1 - tendencyDiscount);

    if (score < bestScore) {
      bestScore = score;
      bestInversion = inv;
    }
  }

  // Random gate: only use non-root if mood allows
  if (bestInversion !== 0 && Math.random() > INVERSION_TENDENCY[mood]) {
    return 0;
  }

  return bestInversion;
}

/**
 * Apply an inversion to chord notes by rotating the array and
 * adjusting octaves so the bass note is lowest.
 *
 * @param notes     Chord notes with octave (e.g., ['C3', 'E3', 'G3'])
 * @param inversion Which inversion to apply (0, 1, or 2)
 * @returns Reordered notes with adjusted octaves
 */
export function applyInversion(
  notes: string[],
  inversion: Inversion
): string[] {
  if (inversion === 0 || notes.length < 2) return notes;

  const inv = Math.min(inversion, notes.length - 1);
  // Rotate: move first `inv` notes to the end, one octave up
  const bottom = notes.slice(inv);
  const raised = notes.slice(0, inv).map(n => {
    const match = n.match(/^([A-G][b#]?)(\d+)$/);
    if (!match) return n;
    return `${match[1]}${parseInt(match[2]) + 1}`;
  });
  return [...bottom, ...raised];
}

/**
 * Extract the bass note (lowest) from a chord with octave notation.
 * Returns just the note name without octave.
 */
export function extractBassNote(notes: string[]): NoteName | null {
  if (notes.length === 0) return null;
  // First note is typically the bass
  const match = notes[0].match(/^([A-G][b#]?)/);
  return match ? match[1] as NoteName : null;
}

/**
 * Get the inversion tendency for a mood (for testing).
 */
export function inversionTendency(mood: Mood): number {
  return INVERSION_TENDENCY[mood];
}
