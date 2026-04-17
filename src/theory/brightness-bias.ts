/**
 * Melodic brightness bias — joy-oriented interval direction.
 *
 * Biases melodic motion toward ascending/opening intervals that
 * naturally sound optimistic. Not about which intervals to use
 * (that's interval-character) or gravity toward chord tones
 * (that's melodic-gravity), but about the *direction* of motion.
 *
 * During builds and peaks, melodies trend upward with major 3rds
 * and perfect 4ths. During breakdowns, motion relaxes downward.
 * This creates emotional momentum aligned with section energy.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood brightness bias (tendency toward ascending motion).
 * Higher = stronger upward pull.
 */
const BRIGHTNESS_BIAS: Record<Mood, number> = {
  trance:    0.30,  // moderate upward drive
  avril:     0.55,  // classical brightness
  disco:     0.50,  // uplifting groove
  downtempo: 0.25,  // gentle lift
  blockhead: 0.35,  // moderate
  lofi:      0.40,  // warm optimism
  flim:      0.45,  // delicate brightness
  xtal:      0.30,  // floating, less directed
  syro:      0.15,  // complex, less biased
  ambient:   0.20,  // gentle drift,
  plantasia: 0.20,
};

/**
 * Section multiplier for brightness bias.
 * Builds go up, breakdowns go down.
 */
const SECTION_BRIGHTNESS: Record<Section, number> = {
  intro:     0.6,   // neutral-positive
  build:     1.4,   // strong upward pull
  peak:      1.0,   // sustain brightness
  breakdown: -0.3,  // allow downward motion
  groove:    0.8,   // moderate lift
};

/**
 * Calculate directional bias for the next melodic interval.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Bias value (-1 to 1, positive = ascending, negative = descending)
 */
export function directionBias(mood: Mood, section: Section): number {
  const base = BRIGHTNESS_BIAS[mood];
  const sectionMult = SECTION_BRIGHTNESS[section];
  return Math.max(-0.5, Math.min(0.7, base * sectionMult));
}

/**
 * Apply brightness bias to a MIDI pitch offset.
 * Nudges the interval toward the biased direction.
 *
 * @param currentInterval Proposed interval in semitones (signed)
 * @param bias Directional bias from directionBias()
 * @returns Adjusted interval
 */
export function biasInterval(currentInterval: number, bias: number): number {
  if (Math.abs(bias) < 0.05) return currentInterval;

  // If interval goes against bias direction, reduce it
  if (bias > 0 && currentInterval < 0) {
    // Bias wants up, interval goes down — reduce magnitude
    return Math.round(currentInterval * (1.0 - bias));
  }
  if (bias < 0 && currentInterval > 0) {
    // Bias wants down, interval goes up — reduce magnitude
    return Math.round(currentInterval * (1.0 + bias));
  }

  // Interval already aligns with bias — slight amplification
  return Math.round(currentInterval * (1.0 + Math.abs(bias) * 0.3));
}

/**
 * Should brightness bias be applied?
 */
export function shouldApplyBrightnessBias(mood: Mood, section: Section): boolean {
  return Math.abs(BRIGHTNESS_BIAS[mood] * SECTION_BRIGHTNESS[section]) > 0.08;
}

/**
 * Get brightness bias strength for a mood (for testing).
 */
export function brightnessBiasStrength(mood: Mood): number {
  return BRIGHTNESS_BIAS[mood];
}
