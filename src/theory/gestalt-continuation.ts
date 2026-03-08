/**
 * Gestalt continuation — trajectory persistence for auditory streaming.
 *
 * Listeners build mental trajectories for musical parameters (pitch direction,
 * density trend, brightness arc). Violating these creates cognitive friction.
 * This module scores proposed values against established trajectories,
 * favoring continuation and penalizing abrupt reversals.
 *
 * Applied as a bias on melodic direction, density changes, and brightness.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood continuation strength (higher = stronger trajectory enforcement).
 */
const CONTINUATION_STRENGTH: Record<Mood, number> = {
  trance:    0.60,  // strong — groove continuity sacred
  avril:     0.50,  // strong — classical phrasing
  disco:     0.55,  // strong — groove
  downtempo: 0.45,  // moderate
  blockhead: 0.40,  // moderate — some breaks OK
  lofi:      0.35,  // moderate — jazz surprise OK
  flim:      0.30,  // moderate-low — organic shifts
  xtal:      0.25,  // low — ambient evolution
  syro:      0.20,  // low — IDM breaks trajectory
  ambient:   0.15,  // minimal — non-directional
};

/**
 * Section multiplier for continuation enforcement.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,
  build:     1.0,   // strongest continuation (don't break momentum)
  peak:      0.8,
  breakdown: 0.5,   // allow more trajectory breaks
  groove:    0.9,
};

/**
 * Calculate trajectory momentum from a history of values.
 * Returns the slope direction and strength.
 *
 * @param history Array of recent values (oldest first, at least 2)
 * @returns Momentum -1 to 1 (negative = descending, positive = ascending)
 */
export function trajectoryMomentum(history: number[]): number {
  if (history.length < 2) return 0;
  // Use last 4 values for stability
  const recent = history.slice(-4);
  let totalSlope = 0;
  for (let i = 1; i < recent.length; i++) {
    totalSlope += recent[i] - recent[i - 1];
  }
  const avgSlope = totalSlope / (recent.length - 1);
  // Normalize to -1..1 range (assume values in 0..1 range)
  return Math.max(-1, Math.min(1, avgSlope * 4));
}

/**
 * Calculate violation cost of proposing a value that breaks trajectory.
 *
 * @param momentum Current trajectory momentum (-1 to 1)
 * @param currentValue Last observed value
 * @param proposedValue Proposed next value
 * @param mood Current mood
 * @param section Current section
 * @returns Violation cost 0-1 (0 = continues trajectory, 1 = maximum violation)
 */
export function violationCost(
  momentum: number,
  currentValue: number,
  proposedValue: number,
  mood: Mood,
  section: Section
): number {
  const strength = CONTINUATION_STRENGTH[mood] * SECTION_MULT[section];

  const proposedDirection = proposedValue - currentValue;
  // Violation = moving opposite to established momentum
  const directionMatch = momentum * proposedDirection;

  if (directionMatch >= 0) return 0; // continuing or neutral

  // Magnitude of violation
  const violationMagnitude = Math.abs(proposedDirection) * Math.abs(momentum);
  return Math.min(1, violationMagnitude * strength * 2);
}

/**
 * Calculate continuation bias for a proposed value.
 * Returns a multiplier favoring values that continue the trajectory.
 *
 * @param momentum Current trajectory momentum (-1 to 1)
 * @param currentValue Last observed value
 * @param proposedValue Proposed next value
 * @param mood Current mood
 * @param section Current section
 * @returns Bias multiplier (0.7 - 1.3)
 */
export function continuationBias(
  momentum: number,
  currentValue: number,
  proposedValue: number,
  mood: Mood,
  section: Section
): number {
  const cost = violationCost(momentum, currentValue, proposedValue, mood, section);
  // Low cost = boost, high cost = reduce
  return 1.3 - cost * 0.6;
}

/**
 * Should gestalt continuation be applied?
 */
export function shouldApplyContinuation(mood: Mood, section: Section): boolean {
  return CONTINUATION_STRENGTH[mood] * SECTION_MULT[section] > 0.10;
}

/**
 * Get continuation strength for a mood (for testing).
 */
export function continuationStrength(mood: Mood): number {
  return CONTINUATION_STRENGTH[mood];
}
