/**
 * Stretto — overlapping canonic entries of the same motif.
 *
 * In a fugue's stretto section, the subject enters before the previous
 * entry has finished, creating a compressed, intensifying texture.
 * Bach used this as the climactic device in many fugues.
 *
 * In our context: during builds and peaks, the arp can enter with
 * a delayed copy of the melody motif before the melody finishes,
 * creating an overlapping effect that builds tension and density.
 *
 * Parameters:
 * - Entry offset: how many steps after the leader the follower enters
 *   (smaller = more intense overlap)
 * - Transposition: follower can enter at the same pitch, up a 4th/5th,
 *   or inverted
 *
 * The effect is powerful because the listener hears the same material
 * "catching up" — creating urgency and inevitability.
 */

import type { Mood, Section } from '../types';

/** How much each mood uses stretto technique (0-1) */
const STRETTO_TENDENCY: Record<Mood, number> = {
  trance:    0.35,  // overlapping builds
  syro:      0.30,  // IDM — layered entries
  disco:     0.25,  // dance floor energy
  blockhead: 0.22,  // hip-hop layers
  flim:      0.20,  // organic overlap
  lofi:      0.15,  // jazz — canonic play
  downtempo: 0.12,  // subtle
  avril:     0.10,  // songwriter
  xtal:      0.08,  // gentle echoes
  ambient:   0.05,  // minimal,
  plantasia: 0.05,
};

/** Section multiplier */
const SECTION_STRETTO_MULT: Record<Section, number> = {
  intro:     0.3,   // too early for intensity
  build:     1.8,   // stretto's natural home
  peak:      1.5,   // maximum overlap
  breakdown: 0.4,   // space out
  groove:    1.0,   // neutral
};

/**
 * Create a stretto overlay: the same motif entering at a later offset.
 *
 * @param motif     The original motif notes
 * @param offset    Entry delay (in steps) for the follower
 * @param length    Total output length
 * @returns Follower's note array (with leading rests for the offset)
 */
export function strettoEntry(
  motif: string[],
  offset: number,
  length: number
): string[] {
  if (motif.length === 0 || offset < 0) return new Array(length).fill('~');

  const result = new Array(length).fill('~');
  for (let i = 0; i < motif.length && (i + offset) < length; i++) {
    result[i + offset] = motif[i];
  }
  return result;
}

/**
 * Create a transposed stretto entry (up/down by interval).
 *
 * @param motif       Original motif
 * @param semitones   Transposition in semitones (7 = P5, 5 = P4)
 * @param scaleNotes  Available scale notes for snapping
 * @returns Transposed motif
 */
export function transposeForStretto(
  motif: string[],
  semitones: number,
  scaleNotes: string[]
): string[] {
  const NOTE_TO_PC: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };
  const PC_TO_NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  return motif.map(note => {
    if (note === '~') return note;
    const match = note.match(/^([A-G](?:b|#)?)(\d+)$/);
    if (!match) return note;
    const pc = NOTE_TO_PC[match[1]];
    if (pc === undefined) return note;
    const oct = parseInt(match[2]);

    let newPC = (pc + semitones) % 12;
    if (newPC < 0) newPC += 12;
    const octShift = Math.floor((pc + semitones) / 12);
    const newOct = Math.max(2, Math.min(6, oct + octShift));

    return `${PC_TO_NOTE[newPC]}${newOct}`;
  });
}

/**
 * Calculate ideal stretto offset based on tension and mood.
 * Higher tension → tighter overlap.
 *
 * @param motifLength  Length of the motif
 * @param tension      Current tension (0-1)
 * @param mood         Current mood
 * @returns Offset in steps (1 = very tight, motifLength-1 = wide)
 */
export function strettoOffset(
  motifLength: number,
  tension: number,
  mood: Mood
): number {
  if (motifLength <= 1) return 1;

  // High tension → tight stretto (offset = 1-2)
  // Low tension → loose stretto (offset = motifLength/2)
  const minOffset = 1;
  const maxOffset = Math.max(2, Math.floor(motifLength * 0.6));

  // Inverse mapping: higher tension = smaller offset
  const offset = Math.round(maxOffset - tension * (maxOffset - minOffset));
  return Math.max(minOffset, Math.min(maxOffset, offset));
}

/**
 * Select transposition interval for the stretto follower.
 * Common choices: unison (0), up a 4th (5), up a 5th (7), inverted (-1 per step).
 */
export function strettoInterval(mood: Mood, tick: number): number {
  const intervals: Record<Mood, number[]> = {
    trance:    [0, 7, 12],  // unison, fifth, octave
    syro:      [0, 5, 7, 6], // includes tritone
    disco:     [0, 7, 12],
    blockhead: [0, 5, 7],
    flim:      [0, 7, 5],
    lofi:      [0, 7, 5, 3],
    downtempo: [0, 7, 5],
    avril:     [0, 7, 12],
    xtal:      [0, 7, 12],
    ambient:   [0, 12, 7],
    plantasia: [0, 12, 7],
  };

  const options = intervals[mood];
  return options[((tick * 65537) >>> 0) % options.length];
}

/**
 * Whether to apply stretto at this moment.
 */
export function shouldApplyStretto(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = STRETTO_TENDENCY[mood] * (SECTION_STRETTO_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 13001) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get stretto tendency for a mood (for testing).
 */
export function strettoTendency(mood: Mood): number {
  return STRETTO_TENDENCY[mood];
}
