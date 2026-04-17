/**
 * Harmonic tension color — tension level colors timbre.
 *
 * Different tension levels should sound different. Low tension
 * should feel warm and open (more reverb, lower LPF, less FM).
 * High tension should feel urgent and bright (less reverb, higher
 * LPF, more FM distortion). This module maps tension to timbral
 * parameters beyond just brightness.
 *
 * Different from tension-brightness (which only affects LPF) and
 * tension-space (which only affects reverb) — this coordinates
 * multiple timbral dimensions at once.
 */

import type { Mood } from '../types';

/**
 * Per-mood tension color sensitivity.
 */
const COLOR_SENSITIVITY: Record<Mood, number> = {
  trance:    0.35,  // moderate color shift
  avril:     0.50,  // dramatic timbral change
  disco:     0.25,  // groove consistency
  downtempo: 0.40,  // noticeable shifts
  blockhead: 0.30,  // moderate
  lofi:      0.45,  // jazz color variety
  flim:      0.42,  // organic shifts
  xtal:      0.30,  // floating variation
  syro:      0.20,  // controlled shifts
  ambient:   0.50,  // maximum timbral color,
  plantasia: 0.50,
};

/**
 * FM depth multiplier based on tension.
 * Low tension = less FM (purer), high tension = more FM (richer/harsher).
 *
 * @param tension Current tension (0-1)
 * @param mood Current mood
 * @returns FM multiplier (0.6-1.5)
 */
export function tensionFmColor(tension: number, mood: Mood): number {
  const sensitivity = COLOR_SENSITIVITY[mood];
  return 1.0 + (tension - 0.5) * sensitivity;
}

/**
 * Decay multiplier based on tension.
 * Low tension = longer decay (sustained), high tension = shorter (urgent).
 *
 * @param tension Current tension (0-1)
 * @param mood Current mood
 * @returns Decay multiplier (0.6-1.4)
 */
export function tensionDecayColor(tension: number, mood: Mood): number {
  const sensitivity = COLOR_SENSITIVITY[mood];
  return 1.0 - (tension - 0.5) * sensitivity * 0.5;
}

/**
 * Pan width multiplier based on tension.
 * Low tension = wide stereo, high tension = narrow focus.
 *
 * @param tension Current tension (0-1)
 * @param mood Current mood
 * @returns Pan width multiplier (0.5-1.2)
 */
export function tensionPanColor(tension: number, mood: Mood): number {
  const sensitivity = COLOR_SENSITIVITY[mood];
  return 1.0 - (tension - 0.5) * sensitivity * 0.4;
}

/**
 * Should tension color be applied?
 */
export function shouldApplyTensionColor(mood: Mood): boolean {
  return COLOR_SENSITIVITY[mood] > 0.15;
}

/**
 * Get color sensitivity for a mood (for testing).
 */
export function colorSensitivity(mood: Mood): number {
  return COLOR_SENSITIVITY[mood];
}
