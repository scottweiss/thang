/**
 * Dynamic range management — ensure audibility across all sections.
 *
 * Prevents the loudest moments from clipping and the quietest
 * from disappearing. Acts as a soft limiter on the combined
 * gain of all layers, with per-mood dynamic range targets.
 *
 * Different from headroom.ts (which just scales by layer count).
 * This module considers the actual gain values and section context.
 */

import type { Mood, Section } from '../types';

/**
 * Target dynamic range per mood (dB-like, 0-1 scale).
 * Higher = more dynamic range (bigger difference between loud/quiet).
 */
const DYNAMIC_RANGE: Record<Mood, number> = {
  trance:    0.35,  // compressed, pumping
  avril:     0.55,  // piano dynamics
  disco:     0.40,  // moderate compression
  downtempo: 0.50,  // moderate range
  blockhead: 0.45,  // moderate
  lofi:      0.60,  // wide dynamics, jazz
  flim:      0.55,  // organic
  xtal:      0.65,  // wide, crystalline
  syro:      0.50,  // moderate
  ambient:   0.70,  // maximum dynamic range
};

/**
 * Section floor — minimum gain level to maintain audibility.
 */
const SECTION_FLOOR: Record<Section, number> = {
  intro:     0.15,  // can be very quiet
  build:     0.25,  // building
  peak:      0.40,  // always present
  breakdown: 0.15,  // can drop low
  groove:    0.30,  // cruising
};

/**
 * Section ceiling — maximum gain to prevent harshness.
 */
const SECTION_CEILING: Record<Section, number> = {
  intro:     0.70,  // gentle
  build:     0.85,  // growing
  peak:      1.0,   // full power
  breakdown: 0.75,  // restrained
  groove:    0.90,  // near-full
};

/**
 * Calculate total combined gain from all layer gains.
 *
 * @param gains Array of per-layer gain values
 * @returns Combined gain estimate
 */
export function combinedGain(gains: number[]): number {
  // RMS-like combination (not pure sum, not pure max)
  if (gains.length === 0) return 0;
  const sumSquares = gains.reduce((sum, g) => sum + g * g, 0);
  return Math.sqrt(sumSquares / gains.length) * Math.sqrt(gains.length);
}

/**
 * Calculate a soft-limiting multiplier for the overall mix.
 *
 * @param totalGain Current combined gain
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (< 1.0 = limit, > 1.0 = boost)
 */
export function dynamicRangeMultiplier(
  totalGain: number,
  mood: Mood,
  section: Section
): number {
  const ceiling = SECTION_CEILING[section];
  const floor = SECTION_FLOOR[section];

  if (totalGain > ceiling) {
    // Soft limiting: gentle curve rather than hard clip
    const overshoot = totalGain - ceiling;
    return ceiling / (ceiling + overshoot * 0.5) / totalGain * ceiling;
  }

  if (totalGain < floor && totalGain > 0) {
    // Boost quiet passages toward floor
    const range = DYNAMIC_RANGE[mood];
    const boost = floor / totalGain;
    // Don't boost too aggressively — scale by range preference
    return Math.min(boost, 1.0 + range * 0.5);
  }

  return 1.0;
}

/**
 * Should dynamic range management be applied?
 *
 * @param totalGain Combined gain
 * @param section Current section
 * @returns Whether to apply
 */
export function shouldApplyDynamicRange(
  totalGain: number,
  section: Section
): boolean {
  return totalGain > SECTION_CEILING[section] * 0.9 ||
         totalGain < SECTION_FLOOR[section] * 1.5;
}

/**
 * Get dynamic range for a mood (for testing).
 */
export function moodDynamicRange(mood: Mood): number {
  return DYNAMIC_RANGE[mood];
}
