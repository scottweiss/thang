/**
 * Spectral centroid tracking — monitor overall brightness balance.
 *
 * The spectral centroid is the "center of mass" of the frequency
 * spectrum. When it's too high, the mix sounds thin/harsh. When
 * too low, it sounds muddy/dark. This module tracks the
 * approximate centroid from LPF/HPF values across layers and
 * suggests corrections.
 *
 * Applied in rebuildAll() to auto-correct brightness imbalances.
 */

import type { Mood, Section } from '../types';

/**
 * Target centroid per mood (arbitrary units, ~Hz-like).
 * Higher = brighter overall mix.
 */
const TARGET_CENTROID: Record<Mood, number> = {
  trance:    2800,   // bright, energetic
  avril:     2200,   // warm but clear
  disco:     2600,   // bright, present
  downtempo: 2000,   // warm
  blockhead: 2400,   // moderate-bright
  lofi:      1800,   // warm, jazz
  flim:      2100,   // organic warmth
  xtal:      2500,   // crystalline
  syro:      2700,   // detailed, present
  ambient:   1600,   // dark, warm,
  plantasia: 1600,
};

/**
 * Section offsets to centroid target.
 */
const SECTION_OFFSET: Record<Section, number> = {
  intro:     -200,   // darker
  build:     0,
  peak:      300,    // brighter
  breakdown: -300,   // darker
  groove:    100,    // slightly bright
};

/**
 * Estimate spectral centroid from LPF cutoff values across layers.
 * Uses LPF as a proxy for brightness (higher cutoff = brighter).
 *
 * @param lpfValues LPF cutoff frequencies from active layers
 * @returns Estimated centroid
 */
export function estimateCentroid(lpfValues: number[]): number {
  if (lpfValues.length === 0) return 2000;
  const sum = lpfValues.reduce((a, b) => a + b, 0);
  return sum / lpfValues.length;
}

/**
 * Calculate how far the current centroid is from the target.
 * Positive = too bright, negative = too dark.
 *
 * @param currentCentroid Estimated current centroid
 * @param mood Current mood
 * @param section Current section
 * @returns Deviation (positive = too bright)
 */
export function centroidDeviation(
  currentCentroid: number,
  mood: Mood,
  section: Section
): number {
  const target = TARGET_CENTROID[mood] + SECTION_OFFSET[section];
  return currentCentroid - target;
}

/**
 * LPF correction multiplier to bring centroid closer to target.
 * Apply to all layer LPF values.
 *
 * @param deviation Current centroid deviation
 * @param mood Current mood
 * @returns LPF multiplier (< 1 = darken, > 1 = brighten)
 */
export function lpfCorrectionMultiplier(
  deviation: number,
  mood: Mood
): number {
  // Gentle correction — don't overcorrect
  const sensitivity = 0.0003; // per-Hz correction strength
  const correction = 1.0 - deviation * sensitivity;
  return Math.max(0.75, Math.min(1.25, correction));
}

/**
 * Should spectral correction be applied?
 * Only correct when deviation exceeds a threshold.
 *
 * @param deviation Centroid deviation
 * @param mood Current mood
 * @returns Whether to correct
 */
export function shouldCorrectCentroid(deviation: number, mood: Mood): boolean {
  // More tolerant moods (ambient, xtal) need less correction
  const tolerance: Record<Mood, number> = {
    trance: 300, avril: 350, disco: 300, downtempo: 400,
    blockhead: 350, lofi: 400, flim: 400, xtal: 500,
    syro: 300, ambient: 500, plantasia: 500,
  };
  return Math.abs(deviation) > tolerance[mood];
}

/**
 * Get target centroid for a mood (for testing).
 */
export function targetCentroid(mood: Mood): number {
  return TARGET_CENTROID[mood];
}
