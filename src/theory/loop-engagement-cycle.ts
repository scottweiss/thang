/**
 * Loop-engagement cycle — rhythmic entrainment and habituation.
 *
 * Tracks how deeply the listener is entrained to a repeating pattern.
 * High entrainment = pattern is locked in; intervention needed to
 * maintain interest. Breaking the pattern drops entrainment; resuming
 * creates anticipatory re-engagement.
 *
 * Applied as a pattern-break trigger and re-entry gain boost.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood entrainment buildup rate (higher = faster habituation).
 */
const ENTRAINMENT_RATE: Record<Mood, number> = {
  trance:    0.08,  // slow — repetition IS the point
  avril:     0.20,  // moderate
  disco:     0.10,  // slow — groove holds
  downtempo: 0.15,  // moderate
  blockhead: 0.25,  // fast — needs frequent variation
  lofi:      0.18,  // moderate
  flim:      0.22,  // fast — organic surprise
  xtal:      0.12,  // slow — ambient patience
  syro:      0.30,  // fastest — IDM demands change
  ambient:   0.05,  // slowest — repetition is meditative
};

/**
 * Per-mood plateau threshold (entrainment level that triggers intervention).
 */
const PLATEAU_THRESHOLD: Record<Mood, number> = {
  trance:    0.85,  // high — let it ride
  avril:     0.70,  // moderate
  disco:     0.80,  // high
  downtempo: 0.72,  // moderate
  blockhead: 0.65,  // lower — break sooner
  lofi:      0.70,  // moderate
  flim:      0.68,  // moderate
  xtal:      0.75,  // moderate-high
  syro:      0.60,  // lowest — break early
  ambient:   0.90,  // highest — rarely break
};

/**
 * Section multiplier on entrainment rate.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.5,   // slow buildup
  build:     0.8,
  peak:      1.0,   // fastest habituation at peak energy
  breakdown: 0.4,   // slow — pattern already sparse
  groove:    0.9,
};

/**
 * Update entrainment level based on loop repetitions.
 *
 * @param current Current entrainment 0-1
 * @param loopRepetitions How many consecutive similar patterns
 * @param mood Current mood
 * @param section Current section
 * @returns Updated entrainment level 0-1
 */
export function updateEntrainment(
  current: number,
  loopRepetitions: number,
  mood: Mood,
  section: Section
): number {
  const rate = ENTRAINMENT_RATE[mood] * SECTION_MULT[section];
  const growth = rate * Math.log2(1 + loopRepetitions) * 0.3;
  return Math.min(1, current + growth);
}

/**
 * Should the current pattern be broken/varied?
 *
 * @param entrainment Current entrainment level 0-1
 * @param mood Current mood
 * @returns Whether to trigger pattern intervention
 */
export function shouldBreakPattern(
  entrainment: number,
  mood: Mood
): boolean {
  return entrainment >= PLATEAU_THRESHOLD[mood];
}

/**
 * Calculate re-engagement gain boost when a pattern resumes after break.
 *
 * @param ticksSinceBreak How many ticks since the pattern was broken
 * @param mood Current mood
 * @returns Gain multiplier (1.0 - 1.10)
 */
export function reengagementGain(
  ticksSinceBreak: number,
  mood: Mood
): number {
  if (ticksSinceBreak < 1 || ticksSinceBreak > 4) return 1.0;
  const strength = ENTRAINMENT_RATE[mood];
  // Peak boost at tick 1-2 after break, decays
  const boost = strength * 0.3 * Math.exp(-ticksSinceBreak * 0.5);
  return 1.0 + Math.min(0.10, boost);
}

/**
 * Get entrainment rate for a mood (for testing).
 */
export function entrainmentRate(mood: Mood): number {
  return ENTRAINMENT_RATE[mood];
}

/**
 * Get plateau threshold for a mood (for testing).
 */
export function plateauThreshold(mood: Mood): number {
  return PLATEAU_THRESHOLD[mood];
}
