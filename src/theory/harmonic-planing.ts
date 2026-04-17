/**
 * Harmonic planing — parallel chord movement for impressionist color.
 *
 * Traditional voice leading minimizes motion (each voice moves to the
 * nearest available note). Harmonic planing does the opposite: the entire
 * chord structure moves in parallel, preserving the intervallic shape.
 *
 * When used sparingly, planing creates a distinctive "floating" quality:
 * - Debussy, Ravel (impressionist parallel chords)
 * - Ambient electronica (parallel pad motion)
 * - Brian Eno (floating major triads in parallel)
 *
 * This module determines when to use planing vs. voice leading,
 * and computes the parallel-shifted voicing.
 *
 * Rules:
 * - Planing is more likely during breakdowns and intros (dreamy)
 * - Less likely during peaks (where functional harmony is important)
 * - Some moods (ambient, xtal, flim) prefer planing; others (trance, disco) don't
 * - The chord quality is preserved — a major triad stays major
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood probability of using planing instead of voice leading.
 */
const MOOD_PLANING_PROBABILITY: Record<Mood, number> = {
  ambient: 0.4,     // impressionist floating,
  plantasia: 0.4,
  downtempo: 0.15,  // occasional color
  lofi: 0.1,        // subtle
  trance: 0.05,     // mostly functional harmony
  avril: 0.2,       // gentle parallel motion
  xtal: 0.45,       // very impressionist
  syro: 0.1,        // occasional surprise
  blockhead: 0.08,  // functional hip-hop harmony
  flim: 0.35,       // dreamy parallel movement
  disco: 0.03,      // strongly functional
};

/**
 * Section modifier for planing probability.
 * Planing works better in dreamy/sparse sections.
 */
const SECTION_PLANING_MULT: Record<Section, number> = {
  intro: 1.5,       // dreamy, establishing
  build: 0.6,       // building tension, want functional harmony
  peak: 0.3,        // maximum energy, functional
  breakdown: 1.3,   // dreamy — planing more likely but not dominant
  groove: 0.8,      // moderate
};

/**
 * Determine if the current chord change should use planing.
 *
 * @param mood     Current mood
 * @param section  Current section
 * @returns true if this chord change should use parallel motion
 */
export function shouldUsePlaning(mood: Mood, section: Section): boolean {
  const prob = (MOOD_PLANING_PROBABILITY[mood] ?? 0.1) *
               (SECTION_PLANING_MULT[section] ?? 1.0);
  return Math.random() < Math.min(0.6, prob); // cap at 60%
}

/**
 * Apply harmonic planing: shift all notes by the same interval.
 *
 * Given the previous chord's voicing and a target root, compute
 * a new voicing that preserves the intervallic structure but
 * centers on the new root.
 *
 * @param prevNotes   Previous chord notes with octaves (e.g., ['C3', 'E3', 'G3'])
 * @param newRoot     New chord root (e.g., 'D')
 * @param prevRoot    Previous chord root (e.g., 'C')
 * @returns Parallel-shifted notes, or null if planing isn't possible
 */
export function planedVoicing(
  prevNotes: string[],
  newRoot: string,
  prevRoot: string
): string[] | null {
  if (prevNotes.length === 0) return null;

  // Calculate the semitone interval between roots
  const interval = rootInterval(prevRoot, newRoot);
  if (interval === 0) return null; // same root, no planing needed

  // Shift every note by the same interval
  return prevNotes.map(note => transposeNote(note, interval)).filter(Boolean) as string[];
}

/**
 * Compute the shortest semitone interval from one root to another.
 * Always takes the shortest path (max ±6 semitones).
 */
function rootInterval(from: string, to: string): number {
  const fromPitch = rootToPitch(from);
  const toPitch = rootToPitch(to);
  if (fromPitch < 0 || toPitch < 0) return 0;

  let interval = (toPitch - fromPitch + 12) % 12;
  // Use shortest path
  if (interval > 6) interval -= 12;
  return interval;
}

/**
 * Transpose a note string by a number of semitones.
 */
function transposeNote(note: string, semitones: number): string | null {
  const match = note.match(/^([A-G][b#]?)(\d)$/);
  if (!match) return null;

  const pitch = rootToPitch(match[1]);
  if (pitch < 0) return null;

  const octave = parseInt(match[2]);
  const totalSemitones = octave * 12 + pitch + semitones;
  const newOctave = Math.floor(totalSemitones / 12);
  const newPitch = ((totalSemitones % 12) + 12) % 12;

  // Clamp to reasonable range
  if (newOctave < 1 || newOctave > 7) return null;

  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return `${NAMES[newPitch]}${newOctave}`;
}

/** Convert a root name to pitch class (0-11). */
function rootToPitch(name: string): number {
  const MAP: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };
  return MAP[name] ?? -1;
}
