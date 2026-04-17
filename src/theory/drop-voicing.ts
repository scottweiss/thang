/**
 * Drop voicings — widen chords by dropping inner voices down an octave.
 *
 * Close-position chords (all notes within one octave) sound "clumpy."
 * Drop voicings open them up by moving one or more inner voices down
 * an octave, creating wider, more professional-sounding voicings.
 *
 * Drop-2: Second voice from top drops an octave (most common jazz voicing)
 * Drop-3: Third voice from top drops an octave
 *
 * Example:
 * Close position: C4 E4 G4 B4  (all within one octave)
 * Drop-2:         G3 C4 E4 B4  (G dropped, creates wider spread)
 *
 * Applied to harmony layer based on mood and section:
 * - Jazz/lofi moods use drop-2 frequently
 * - Peaks may use drop-2 for fuller sound
 * - Breakdowns use close position for intimacy
 */

import type { Mood, Section } from '../types';

/**
 * Apply drop-2 voicing: drop second-from-top voice down an octave.
 *
 * @param notes  Chord notes sorted low to high (e.g., ["C4", "E4", "G4", "B4"])
 * @returns Notes with second voice from top dropped an octave
 */
export function applyDrop2(notes: string[]): string[] {
  if (notes.length < 3) return notes;

  const result = [...notes];
  // The second voice from top is at index length - 2
  const dropIdx = result.length - 2;
  const dropped = shiftOctave(result[dropIdx], -1);
  if (dropped) {
    result[dropIdx] = dropped;
    // Re-sort so voices are in ascending order
    result.sort(pitchCompare);
  }
  return result;
}

/**
 * Apply drop-3 voicing: drop third-from-top voice down an octave.
 */
export function applyDrop3(notes: string[]): string[] {
  if (notes.length < 4) return applyDrop2(notes); // fall back to drop-2

  const result = [...notes];
  const dropIdx = result.length - 3;
  const dropped = shiftOctave(result[dropIdx], -1);
  if (dropped) {
    result[dropIdx] = dropped;
    result.sort(pitchCompare);
  }
  return result;
}

/**
 * Whether to apply a drop voicing and which type.
 */
export function pickDropVoicing(
  mood: Mood,
  section: Section,
  noteCount: number
): 'drop2' | 'drop3' | 'close' {
  if (noteCount < 3) return 'close';

  const prob = DROP_PROBABILITY[mood] * SECTION_DROP_MULT[section];
  if (Math.random() >= prob) return 'close';

  // Drop-3 only for 4+ note chords, and less common
  if (noteCount >= 4 && Math.random() < 0.3) return 'drop3';
  return 'drop2';
}

/**
 * Deterministic probability for testing.
 */
export function dropProbability(mood: Mood, section: Section): number {
  return DROP_PROBABILITY[mood] * SECTION_DROP_MULT[section];
}

function shiftOctave(note: string, delta: number): string | null {
  const match = note.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return null;
  const newOct = parseInt(match[2]) + delta;
  if (newOct < 1 || newOct > 7) return null;
  return `${match[1]}${newOct}`;
}

function pitchCompare(a: string, b: string): number {
  return approxPitch(a) - approxPitch(b);
}

function approxPitch(note: string): number {
  const match = note.match(/^([A-G])([b#]?)(\d+)$/);
  if (!match) return 0;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const letter = base[match[1]] ?? 0;
  const acc = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return (parseInt(match[3]) + 1) * 12 + letter + acc;
}

/** Per-mood probability of using a drop voicing */
const DROP_PROBABILITY: Record<Mood, number> = {
  lofi:      0.55,   // jazzy — drop voicings are essential
  downtempo: 0.40,   // smooth, open voicings
  avril:     0.35,   // intimate, piano-like
  flim:      0.30,   // delicate open voicings
  blockhead: 0.30,   // neo-soul influence
  xtal:      0.25,   // dreamy wideness
  disco:     0.25,   // funky chords
  syro:      0.20,   // occasional jazz reference
  trance:    0.10,   // mostly stacked pads
  ambient:   0.15,   // wide but sparse,
  plantasia: 0.15,
};

/** Section multiplier for drop voicing probability */
const SECTION_DROP_MULT: Record<Section, number> = {
  groove:    1.3,    // settled — rich voicings shine
  peak:      1.1,    // full sound
  build:     0.8,    // building up
  breakdown: 0.6,    // intimate — close position
  intro:     0.5,    // establishing — simple voicings
};
