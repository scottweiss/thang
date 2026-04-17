/**
 * Chord sustain shape — envelope shape varies by chord quality.
 *
 * Different chord qualities should have different sustain characteristics.
 * Major chords sustain fully (confident), minor chords taper slightly
 * (introspective), dominant 7ths decay faster (tension wants to resolve),
 * sus chords sustain longest (floating, unresolved).
 *
 * Applied as decay/sustain multipliers based on chord quality.
 */

import type { Mood, ChordQuality } from '../types';

/**
 * Per-mood sustain sensitivity.
 */
const SUSTAIN_SENSITIVITY: Record<Mood, number> = {
  trance:    0.20,  // uniform sustain
  avril:     0.50,  // piano-like quality response
  disco:     0.25,  // groove consistency
  downtempo: 0.40,  // quality-colored
  blockhead: 0.30,  // moderate
  lofi:      0.55,  // maximum quality sensitivity
  flim:      0.45,  // organic response
  xtal:      0.35,  // gentle variation
  syro:      0.20,  // controlled
  ambient:   0.45,  // quality colors sustain,
  plantasia: 0.45,
};

/**
 * Base sustain multiplier by chord quality.
 */
const QUALITY_SUSTAIN: Record<ChordQuality, number> = {
  maj:   1.0,   // full sustain
  min:   0.85,  // slightly shorter (introspective)
  maj7:  1.1,   // rich, sustained
  min7:  0.90,  // warm but slightly shorter
  dom7:  0.75,  // wants to resolve (shorter)
  sus2:  1.15,  // floating, longest
  sus4:  1.12,  // floating
  dim:   0.65,  // tense, short
  aug:   0.70,  // unstable, short
  add9:  1.05,  // open, sustained
  min9:  0.95,  // warm
};

/**
 * Calculate decay multiplier based on chord quality.
 *
 * @param quality Current chord quality
 * @param mood Current mood
 * @returns Decay multiplier (0.6-1.3)
 */
export function qualityDecayMultiplier(quality: ChordQuality, mood: Mood): number {
  const sensitivity = SUSTAIN_SENSITIVITY[mood];
  const baseMult = QUALITY_SUSTAIN[quality] ?? 1.0;
  // Blend toward 1.0 based on sensitivity (low sensitivity = closer to 1.0)
  return 1.0 + (baseMult - 1.0) * sensitivity;
}

/**
 * Calculate sustain parameter multiplier based on chord quality.
 *
 * @param quality Current chord quality
 * @param mood Current mood
 * @returns Sustain multiplier
 */
export function qualitySustainMultiplier(quality: ChordQuality, mood: Mood): number {
  const sensitivity = SUSTAIN_SENSITIVITY[mood];
  const baseMult = QUALITY_SUSTAIN[quality] ?? 1.0;
  // Sustain follows same direction but less extreme
  return 1.0 + (baseMult - 1.0) * sensitivity * 0.5;
}

/**
 * Should chord sustain shaping be applied?
 */
export function shouldApplySustainShape(mood: Mood): boolean {
  return SUSTAIN_SENSITIVITY[mood] > 0.15;
}

/**
 * Get sustain sensitivity for a mood (for testing).
 */
export function sustainSensitivity(mood: Mood): number {
  return SUSTAIN_SENSITIVITY[mood];
}
