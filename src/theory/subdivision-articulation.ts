/**
 * Subdivision articulation — adjust articulation based on rhythmic subdivision level.
 *
 * Faster subdivisions (16ths) need shorter, crisper articulation.
 * Slower subdivisions (quarters, halves) can afford longer, more
 * lyrical articulation. This module maps subdivision level to
 * decay and sustain parameters.
 *
 * Applied as decay multiplier based on note density/subdivision.
 */

import type { Mood } from '../types';

/**
 * Per-mood articulation responsiveness (higher = more subdivision-aware).
 */
const ARTICULATION_RESPONSIVENESS: Record<Mood, number> = {
  trance:    0.45,  // moderate — machine-like
  avril:     0.55,  // high — classical phrasing
  disco:     0.40,  // moderate
  downtempo: 0.50,  // moderate
  blockhead: 0.60,  // highest — choppy
  lofi:      0.45,  // moderate
  flim:      0.55,  // high — precise
  xtal:      0.40,  // moderate
  syro:      0.35,  // moderate
  ambient:   0.25,  // low — everything legato,
  plantasia: 0.25,
};

/**
 * Calculate decay multiplier based on subdivision level.
 *
 * @param subdivisionLevel 1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth
 * @param mood Current mood
 * @returns Decay multiplier (0.5 - 1.5)
 */
export function subdivisionDecay(
  subdivisionLevel: number,
  mood: Mood
): number {
  const responsiveness = ARTICULATION_RESPONSIVENESS[mood];
  const level = Math.max(1, Math.min(16, subdivisionLevel));

  // Higher subdivision = shorter decay
  const normalized = Math.log2(level) / 4; // 0-1 range
  const deviation = (0.5 - normalized) * responsiveness * 1.5;

  return Math.max(0.5, Math.min(1.5, 1.0 + deviation));
}

/**
 * Sustain multiplier based on subdivision.
 *
 * @param subdivisionLevel Note subdivision level
 * @param mood Current mood
 * @returns Sustain multiplier (0.3 - 1.2)
 */
export function subdivisionSustain(
  subdivisionLevel: number,
  mood: Mood
): number {
  const responsiveness = ARTICULATION_RESPONSIVENESS[mood];
  const level = Math.max(1, Math.min(16, subdivisionLevel));

  // Fast notes = less sustain
  const normalized = Math.log2(level) / 4;
  const deviation = (0.5 - normalized) * responsiveness * 1.0;

  return Math.max(0.3, Math.min(1.2, 0.8 + deviation));
}

/**
 * Get articulation responsiveness for a mood (for testing).
 */
export function articulationResponsiveness(mood: Mood): number {
  return ARTICULATION_RESPONSIVENESS[mood];
}
