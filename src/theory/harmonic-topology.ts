/**
 * Harmonic topology — perceptual chord distance in multi-dimensional space.
 *
 * Models how "far" two chords are from each other considering:
 * pitch-class proximity, functional distance, and quality similarity.
 * Used to bias chord selection toward smooth progressions (trance)
 * or adventurous leaps (syro/flim).
 *
 * Applied as a distance-weighted bias on chord candidate selection.
 */

import type { Mood, Section } from '../types';
import type { ChordQuality } from '../types';

/**
 * Per-mood preferred distance range (0=same, 1=maximally distant).
 * Lower = prefer close chords, higher = allow distant jumps.
 */
const PREFERRED_DISTANCE: Record<Mood, number> = {
  trance:    0.25,  // close — smooth functional progressions
  avril:     0.35,  // moderate — classical adventure
  disco:     0.30,  // moderate
  downtempo: 0.35,  // moderate
  blockhead: 0.40,  // moderate-far
  lofi:      0.40,  // moderate — jazz exploration
  flim:      0.50,  // far — organic wandering
  xtal:      0.45,  // moderate-far — ambient drift
  syro:      0.60,  // farthest — IDM harmonic adventure
  ambient:   0.35,  // moderate — gentle drift,
  plantasia: 0.35,
};

/**
 * Section multiplier on distance preference.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,   // closer chords for establishing
  build:     0.9,   // moderate
  peak:      1.0,   // full expression
  breakdown: 1.1,   // slightly more exploration
  groove:    0.8,   // stable
};

/**
 * Functional distance between scale degrees (circle-of-fifths based).
 */
const DEGREE_DISTANCE: number[][] = [
  // I    ii   iii  IV    V   vi   vii
  [0.0, 0.4, 0.5, 0.2, 0.2, 0.3, 0.6], // from I
  [0.4, 0.0, 0.4, 0.5, 0.3, 0.5, 0.4], // from ii
  [0.5, 0.4, 0.0, 0.5, 0.5, 0.3, 0.5], // from iii
  [0.2, 0.5, 0.5, 0.0, 0.3, 0.4, 0.5], // from IV
  [0.2, 0.3, 0.5, 0.3, 0.0, 0.4, 0.3], // from V
  [0.3, 0.5, 0.3, 0.4, 0.4, 0.0, 0.5], // from vi
  [0.6, 0.4, 0.5, 0.5, 0.3, 0.5, 0.0], // from vii
];

/**
 * Quality similarity matrix.
 */
const QUALITY_DISTANCE: Record<string, Record<string, number>> = {
  maj:       { maj: 0, min: 0.3, dom7: 0.2, min7: 0.4, dim: 0.7, aug: 0.6, sus2: 0.3, sus4: 0.3, maj7: 0.15, add9: 0.15, min9: 0.5 },
  min:       { maj: 0.3, min: 0, dom7: 0.4, min7: 0.2, dim: 0.4, aug: 0.6, sus2: 0.4, sus4: 0.4, maj7: 0.4, add9: 0.4, min9: 0.15 },
  dom7:      { maj: 0.2, min: 0.4, dom7: 0, min7: 0.3, dim: 0.5, aug: 0.5, sus2: 0.4, sus4: 0.4, maj7: 0.25, add9: 0.3, min9: 0.35 },
  min7:      { maj: 0.4, min: 0.2, dom7: 0.3, min7: 0, dim: 0.4, aug: 0.6, sus2: 0.4, sus4: 0.4, maj7: 0.35, add9: 0.4, min9: 0.15 },
  dim:       { maj: 0.7, min: 0.4, dom7: 0.5, min7: 0.4, dim: 0, aug: 0.8, sus2: 0.6, sus4: 0.6, maj7: 0.6, add9: 0.7, min9: 0.5 },
  aug:       { maj: 0.6, min: 0.6, dom7: 0.5, min7: 0.6, dim: 0.8, aug: 0, sus2: 0.6, sus4: 0.6, maj7: 0.5, add9: 0.6, min9: 0.6 },
};

/**
 * Calculate perceptual distance between two chords.
 *
 * @param fromDegree Source chord degree (0-6)
 * @param toDegree Target chord degree (0-6)
 * @param fromQuality Source chord quality
 * @param toQuality Target chord quality
 * @returns Distance 0-1 (0 = same, 1 = maximally distant)
 */
export function chordDistance(
  fromDegree: number,
  toDegree: number,
  fromQuality: ChordQuality,
  toQuality: ChordQuality
): number {
  const degDist = DEGREE_DISTANCE[fromDegree % 7]?.[toDegree % 7] ?? 0.5;
  const qualDist = QUALITY_DISTANCE[fromQuality]?.[toQuality]
    ?? QUALITY_DISTANCE[toQuality]?.[fromQuality]
    ?? 0.4;

  // Weighted blend: functional distance 60%, quality distance 40%
  return degDist * 0.6 + qualDist * 0.4;
}

/**
 * Calculate distance bias for chord selection.
 * Returns a multiplier that favors chords at the mood's preferred distance.
 *
 * @param distance 0-1 chord distance
 * @param mood Current mood
 * @param section Current section
 * @returns Bias multiplier (0.5 - 1.5, where > 1 = preferred)
 */
export function distanceBias(
  distance: number,
  mood: Mood,
  section: Section
): number {
  const preferred = PREFERRED_DISTANCE[mood] * SECTION_MULT[section];
  // Gaussian-like preference around the preferred distance
  const deviation = Math.abs(distance - preferred);
  return Math.max(0.5, 1.5 - deviation * 2.0);
}

/**
 * Should harmonic topology be applied?
 */
export function shouldApplyTopology(mood: Mood): boolean {
  return PREFERRED_DISTANCE[mood] > 0.15;
}

/**
 * Get preferred distance for a mood (for testing).
 */
export function preferredDistance(mood: Mood): number {
  return PREFERRED_DISTANCE[mood];
}
