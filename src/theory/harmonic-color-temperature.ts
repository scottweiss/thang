/**
 * Harmonic color temperature — warm/cool tonal quality affects filters.
 *
 * Certain intervals and chord qualities feel "warm" (major 3rds, 6ths)
 * while others feel "cool" (minor, diminished). This module maps
 * harmonic warmth to filter character for timbral coherence.
 *
 * Applied as LPF/resonance adjustment based on harmonic warmth.
 */

import type { Mood } from '../types';

/**
 * Per-mood temperature sensitivity (higher = more filter response).
 */
const TEMPERATURE_SENSITIVITY: Record<Mood, number> = {
  trance:    0.30,  // moderate
  avril:     0.50,  // strong — orchestral color
  disco:     0.25,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.55,  // strongest — warm/cool contrast
  flim:      0.45,  // strong
  xtal:      0.50,  // strong — crystalline temperature
  syro:      0.20,  // weak — electronic neutrality
  ambient:   0.60,  // strongest — color is everything
};

/**
 * Chord quality warmth ratings.
 */
const QUALITY_WARMTH: Record<string, number> = {
  maj:   0.7,   // warm
  min:   0.3,   // cool
  maj7:  0.8,   // very warm
  min7:  0.4,   // cool-warm
  dom7:  0.6,   // neutral-warm
  sus2:  0.5,   // neutral
  sus4:  0.5,   // neutral
  dim:   0.1,   // very cool
  aug:   0.2,   // cool-tense
  add9:  0.75,  // warm-bright
  min9:  0.45,  // cool-warm
};

/**
 * Calculate harmonic color temperature.
 *
 * @param quality Chord quality string
 * @returns Temperature (0.0 = coldest, 1.0 = warmest)
 */
export function harmonicTemperature(quality: string): number {
  return QUALITY_WARMTH[quality] ?? 0.5;
}

/**
 * Calculate LPF multiplier from harmonic temperature.
 * Warm = slightly higher LPF (brighter). Cool = slightly lower (darker).
 *
 * @param quality Chord quality
 * @param mood Current mood
 * @returns LPF multiplier (0.85 - 1.15)
 */
export function temperatureLpf(quality: string, mood: Mood): number {
  const sensitivity = TEMPERATURE_SENSITIVITY[mood];
  const warmth = harmonicTemperature(quality);
  // Warm chords get brighter, cool chords get darker
  const deviation = (warmth - 0.5) * sensitivity * 0.3;
  return Math.max(0.85, Math.min(1.15, 1.0 + deviation));
}

/**
 * Calculate FM depth multiplier from temperature.
 * Cool chords get more FM for richer harmonics, warm stay pure.
 *
 * @param quality Chord quality
 * @param mood Current mood
 * @returns FM multiplier (0.8 - 1.3)
 */
export function temperatureFm(quality: string, mood: Mood): number {
  const sensitivity = TEMPERATURE_SENSITIVITY[mood];
  const warmth = harmonicTemperature(quality);
  // Cool = more FM, warm = less FM
  const deviation = (0.5 - warmth) * sensitivity * 0.5;
  return Math.max(0.8, Math.min(1.3, 1.0 + deviation));
}

/**
 * Get temperature sensitivity for a mood (for testing).
 */
export function temperatureSensitivity(mood: Mood): number {
  return TEMPERATURE_SENSITIVITY[mood];
}
