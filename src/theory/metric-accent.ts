/**
 * Metric accent profiles — mood-specific beat emphasis patterns.
 *
 * Different musical styles have fundamentally different rhythmic feels
 * based on which beats are emphasized:
 *
 * - **Disco/funk**: backbeat (2 & 4) emphasis — the "groove"
 * - **Trance/EDM**: downbeat (1) heavy, steady pulse
 * - **Ambient**: no strong accents — floating, weightless
 * - **Jazz/lofi**: offbeat emphasis — syncopated, swinging
 * - **Blockhead/hip-hop**: 1 & 3 with ghost notes on off-beats
 * - **Syro/IDM**: irregular accents — shifting, unpredictable
 *
 * These patterns provide gain multipliers for each beat position in
 * a cycle, which can be applied as a gain pattern or combined with
 * velocity evolution.
 */

import type { Mood } from '../types';

/**
 * Accent pattern for N subdivisions of a bar.
 * Values are gain multipliers (0.7 = soft, 1.0 = neutral, 1.2 = accented).
 */
export interface AccentProfile {
  /** Per-beat gain multipliers (length = subdivisions per bar) */
  weights: number[];
  /** How strongly the accent pattern applies (0 = ignore, 1 = fully apply) */
  strength: number;
}

/**
 * Generate a metric accent profile for a mood.
 * Returns accent weights for 8 subdivisions (eighth notes in 4/4).
 *
 * @param mood Current mood
 * @returns AccentProfile with 8 weights
 */
export function moodAccentProfile(mood: Mood): AccentProfile {
  switch (mood) {
    case 'disco':
      // Backbeat groove: 2 & 4 emphasized, upbeats ghost
      return {
        weights: [0.95, 0.75, 1.15, 0.8, 0.95, 0.75, 1.15, 0.85],
        strength: 0.7,
      };

    case 'trance':
      // Four-on-the-floor: every beat strong, downbeat strongest
      return {
        weights: [1.2, 0.7, 1.05, 0.7, 1.1, 0.7, 1.05, 0.75],
        strength: 0.8,
      };

    case 'ambient':
      // Nearly flat — no strong metric pulse
      return {
        weights: [1.02, 0.98, 1.0, 0.98, 1.01, 0.99, 1.0, 0.98],
        strength: 0.2,
      };

    case 'downtempo':
      // Gentle pulse: 1 & 3 with soft backbeats
      return {
        weights: [1.1, 0.85, 1.0, 0.85, 1.05, 0.85, 0.95, 0.9],
        strength: 0.5,
      };

    case 'lofi':
      // Lazy swing feel: offbeat emphasis, laid-back
      return {
        weights: [1.0, 0.9, 0.95, 1.05, 0.95, 0.9, 0.95, 1.05],
        strength: 0.4,
      };

    case 'blockhead':
      // Hip-hop boom-bap: 1 hard, 3 hard, ghost notes between
      return {
        weights: [1.2, 0.7, 0.85, 0.7, 1.15, 0.7, 0.85, 0.8],
        strength: 0.7,
      };

    case 'syro':
      // IDM irregular: shifting accents, unpredictable
      return {
        weights: [1.1, 0.8, 0.9, 1.05, 0.75, 1.1, 0.85, 0.95],
        strength: 0.6,
      };

    case 'xtal':
      // Ambient electronic: gentle pulse with slight 1 emphasis
      return {
        weights: [1.05, 0.95, 1.0, 0.95, 1.02, 0.95, 0.98, 0.97],
        strength: 0.3,
      };

    case 'avril':
      // Intimate: very subtle downbeat, mostly even
      return {
        weights: [1.05, 0.97, 1.0, 0.97, 1.02, 0.97, 0.98, 0.98],
        strength: 0.25,
      };

    case 'flim':
      // Delicate: light waltz-like feel adapted to 4/4
      return {
        weights: [1.08, 0.9, 0.95, 1.02, 0.92, 0.95, 0.98, 0.95],
        strength: 0.35,
      };
  }
}

/**
 * Apply accent profile to an array of gain values.
 * Multiplies each gain by the corresponding accent weight,
 * scaled by the profile strength.
 *
 * @param gains    Array of gain values
 * @param profile  Accent profile to apply
 * @returns Modified gain array
 */
export function applyAccentProfile(
  gains: number[],
  profile: AccentProfile
): number[] {
  if (gains.length === 0) return gains;

  return gains.map((gain, i) => {
    const weightIdx = i % profile.weights.length;
    const weight = profile.weights[weightIdx];

    // Blend between neutral (1.0) and weighted based on strength
    const effective = 1.0 + (weight - 1.0) * profile.strength;

    return gain * effective;
  });
}

/**
 * Generate an accent-shaped gain pattern string for N steps.
 * Useful for generating mood-appropriate `.gain("...")` patterns.
 *
 * @param mood   Current mood
 * @param steps  Number of steps
 * @param baseGain  Base gain level
 * @returns Space-separated gain string
 */
export function accentGainPattern(
  mood: Mood,
  steps: number,
  baseGain: number
): string {
  const profile = moodAccentProfile(mood);
  const gains = new Array(steps).fill(baseGain);
  const accented = applyAccentProfile(gains, profile);
  return accented.map(v => v.toFixed(4)).join(' ');
}
