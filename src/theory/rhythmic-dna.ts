/**
 * Rhythmic DNA — characteristic rhythmic cells per mood.
 *
 * Just as each mood has melodic interval preferences (interval-character.ts),
 * each mood should have characteristic rhythmic patterns that recur across
 * layers, creating a distinctive groove fingerprint.
 *
 * Trance: four-on-the-floor with off-beat emphasis
 * Lofi: lazy swing triplet feel
 * Syro: displaced, fractured irregular cells
 * Ambient: long sustained notes with occasional movement
 *
 * These cells can be applied as accent patterns, fill templates,
 * or rhythmic masks that bias note placement across layers.
 */

import type { Mood, Section } from '../types';

/**
 * A rhythmic cell: array of relative durations and accents.
 * Each entry is { hit: boolean, accent: number (0-1) }.
 */
export interface RhythmicCell {
  pattern: { hit: boolean; accent: number }[];
  length: number;
}

/**
 * Core rhythmic DNA cells per mood.
 * These are the characteristic 8-step rhythmic fingerprints.
 */
const RHYTHMIC_DNA: Record<Mood, RhythmicCell[]> = {
  trance: [
    // Four-on-the-floor with off-beat buildup
    { pattern: [
      { hit: true, accent: 1.0 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.6 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.8 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.6 }, { hit: true, accent: 0.4 },
    ], length: 8 },
    // Driving 16th note push
    { pattern: [
      { hit: true, accent: 1.0 }, { hit: true, accent: 0.3 },
      { hit: true, accent: 0.5 }, { hit: true, accent: 0.3 },
      { hit: true, accent: 0.8 }, { hit: true, accent: 0.3 },
      { hit: true, accent: 0.5 }, { hit: true, accent: 0.3 },
    ], length: 8 },
  ],
  disco: [
    // Disco groove: off-beat hi-hat emphasis
    { pattern: [
      { hit: true, accent: 0.9 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.7 }, { hit: true, accent: 0.5 },
      { hit: true, accent: 0.3 }, { hit: true, accent: 0.8 },
      { hit: true, accent: 0.5 }, { hit: true, accent: 0.4 },
    ], length: 8 },
  ],
  lofi: [
    // Lazy swing: sparse with emphasis on 2 and 4
    { pattern: [
      { hit: true, accent: 0.7 }, { hit: false, accent: 0 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.4 },
      { hit: true, accent: 0.9 }, { hit: false, accent: 0 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.5 },
    ], length: 8 },
  ],
  blockhead: [
    // Hip-hop boom-bap
    { pattern: [
      { hit: true, accent: 1.0 }, { hit: false, accent: 0 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.5 },
      { hit: true, accent: 0.8 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.4 }, { hit: false, accent: 0 },
    ], length: 8 },
  ],
  downtempo: [
    // Slow groove: dotted feel
    { pattern: [
      { hit: true, accent: 0.9 }, { hit: false, accent: 0 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.5 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.7 },
      { hit: false, accent: 0 }, { hit: false, accent: 0 },
    ], length: 8 },
  ],
  avril: [
    // Singer-songwriter: gentle pulse
    { pattern: [
      { hit: true, accent: 0.8 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.4 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.6 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.3 }, { hit: false, accent: 0 },
    ], length: 8 },
  ],
  xtal: [
    // Dreamy: sparse, unpredictable
    { pattern: [
      { hit: true, accent: 0.7 }, { hit: false, accent: 0 },
      { hit: false, accent: 0 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.5 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.3 }, { hit: false, accent: 0 },
    ], length: 8 },
  ],
  flim: [
    // Organic: breathing rhythm
    { pattern: [
      { hit: true, accent: 0.6 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.4 }, { hit: false, accent: 0 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.5 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.3 },
    ], length: 8 },
  ],
  syro: [
    // IDM: irregular, displaced
    { pattern: [
      { hit: true, accent: 0.8 }, { hit: true, accent: 0.3 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.6 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.4 },
      { hit: true, accent: 0.7 }, { hit: false, accent: 0 },
    ], length: 8 },
    // Fractured groove
    { pattern: [
      { hit: false, accent: 0 }, { hit: true, accent: 0.6 },
      { hit: true, accent: 0.4 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.8 }, { hit: false, accent: 0 },
      { hit: false, accent: 0 }, { hit: true, accent: 0.7 },
    ], length: 8 },
  ],
  ambient: [
    // Floating: minimal hits
    { pattern: [
      { hit: true, accent: 0.5 }, { hit: false, accent: 0 },
      { hit: false, accent: 0 }, { hit: false, accent: 0 },
      { hit: false, accent: 0 }, { hit: false, accent: 0 },
      { hit: true, accent: 0.3 }, { hit: false, accent: 0 },
    ], length: 8 },
  ],
};

/**
 * Per-mood tendency to apply rhythmic DNA.
 */
const DNA_TENDENCY: Record<Mood, number> = {
  trance:    0.45,
  disco:     0.40,
  blockhead: 0.38,
  lofi:      0.30,
  downtempo: 0.25,
  avril:     0.22,
  flim:      0.18,
  xtal:      0.12,
  syro:      0.15,
  ambient:   0.08,
};

/**
 * Select a rhythmic DNA cell for the current mood.
 */
export function selectDNACell(mood: Mood, tick: number): RhythmicCell {
  const cells = RHYTHMIC_DNA[mood];
  const hash = ((tick * 2654435761 + 59029) >>> 0) / 4294967296;
  const idx = Math.floor(hash * cells.length);
  return cells[idx];
}

/**
 * Generate an accent mask from a rhythmic DNA cell, scaled to target length.
 * Returns gain multipliers (0-boost range).
 *
 * @param cell      Rhythmic cell
 * @param length    Target pattern length (8 or 16)
 * @param intensity How strongly to apply the DNA (0-1)
 * @returns Array of gain multipliers
 */
export function dnaAccentMask(
  cell: RhythmicCell,
  length: number,
  intensity: number
): number[] {
  const mask = new Array(length).fill(1.0);
  const boost = 1.0 + intensity * 0.25;
  const suppress = 1.0 - intensity * 0.15;

  for (let i = 0; i < length; i++) {
    const cellIdx = i % cell.length;
    const entry = cell.pattern[cellIdx];
    if (entry.hit) {
      mask[i] = suppress + (boost - suppress) * entry.accent;
    } else {
      mask[i] = suppress;
    }
  }

  return mask;
}

/**
 * Generate a hit mask from a rhythmic DNA cell.
 * Returns boolean array: true = place note, false = rest.
 */
export function dnaHitMask(cell: RhythmicCell, length: number): boolean[] {
  const mask: boolean[] = [];
  for (let i = 0; i < length; i++) {
    mask.push(cell.pattern[i % cell.length].hit);
  }
  return mask;
}

/**
 * Should rhythmic DNA be applied at this tick?
 */
export function shouldApplyDNA(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const sectionMult: Record<Section, number> = {
    intro: 0.6,
    build: 1.0,
    peak: 1.2,
    breakdown: 0.5,
    groove: 1.3,
  };
  const tendency = DNA_TENDENCY[mood] * sectionMult[section];
  const hash = ((tick * 1597334677 + 31013) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get DNA tendency for a mood (for testing).
 */
export function dnaTendency(mood: Mood): number {
  return DNA_TENDENCY[mood];
}
