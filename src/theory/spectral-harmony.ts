/**
 * Spectral harmony — voicings derived from the overtone series.
 *
 * Traditional chords are built from stacked thirds (C-E-G-B).
 * Spectral harmony instead uses intervals found in the natural
 * harmonic series: octave, fifth, fourth, major third, minor third,
 * and the characteristic "spectral" intervals (harmonic 7th, 11th, 13th).
 *
 * These voicings sound luminous and bell-like because they align with
 * the physical overtones of the root note. Used by spectral composers
 * (Grisey, Murail) and increasingly in ambient electronic music.
 *
 * Practical application: given a chord root, suggest additional pitches
 * from its overtone series to create richer, more resonant voicings
 * that complement FM synthesis particularly well.
 */

import type { Mood, Section, NoteName } from '../types';

/**
 * Overtone intervals in semitones above the fundamental.
 * Each entry: [harmonic number, semitones above root (mod 12), tuning deviation in cents]
 *
 * Harmonic 1: root (0)
 * Harmonic 2: octave (12 → 0)
 * Harmonic 3: P5 (7)
 * Harmonic 4: octave (0)
 * Harmonic 5: M3 (4, -14 cents flat)
 * Harmonic 6: P5 (7)
 * Harmonic 7: m7 (10, -31 cents flat — the "spectral 7th")
 * Harmonic 8: octave (0)
 * Harmonic 9: M2 (2, +4 cents sharp)
 * Harmonic 10: M3 (4)
 * Harmonic 11: #4/b5 (6, -49 cents — the "spectral 11th")
 * Harmonic 12: P5 (7)
 * Harmonic 13: m6 (8, +41 cents — the "spectral 13th")
 */
const OVERTONE_SERIES: { harmonic: number; semitones: number; cents: number }[] = [
  { harmonic: 1,  semitones: 0,  cents: 0 },
  { harmonic: 3,  semitones: 7,  cents: 2 },
  { harmonic: 5,  semitones: 4,  cents: -14 },
  { harmonic: 7,  semitones: 10, cents: -31 },
  { harmonic: 9,  semitones: 2,  cents: 4 },
  { harmonic: 11, semitones: 6,  cents: -49 },
  { harmonic: 13, semitones: 8,  cents: 41 },
];

/** How much each mood uses spectral harmony (0-1) */
const SPECTRAL_TENDENCY: Record<Mood, number> = {
  ambient:   0.55,  // ethereal, overtone-rich
  xtal:      0.50,  // crystalline, bell-like
  flim:      0.35,  // organic shimmer
  downtempo: 0.30,  // warm depth
  avril:     0.25,  // songwriter — natural resonance
  lofi:      0.20,  // subtle warmth
  syro:      0.15,  // IDM — occasional luminosity
  blockhead: 0.10,  // hip-hop — mostly conventional
  disco:     0.08,  // functional
  trance:    0.05,  // simple voicings preferred
};

/** Section multiplier for spectral tendency */
const SECTION_SPECTRAL_MULT: Record<Section, number> = {
  intro:     1.3,   // shimmer during openings
  build:     0.8,   // reduce — focus on drive
  peak:      0.6,   // minimal — energy over color
  breakdown: 1.8,   // maximum — beauty in stillness
  groove:    1.0,   // neutral
};

const NOTE_TO_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

const PC_TO_NOTE: NoteName[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Get spectral extension notes for a given root.
 * Returns pitch classes from the overtone series that can be added
 * to enrich a chord voicing.
 *
 * @param root       Chord root note name
 * @param maxCount   Maximum extensions to return (higher harmonics first excluded)
 * @returns Array of note names from the overtone series
 */
export function spectralExtensions(root: NoteName, maxCount: number = 3): NoteName[] {
  const rootPC = NOTE_TO_PC[root];
  if (rootPC === undefined) return [];

  // Skip fundamental (harmonic 1) and fifth (harmonic 3) as they're
  // already in conventional chords. Return higher harmonics.
  const extensions = OVERTONE_SERIES
    .filter(o => o.harmonic >= 5)  // start from harmonic 5 (natural M3 and beyond)
    .map(o => PC_TO_NOTE[((rootPC + o.semitones) % 12 + 12) % 12])
    .slice(0, maxCount);

  return extensions;
}

/**
 * Get the spectral 7th (harmonic 7) for a root — the natural, slightly flat
 * minor seventh that sounds warm and resonant rather than dissonant.
 */
export function spectralSeventh(root: NoteName): NoteName {
  const rootPC = NOTE_TO_PC[root];
  if (rootPC === undefined) return root;
  return PC_TO_NOTE[((rootPC + 10) % 12)];
}

/**
 * Get the spectral 11th (harmonic 11) — the natural tritone that sounds
 * mysterious and luminous rather than tense.
 */
export function spectralEleventh(root: NoteName): NoteName {
  const rootPC = NOTE_TO_PC[root];
  if (rootPC === undefined) return root;
  return PC_TO_NOTE[((rootPC + 6) % 12)];
}

/**
 * Score how "spectrally consonant" a set of notes is with a given root.
 * Higher score means more notes align with the overtone series.
 *
 * @param root    Root note
 * @param notes   Notes to check (pitch classes, no octave)
 * @returns Score 0-1 (1 = all notes in overtone series)
 */
export function spectralConsonance(root: NoteName, notes: NoteName[]): number {
  const rootPC = NOTE_TO_PC[root];
  if (rootPC === undefined || notes.length === 0) return 0;

  const overtoneSet = new Set(
    OVERTONE_SERIES.map(o => ((rootPC + o.semitones) % 12 + 12) % 12)
  );

  let hits = 0;
  for (const note of notes) {
    const pc = NOTE_TO_PC[note];
    if (pc !== undefined && overtoneSet.has(pc)) hits++;
  }

  return hits / notes.length;
}

/**
 * Whether to apply spectral voicing extensions at this moment.
 */
export function shouldApplySpectralHarmony(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = SPECTRAL_TENDENCY[mood] * (SECTION_SPECTRAL_MULT[section] ?? 1.0);
  // Deterministic hash
  const hash = ((tick * 2654435761 + 7919) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get spectral tendency for a mood (for testing).
 */
export function spectralTendency(mood: Mood): number {
  return SPECTRAL_TENDENCY[mood];
}

/**
 * Suggest voicing enrichments based on spectral harmony.
 * Given existing chord notes, suggests 1-2 additional notes from
 * the overtone series that would add luminosity.
 *
 * @param root      Chord root
 * @param existing  Existing chord note names (no octave)
 * @param maxAdd    Maximum notes to add
 * @returns Notes to add (pitch class only, no octave)
 */
export function suggestSpectralEnrichment(
  root: NoteName,
  existing: NoteName[],
  maxAdd: number = 1
): NoteName[] {
  const extensions = spectralExtensions(root, 5);
  const existingSet = new Set(existing);

  // Only suggest notes not already in the chord
  const novel = extensions.filter(n => !existingSet.has(n));
  return novel.slice(0, maxAdd);
}
