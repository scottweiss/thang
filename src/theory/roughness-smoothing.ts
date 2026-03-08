/**
 * Roughness smoothing — critical-band roughness detection.
 *
 * When two simultaneous pitches fall within the same critical band
 * (~1/3 octave), they produce audible "roughness" — beating that
 * sounds grating. This module detects such collisions and applies
 * velocity tapering to smooth them.
 *
 * Applied as gain reduction when roughness exceeds mood threshold.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood roughness tolerance (higher = more roughness OK).
 */
const ROUGHNESS_TOLERANCE: Record<Mood, number> = {
  trance:    0.50,  // high tolerance — dissonance is energy
  avril:     0.20,  // low — classical smoothness
  disco:     0.40,  // moderate
  downtempo: 0.30,  // moderate-low
  blockhead: 0.45,  // moderate
  lofi:      0.25,  // low — smooth jazz
  flim:      0.30,  // moderate
  xtal:      0.35,  // moderate
  syro:      0.55,  // highest — IDM roughness is a feature
  ambient:   0.15,  // lowest — smooth
};

/**
 * Estimate critical bandwidth at a given frequency (Bark scale approximation).
 * Returns bandwidth in Hz.
 */
function criticalBandwidth(freqHz: number): number {
  // Zwicker's approximation
  return 25 + 75 * Math.pow(1 + 1.4 * (freqHz / 1000) ** 2, 0.69);
}

/**
 * MIDI to approximate frequency.
 */
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Calculate roughness between two MIDI pitches.
 * Returns 0-1 (0 = no roughness, 1 = maximum roughness).
 *
 * @param midi1 First MIDI pitch
 * @param midi2 Second MIDI pitch
 * @returns Roughness value (0-1)
 */
export function pairRoughness(midi1: number, midi2: number): number {
  const f1 = midiToFreq(midi1);
  const f2 = midiToFreq(midi2);
  const diff = Math.abs(f1 - f2);
  const avgFreq = (f1 + f2) / 2;
  const cb = criticalBandwidth(avgFreq);

  // Roughness peaks at ~1/4 critical bandwidth
  const ratio = diff / cb;
  if (ratio < 0.01) return 0; // unison — no roughness
  if (ratio > 1.2) return 0;  // beyond critical band

  // Bell curve peaking at ratio ~0.25
  return Math.exp(-0.5 * Math.pow((ratio - 0.25) / 0.15, 2));
}

/**
 * Calculate total roughness of a set of pitches.
 * Sums pairwise roughness, normalized by pair count.
 *
 * @param midis Array of MIDI pitches sounding simultaneously
 * @returns Average roughness (0-1)
 */
export function totalRoughness(midis: number[]): number {
  if (midis.length < 2) return 0;

  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < midis.length; i++) {
    for (let j = i + 1; j < midis.length; j++) {
      sum += pairRoughness(midis[i], midis[j]);
      pairs++;
    }
  }
  return pairs > 0 ? sum / pairs : 0;
}

/**
 * Calculate gain reduction to smooth roughness.
 *
 * @param roughness Total roughness (0-1)
 * @param mood Current mood
 * @returns Gain multiplier (0.8 - 1.0)
 */
export function roughnessGainReduction(
  roughness: number,
  mood: Mood
): number {
  const tolerance = ROUGHNESS_TOLERANCE[mood];
  const excess = Math.max(0, roughness - tolerance);
  return Math.max(0.8, 1.0 - excess * 0.5);
}

/**
 * Should roughness smoothing be applied?
 */
export function shouldSmoothRoughness(mood: Mood): boolean {
  return ROUGHNESS_TOLERANCE[mood] < 0.60;
}

/**
 * Get roughness tolerance for a mood (for testing).
 */
export function roughnessTolerance(mood: Mood): number {
  return ROUGHNESS_TOLERANCE[mood];
}
