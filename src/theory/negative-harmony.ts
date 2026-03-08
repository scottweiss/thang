/**
 * Negative harmony — mirror chord progressions around a tonal axis.
 *
 * Ernst Levy and Jacob Collier popularized the concept of "negative
 * harmony": reflecting pitches around an axis (typically between the
 * root and fifth) to create mirror-image progressions that sound
 * surprisingly natural and emotionally inverted.
 *
 * Examples in C major (axis between E and Eb):
 *   C major → F minor (bright → dark mirror)
 *   G7 → Fm6 (dominant → subdominant mirror)
 *   Am → Eb (relative minor → its mirror)
 *
 * This creates harmonic variety that feels related to the original
 * progression but with an emotional "negative" — like a photo negative
 * that preserves structure while inverting light/dark.
 *
 * Used sparingly during breakdowns or transitions for harmonic surprise.
 */

import type { Mood, Section, NoteName } from '../types';

/** Chromatic pitch classes */
const PITCH_CLASSES: NoteName[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/** Enharmonic normalization */
const NORMALIZE: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/** How much each mood uses negative harmony (0-1) */
const NEGATIVE_TENDENCY: Record<Mood, number> = {
  lofi:      0.20,   // jazz — Collier influence
  syro:      0.25,   // IDM — harmonic adventure
  flim:      0.18,   // organic surprise
  downtempo: 0.15,   // moderate
  blockhead: 0.15,   // hip-hop — neo-soul color
  xtal:      0.12,   // dreamy mirror
  avril:     0.10,   // songwriter — occasional
  ambient:   0.08,   // subtle
  disco:     0.05,   // functional harmony preferred
  trance:    0.03,   // minimal deviation
};

/** Section modifies negative harmony probability */
const SECTION_NEGATIVE_MULT: Record<Section, number> = {
  intro:     0.5,    // establishing — stay conventional
  build:     0.8,    // moderate surprise
  peak:      0.6,    // energy over surprise
  breakdown: 1.8,    // maximum harmonic exploration
  groove:    1.0,    // neutral
};

/**
 * Mirror a pitch class around the axis between root and fifth.
 * The axis sits between scale degrees 3 and b3 (E and Eb in C).
 *
 * @param pitchClass  Input pitch class (0-11)
 * @param axisNote    The root note's pitch class (defines the axis)
 * @returns Mirrored pitch class (0-11)
 */
export function mirrorPitch(pitchClass: number, axisNote: number): number {
  // Axis is between 4th and 3rd semitone above root (between M3 and m3)
  // In C: axis between E(4) and Eb(3), so axis = 3.5
  const axis = axisNote + 3.5;
  const mirrored = Math.round(2 * axis - pitchClass);
  return ((mirrored % 12) + 12) % 12;
}

/**
 * Get the negative harmony equivalent of a chord root.
 *
 * @param root     Chord root note name
 * @param keyRoot  Key root note name (defines the mirror axis)
 * @returns Mirrored root note name
 */
export function negativeRoot(root: NoteName, keyRoot: NoteName): NoteName {
  const rootPC = NORMALIZE[root];
  const keyPC = NORMALIZE[keyRoot];
  if (rootPC === undefined || keyPC === undefined) return root;
  const mirrored = mirrorPitch(rootPC, keyPC);
  return PITCH_CLASSES[mirrored];
}

/**
 * Mirror an entire set of notes (chord voicing) around the tonal axis.
 *
 * @param notes    Array of note names with octaves (e.g., ['C3', 'E3', 'G3'])
 * @param keyRoot  Key root for axis calculation
 * @returns Mirrored notes
 */
export function negativeVoicing(notes: string[], keyRoot: NoteName): string[] {
  const keyPC = NORMALIZE[keyRoot];
  if (keyPC === undefined) return notes;

  return notes.map(note => {
    const match = note.match(/^([A-G][#b]?)(\d)$/);
    if (!match) return note;
    const pc = NORMALIZE[match[1]];
    if (pc === undefined) return note;
    const oct = parseInt(match[2]);
    const mirrored = mirrorPitch(pc, keyPC);
    // Adjust octave: if mirrored pitch wraps, shift octave
    const diff = pc - mirrored;
    const octShift = diff > 6 ? 1 : diff < -6 ? -1 : 0;
    return `${PITCH_CLASSES[mirrored]}${oct + octShift}`;
  });
}

/**
 * Whether to apply negative harmony at this moment.
 *
 * @param tick     Current tick (for deterministic variation)
 * @param mood     Current mood
 * @param section  Current section
 */
export function shouldApplyNegativeHarmony(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = NEGATIVE_TENDENCY[mood] * (SECTION_NEGATIVE_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 13) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get negative harmony tendency for a mood (for testing).
 */
export function negativeTendency(mood: Mood): number {
  return NEGATIVE_TENDENCY[mood];
}
