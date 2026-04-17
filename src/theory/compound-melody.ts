/**
 * Compound melody — a single line that implies multiple voices.
 *
 * In Bach's unaccompanied cello suites and violin partitas, a single
 * instrument creates the illusion of polyphony by alternating between
 * high and low registers. The ear separates the interleaved notes into
 * two "streams" — one high, one low — perceiving counterpoint where
 * there's only one voice. This is the auditory stream segregation
 * principle (Bregman, 1990).
 *
 * Application: the melody layer can create compound lines during
 * sections where the arp is sparse (breakdowns, intros), making a
 * single voice sound like two interleaved melodies. The register
 * separation must be at least a sixth (~9 semitones) for the ear
 * to split the streams.
 *
 * Parameters:
 * - Stream separation: minimum interval between the two implied voices
 * - Alternation rate: how quickly we switch between high and low stream
 * - Stream priority: which stream gets the chord tones vs passing tones
 */

import type { Mood, Section } from '../types';

/** How much each mood uses compound melody (0-1) */
const COMPOUND_TENDENCY: Record<Mood, number> = {
  xtal:      0.35,  // ethereal, Bach-like
  flim:      0.30,  // organic, detailed
  ambient:   0.25,  // single voice implying many,
  plantasia: 0.25,
  lofi:      0.20,  // jazz — implied bass lines
  avril:     0.18,  // songwriter — expressive
  downtempo: 0.15,  // gentle polyphony
  syro:      0.12,  // IDM — some register play
  blockhead: 0.08,  // hip-hop — less melodic
  disco:     0.05,  // melody stays in one register
  trance:    0.03,  // single line preferred
};

/** Section multipliers */
const SECTION_COMPOUND_MULT: Record<Section, number> = {
  intro:     1.5,   // sparse context — compound shines
  build:     0.6,   // too busy for implied polyphony
  peak:      0.3,   // way too busy
  breakdown: 1.8,   // perfect for compound melody
  groove:    1.0,   // moderate
};

/**
 * Whether to apply compound melody at this moment.
 */
export function shouldApplyCompound(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = COMPOUND_TENDENCY[mood] * (SECTION_COMPOUND_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 19937) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Split a motif into two interleaved register streams,
 * creating a compound melody from a single-voice line.
 *
 * Takes the original notes and alternates them between a high
 * and low register, with the interval separation determining
 * how clearly the ear splits them into two streams.
 *
 * @param motif        Original melody notes (e.g., ['C4', 'D4', 'E4', 'F4'])
 * @param separation   Semitones between streams (9 = sixth, 12 = octave)
 * @param pattern      Alternation pattern: 'alternate' = HLHL, 'grouped' = HHLL
 * @returns Compound melody with register jumps
 */
export function createCompoundMelody(
  motif: string[],
  separation: number,
  pattern: 'alternate' | 'grouped' = 'alternate'
): string[] {
  if (motif.length < 2) return motif;

  const NOTE_TO_PC: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };
  const PC_TO_NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  return motif.map((note, i) => {
    if (note === '~') return note;
    const match = note.match(/^([A-G](?:b|#)?)(\d+)$/);
    if (!match) return note;

    const isHigh = pattern === 'alternate'
      ? i % 2 === 0
      : i < motif.length / 2;

    if (isHigh) {
      // Keep in upper register (shift up by half the separation)
      const pc = NOTE_TO_PC[match[1]];
      if (pc === undefined) return note;
      const oct = parseInt(match[2]);
      const shift = Math.floor(separation / 2);
      let newPC = (pc + shift) % 12;
      const octShift = Math.floor((pc + shift) / 12);
      return `${PC_TO_NOTE[newPC]}${Math.min(6, oct + octShift)}`;
    } else {
      // Lower register (shift down by half the separation)
      const pc = NOTE_TO_PC[match[1]];
      if (pc === undefined) return note;
      const oct = parseInt(match[2]);
      const shift = Math.floor(separation / 2);
      let newPC = ((pc - shift) % 12 + 12) % 12;
      const octShift = Math.floor((pc - shift) / 12);
      return `${PC_TO_NOTE[newPC]}${Math.max(2, oct + octShift)}`;
    }
  });
}

/**
 * Determine ideal stream separation based on mood and section.
 * Wider separation = clearer stream segregation.
 *
 * @param mood     Current mood
 * @param section  Current section
 * @returns Separation in semitones
 */
export function compoundSeparation(mood: Mood, section: Section): number {
  // Base separation: at least a sixth for auditory streaming
  const base: Record<Mood, number> = {
    xtal:      12,  // full octave — clear streams
    flim:      10,  // wide — detailed
    ambient:   14,  // very wide — ethereal,
    plantasia: 14,
    lofi:      9,   // sixth — jazz-like
    avril:     9,   // sixth — expressive
    downtempo: 10,  // moderate
    syro:      12,  // octave — geometric
    blockhead: 9,   // minimal
    disco:     7,   // fifth — subtle
    trance:    7,   // fifth — subtle
  };

  // Breakdowns and intros widen separation for clarity
  const sectionAdj = section === 'breakdown' ? 2
    : section === 'intro' ? 1
    : section === 'peak' ? -2
    : 0;

  return Math.max(5, Math.min(16, base[mood] + sectionAdj));
}

/**
 * Select alternation pattern based on mood.
 * 'alternate' = HLHLHL (Bach-like, more polyphonic)
 * 'grouped' = HHHLLLL (more melodic, arc-shaped)
 */
export function compoundPattern(
  mood: Mood,
  tick: number
): 'alternate' | 'grouped' {
  // Some moods prefer the Bach-like alternation, others prefer grouped arcs
  const alternateWeight: Record<Mood, number> = {
    xtal:      0.7,
    flim:      0.6,
    ambient:   0.8,
    plantasia: 0.8,
    lofi:      0.4,  // jazz prefers grouped arcs
    avril:     0.3,  // songwriter — melodic arcs
    downtempo: 0.5,
    syro:      0.7,
    blockhead: 0.4,
    disco:     0.3,
    trance:    0.3,
  };

  const hash = ((tick * 65537 + 11003) >>> 0) / 4294967296;
  return hash < alternateWeight[mood] ? 'alternate' : 'grouped';
}

/**
 * Get compound melody tendency for a mood (for testing).
 */
export function compoundTendency(mood: Mood): number {
  return COMPOUND_TENDENCY[mood];
}
