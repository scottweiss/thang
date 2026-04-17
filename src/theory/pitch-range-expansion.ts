/**
 * Pitch range expansion — widen available pitch range as energy builds.
 *
 * Low-energy sections use a narrow register (intimate, focused).
 * High-energy sections expand to use full register (epic, dramatic).
 * This module calculates the available pitch range based on
 * tension and section energy.
 *
 * Applied as octave range constraint for melody/arp generation.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood base range (in octaves, minimum at rest).
 */
const BASE_RANGE: Record<Mood, number> = {
  trance:    1.5,  // moderate start
  avril:     1.0,  // narrow — intimate start
  disco:     1.5,  // moderate
  downtempo: 1.0,  // narrow — focused
  blockhead: 1.5,  // moderate
  lofi:      1.0,  // narrow — cozy
  flim:      1.0,  // narrow
  xtal:      0.8,  // very narrow — delicate
  syro:      2.0,  // wide — already expansive
  ambient:   1.0,  // narrow — spacious within limits,
  plantasia: 1.0,
};

/**
 * Per-mood expansion factor (how much range grows with energy).
 */
const EXPANSION_FACTOR: Record<Mood, number> = {
  trance:    1.5,  // moderate expansion
  avril:     2.0,  // dramatic expansion
  disco:     1.0,  // modest expansion
  downtempo: 1.5,  // moderate
  blockhead: 1.0,  // modest
  lofi:      1.5,  // moderate
  flim:      1.8,  // significant
  xtal:      2.5,  // dramatic — from tiny to vast
  syro:      0.5,  // minimal — already wide
  ambient:   2.0,  // dramatic,
  plantasia: 2.0,
};

/**
 * Calculate available pitch range based on energy level.
 *
 * @param tension Current tension (0-1)
 * @param mood Current mood
 * @returns Available range in octaves (0.8 - 4.0)
 */
export function availablePitchRange(
  tension: number,
  mood: Mood
): number {
  const base = BASE_RANGE[mood];
  const expansion = EXPANSION_FACTOR[mood];
  const t = Math.max(0, Math.min(1, tension));
  const range = base + t * expansion;
  return Math.max(0.8, Math.min(4.0, range));
}

/**
 * Gain correction for notes near the edge of available range.
 * Notes at extremes get slightly reduced gain for a natural feel.
 *
 * @param notePosition Position within range (0 = lowest, 1 = highest)
 * @param tension Current tension
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.0)
 */
export function rangeEdgeGain(
  notePosition: number,
  tension: number,
  mood: Mood
): number {
  const pos = Math.max(0, Math.min(1, notePosition));
  const edgeDistance = Math.min(pos, 1 - pos); // 0 at edges, 0.5 at center
  const reduction = (1 - edgeDistance * 2) * 0.15; // max 15% at edges
  return Math.max(0.85, 1.0 - reduction);
}

/**
 * Get base range for a mood (for testing).
 */
export function baseRange(mood: Mood): number {
  return BASE_RANGE[mood];
}
