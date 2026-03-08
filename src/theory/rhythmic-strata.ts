/**
 * Rhythmic strata — independent tempo layers for polymetric texture.
 *
 * Different layers can operate at related but different tempos:
 * arp at 3/4 against melody at 4/4, or drone at half-time.
 * This creates rhythmic complexity without changing the base tempo.
 *
 * Applied as a .slow() multiplier per layer.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood stratification strength (0 = all same tempo, 1 = maximum independence).
 */
const STRATA_STRENGTH: Record<Mood, number> = {
  trance:    0.10,  // minimal — 4/4 discipline
  avril:     0.25,  // moderate — classical tempo layers
  disco:     0.08,  // minimal — unified groove
  downtempo: 0.30,  // moderate — lazy polyrhythm
  blockhead: 0.20,  // moderate — hip-hop halftime layers
  lofi:      0.35,  // strong — jazz independence
  flim:      0.40,  // strong — Aphex polymetric
  xtal:      0.45,  // strong — ambient time layers
  syro:      0.50,  // strongest — IDM temporal chaos
  ambient:   0.35,  // strong — drifting time
};

/**
 * Section multiplier on stratification.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.6,   // unified — establishing
  build:     0.9,
  peak:      0.7,   // more unified — energy
  breakdown: 1.3,   // most stratified — deconstructed
  groove:    1.0,
};

/**
 * Available tempo ratios (multipliers on .slow()).
 * Values < 1 = faster, > 1 = slower.
 */
const TEMPO_RATIOS: Record<string, number[]> = {
  drone:      [2.0, 1.5],           // half-time, 3/2 time
  harmony:    [1.0, 1.5],           // normal or 3/2
  melody:     [1.0, 0.75],          // normal or 4/3 (slightly faster)
  texture:    [1.0, 0.5],           // normal or double-time
  arp:        [1.0, 0.75, 1.333],   // normal, 4/3, or 3/4
  atmosphere: [2.0, 3.0],           // half or third time
};

/**
 * Calculate tempo ratio for a layer based on current context.
 *
 * @param layerName Layer name
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns Slow multiplier (0.5 - 3.0)
 */
export function layerTempoRatio(
  layerName: string,
  tick: number,
  mood: Mood,
  section: Section
): number {
  const strength = STRATA_STRENGTH[mood] * SECTION_MULT[section];
  const ratios = TEMPO_RATIOS[layerName] ?? [1.0];
  // Deterministic ratio selection
  const hash = ((tick * 2654435761 + layerName.length * 7919) >>> 0) / 4294967296;
  // Blend between 1.0 (unified) and selected ratio by strength
  if (hash > strength) return 1.0; // no stratification this tick
  const idx = Math.floor(hash / strength * ratios.length) % ratios.length;
  return ratios[idx];
}

/**
 * Should rhythmic strata be applied?
 */
export function shouldApplyStrata(mood: Mood, section: Section): boolean {
  return STRATA_STRENGTH[mood] * SECTION_MULT[section] > 0.08;
}

/**
 * Get strata strength for a mood (for testing).
 */
export function strataStrength(mood: Mood): number {
  return STRATA_STRENGTH[mood];
}
