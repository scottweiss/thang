/**
 * Rhythmic elasticity — tempo micro-flexibility from harmonic tension.
 *
 * Like a jazz pianist who stretches time at a dissonant chord
 * and snaps back at resolution. The tempo momentarily expands
 * (slower) during tension and contracts (faster) at resolution.
 *
 * Different from rubato.ts (which handles section-level tempo)
 * and tempo-feel.ts (which handles phrase-level breathing).
 * This is note-level, tension-responsive micro-timing.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood elasticity (how much tempo stretches with tension).
 * Higher = more stretch.
 */
const ELASTICITY: Record<Mood, number> = {
  lofi:      0.06,  // jazz — moderate elasticity (was 0.12)
  downtempo: 0.05,  // moderate stretch (was 0.10)
  flim:      0.05,  // organic feel (was 0.10)
  ambient:   0.05,  // dreamlike (was 0.15),
  plantasia: 0.05,
  xtal:      0.04,  // floating (was 0.08)
  avril:     0.04,  // subtle rubato (was 0.08)
  syro:      0.03,  // complex but tight (was 0.05)
  blockhead: 0.02,  // groove (was 0.06)
  disco:     0.01,  // groove-locked (was 0.03)
  trance:    0.01,  // metronomic (was 0.02)
};

/**
 * Section multiplier for elasticity.
 */
const SECTION_ELASTICITY: Record<Section, number> = {
  intro:     1.2,   // free tempo
  build:     0.8,   // tightening
  peak:      0.5,   // locked in
  breakdown: 1.5,   // maximum freedom
  groove:    1.0,   // normal
};

/**
 * Calculate tempo multiplier based on current harmonic tension.
 * Tension > 0.5 stretches (slower), tension < 0.5 contracts (faster).
 *
 * @param tension Current tension level (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Tempo multiplier (< 1 = slower, > 1 = faster)
 */
export function elasticTempoMultiplier(
  tension: number,
  mood: Mood,
  section: Section
): number {
  const elasticity = ELASTICITY[mood] * SECTION_ELASTICITY[section];

  // Center around 0.5 tension: above stretches, below contracts
  const deviation = tension - 0.5;
  // Negative deviation (low tension) = slightly faster
  // Positive deviation (high tension) = slightly slower
  return 1.0 - deviation * elasticity * 2;
}

/**
 * Calculate a .late() offset that creates elastic timing feel.
 * Dissonant notes arrive slightly late; consonant notes arrive on time.
 *
 * @param tension Current tension (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Late offset (0-0.1 cycle units)
 */
export function elasticLateOffset(
  tension: number,
  mood: Mood,
  section: Section
): number {
  const elasticity = ELASTICITY[mood] * SECTION_ELASTICITY[section];

  // Only create lateness at high tension
  if (tension < 0.5) return 0;

  return (tension - 0.5) * elasticity * 0.5;
}

/**
 * Should rhythmic elasticity be applied?
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to apply
 */
export function shouldApplyElasticity(mood: Mood, section: Section): boolean {
  return ELASTICITY[mood] * SECTION_ELASTICITY[section] > 0.03;
}

/**
 * Get elasticity for a mood (for testing).
 */
export function moodElasticity(mood: Mood): number {
  return ELASTICITY[mood];
}
