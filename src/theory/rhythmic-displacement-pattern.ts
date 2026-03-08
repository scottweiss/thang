/**
 * Rhythmic displacement pattern — systematic offset of repeating patterns.
 *
 * Instead of always starting on beat 1, patterns can be displaced by
 * 1/8 or 1/16 note, creating a "shifted groove" feel. Common in
 * Afrobeat, funk, and electronic music where the same riff sounds
 * completely different when offset by one 16th note.
 *
 * Applied as a .late() offset on repeating patterns.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood displacement probability.
 */
const DISPLACEMENT_PROB: Record<Mood, number> = {
  trance:    0.08,  // rare — on-the-grid
  avril:     0.15,  // occasional — rubato feel
  disco:     0.25,  // moderate — funk offbeats
  downtempo: 0.30,  // strong — lazy displacement
  blockhead: 0.40,  // strong — hip-hop displacement
  lofi:      0.35,  // strong — jazz anticipation
  flim:      0.30,  // moderate — Aphex wonk
  xtal:      0.20,  // moderate
  syro:      0.45,  // strongest — IDM grid defiance
  ambient:   0.05,  // minimal — time is dissolved
};

/**
 * Section multiplier on displacement.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,   // less displacement — establishing
  build:     1.0,
  peak:      0.8,   // tighter — locked in
  breakdown: 1.2,   // more displacement — deconstructed
  groove:    1.1,   // moderate — funky
};

/**
 * Available displacement amounts in seconds (at ~120 BPM).
 * These get scaled by actual tempo.
 */
const DISPLACEMENTS = [
  0.0625,  // 1/16 note
  0.125,   // 1/8 note
  0.1875,  // dotted 1/16
];

/**
 * Should a pattern be displaced this tick?
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to displace
 */
export function shouldDisplace(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const prob = DISPLACEMENT_PROB[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 9371) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Get displacement amount in seconds.
 *
 * @param tick Current tick
 * @param mood Current mood
 * @returns Displacement in seconds
 */
export function displacementAmount(tick: number, mood: Mood): number {
  const hash = ((tick * 1597334677 + 4219) >>> 0) / 4294967296;
  const idx = Math.floor(hash * DISPLACEMENTS.length);
  return DISPLACEMENTS[idx];
}

/**
 * Get displacement probability for a mood (for testing).
 */
export function displacementProbability(mood: Mood): number {
  return DISPLACEMENT_PROB[mood];
}
