/**
 * Harmonic envelope shaping — chord sustain character varies by harmonic function.
 *
 * Tonic chords (I, vi) sustain with slow release — they are destinations.
 * Dominant chords (V, vii°) have shorter, tenser sustain — they want to move.
 * Subdominant chords (IV, ii) have moderate sustain — transitional.
 *
 * Applied as a decay multiplier on harmony layer.
 */

import type { Mood } from '../types';

/**
 * Per-mood sensitivity to function-based shaping (0 = flat, 1 = dramatic).
 */
const SHAPING_SENSITIVITY: Record<Mood, number> = {
  trance:    0.25,  // moderate — trance chords are more static
  avril:     0.65,  // strong — classical phrase shaping
  disco:     0.30,  // moderate
  downtempo: 0.50,  // strong — breathing chords
  blockhead: 0.35,  // moderate
  lofi:      0.55,  // strong — jazz comping dynamics
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.20,  // weak — IDM chords are unpredictable
  ambient:   0.60,  // strong — sustained resolution pads,
  plantasia: 0.60,
};

/**
 * Harmonic function categories.
 */
type HarmonicFunction = 'tonic' | 'subdominant' | 'dominant';

/**
 * Map scale degree (1-7) to harmonic function.
 */
function degreeToFunction(degree: number): HarmonicFunction {
  if (degree === 1 || degree === 3 || degree === 6) return 'tonic';
  if (degree === 2 || degree === 4) return 'subdominant';
  return 'dominant'; // 5, 7
}

/**
 * Base decay multiplier by function (before mood scaling).
 */
const FUNCTION_DECAY: Record<HarmonicFunction, number> = {
  tonic:       1.3,   // long sustain — destination
  subdominant: 1.0,   // neutral
  dominant:    0.75,  // short — wants to resolve
};

/**
 * Calculate decay multiplier for harmony based on chord function.
 *
 * @param degree Scale degree (1-7)
 * @param mood Current mood
 * @returns Decay multiplier (0.75 - 1.3, scaled by mood sensitivity)
 */
export function functionDecayMultiplier(
  degree: number,
  mood: Mood
): number {
  const fn = degreeToFunction(degree);
  const base = FUNCTION_DECAY[fn];
  const sensitivity = SHAPING_SENSITIVITY[mood];
  // Blend toward 1.0 by (1 - sensitivity)
  return 1.0 + (base - 1.0) * sensitivity;
}

/**
 * Get shaping sensitivity for a mood (for testing).
 */
export function shapingSensitivity(mood: Mood): number {
  return SHAPING_SENSITIVITY[mood];
}

/**
 * Get harmonic function for a degree (for testing).
 */
export function getHarmonicFunction(degree: number): HarmonicFunction {
  return degreeToFunction(degree);
}
