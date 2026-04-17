/**
 * Stochastic resonance — controlled randomness that improves perception.
 *
 * A real neuroscience phenomenon: adding a small amount of noise to a
 * sub-threshold signal paradoxically makes it more detectable. In music,
 * tiny random deviations in timing, pitch, and gain make patterns feel
 * more alive and perceptible than perfectly quantized versions.
 *
 * Applied as micro-jitter on gain, FM depth, and filter cutoff.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood noise intensity (higher = more beneficial randomness).
 */
const NOISE_INTENSITY: Record<Mood, number> = {
  trance:    0.10,  // minimal — precision matters
  avril:     0.25,  // moderate — human expression
  disco:     0.12,  // low — tight groove
  downtempo: 0.30,  // moderate — lazy organic
  blockhead: 0.20,  // moderate
  lofi:      0.40,  // highest — imperfection is the aesthetic
  flim:      0.35,  // high — organic texture
  xtal:      0.30,  // moderate — ambient shimmer
  syro:      0.25,  // moderate — controlled chaos
  ambient:   0.20,  // moderate — gentle movement,
  plantasia: 0.20,
};

/**
 * Section multiplier on noise intensity.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,
  build:     0.8,
  peak:      0.6,   // less noise at peak — clarity
  breakdown: 1.0,   // full noise — breathing
  groove:    0.9,
};

/**
 * Generate deterministic pseudo-random jitter from tick and seed.
 *
 * @param tick Current tick
 * @param seed Layer-specific seed
 * @returns Value in -1 to 1
 */
function jitter(tick: number, seed: number): number {
  const hash = ((tick * 2654435761 + seed * 7919) >>> 0) / 4294967296;
  return hash * 2 - 1;
}

/**
 * Calculate gain jitter — micro-variation on gain for organic feel.
 *
 * @param tick Current tick
 * @param layerIndex Layer index (seed)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.96 - 1.04)
 */
export function gainJitter(
  tick: number,
  layerIndex: number,
  mood: Mood,
  section: Section
): number {
  const intensity = NOISE_INTENSITY[mood] * SECTION_MULT[section];
  const noise = jitter(tick, layerIndex) * intensity * 0.08;
  return Math.max(0.96, Math.min(1.04, 1.0 + noise));
}

/**
 * Calculate FM jitter — micro-variation on FM depth.
 *
 * @param tick Current tick
 * @param layerIndex Layer index (seed)
 * @param mood Current mood
 * @param section Current section
 * @returns FM multiplier (0.95 - 1.05)
 */
export function fmJitter(
  tick: number,
  layerIndex: number,
  mood: Mood,
  section: Section
): number {
  const intensity = NOISE_INTENSITY[mood] * SECTION_MULT[section];
  const noise = jitter(tick, layerIndex + 100) * intensity * 0.10;
  return Math.max(0.95, Math.min(1.05, 1.0 + noise));
}

/**
 * Calculate filter jitter — micro-variation on LPF cutoff.
 *
 * @param tick Current tick
 * @param layerIndex Layer index (seed)
 * @param mood Current mood
 * @param section Current section
 * @returns LPF multiplier (0.97 - 1.03)
 */
export function filterJitter(
  tick: number,
  layerIndex: number,
  mood: Mood,
  section: Section
): number {
  const intensity = NOISE_INTENSITY[mood] * SECTION_MULT[section];
  const noise = jitter(tick, layerIndex + 200) * intensity * 0.06;
  return Math.max(0.97, Math.min(1.03, 1.0 + noise));
}

/**
 * Should stochastic resonance be applied?
 */
export function shouldApplyResonance(mood: Mood, section: Section): boolean {
  return NOISE_INTENSITY[mood] * SECTION_MULT[section] > 0.05;
}

/**
 * Get noise intensity for a mood (for testing).
 */
export function noiseIntensity(mood: Mood): number {
  return NOISE_INTENSITY[mood];
}
