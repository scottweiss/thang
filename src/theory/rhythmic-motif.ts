/**
 * Rhythmic motif — recurring rhythmic patterns create identity.
 *
 * Great music has recognizable rhythmic fingerprints — short
 * patterns of note/rest that repeat and develop. This module
 * generates and tracks mood-characteristic rhythmic cells that
 * give each mood a distinctive groove identity beyond just tempo.
 *
 * Applied to melody and arp: a rhythmic cell (e.g., "note rest note note")
 * is established and then varied throughout the piece.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood rhythmic cell length (in beats).
 */
const CELL_LENGTH: Record<Mood, number> = {
  trance:    4,   // 4-beat pattern (four-on-the-floor)
  avril:     6,   // longer classical phrasing
  disco:     4,   // groove cell
  downtempo: 5,   // odd-length for floating feel
  blockhead: 3,   // short choppy cells
  lofi:      4,   // jazz cell
  flim:      5,   // odd-length organic
  xtal:      7,   // asymmetric, dreamy
  syro:      3,   // short complex cells
  ambient:   8,   // long, breathing,
  plantasia: 8,
};

/**
 * Per-mood motif adherence strength.
 * Higher = more strictly follows established cell.
 */
const ADHERENCE: Record<Mood, number> = {
  trance:    0.60,  // strong rhythmic identity
  avril:     0.45,  // classical variation
  disco:     0.55,  // groove lock
  downtempo: 0.35,  // moderate
  blockhead: 0.40,  // choppy identity
  lofi:      0.50,  // jazz cell recurrence
  flim:      0.35,  // organic variation
  xtal:      0.25,  // floating, less rigid
  syro:      0.30,  // complex variation
  ambient:   0.15,  // barely recurring,
  plantasia: 0.15,
};

/**
 * Generate a rhythmic cell for a mood.
 * Returns array of booleans (true=note, false=rest).
 *
 * @param mood Current mood
 * @param seed Seed for deterministic generation
 * @returns Rhythmic cell pattern
 */
export function generateCell(mood: Mood, seed: number): boolean[] {
  const len = CELL_LENGTH[mood];
  const cell: boolean[] = [];

  for (let i = 0; i < len; i++) {
    const hash = (((seed + 7) * 2654435761 ^ (i + 3) * 3266489917) >>> 0) / 4294967296;
    // First beat always has a note
    if (i === 0) {
      cell.push(true);
    } else {
      // Density varies by mood
      const densityThreshold = mood === 'ambient' ? 0.6
        : mood === 'trance' ? 0.3
        : mood === 'syro' ? 0.35
        : 0.45;
      cell.push(hash > densityThreshold);
    }
  }

  return cell;
}

/**
 * Apply a rhythmic cell to an element array.
 * Masks notes to rests where cell says rest.
 *
 * @param elements Note elements (notes and rests)
 * @param cell Rhythmic cell pattern
 * @param adherence How strictly to follow (0-1)
 * @param tick Current tick for variation
 * @returns Modified elements
 */
export function applyCell(
  elements: string[],
  cell: boolean[],
  adherence: number,
  tick: number
): string[] {
  return elements.map((e, i) => {
    if (e === '~') return e;
    const cellIdx = i % cell.length;
    if (!cell[cellIdx]) {
      // Cell says rest — apply with probability
      const hash = ((tick * 48271 + i * 2654435761) >>> 0) / 4294967296;
      if (hash < adherence) return '~';
    }
    return e;
  });
}

/**
 * Get cell length for a mood (for testing).
 */
export function cellLength(mood: Mood): number {
  return CELL_LENGTH[mood];
}

/**
 * Get adherence for a mood (for testing).
 */
export function cellAdherence(mood: Mood): number {
  return ADHERENCE[mood];
}

/**
 * Should rhythmic motif be applied?
 */
export function shouldApplyRhythmicMotif(mood: Mood, section: Section): boolean {
  const sectionMult: Record<Section, number> = {
    intro: 0.6, build: 0.9, peak: 0.8, breakdown: 1.2, groove: 1.0,
  };
  return ADHERENCE[mood] * (sectionMult[section] ?? 1.0) > 0.12;
}
