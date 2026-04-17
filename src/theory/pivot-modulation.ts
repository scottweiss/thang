/**
 * Pivot chord modulation — smooth key changes via shared chords.
 *
 * When moving between keys, a pivot chord belongs to both keys
 * simultaneously. For example, going from C major to G major:
 *   Am (vi in C, ii in G) → D7 (V in G) → G (I in G)
 *
 * The listener's ear reinterprets the pivot chord mid-phrase,
 * creating a seamless transition rather than an abrupt key change.
 *
 * Common pivot relationships:
 * - I → V: vi becomes ii (most common)
 * - I → IV: ii becomes vi
 * - I → vi: I becomes III
 * - I → bVII: IV becomes I (rock modulation)
 *
 * Application: when the harmonic journey module requests a key change,
 * suggest a pivot chord that smooths the transition.
 */

import type { Mood, Section, NoteName } from '../types';

const NOTE_TO_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

const PC_TO_NOTE: NoteName[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/** Major scale intervals (in semitones) */
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

/** Diatonic chord qualities for major scale degrees */
const MAJOR_QUALITIES: ('maj' | 'min' | 'dim')[] = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];

/** How much each mood uses pivot modulation (0-1) */
const PIVOT_TENDENCY: Record<Mood, number> = {
  lofi:      0.35,  // jazz — key exploration
  avril:     0.30,  // songwriter — expressive modulation
  downtempo: 0.25,  // smooth transitions
  flim:      0.20,  // organic key shifts
  xtal:      0.18,  // dreamy wander
  ambient:   0.15,  // gradual drift,
  plantasia: 0.15,
  syro:      0.12,  // IDM — abrupt is OK
  blockhead: 0.10,  // hip-hop
  disco:     0.08,  // functional harmony
  trance:    0.05,  // minimal modulation
};

/**
 * Find pivot chords shared between two keys.
 * Returns chords (as root + quality) that exist in both keys.
 *
 * @param fromRoot  Current key root
 * @param toRoot    Target key root
 * @returns Array of { root, quality, fromDegree, toDegree }
 */
export function findPivotChords(
  fromRoot: NoteName,
  toRoot: NoteName
): { root: NoteName; quality: 'maj' | 'min' | 'dim'; fromDegree: number; toDegree: number }[] {
  const fromPC = NOTE_TO_PC[fromRoot];
  const toPC = NOTE_TO_PC[toRoot];
  if (fromPC === undefined || toPC === undefined) return [];

  const fromChords = MAJOR_SCALE.map((interval, degree) => ({
    pc: (fromPC + interval) % 12,
    quality: MAJOR_QUALITIES[degree],
    degree,
  }));

  const toChords = MAJOR_SCALE.map((interval, degree) => ({
    pc: (toPC + interval) % 12,
    quality: MAJOR_QUALITIES[degree],
    degree,
  }));

  const pivots: { root: NoteName; quality: 'maj' | 'min' | 'dim'; fromDegree: number; toDegree: number }[] = [];

  for (const fc of fromChords) {
    for (const tc of toChords) {
      if (fc.pc === tc.pc && fc.quality === tc.quality) {
        pivots.push({
          root: PC_TO_NOTE[fc.pc],
          quality: fc.quality,
          fromDegree: fc.degree,
          toDegree: tc.degree,
        });
      }
    }
  }

  return pivots;
}

/**
 * Select the best pivot chord for a modulation.
 * Prefers pivots where the chord is functionally strong in the target key
 * (ii and IV are strongest pivot targets as they set up V→I).
 *
 * @param fromRoot  Current key
 * @param toRoot    Target key
 * @returns Best pivot or null if none found
 */
export function bestPivotChord(
  fromRoot: NoteName,
  toRoot: NoteName
): { root: NoteName; quality: 'maj' | 'min' | 'dim'; fromDegree: number; toDegree: number } | null {
  const pivots = findPivotChords(fromRoot, toRoot);
  if (pivots.length === 0) return null;

  // Score each pivot: prefer ii (1) or IV (3) in target key
  const scored = pivots.map(p => {
    let score = 1.0;
    if (p.toDegree === 1) score += 3.0;  // ii → can set up V
    if (p.toDegree === 3) score += 2.5;  // IV → subdominant setup
    if (p.toDegree === 5) score += 2.0;  // vi → relative minor
    if (p.quality === 'dim') score -= 1.0;  // diminished less stable
    if (p.fromDegree === 0) score -= 0.5;  // don't use tonic as pivot (boring exit)
    return { pivot: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].pivot;
}

/**
 * Whether to use pivot modulation for a key change.
 */
export function shouldUsePivot(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const sectionMult = section === 'build' ? 1.3 : section === 'breakdown' ? 1.5 : 1.0;
  const tendency = PIVOT_TENDENCY[mood] * sectionMult;
  const hash = ((tick * 2654435761 + 9001) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get the number of common chords between two keys.
 * More shared chords = smoother modulation possible.
 */
export function modulationSmoothness(fromRoot: NoteName, toRoot: NoteName): number {
  return findPivotChords(fromRoot, toRoot).length;
}

/**
 * Get pivot modulation tendency for a mood (for testing).
 */
export function pivotTendency(mood: Mood): number {
  return PIVOT_TENDENCY[mood];
}
