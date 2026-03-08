/**
 * Spectral decay profile — higher harmonics decay faster than lower ones.
 *
 * In acoustic instruments, overtones die away before the fundamental.
 * This creates a natural "darkening" of timbre over a note's lifetime.
 * We simulate this by reducing LPF over time within each tick,
 * making sustained notes progressively warmer.
 *
 * Applied as an LPF reduction factor based on note age.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood spectral decay rate (higher = faster darkening).
 */
const DECAY_RATE: Record<Mood, number> = {
  trance:    0.15,  // weak — bright sustained pads
  avril:     0.40,  // strong — piano-like decay
  disco:     0.20,  // moderate
  downtempo: 0.35,  // strong
  blockhead: 0.25,  // moderate
  lofi:      0.45,  // strong — warm decay
  flim:      0.35,  // moderate
  xtal:      0.30,  // moderate — crystalline decay
  syro:      0.20,  // moderate
  ambient:   0.50,  // strongest — natural darkening
};

/**
 * Section multiplier.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.1,
  build:     0.8,   // brighter sustained tones
  peak:      0.7,   // brightest
  breakdown: 1.3,   // most darkening
  groove:    1.0,
};

/**
 * Calculate LPF multiplier for spectral decay based on note age.
 *
 * @param ticksIntoNote How many ticks since the note started (0 = just attacked)
 * @param mood Current mood
 * @param section Current section
 * @returns LPF multiplier (0.7 - 1.0)
 */
export function spectralDecayLpf(
  ticksIntoNote: number,
  mood: Mood,
  section: Section
): number {
  const rate = DECAY_RATE[mood] * SECTION_MULT[section];
  // Exponential decay curve
  const decay = Math.exp(-ticksIntoNote * rate * 0.3);
  return Math.max(0.7, decay);
}

/**
 * Get decay rate for a mood (for testing).
 */
export function spectralDecayRate(mood: Mood): number {
  return DECAY_RATE[mood];
}

/**
 * Should spectral decay be applied?
 */
export function shouldApplySpectralDecay(mood: Mood, section: Section): boolean {
  return DECAY_RATE[mood] * SECTION_MULT[section] > 0.10;
}
