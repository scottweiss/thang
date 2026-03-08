/**
 * Bass weight — low frequency energy management.
 *
 * Bass frequencies need special attention: too much bass = mud,
 * too little = thin. This module manages the gain/filtering of
 * layers in the bass register to ensure solid low-end without
 * frequency buildup. When drone and harmony both have low notes,
 * one should be filtered to prevent bass collision.
 *
 * Applied as HPF/gain corrections to prevent bass buildup.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood bass tolerance (how much bass buildup is acceptable).
 */
const BASS_TOLERANCE: Record<Mood, number> = {
  trance:    0.50,  // heavy bass OK
  avril:     0.35,  // classical balance
  disco:     0.55,  // heavy bass
  downtempo: 0.60,  // maximum bass weight
  blockhead: 0.45,  // moderate
  lofi:      0.40,  // warm but controlled
  flim:      0.35,  // balanced
  xtal:      0.30,  // lighter bass
  syro:      0.45,  // moderate
  ambient:   0.25,  // lightest bass
};

/**
 * Estimate how many layers have significant bass content.
 *
 * @param layerAvgMidis Record of layer name → average MIDI pitch
 * @param threshold MIDI note below which is "bass" (default 48 = C3)
 * @returns Number of bass-heavy layers
 */
export function bassLayerCount(
  layerAvgMidis: Record<string, number>,
  threshold: number = 48
): number {
  return Object.values(layerAvgMidis).filter(midi => midi < threshold).length;
}

/**
 * Calculate HPF correction for bass-heavy layers when too many exist.
 *
 * @param bassCount Number of bass-heavy layers
 * @param mood Current mood
 * @param isMainBass Whether this layer is the primary bass (drone)
 * @returns HPF offset to add (0 = no change, positive = cut more bass)
 */
export function bassHpfCorrection(
  bassCount: number,
  mood: Mood,
  isMainBass: boolean
): number {
  if (bassCount <= 1) return 0;
  if (isMainBass) return 0; // primary bass layer keeps its bass

  const tolerance = BASS_TOLERANCE[mood];
  const excess = bassCount - 1;
  // Each extra bass layer adds HPF proportional to intolerance
  return Math.round(excess * (1.0 - tolerance) * 80);
}

/**
 * Calculate gain reduction for secondary bass layers.
 *
 * @param bassCount Number of bass-heavy layers
 * @param mood Current mood
 * @param isMainBass Whether this is the primary bass
 * @returns Gain multiplier (0.6-1.0)
 */
export function bassGainCorrection(
  bassCount: number,
  mood: Mood,
  isMainBass: boolean
): number {
  if (bassCount <= 1 || isMainBass) return 1.0;

  const tolerance = BASS_TOLERANCE[mood];
  return Math.max(0.6, 1.0 - (1.0 - tolerance) * 0.3 * (bassCount - 1));
}

/**
 * Should bass weight management be applied?
 */
export function shouldApplyBassWeight(mood: Mood): boolean {
  return true; // always apply — bass management is critical
}

/**
 * Get bass tolerance for a mood (for testing).
 */
export function bassTolerance(mood: Mood): number {
  return BASS_TOLERANCE[mood];
}
