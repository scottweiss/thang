/**
 * Tonal closure — sense of resolution at structural boundaries.
 *
 * Music needs satisfying endings. This module detects when a section
 * or phrase is ending and biases the harmony toward resolution:
 * approaching the tonic, simplifying chord quality, and reducing
 * dissonance. The effect creates the sensation of "landing" at
 * phrase and section boundaries.
 *
 * Different from cadential-sequence (which generates specific chord
 * patterns) — this is about the *degree* of tonal resolution pressure
 * at any given moment based on structural position.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood closure strength.
 * Higher = stronger pull toward resolution at boundaries.
 */
const CLOSURE_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // strong resolution drive
  avril:     0.65,  // classical closure
  disco:     0.40,  // groove closure
  downtempo: 0.35,  // gentle resolution
  blockhead: 0.25,  // moderate
  lofi:      0.50,  // jazz resolution (deceptive sometimes)
  flim:      0.40,  // organic closure
  xtal:      0.20,  // open-ended
  syro:      0.12,  // avoids closure
  ambient:   0.08,  // nearly closureless,
  plantasia: 0.08,
};

/**
 * Calculate closure pressure at a given section progress.
 * Increases exponentially toward section end.
 *
 * @param sectionProgress Progress within section (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Closure pressure (0-1)
 */
export function closurePressure(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const strength = CLOSURE_STRENGTH[mood];

  // Section endings need more closure
  const sectionMult: Record<Section, number> = {
    intro:     0.5,   // weak closure (opening)
    build:     0.7,   // some closure before peak
    peak:      1.0,   // normal
    breakdown: 1.3,   // strong closure to resolve
    groove:    0.8,   // moderate
  };

  // Exponential ramp toward end
  const ramp = sectionProgress * sectionProgress * sectionProgress;
  return Math.min(1.0, ramp * strength * (sectionMult[section] ?? 1.0));
}

/**
 * Bias chord selection toward tonic-compatible chords.
 * Returns a multiplier for I, IV, V chord weights.
 *
 * @param pressure Current closure pressure
 * @returns Tonic bias multiplier (1.0-3.0)
 */
export function tonicBias(pressure: number): number {
  return 1.0 + pressure * 2.0;
}

/**
 * Should tonal closure be applied?
 */
export function shouldApplyClosure(mood: Mood): boolean {
  return CLOSURE_STRENGTH[mood] > 0.10;
}

/**
 * Get closure strength for a mood (for testing).
 */
export function closureStrength(mood: Mood): number {
  return CLOSURE_STRENGTH[mood];
}
