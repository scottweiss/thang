/**
 * Tessitura tracking — adjust gain based on average pitch height.
 *
 * Melodies in extreme registers (very high or very low) need gain
 * compensation. Very high notes can be piercing; very low notes
 * can be muddy. This module tracks the average pitch position
 * and applies Fletcher-Munson-inspired gain correction.
 *
 * Applied as gain correction for register balance.
 */

import type { Mood } from '../types';

/**
 * Per-mood correction strength (higher = more register-aware).
 */
const CORRECTION_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate
  avril:     0.55,  // strong — orchestral balance
  disco:     0.35,  // moderate
  downtempo: 0.45,  // moderate
  blockhead: 0.50,  // strong — needs clarity
  lofi:      0.40,  // moderate
  flim:      0.45,  // moderate
  xtal:      0.50,  // strong — crystalline clarity
  syro:      0.30,  // moderate
  ambient:   0.35,  // moderate — wide register OK
};

/**
 * Ideal center MIDI note for each layer.
 */
const IDEAL_CENTER: Record<string, number> = {
  drone: 40,      // E2 area
  harmony: 55,    // G3 area
  melody: 67,     // G4 area
  arp: 72,        // C5 area
  texture: 60,    // C4 (drums — neutral)
  atmosphere: 48, // C3 area
};

/**
 * Calculate gain correction for register position.
 *
 * @param avgMidi Average MIDI note number of the layer
 * @param layerName Layer identifier
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.10)
 */
export function tessituraGainCorrection(
  avgMidi: number,
  layerName: string,
  mood: Mood
): number {
  const strength = CORRECTION_STRENGTH[mood];
  const ideal = IDEAL_CENTER[layerName] ?? 60;
  const deviation = Math.abs(avgMidi - ideal);

  // More deviation = more correction needed
  const correction = Math.min(deviation / 24, 1.0); // normalize to 0-1
  const adjustment = -correction * strength * 0.25;

  return Math.max(0.85, Math.min(1.10, 1.0 + adjustment));
}

/**
 * Get correction strength for a mood (for testing).
 */
export function correctionStrength(mood: Mood): number {
  return CORRECTION_STRENGTH[mood];
}
