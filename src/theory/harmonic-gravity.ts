/**
 * Harmonic gravity — chords weighted by gravitational pull toward tonic.
 *
 * In tonal music, chords have different "weights" based on their
 * distance from the tonic. The tonic (I) is the heaviest, dominant
 * (V) has strong pull toward tonic, and chromatic chords are lighter/
 * more unstable. This module quantifies that gravitational hierarchy
 * to bias chord selection toward structurally meaningful progressions.
 *
 * Used to modulate chord duration: heavier chords sustain longer,
 * lighter chords pass quickly.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood gravity sensitivity.
 * Higher = stronger tonal hierarchy (chords closer to tonic last longer).
 */
const GRAVITY_SENSITIVITY: Record<Mood, number> = {
  trance:    0.55,  // strong tonal center
  avril:     0.60,  // classical hierarchy
  disco:     0.45,  // moderate groove stability
  downtempo: 0.40,  // relaxed gravity
  blockhead: 0.30,  // less hierarchical
  lofi:      0.50,  // jazz respects gravity
  flim:      0.35,  // organic, loose
  xtal:      0.20,  // floating, weak gravity
  syro:      0.15,  // complex, gravity-defying
  ambient:   0.10,  // nearly weightless,
  plantasia: 0.10,
};

/**
 * Harmonic gravity weight by scale degree (1-indexed).
 * I=heaviest, V=strong pull, vii°=lightest.
 */
const DEGREE_WEIGHT: Record<number, number> = {
  1: 1.0,   // tonic: maximum stability
  2: 0.4,   // supertonic: pre-dominant
  3: 0.5,   // mediant: moderate
  4: 0.6,   // subdominant: gateway
  5: 0.8,   // dominant: strong pull
  6: 0.45,  // submediant: relative minor
  7: 0.3,   // leading tone: unstable
};

/**
 * Get the harmonic weight of a chord by degree.
 *
 * @param degree Scale degree (1-7)
 * @returns Weight (0-1, higher = heavier/more stable)
 */
export function harmonicWeight(degree: number): number {
  return DEGREE_WEIGHT[degree] ?? 0.35;
}

/**
 * Calculate duration multiplier based on harmonic gravity.
 * Heavy chords sustain longer, light chords pass quickly.
 *
 * @param degree Current chord's scale degree
 * @param mood Current mood
 * @param section Current section
 * @returns Duration multiplier (0.7-1.4)
 */
export function gravityDurationMultiplier(
  degree: number,
  mood: Mood,
  section: Section
): number {
  const weight = harmonicWeight(degree);
  const sensitivity = GRAVITY_SENSITIVITY[mood];

  // Section modulation
  const sectionMult: Record<Section, number> = {
    intro:     1.2,   // heavy = lingering
    build:     0.8,   // lighter = faster
    peak:      0.7,   // sustained power
    breakdown: 1.3,   // heavy = atmospheric
    groove:    1.0,
  };

  const deviation = (weight - 0.5) * sensitivity * (sectionMult[section] ?? 1.0);
  return Math.max(0.7, Math.min(1.4, 1.0 + deviation));
}

/**
 * Should harmonic gravity be applied?
 */
export function shouldApplyHarmonicGravity(mood: Mood): boolean {
  return GRAVITY_SENSITIVITY[mood] > 0.12;
}

/**
 * Get gravity sensitivity for a mood (for testing).
 */
export function gravitySensitivity(mood: Mood): number {
  return GRAVITY_SENSITIVITY[mood];
}
