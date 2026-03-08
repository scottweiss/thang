/**
 * Rhythmic weight — notes on strong metric positions are louder/longer.
 *
 * Beyond simple metric accent (which just emphasizes beat positions),
 * rhythmic weight gives notes on structurally important beats more
 * "substance" — longer decay, slightly more FM depth, and higher gain.
 * This creates a natural hierarchical feel where downbeats feel
 * grounded and upbeats feel lighter.
 *
 * Applied per-note as multipliers for gain, decay, and FM.
 */

import type { Mood } from '../types';

/**
 * Per-mood weight depth.
 * Higher = more contrast between strong and weak beats.
 */
const WEIGHT_DEPTH: Record<Mood, number> = {
  trance:    0.35,  // strong downbeat emphasis
  avril:     0.40,  // classical weight
  disco:     0.45,  // strong backbeat weight
  downtempo: 0.30,  // moderate
  blockhead: 0.50,  // maximum choppy weight
  lofi:      0.35,  // jazz weight
  flim:      0.25,  // organic, less hierarchical
  xtal:      0.15,  // floating, minimal weight
  syro:      0.20,  // complex accents
  ambient:   0.10,  // barely weighted
};

/**
 * Metric weight for a given beat position.
 * Uses hierarchical metric structure: 1 > 3 > 2,4 > off-beats.
 *
 * @param position Beat position (0-indexed)
 * @param totalBeats Total beats in pattern
 * @returns Weight (0-1, higher = stronger position)
 */
export function metricWeight(position: number, totalBeats: number): number {
  if (totalBeats <= 0) return 0.5;

  // Downbeat
  if (position === 0) return 1.0;
  // Half-way (beat 3 in 4/4, beat 2 in 2/4)
  if (position === Math.floor(totalBeats / 2)) return 0.75;
  // Quarter points
  if (totalBeats >= 4 && position % (Math.floor(totalBeats / 4)) === 0) return 0.5;
  // Everything else
  return 0.25;
}

/**
 * Calculate gain multiplier for a note based on metric position.
 *
 * @param position Beat position
 * @param totalBeats Total beats
 * @param mood Current mood
 * @returns Gain multiplier (0.8-1.2)
 */
export function weightGainMultiplier(
  position: number,
  totalBeats: number,
  mood: Mood
): number {
  const depth = WEIGHT_DEPTH[mood];
  const weight = metricWeight(position, totalBeats);
  return 1.0 + (weight - 0.5) * depth * 0.4;
}

/**
 * Calculate decay multiplier for a note based on metric position.
 * Strong beats get longer decay.
 *
 * @param position Beat position
 * @param totalBeats Total beats
 * @param mood Current mood
 * @returns Decay multiplier (0.85-1.15)
 */
export function weightDecayMultiplier(
  position: number,
  totalBeats: number,
  mood: Mood
): number {
  const depth = WEIGHT_DEPTH[mood];
  const weight = metricWeight(position, totalBeats);
  return 1.0 + (weight - 0.5) * depth * 0.2;
}

/**
 * Should rhythmic weight be applied?
 */
export function shouldApplyRhythmicWeight(mood: Mood): boolean {
  return WEIGHT_DEPTH[mood] > 0.12;
}

/**
 * Get weight depth for a mood (for testing).
 */
export function weightDepth(mood: Mood): number {
  return WEIGHT_DEPTH[mood];
}
