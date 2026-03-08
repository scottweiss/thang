/**
 * Rhythmic gravity — metric weight distribution that creates natural
 * sense of meter in generative patterns.
 *
 * In music, not all beats are equal. Beat 1 is the "gravitational center"
 * of the bar, beat 3 has secondary weight, and beats 2 & 4 are lighter
 * (in 4/4 time). Within each beat, the downbeat is heavier than
 * subdivisions.
 *
 * This hierarchical weight system creates the "groove" that makes
 * music feel grounded rather than randomly scattered.
 *
 * Different moods interpret metric gravity differently:
 * - Trance: very strong downbeat gravity (4-on-the-floor)
 * - Jazz (lofi): weak gravity (anything can be heavy)
 * - Disco: shifted gravity (backbeat emphasis)
 * - Ambient: almost no gravity (floating, timeless)
 *
 * This module provides gravity weights for any step position,
 * which can be used to:
 * - Place notes preferentially on strong beats
 * - Weight velocity/gain toward metrically important positions
 * - Decide where rests are most natural (weak beats)
 */

import type { Mood } from '../types';

/**
 * Metric hierarchy for 16-step grid (4/4 time, 16th notes).
 * Values represent relative gravity (1.0 = strongest beat).
 *
 * Position mapping:
 * 0=1.1, 1=1e, 2=1&, 3=1a, 4=2.1, 5=2e, 6=2&, 7=2a,
 * 8=3.1, 9=3e, 10=3&, 11=3a, 12=4.1, 13=4e, 14=4&, 15=4a
 */
const METRIC_WEIGHT_16: number[] = [
  1.00, 0.20, 0.50, 0.15,  // beat 1 (strongest)
  0.60, 0.15, 0.40, 0.10,  // beat 2
  0.80, 0.20, 0.50, 0.15,  // beat 3 (secondary strong)
  0.60, 0.15, 0.40, 0.10,  // beat 4
];

/** How strongly each mood follows metric gravity (0 = ignore, 1 = strict) */
const GRAVITY_STRENGTH: Record<Mood, number> = {
  trance:    0.70,   // very strong meter
  disco:     0.55,   // clear groove
  blockhead: 0.50,   // hip-hop pocket
  downtempo: 0.40,   // laid back but grounded
  lofi:      0.30,   // jazz looseness
  avril:     0.35,   // singer-songwriter feel
  flim:      0.25,   // delicate meter
  syro:      0.15,   // intentionally off-grid
  xtal:      0.15,   // dreamy floating
  ambient:   0.05,   // nearly timeless
};

/** Mood-specific gravity modifications */
const GRAVITY_SHIFT: Record<Mood, Record<number, number>> = {
  // Disco/funk shifts weight to backbeats (2 and 4)
  disco:     { 4: 0.90, 12: 0.90, 0: 0.70, 8: 0.65 },
  // Trance emphasizes the four-on-the-floor
  trance:    { 0: 1.0, 4: 0.95, 8: 0.95, 12: 0.95 },
  // Lofi/jazz: emphasize upbeats and syncopations
  lofi:      { 2: 0.55, 6: 0.50, 10: 0.55, 14: 0.50 },
  // Blockhead: heavy on 1 and 3, ghost on everything else
  blockhead: { 0: 1.0, 8: 0.85, 6: 0.45, 14: 0.45 },
  // Others use default hierarchy
  ambient:   {},
  downtempo: {},
  avril:     {},
  xtal:      {},
  syro:      {},
  flim:      {},
};

/**
 * Get the metric gravity weight for a step position.
 *
 * @param step       Step index (0-based, wraps to 16-step grid)
 * @param mood       Current mood
 * @param stepCount  Total steps in pattern (for wrapping, default 16)
 * @returns Gravity weight 0-1 (1 = strongest beat)
 */
export function metricGravity(
  step: number,
  mood: Mood,
  stepCount: number = 16
): number {
  // Map step to 16-step grid position
  const pos = Math.floor((step / stepCount) * 16) % 16;

  // Get base metric weight
  let weight = METRIC_WEIGHT_16[pos];

  // Apply mood-specific shifts
  const shifts = GRAVITY_SHIFT[mood];
  if (shifts[pos] !== undefined) {
    weight = shifts[pos];
  }

  return weight;
}

/**
 * Generate a gravity-weighted note placement probability array.
 * Higher values = more likely to place a note at that position.
 *
 * @param stepCount  Number of steps in the pattern
 * @param mood       Current mood
 * @param density    Overall density 0-1 (scales all probabilities)
 * @returns Array of placement probabilities (0-1)
 */
export function gravityPlacementWeights(
  stepCount: number,
  mood: Mood,
  density: number = 0.5
): number[] {
  const strength = GRAVITY_STRENGTH[mood];
  const weights: number[] = [];

  for (let i = 0; i < stepCount; i++) {
    const gravity = metricGravity(i, mood, stepCount);
    // Blend between uniform and gravity-weighted based on mood strength
    const uniform = density;
    const weighted = gravity * density;
    weights.push(uniform * (1 - strength) + weighted * strength);
  }

  return weights;
}

/**
 * Generate a gravity-weighted velocity array for a pattern.
 * Metrically strong positions get louder, weak positions softer.
 *
 * @param stepCount  Number of steps
 * @param mood       Current mood
 * @param baseVel    Base velocity (0-1)
 * @returns Array of velocity values
 */
export function gravityVelocityPattern(
  stepCount: number,
  mood: Mood,
  baseVel: number = 0.7
): number[] {
  const strength = GRAVITY_STRENGTH[mood];
  const velocities: number[] = [];

  for (let i = 0; i < stepCount; i++) {
    const gravity = metricGravity(i, mood, stepCount);
    // Velocity ranges from base*0.7 to base*1.1 based on gravity
    const range = 0.4 * strength; // how much velocity varies
    const vel = baseVel * (1.0 - range / 2 + gravity * range);
    velocities.push(Math.max(0.1, Math.min(1.0, vel)));
  }

  return velocities;
}

/**
 * Whether a step position is metrically "strong" for the mood.
 */
export function isStrongBeat(
  step: number,
  mood: Mood,
  stepCount: number = 16
): boolean {
  return metricGravity(step, mood, stepCount) >= 0.5;
}

/**
 * Get gravity strength for a mood (for testing).
 */
export function rhythmicGravityStrength(mood: Mood): number {
  return GRAVITY_STRENGTH[mood];
}
