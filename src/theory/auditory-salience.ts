/**
 * Auditory salience — perceptual prominence modeling.
 *
 * Models which musical events grab listener attention based on
 * register extremes, spectral surprises, syncopation, and dynamic
 * contrasts. Used to ensure focal points exist (builds/peaks) or
 * are minimized (ambient/breakdowns).
 *
 * Applied as gain boost on salient events and gain reduction on
 * non-salient background events.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood salience sensitivity (higher = more prominent focal points).
 */
const SALIENCE_STRENGTH: Record<Mood, number> = {
  trance:    0.35,  // moderate — repetition is the point
  avril:     0.50,  // strong — classical dynamics
  disco:     0.40,  // moderate
  downtempo: 0.35,  // moderate
  blockhead: 0.55,  // strong — hip-hop emphasis
  lofi:      0.30,  // gentle — smooth flow
  flim:      0.45,  // organic highlights
  xtal:      0.25,  // low — ambient shimmer
  syro:      0.60,  // strongest — IDM surprises
  ambient:   0.10,  // minimal — non-hierarchical
};

/**
 * Section multiplier for salience effect.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.5,
  build:     0.9,
  peak:      1.0,
  breakdown: 0.4,
  groove:    0.7,
};

/**
 * Calculate note salience score based on multiple perceptual factors.
 *
 * @param registerExtremity 0-1 how far from middle register (extreme = salient)
 * @param spectralChange 0-1 magnitude of brightness/timbre shift
 * @param syncopation 0-1 off-beat strength
 * @param dynamicShift 0-1 gain change magnitude
 * @param mood Current mood
 * @param section Current section
 * @returns Salience score 0-1
 */
export function noteSalience(
  registerExtremity: number,
  spectralChange: number,
  syncopation: number,
  dynamicShift: number,
  mood: Mood,
  section: Section
): number {
  const strength = SALIENCE_STRENGTH[mood] * SECTION_MULT[section];

  // Weight different salience factors
  const raw = (
    registerExtremity * 0.25 +
    spectralChange * 0.30 +
    syncopation * 0.25 +
    dynamicShift * 0.20
  ) * strength;

  return Math.max(0, Math.min(1, raw));
}

/**
 * Calculate gain boost for salient events.
 *
 * @param salience 0-1 salience score
 * @param mood Current mood
 * @returns Gain multiplier (1.0 - 1.12)
 */
export function salienceGainBoost(salience: number, mood: Mood): number {
  const strength = SALIENCE_STRENGTH[mood];
  return 1.0 + salience * strength * 0.2;
}

/**
 * Calculate gain reduction for non-salient background.
 * Applied to layers that are NOT the salient foreground.
 *
 * @param foregroundSalience 0-1 salience of the foreground layer
 * @param mood Current mood
 * @returns Gain multiplier (0.90 - 1.0)
 */
export function backgroundGainReduction(
  foregroundSalience: number,
  mood: Mood
): number {
  const strength = SALIENCE_STRENGTH[mood];
  const reduction = foregroundSalience * strength * 0.10;
  return Math.max(0.90, 1.0 - reduction);
}

/**
 * Should auditory salience be applied?
 */
export function shouldApplySalience(mood: Mood, section: Section): boolean {
  return SALIENCE_STRENGTH[mood] * SECTION_MULT[section] > 0.08;
}

/**
 * Get salience strength for a mood (for testing).
 */
export function salienceStrength(mood: Mood): number {
  return SALIENCE_STRENGTH[mood];
}
