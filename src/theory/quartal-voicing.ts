/**
 * Quartal and quintal voicings — chords built in 4ths and 5ths.
 *
 * Traditional harmony stacks notes in 3rds (major/minor triads).
 * Quartal harmony stacks notes in perfect 4ths (e.g., C-F-Bb-Eb),
 * and quintal harmony stacks in 5ths (C-G-D-A). These voicings:
 *
 * - Sound open, modern, and ambiguous (neither major nor minor)
 * - Are central to McCoy Tyner's piano style and Herbie Hancock
 * - Used extensively in film scoring for "epic" or "mysterious" moods
 * - Common in Debussy and Bartók (early 20th century)
 * - Popular in ambient/atmospheric music for their spacious quality
 *
 * Application: during breakdowns and ambient passages, the harmony
 * layer can use quartal voicings instead of tertial (3rd-based) ones.
 * This creates an open, floating quality that avoids the major/minor
 * binary. The arp layer can also use quartal spread patterns.
 */

import type { Mood, Section } from '../types';

/** How much each mood uses quartal voicing (0-1) */
const QUARTAL_TENDENCY: Record<Mood, number> = {
  ambient:   0.40,  // open, spacious — quartal's home,
  plantasia: 0.40,
  xtal:      0.35,  // ethereal, ambiguous
  syro:      0.28,  // modern, angular
  lofi:      0.25,  // jazz — McCoy Tyner influence
  flim:      0.22,  // organic, open
  downtempo: 0.18,  // smooth, spacious
  avril:     0.12,  // songwriter — occasional color
  blockhead: 0.10,  // hip-hop — jazz influence
  disco:     0.05,  // functional harmony preferred
  trance:    0.03,  // very functional
};

/** Section multipliers */
const SECTION_QUARTAL_MULT: Record<Section, number> = {
  intro:     1.3,   // open beginning
  build:     0.5,   // needs clearer harmony
  peak:      0.3,   // needs strongest harmonic clarity
  breakdown: 2.0,   // floating, ambiguous — perfect
  groove:    1.0,   // moderate
};

const NOTE_TO_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};
const PC_TO_NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Whether to apply quartal voicing at this moment.
 */
export function shouldApplyQuartal(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = QUARTAL_TENDENCY[mood] * (SECTION_QUARTAL_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 31337) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Build a quartal voicing from a root note.
 * Stacks perfect 4ths (5 semitones each) from the root.
 *
 * @param root       Root note name
 * @param octave     Starting octave
 * @param voices     Number of notes to stack (3-5)
 * @param scaleNotes Available scale notes for optional diatonic snapping
 * @returns Array of note names with octaves
 */
export function quartalVoicing(
  root: string,
  octave: number,
  voices: number = 4,
  scaleNotes?: string[]
): string[] {
  const rootPC = NOTE_TO_PC[root];
  if (rootPC === undefined) return [`${root}${octave}`];

  const result: string[] = [];
  let currentPC = rootPC;
  let currentOct = octave;

  for (let i = 0; i < voices; i++) {
    const noteName = PC_TO_NOTE[currentPC % 12];
    result.push(`${noteName}${currentOct}`);

    // Stack a perfect 4th (5 semitones)
    currentPC += 5;
    if (currentPC >= 12) {
      currentPC -= 12;
      currentOct++;
    }
    currentOct = Math.min(6, currentOct);
  }

  return result;
}

/**
 * Build a quintal voicing from a root note.
 * Stacks perfect 5ths (7 semitones each) from the root.
 *
 * @param root       Root note name
 * @param octave     Starting octave
 * @param voices     Number of notes (3-4)
 * @returns Array of note names with octaves
 */
export function quintalVoicing(
  root: string,
  octave: number,
  voices: number = 3
): string[] {
  const rootPC = NOTE_TO_PC[root];
  if (rootPC === undefined) return [`${root}${octave}`];

  const result: string[] = [];
  let currentPC = rootPC;
  let currentOct = octave;

  for (let i = 0; i < voices; i++) {
    const noteName = PC_TO_NOTE[currentPC % 12];
    result.push(`${noteName}${currentOct}`);

    // Stack a perfect 5th (7 semitones)
    currentPC += 7;
    if (currentPC >= 12) {
      currentPC -= 12;
      currentOct++;
    }
    currentOct = Math.min(6, currentOct);
  }

  return result;
}

/**
 * Select quartal or quintal based on mood character.
 * Quartal = more modern/jazz, quintal = more open/medieval.
 */
export function selectVoicingType(
  mood: Mood,
  tick: number
): 'quartal' | 'quintal' {
  const quartalWeight: Record<Mood, number> = {
    lofi:      0.7,  // jazz — quartal preferred
    syro:      0.6,  // angular — quartal
    ambient:   0.4,  // mixed,
    plantasia: 0.4,
    xtal:      0.4,  // mixed
    flim:      0.5,  // balanced
    downtempo: 0.5,
    avril:     0.4,
    blockhead: 0.6,
    disco:     0.5,
    trance:    0.5,
  };

  const hash = ((tick * 65537 + 33331) >>> 0) / 4294967296;
  return hash < quartalWeight[mood] ? 'quartal' : 'quintal';
}

/**
 * Number of voices appropriate for the section context.
 * Sparse sections use fewer voices, dense sections use more.
 */
export function quartalVoiceCount(section: Section): number {
  switch (section) {
    case 'intro':     return 3;
    case 'breakdown': return 3;
    case 'build':     return 4;
    case 'peak':      return 4;
    case 'groove':    return 4;
    default:          return 3;
  }
}

/**
 * Get quartal tendency for a mood (for testing).
 */
export function quartalTendency(mood: Mood): number {
  return QUARTAL_TENDENCY[mood];
}
