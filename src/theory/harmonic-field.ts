/**
 * Harmonic field — voicings derived from the natural overtone series.
 *
 * The overtone series (fundamental, octave, fifth, 2nd octave, major 3rd,
 * etc.) produces the most naturally consonant intervals. Chords built
 * from these relationships have a luminous, bell-like quality.
 *
 * Higher partials introduce more complex intervals:
 * - Partials 1-4: octaves and fifths (very open)
 * - Partials 4-7: major triads emerge naturally
 * - Partials 7-11: sevenths, ninths, elevenths (jazz territory)
 * - Partials 11+: quarter-tones, microtonal (spectral music)
 *
 * This module generates note sets based on overtone relationships
 * from a given fundamental, creating "spectral chords" that can
 * supplement or replace conventional tertian harmony.
 *
 * Application: in ambient/xtal moods, harmony layer occasionally
 * uses overtone-based voicings instead of stacked thirds.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood tendency to use harmonic field voicings.
 */
const FIELD_TENDENCY: Record<Mood, number> = {
  ambient:   0.45,  // natural, resonant
  xtal:      0.35,  // bell-like
  flim:      0.25,  // organic sonority
  downtempo: 0.20,  // occasional color
  lofi:      0.12,  // subtle
  avril:     0.10,  // mostly conventional
  blockhead: 0.08,  // rare
  syro:      0.06,  // IDM uses other approaches
  disco:     0.04,  // needs clear harmony
  trance:    0.03,  // needs strong triads
};

/**
 * Section multiplier for harmonic field.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // open, spacious
  build:     0.7,
  peak:      0.5,   // needs clear harmony
  breakdown: 1.5,   // dreamy, open
  groove:    0.8,
};

/**
 * Intervals in semitones for the first N partials of the overtone series.
 * Partial 1 = fundamental (0), 2 = octave (12), 3 = octave+fifth (19),
 * 4 = 2 octaves (24), 5 = 2 octaves+major 3rd (28), 6 = 2 octaves+5th (31),
 * 7 = 2 octaves+minor 7th (34, approximate), etc.
 */
const OVERTONE_INTERVALS = [0, 12, 19, 24, 28, 31, 34, 36];

/**
 * Generate overtone voicing notes from a fundamental.
 *
 * @param root      Root note name (e.g., 'C')
 * @param baseOctave Base octave for the fundamental
 * @param partials   How many partials to include (2-8)
 * @returns Array of note strings
 */
export function overtoneVoicing(
  root: string,
  baseOctave: number,
  partials: number
): string[] {
  const NOTE_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const ROOT_PC: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };

  const rootPc = ROOT_PC[root] ?? 0;
  const baseMidi = (baseOctave + 1) * 12 + rootPc;
  const clampedPartials = Math.max(2, Math.min(8, partials));

  const notes: string[] = [];
  for (let i = 0; i < clampedPartials; i++) {
    const midi = baseMidi + OVERTONE_INTERVALS[i];
    const pc = midi % 12;
    const oct = Math.floor(midi / 12) - 1;
    notes.push(`${NOTE_NAMES[pc]}${oct}`);
  }

  return notes;
}

/**
 * How many partials to use based on mood and section.
 * More partials = richer, more complex sonority.
 */
export function fieldPartials(mood: Mood, section: Section): number {
  const base = {
    ambient: 6, xtal: 5, flim: 5, downtempo: 4,
    lofi: 4, avril: 3, blockhead: 3, syro: 4,
    disco: 3, trance: 3,
  }[mood];

  // Breakdowns and intros get more partials (spacious)
  if (section === 'breakdown' || section === 'intro') return Math.min(8, base + 1);
  if (section === 'peak') return Math.max(2, base - 1);
  return base;
}

/**
 * Should harmonic field voicing be used at this tick?
 */
export function shouldApplyField(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = FIELD_TENDENCY[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 67031) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Blend overtone voicing with conventional chord notes.
 * At low blend: mostly conventional, a few overtone additions.
 * At high blend: mostly overtone voicing.
 *
 * @param conventional  Standard chord notes
 * @param overtones     Overtone-derived notes
 * @param blend         Blend amount (0 = all conventional, 1 = all overtone)
 * @returns Blended note set
 */
export function blendVoicings(
  conventional: string[],
  overtones: string[],
  blend: number
): string[] {
  const clampedBlend = Math.max(0, Math.min(1, blend));
  const total = Math.max(conventional.length, overtones.length);
  const overtoneCount = Math.round(total * clampedBlend);
  const conventionalCount = total - overtoneCount;

  const result: string[] = [];
  for (let i = 0; i < conventionalCount && i < conventional.length; i++) {
    result.push(conventional[i]);
  }
  for (let i = 0; i < overtoneCount && i < overtones.length; i++) {
    if (!result.includes(overtones[i])) {
      result.push(overtones[i]);
    }
  }

  return result;
}

/**
 * Get field tendency for a mood (for testing).
 */
export function fieldTendency(mood: Mood): number {
  return FIELD_TENDENCY[mood];
}
