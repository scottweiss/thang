/**
 * Modal interchange brightness — borrowed chord color from parallel modes.
 *
 * When a chord is borrowed from a parallel mode (e.g., bVI from minor
 * in a major key), its brightness character should reflect the source
 * mode. Minor-borrowed chords feel darker, lydian-borrowed feel brighter.
 *
 * Applied as LPF/FM adjustment based on borrowed chord origin.
 */

import type { Mood } from '../types';

/**
 * Per-mood interchange sensitivity (higher = more timbral response).
 */
const INTERCHANGE_SENSITIVITY: Record<Mood, number> = {
  trance:    0.30,  // moderate
  avril:     0.55,  // strong — dramatic color shifts
  disco:     0.20,  // weak — consistent brightness
  downtempo: 0.45,  // moderate
  blockhead: 0.25,  // weak
  lofi:      0.50,  // strong — jazz color
  flim:      0.45,  // moderate
  xtal:      0.55,  // strong — crystalline color
  syro:      0.35,  // moderate
  ambient:   0.60,  // strongest — modal color is key,
  plantasia: 0.60,
};

/**
 * Mode brightness ratings (relative to major/ionian).
 */
const MODE_BRIGHTNESS: Record<string, number> = {
  lydian:      1.0,   // brightest
  ionian:      0.7,   // major — bright
  mixolydian:  0.5,   // neutral-bright
  dorian:      0.3,   // neutral-dark
  aeolian:     0.2,   // minor — dark
  phrygian:    0.1,   // very dark
  locrian:     0.0,   // darkest
};

/**
 * Calculate brightness modifier for a borrowed chord.
 *
 * @param sourceMode Mode the chord is borrowed from
 * @param mood Current mood
 * @returns LPF multiplier (0.85 - 1.2)
 */
export function interchangeBrightness(
  sourceMode: string,
  mood: Mood
): number {
  const sensitivity = INTERCHANGE_SENSITIVITY[mood];
  const brightness = MODE_BRIGHTNESS[sourceMode] ?? 0.5;
  // Deviation from neutral (0.5)
  const deviation = (brightness - 0.5) * sensitivity * 0.4;
  return Math.max(0.85, Math.min(1.2, 1.0 + deviation));
}

/**
 * Calculate FM modifier — darker modes get richer harmonics.
 *
 * @param sourceMode Mode the chord is borrowed from
 * @param mood Current mood
 * @returns FM multiplier (0.8 - 1.25)
 */
export function interchangeFm(
  sourceMode: string,
  mood: Mood
): number {
  const sensitivity = INTERCHANGE_SENSITIVITY[mood];
  const brightness = MODE_BRIGHTNESS[sourceMode] ?? 0.5;
  // Darker modes = more FM
  const deviation = (0.5 - brightness) * sensitivity * 0.4;
  return Math.max(0.8, Math.min(1.25, 1.0 + deviation));
}

/**
 * Get interchange sensitivity for a mood (for testing).
 */
export function interchangeSensitivity(mood: Mood): number {
  return INTERCHANGE_SENSITIVITY[mood];
}
