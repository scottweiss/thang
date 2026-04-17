/**
 * Sustain pedal simulation — harmonic richness through overlapping notes.
 *
 * Piano sustain pedal lets notes ring through chord changes, creating
 * harmonic wash. This module simulates that effect by extending decay
 * and adding reverb at appropriate moments — specifically when chord
 * tones share common notes with the next chord.
 *
 * Applied as decay/reverb multiplier for harmony layers.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood pedal depth (higher = more sustain bleed).
 */
const PEDAL_DEPTH: Record<Mood, number> = {
  trance:    0.30,  // moderate — pads already sustained
  avril:     0.55,  // high — piano pedaling
  disco:     0.20,  // low — tight groove
  downtempo: 0.50,  // high — spacious
  blockhead: 0.15,  // low — dry
  lofi:      0.60,  // highest — Rhodes pedal
  flim:      0.45,  // moderate
  xtal:      0.50,  // high — crystalline sustain
  syro:      0.25,  // low
  ambient:   0.65,  // highest — wash,
  plantasia: 0.65,
};

/**
 * Calculate sustain extension based on common tones between chords.
 *
 * @param currentPcs Current chord pitch classes
 * @param nextPcs Next chord pitch classes (or current if unknown)
 * @param mood Current mood
 * @returns Decay multiplier (1.0 - 1.8)
 */
export function pedalDecayMultiplier(
  currentPcs: number[],
  nextPcs: number[],
  mood: Mood
): number {
  const depth = PEDAL_DEPTH[mood];
  const currentSet = new Set(currentPcs);
  const commonCount = nextPcs.filter(pc => currentSet.has(pc)).length;
  const totalUnique = new Set([...currentPcs, ...nextPcs]).size;

  // More common tones = more pedal sustain
  const commonRatio = totalUnique > 0 ? commonCount / totalUnique : 0;
  const boost = commonRatio * depth * 1.5;

  return Math.max(1.0, Math.min(1.8, 1.0 + boost));
}

/**
 * Reverb addition for pedal effect.
 *
 * @param commonToneCount Number of shared pitch classes
 * @param mood Current mood
 * @returns Room multiplier (1.0 - 1.3)
 */
export function pedalReverbMultiplier(
  commonToneCount: number,
  mood: Mood
): number {
  const depth = PEDAL_DEPTH[mood];
  const boost = Math.min(commonToneCount, 3) / 3 * depth * 0.5;
  return Math.max(1.0, Math.min(1.3, 1.0 + boost));
}

/**
 * Get pedal depth for a mood (for testing).
 */
export function pedalDepth(mood: Mood): number {
  return PEDAL_DEPTH[mood];
}
