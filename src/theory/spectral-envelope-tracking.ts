/**
 * Spectral envelope tracking — filter follows harmonic content evolution.
 *
 * As a note sustains, its harmonic content naturally decays from bright
 * to dark. This module models that spectral envelope so filters track
 * the natural timbral evolution rather than staying static.
 *
 * Applied as LPF multiplier that darkens over sustain duration.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood tracking depth (higher = more pronounced spectral evolution).
 */
const TRACKING_DEPTH: Record<Mood, number> = {
  trance:    0.30,  // moderate — bright sustained pads
  avril:     0.45,  // strong — orchestral decay character
  disco:     0.20,  // weak — bright and punchy
  downtempo: 0.40,  // moderate
  blockhead: 0.35,  // moderate — 808 decay character
  lofi:      0.50,  // strong — warm tape-like decay
  flim:      0.45,  // strong — delicate spectral shift
  xtal:      0.55,  // strongest — crystalline decay
  syro:      0.25,  // weak — sharp electronic timbres
  ambient:   0.60,  // strongest — evolving pads,
  plantasia: 0.60,
};

/**
 * Section multipliers for spectral tracking.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // more tracking in sparse intro
  build:     0.9,   // less as energy rises
  peak:      0.7,   // bright and static at peak
  breakdown: 1.3,   // most tracking in reflective sections
  groove:    0.8,   // moderate in groove
};

/**
 * Calculate LPF multiplier based on sustain duration.
 * Returns 1.0 at onset, decays toward (1.0 - depth) over time.
 *
 * @param ticksSinceTrigger Ticks since note/chord onset
 * @param mood Current mood
 * @param section Current section
 * @returns LPF multiplier (0.4 - 1.0)
 */
export function spectralEnvelopeLpf(
  ticksSinceTrigger: number,
  mood: Mood,
  section: Section
): number {
  const depth = TRACKING_DEPTH[mood] * SECTION_MULT[section];
  // Exponential decay curve
  const t = Math.max(0, ticksSinceTrigger);
  const decay = Math.exp(-t * 0.15);
  // LPF goes from 1.0 at onset to (1.0 - depth) over time
  const lpfMul = 1.0 - depth * (1.0 - decay);
  return Math.max(0.4, Math.min(1.0, lpfMul));
}

/**
 * Whether spectral envelope tracking should be applied.
 */
export function shouldTrackSpectralEnvelope(
  mood: Mood,
  section: Section
): boolean {
  return TRACKING_DEPTH[mood] * SECTION_MULT[section] > 0.15;
}

/**
 * Get tracking depth for a mood (for testing).
 */
export function spectralTrackingDepth(mood: Mood): number {
  return TRACKING_DEPTH[mood];
}
