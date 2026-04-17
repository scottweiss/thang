/**
 * Harmonic rhythm superposition — layered chord-change rates.
 *
 * Instead of all voices changing simultaneously (block harmony),
 * different voices change at different rates. Bass holds longer,
 * inner voices move more frequently, creating polyrhythmic
 * harmonic texture. Builds feel more complex without adding notes.
 *
 * Models: bass = slow harmonic rhythm, inner = medium, melody = fast.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood strength of rhythm superposition.
 * Higher = more independence between voice layers.
 */
const SUPERPOSITION_STRENGTH: Record<Mood, number> = {
  trance:    0.10,  // block harmony, together
  avril:     0.20,  // mostly together
  disco:     0.15,  // groove-locked
  downtempo: 0.35,  // moderate independence
  blockhead: 0.30,  // some independence
  lofi:      0.50,  // jazz — maximum voice independence
  flim:      0.45,  // organic, layered
  xtal:      0.40,  // floating independence
  syro:      0.55,  // complex, polyrhythmic
  ambient:   0.25,  // gentle layering,
  plantasia: 0.25,
};

/**
 * Section multiplier for superposition.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.6,   // simple, establishing
  build:     1.0,   // growing complexity
  peak:      1.2,   // maximum layering
  breakdown: 0.5,   // simplified
  groove:    1.1,   // cruising with complexity
};

/**
 * Voice-layer harmonic rhythm rates (relative to base rate).
 * Higher = changes more frequently.
 */
export interface VoiceRates {
  bass: number;      // slowest (holds pedal tones)
  inner: number;     // medium (fills changes)
  melody: number;    // fastest (most reactive)
}

/**
 * Calculate voice-specific harmonic rhythm rates.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Voice rates (multipliers of base harmonic rhythm)
 */
export function voiceHarmonicRates(mood: Mood, section: Section): VoiceRates {
  const strength = SUPERPOSITION_STRENGTH[mood] * SECTION_MULT[section];

  // Bass is always slower; inner is base rate; melody is faster
  // Strength controls how far apart they spread
  return {
    bass: Math.max(0.3, 1.0 - strength * 0.8),     // 0.3-1.0
    inner: 1.0,                                       // base rate
    melody: Math.min(2.0, 1.0 + strength * 1.2),     // 1.0-2.0
  };
}

/**
 * Should the bass voice hold through a chord change?
 * Bass holds longer in high-superposition contexts.
 *
 * @param mood Current mood
 * @param section Current section
 * @param ticksSinceLastBassChange Ticks since bass last changed
 * @param tick Current tick for determinism
 * @returns Whether bass should hold
 */
export function shouldBassHold(
  mood: Mood,
  section: Section,
  ticksSinceLastBassChange: number,
  tick: number
): boolean {
  const rates = voiceHarmonicRates(mood, section);
  // Bass rate < 1 means it holds longer than normal
  // Minimum hold is 2 ticks for bass pedal effect
  const minHold = Math.ceil(2 / rates.bass);
  if (ticksSinceLastBassChange < minHold) return true;

  // Probabilistic: lower rate = more likely to hold
  const holdProb = 1.0 - rates.bass;
  const hash = ((tick * 2654435761 + 104729) >>> 0) / 4294967296;
  return hash < holdProb;
}

/**
 * Should inner voices change independently of the bass?
 * In high-superposition moods, inner voices anticipate or lag.
 *
 * @param mood Current mood
 * @param section Current section
 * @param tick Current tick
 * @returns Whether inner voices should move
 */
export function shouldInnerVoiceMove(
  mood: Mood,
  section: Section,
  tick: number
): boolean {
  const strength = SUPERPOSITION_STRENGTH[mood] * SECTION_MULT[section];
  if (strength < 0.15) return false; // too low to bother

  const hash = ((tick * 2654435761 + 7919) >>> 0) / 4294967296;
  return hash < strength * 0.6;
}

/**
 * Calculate the superposition density score.
 * Higher = more voices changing at different times (richer texture).
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Density score 0-1
 */
export function superpositionDensity(mood: Mood, section: Section): number {
  return Math.min(1, SUPERPOSITION_STRENGTH[mood] * SECTION_MULT[section]);
}

/**
 * Get superposition strength for a mood (for testing).
 */
export function superpositionStrength(mood: Mood): number {
  return SUPERPOSITION_STRENGTH[mood];
}
