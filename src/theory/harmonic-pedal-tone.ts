/**
 * Harmonic pedal tone — sustained bass note during chord changes.
 *
 * A pedal tone is a held bass note that persists through multiple
 * chord changes above it. This creates harmonic tension that resolves
 * when the bass finally moves. Different from pedal-point.ts (which
 * handles drone pedal notes) — this is about the *harmonic* layer
 * holding its bass note while inner voices change.
 *
 * Applied to harmony layer: bass note sustains through N chord changes.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood pedal tendency (probability of sustaining bass).
 */
const PEDAL_TENDENCY: Record<Mood, number> = {
  trance:    0.40,  // tonic pedal common
  avril:     0.35,  // classical pedal point
  disco:     0.30,  // groove pedal
  downtempo: 0.45,  // sustained bass
  blockhead: 0.20,  // choppy, less pedal
  lofi:      0.50,  // jazz walking bass sometimes holds
  flim:      0.40,  // organic pedal
  xtal:      0.55,  // floating sustained bass
  syro:      0.15,  // angular, less pedal
  ambient:   0.60,  // maximum sustain,
  plantasia: 0.60,
};

/**
 * Maximum chord changes a pedal sustains through.
 */
const MAX_PEDAL_LENGTH: Record<Mood, number> = {
  trance:    3,
  avril:     4,
  disco:     2,
  downtempo: 4,
  blockhead: 2,
  lofi:      3,
  flim:      3,
  xtal:      5,
  syro:      2,
  ambient:   6,
  plantasia: 6,
};

/**
 * Should the bass hold as a pedal tone?
 *
 * @param mood Current mood
 * @param section Current section
 * @param chordChangeCount How many changes since pedal started
 * @param tick Current tick for determinism
 * @returns Whether to sustain the bass
 */
export function shouldHoldPedal(
  mood: Mood,
  section: Section,
  chordChangeCount: number,
  tick: number
): boolean {
  if (chordChangeCount >= MAX_PEDAL_LENGTH[mood]) return false;

  const tendency = PEDAL_TENDENCY[mood];
  const sectionMult: Record<Section, number> = {
    intro:     1.3,   // pedals establish tonality
    build:     0.6,   // bass should move
    peak:      0.4,   // active bass
    breakdown: 1.4,   // pedals create atmosphere
    groove:    0.8,
  };

  const hash = ((tick * 2654435761 + 91813) >>> 0) / 4294967296;
  return hash < tendency * (sectionMult[section] ?? 1.0);
}

/**
 * Get max pedal length for a mood (for testing).
 */
export function maxPedalLength(mood: Mood): number {
  return MAX_PEDAL_LENGTH[mood];
}

/**
 * Get pedal tendency for a mood (for testing).
 */
export function pedalTendency(mood: Mood): number {
  return PEDAL_TENDENCY[mood];
}
