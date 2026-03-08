/**
 * Harmonic suspension flow — consecutive suspensions for voice leading.
 *
 * Chain suspensions (4-3, 7-6, 9-8) create continuous melodic flow
 * in inner voices. This module determines when to apply suspension
 * chains and calculates the appropriate preparation-suspension-resolution
 * timing.
 *
 * Applied as note selection bias for harmony inner voices.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood suspension chain tendency (higher = more suspensions).
 */
const CHAIN_TENDENCY: Record<Mood, number> = {
  trance:    0.15,  // weak — clean harmony
  avril:     0.55,  // strongest — classical suspensions
  disco:     0.10,  // very weak — punchy chords
  downtempo: 0.35,  // moderate
  blockhead: 0.20,  // weak
  lofi:      0.45,  // strong — jazz suspensions
  flim:      0.40,  // moderate
  xtal:      0.50,  // strong — delicate suspensions
  syro:      0.25,  // weak — independent voices
  ambient:   0.60,  // strongest — flowing suspensions
};

/**
 * Section multipliers for suspension tendency.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.8,   // moderate in intro
  build:     1.1,   // building tension
  peak:      0.7,   // less at peak (resolved)
  breakdown: 1.3,   // most in breakdown
  groove:    0.9,   // moderate
};

/**
 * Whether a suspension chain should be active.
 *
 * @param tick Current tick for deterministic hash
 * @param mood Current mood
 * @param section Current section
 * @returns true if suspension chain should be applied
 */
export function shouldChainSuspension(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = CHAIN_TENDENCY[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 596572387) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Calculate sustain multiplier for suspension voice.
 * Suspended notes should hold longer than normal.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Sustain multiplier (1.0 - 1.8)
 */
export function suspensionSustainMul(
  mood: Mood,
  section: Section
): number {
  const tendency = CHAIN_TENDENCY[mood] * SECTION_MULT[section];
  return 1.0 + tendency * 0.8;
}

/**
 * Calculate which suspension interval to use.
 * Returns the suspension interval in semitones above resolution.
 *
 * @param tick Current tick for deterministic selection
 * @returns Suspension interval: 1 (4-3 type), 2 (9-8 type), or 1 (7-6 type)
 */
export function suspensionInterval(tick: number): number {
  const hash = ((tick * 2654435761 + 198491317) >>> 0) / 4294967296;
  if (hash < 0.5) return 1;  // 4-3 or 7-6 (semitone above)
  return 2;                    // 9-8 (whole step above)
}

/**
 * Get chain tendency for a mood (for testing).
 */
export function suspensionChainTendency(mood: Mood): number {
  return CHAIN_TENDENCY[mood];
}
