/**
 * Pedal bass sustain — extended bass note sustain during chord changes.
 *
 * A bass pedal holds the root or fifth while upper voices change chords,
 * creating harmonic tension that resolves when the bass finally moves.
 * This module controls when and how long the bass should sustain
 * against changing harmony.
 *
 * Applied as a decay/sustain multiplier for the drone layer.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood pedal sustain tendency (higher = more likely to hold bass).
 */
const PEDAL_TENDENCY: Record<Mood, number> = {
  trance:    0.55,  // strong — trance bass drones
  avril:     0.35,  // moderate — classical pedal points
  disco:     0.40,  // moderate — funky bass
  downtempo: 0.50,  // strong — lazy bass holds
  blockhead: 0.45,  // moderate
  lofi:      0.40,  // moderate — walking bass less pedal
  flim:      0.35,  // moderate
  xtal:      0.55,  // strong — ambient drones
  syro:      0.25,  // weak — IDM bass moves
  ambient:   0.65,  // strongest — sustained drones
};

/**
 * Section multiplier on pedal tendency.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.3,   // strong pedal in intros
  build:     0.8,
  peak:      0.6,   // less pedal — bass should move with harmony
  breakdown: 1.2,   // strong pedal — reflective
  groove:    0.9,
};

/**
 * Should the bass hold a pedal tone during this chord change?
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @param ticksSinceLastPedal Ticks since last pedal was held
 * @returns Whether to hold bass pedal
 */
export function shouldHoldPedal(
  tick: number,
  mood: Mood,
  section: Section,
  ticksSinceLastPedal: number
): boolean {
  // Cooldown — don't pedal every chord change
  if (ticksSinceLastPedal < 3) return false;
  const prob = PEDAL_TENDENCY[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 6563) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Calculate sustain multiplier for pedal bass.
 * Applied to drone layer when holding against chord changes.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Sustain multiplier (1.2 - 2.0)
 */
export function pedalSustainMultiplier(
  mood: Mood,
  section: Section
): number {
  const tendency = PEDAL_TENDENCY[mood] * SECTION_MULT[section];
  return 1.2 + tendency * 0.8;
}

/**
 * Calculate decay extension for pedal bass.
 *
 * @param mood Current mood
 * @returns Decay multiplier (1.0 - 1.5)
 */
export function pedalDecayMultiplier(mood: Mood): number {
  return 1.0 + PEDAL_TENDENCY[mood] * 0.5;
}

/**
 * Get pedal tendency for a mood (for testing).
 */
export function pedalTendency(mood: Mood): number {
  return PEDAL_TENDENCY[mood];
}
