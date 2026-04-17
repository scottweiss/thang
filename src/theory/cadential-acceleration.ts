/**
 * Cadential acceleration — chord changes speed up approaching cadences.
 *
 * In common-practice music, harmonic rhythm accelerates before
 * cadence points: I . . . | IV . . | V . | I — each chord gets
 * shorter as the phrase approaches resolution. This creates
 * forward momentum and a sense of inevitability.
 *
 * Applied to evolution.ts chord timing: multiply chord duration
 * by a factor that decreases as section progress approaches
 * cadence points (every ~8 bars).
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood acceleration strength.
 * Higher = more speed-up before cadences.
 */
const ACCEL_STRENGTH: Record<Mood, number> = {
  avril:     0.35,  // classical phrasing (was 0.50)
  lofi:      0.30,  // jazz phrase momentum (was 0.45)
  downtempo: 0.25,  // subtle push (was 0.35)
  flim:      0.20,  // organic (was 0.35)
  xtal:      0.12,  // floating, less directed (was 0.15)
  blockhead: 0.10,  // groove — minimal (was 0.20)
  syro:      0.08,  // ambiguous (was 0.10)
  disco:     0.05,  // groove-locked — near-zero (was 0.25)
  trance:    0.05,  // groove-locked — near-zero (was 0.30)
  ambient:   0.03,  // barely perceptible (was 0.08),
  plantasia: 0.03,
};

/**
 * Section multiplier for acceleration.
 */
const SECTION_ACCEL: Record<Section, number> = {
  intro:     0.5,   // establishing, less momentum
  build:     1.2,   // maximum push toward peak
  peak:      0.8,   // sustained, less acceleration needed
  breakdown: 0.6,   // relaxed
  groove:    1.0,   // normal
};

/**
 * Calculate chord duration multiplier based on position within
 * a harmonic phrase. Shorter duration = faster chord changes.
 *
 * @param phraseProgress Position within current phrase (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Duration multiplier (< 1.0 = faster changes)
 */
export function cadentialAccelMultiplier(
  phraseProgress: number,
  mood: Mood,
  section: Section
): number {
  const strength = ACCEL_STRENGTH[mood] * SECTION_ACCEL[section];

  // Acceleration curve: slow start, fast finish
  // At progress 0: multiplier = 1.0 (normal speed)
  // At progress 1: multiplier = 1.0 - strength (faster)
  const accel = 1.0 - phraseProgress * phraseProgress * strength;
  return Math.max(0.4, accel);
}

/**
 * Calculate phrase progress from section progress.
 * Assumes ~4 phrases per section.
 *
 * @param sectionProgress Overall section progress (0-1)
 * @returns Progress within current phrase (0-1)
 */
export function phraseProgressFromSection(sectionProgress: number): number {
  const phrasesPerSection = 4;
  return (sectionProgress * phrasesPerSection) % 1.0;
}

/**
 * Should cadential acceleration be applied?
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to apply
 */
export function shouldAccelerate(mood: Mood, section: Section): boolean {
  return ACCEL_STRENGTH[mood] * SECTION_ACCEL[section] > 0.08;
}

/**
 * Get acceleration strength for a mood (for testing).
 */
export function accelStrength(mood: Mood): number {
  return ACCEL_STRENGTH[mood];
}
