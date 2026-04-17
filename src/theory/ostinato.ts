/**
 * Ostinato — persistent repeating musical pattern.
 *
 * The backbone of electronic music, Baroque passacaglia/chaconne,
 * minimalism, and much of world music. An ostinato is a short musical
 * figure that repeats throughout a section or piece while other
 * elements change around it.
 *
 * Types:
 * - Basso ostinato: repeating bass line (ground bass)
 * - Rhythmic ostinato: repeating rhythm with changing pitches
 * - Melodic ostinato: repeating melody fragment
 * - Harmonic ostinato: repeating chord progression (loop)
 *
 * Application: during grooves and builds, the arp or bass can lock
 * onto an ostinato derived from the current chord, creating a
 * hypnotic foundation while melody and harmony evolve above.
 *
 * The power of ostinato is that the repetition itself becomes musical:
 * each cycle reveals new relationships as the context shifts around it.
 */

import type { Mood, Section, NoteName } from '../types';

/** How much each mood uses ostinato patterns (0-1) */
const OSTINATO_TENDENCY: Record<Mood, number> = {
  trance:    0.55,  // hypnotic repetition is the core
  disco:     0.45,  // groove loops
  blockhead: 0.40,  // hip-hop loops
  syro:      0.30,  // IDM — loop then destroy
  lofi:      0.25,  // jazz — vamp patterns
  downtempo: 0.22,  // trip-hop loops
  flim:      0.18,  // organic repetition
  avril:     0.12,  // songwriter — verse riffs
  xtal:      0.10,  // crystalline loops
  ambient:   0.08,  // minimal — evolving over static,
  plantasia: 0.08,
};

/** Section appropriateness */
const SECTION_OSTINATO_MULT: Record<Section, number> = {
  intro:     0.5,   // establishing — not yet locked
  build:     1.3,   // lock in for momentum
  peak:      1.5,   // maximum drive
  breakdown: 0.3,   // break the pattern
  groove:    1.8,   // ostinato's natural home
};

export type OstinatoType = 'ascending' | 'descending' | 'pendulum' | 'static';

/**
 * Generate an ostinato pattern from chord tones.
 *
 * @param chordNotes  Available chord notes (with octave)
 * @param type        Pattern shape
 * @param length      Number of notes in the ostinato
 * @returns Array of note names forming the repeating pattern
 */
export function generateOstinato(
  chordNotes: string[],
  type: OstinatoType,
  length: number = 4
): string[] {
  if (chordNotes.length === 0) return [];
  const len = Math.max(2, Math.min(8, length));

  switch (type) {
    case 'ascending':
      return Array.from({ length: len }, (_, i) =>
        chordNotes[i % chordNotes.length]
      );

    case 'descending':
      return Array.from({ length: len }, (_, i) =>
        chordNotes[(chordNotes.length - 1 - (i % chordNotes.length) + chordNotes.length) % chordNotes.length]
      );

    case 'pendulum': {
      // Up then down: 0,1,2,3,2,1,0,1...
      const cycle = chordNotes.length > 1
        ? [...chordNotes, ...chordNotes.slice(1, -1).reverse()]
        : chordNotes;
      return Array.from({ length: len }, (_, i) =>
        cycle[i % cycle.length]
      );
    }

    case 'static':
      // Root note repeated (ground bass)
      return Array.from({ length: len }, () => chordNotes[0]);
  }
}

/**
 * Select ostinato type based on mood and section.
 */
export function selectOstinatoType(mood: Mood, section: Section, tick: number): OstinatoType {
  const types: OstinatoType[] = ['ascending', 'descending', 'pendulum', 'static'];
  const weights: Record<Mood, number[]> = {
    trance:    [3, 1, 2, 2],  // ascending arps
    disco:     [2, 1, 3, 2],  // pendulum grooves
    blockhead: [1, 2, 1, 4],  // static bass loops
    syro:      [2, 2, 3, 1],  // pendulum
    lofi:      [1, 1, 2, 4],  // static vamps
    downtempo: [1, 2, 2, 3],  // descending + static
    flim:      [2, 2, 3, 1],  // pendulum
    avril:     [1, 1, 1, 4],  // static riffs
    xtal:      [2, 1, 3, 2],  // pendulum shimmer
    ambient:   [1, 1, 2, 4],  // static drones,
    plantasia: [1, 1, 2, 4],
  };

  const w = weights[mood];
  const total = w.reduce((a, b) => a + b, 0);
  const hash = ((tick * 65537 + 4219) >>> 0) % total;
  let cumulative = 0;
  for (let i = 0; i < types.length; i++) {
    cumulative += w[i];
    if (hash < cumulative) return types[i];
  }
  return 'static';
}

/**
 * Whether ostinato should be applied.
 */
export function shouldApplyOstinato(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = OSTINATO_TENDENCY[mood] * (SECTION_OSTINATO_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 10007) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get the ideal ostinato length for a mood.
 */
export function ostinatoLength(mood: Mood): number {
  const lengths: Record<Mood, number> = {
    trance: 4, disco: 4, blockhead: 4, syro: 3,
    lofi: 4, downtempo: 3, flim: 3, avril: 4, xtal: 3, ambient: 2, plantasia: 4,
  };
  return lengths[mood];
}

/**
 * Get ostinato tendency for a mood (for testing).
 */
export function ostinatoTendency(mood: Mood): number {
  return OSTINATO_TENDENCY[mood];
}
