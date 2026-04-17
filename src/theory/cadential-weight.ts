/**
 * Cadential weight — heavier orchestration at cadence points.
 *
 * At strong cadences (V→I, iv→I), all layers should converge
 * for maximum impact. This module detects cadential moments
 * and provides a weight multiplier that affects gain, reverb,
 * and density — creating a "moment of arrival" feeling.
 *
 * Different from arrival-emphasis.ts (which handles section
 * transitions). This handles within-section harmonic arrivals.
 */

import type { Mood, Section, ChordQuality } from '../types';

/**
 * Per-mood weight of cadential emphasis.
 * Higher = more dramatic cadence arrivals.
 */
const CADENTIAL_WEIGHT: Record<Mood, number> = {
  trance:    0.55,  // big builds to resolution
  avril:     0.50,  // classical-style cadences
  disco:     0.40,  // moderate
  downtempo: 0.35,  // subtle
  blockhead: 0.30,  // moderate
  lofi:      0.45,  // jazz turnarounds feel important
  flim:      0.30,  // organic
  xtal:      0.20,  // floating, cadences less important
  syro:      0.15,  // ambiguous, avoiding strong cadences
  ambient:   0.10,  // barely noticeable,
  plantasia: 0.10,
};

/**
 * Cadence type strengths (how strong is this cadence?).
 */
const CADENCE_STRENGTH: Record<string, number> = {
  'V-I':     1.0,   // perfect authentic
  'V7-I':    1.0,   // dominant 7th to tonic
  'IV-I':    0.7,   // plagal
  'vii-I':   0.8,   // leading tone
  'ii-V':    0.5,   // approach (ii-V is incomplete)
  'IV-V':    0.4,   // pre-dominant
};

/**
 * Detect if the current chord change is a cadence.
 *
 * @param prevDegree Previous chord degree (1-7)
 * @param currentDegree Current chord degree
 * @param prevQuality Previous chord quality
 * @returns Cadence strength 0-1 (0 = not a cadence)
 */
export function detectCadence(
  prevDegree: number,
  currentDegree: number,
  prevQuality: ChordQuality
): number {
  if (prevDegree === 5 && currentDegree === 1) {
    return prevQuality === 'dom7' ? CADENCE_STRENGTH['V7-I'] : CADENCE_STRENGTH['V-I'];
  }
  if (prevDegree === 4 && currentDegree === 1) return CADENCE_STRENGTH['IV-I'];
  if (prevDegree === 7 && currentDegree === 1) return CADENCE_STRENGTH['vii-I'];
  if (prevDegree === 2 && currentDegree === 5) return CADENCE_STRENGTH['ii-V'];
  if (prevDegree === 4 && currentDegree === 5) return CADENCE_STRENGTH['IV-V'];
  return 0;
}

/**
 * Calculate cadential weight multiplier.
 * Apply to gain for "heavier" cadence moments.
 *
 * @param cadenceStrength Cadence strength from detectCadence
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (1.0 = no change, up to ~1.3)
 */
export function cadentialGainBoost(
  cadenceStrength: number,
  mood: Mood,
  section: Section
): number {
  if (cadenceStrength < 0.1) return 1.0;

  const weight = CADENTIAL_WEIGHT[mood];
  const sectionMult = section === 'peak' ? 1.3 : section === 'build' ? 1.1 : 1.0;

  return 1.0 + cadenceStrength * weight * sectionMult * 0.3;
}

/**
 * Calculate cadential reverb boost.
 * Cadences get more spaciousness for "bloom" effect.
 *
 * @param cadenceStrength Cadence strength
 * @param mood Current mood
 * @returns Reverb multiplier (1.0 = no change, up to ~1.5)
 */
export function cadentialReverbBoost(
  cadenceStrength: number,
  mood: Mood
): number {
  if (cadenceStrength < 0.1) return 1.0;
  return 1.0 + cadenceStrength * CADENTIAL_WEIGHT[mood] * 0.5;
}

/**
 * Should cadential weight be applied?
 *
 * @param cadenceStrength Detected cadence strength
 * @param mood Current mood
 * @returns Whether to apply
 */
export function shouldApplyCadentialWeight(
  cadenceStrength: number,
  mood: Mood
): boolean {
  return cadenceStrength > 0.2 && CADENTIAL_WEIGHT[mood] > 0.08;
}

/**
 * Get cadential weight for a mood (for testing).
 */
export function moodCadentialWeight(mood: Mood): number {
  return CADENTIAL_WEIGHT[mood];
}
