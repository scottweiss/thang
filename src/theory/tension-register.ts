/**
 * Tension-responsive register — voicing height tracks real-time tension.
 *
 * In orchestral writing, high tension moments use the upper registers
 * (violins in their high range, trumpets soaring) while calm moments
 * settle into warmer mid-low registers (cellos, clarinets).
 *
 * This module shifts the octave of chord voicings and melody notes
 * based on tension. The effect is subtle (±1 octave at extremes)
 * but creates a natural brightness/warmth response.
 *
 * Different layers respond differently:
 * - Harmony: shifts voicing octave (most effect)
 * - Melody: adjusts starting register (moderate effect)
 * - Arp: shifts pattern range (subtle effect)
 * - Drone: mostly stays put (anchoring low end)
 */

import type { Mood } from '../types';

/** Per-mood sensitivity to tension-driven register shift */
const REGISTER_SENSITIVITY: Record<Mood, number> = {
  trance:    0.50,   // dramatic register shifts
  disco:     0.40,   // funky brightness response
  syro:      0.35,   // IDM register play
  blockhead: 0.30,   // hip-hop some shift
  downtempo: 0.25,   // smooth gentle shift
  lofi:      0.25,   // jazz moderate
  flim:      0.20,   // delicate subtle
  avril:     0.20,   // intimate gentle
  xtal:      0.15,   // dreamy subtle
  ambient:   0.05,   // barely moves,
  plantasia: 0.05,
};

/** Per-layer register shift amount (how much each layer responds) */
const LAYER_REGISTER_WEIGHT: Record<string, number> = {
  harmony:    1.0,    // most responsive
  melody:     0.7,    // moderate
  arp:        0.5,    // subtle
  drone:      0.1,    // barely moves (anchor)
  texture:    0.3,    // some shift
  atmosphere: 0.2,    // subtle
};

/**
 * Compute an octave shift based on tension.
 * Positive = shift up (brighter), negative = shift down (warmer).
 *
 * @param tension    Current overall tension (0-1)
 * @param mood       Current mood
 * @param layerName  Layer to compute shift for
 * @returns Octave shift (-1.0 to +1.0, continuous — fractional for interpolation)
 */
export function tensionRegisterShift(
  tension: number,
  mood: Mood,
  layerName: string
): number {
  const sensitivity = REGISTER_SENSITIVITY[mood];
  const layerWeight = LAYER_REGISTER_WEIGHT[layerName] ?? 0.5;
  const t = Math.max(0, Math.min(1, tension));

  // Map tension to register shift:
  // t=0: shift down (warm, -sensitivity * layerWeight)
  // t=0.5: neutral (0)
  // t=1: shift up (bright, +sensitivity * layerWeight)
  return (t - 0.5) * 2 * sensitivity * layerWeight;
}

/**
 * Apply register shift to a set of chord notes.
 * Shifts notes up or down by the appropriate amount.
 *
 * @param notes  Chord notes with octave (e.g., ['C3', 'E3', 'G3'])
 * @param shift  Octave shift amount (rounded to nearest integer for actual transposition)
 * @returns Shifted notes
 */
export function applyRegisterShift(
  notes: string[],
  shift: number
): string[] {
  const intShift = Math.round(shift);
  if (intShift === 0) return notes;

  return notes.map(note => {
    const match = note.match(/^([A-Gb#]+)(\d+)$/);
    if (!match) return note;
    const [, name, octStr] = match;
    const newOct = Math.max(1, Math.min(7, parseInt(octStr) + intShift));
    return `${name}${newOct}`;
  });
}

/**
 * Compute a continuous brightness factor from register shift.
 * Used to modulate filter/FM when the shift is fractional
 * (i.e., not enough for a full octave jump but still audible as timbre).
 *
 * @param shift  Register shift amount
 * @returns Brightness multiplier (0.9-1.1)
 */
export function registerBrightnessFactor(shift: number): number {
  // The fractional part of the shift contributes to brightness
  const fractional = shift - Math.round(shift);
  return 1.0 + fractional * 0.15;
}

/**
 * Whether tension register should be applied.
 */
export function shouldApplyTensionRegister(mood: Mood): boolean {
  return REGISTER_SENSITIVITY[mood] >= 0.1;
}

/**
 * Get register sensitivity for a mood (for testing).
 */
export function tensionRegisterSensitivity(mood: Mood): number {
  return REGISTER_SENSITIVITY[mood];
}
