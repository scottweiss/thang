/**
 * Energy envelope — piece-level energy trajectory.
 *
 * Energy is different from tension: tension can be high during
 * a quiet breakdown (harmonic tension), while energy is about
 * the perceived intensity/activity level. This module models
 * energy with distinct phases: rest → build → sustain → release.
 *
 * Energy affects layer count, rhythmic density, and overall gain
 * on a macro level beyond what section management provides.
 */

import type { Mood, Section } from '../types';

/** Energy phase of the piece. */
export type EnergyPhase = 'rest' | 'rising' | 'sustain' | 'falling';

/**
 * Per-mood energy curve shape.
 * Higher = more energetic overall.
 */
const ENERGY_CEILING: Record<Mood, number> = {
  trance:    0.95,  // high energy ceiling
  avril:     0.70,  // moderate
  disco:     0.90,  // high
  downtempo: 0.60,  // mellow
  blockhead: 0.80,  // moderate-high
  lofi:      0.55,  // chill
  flim:      0.65,  // moderate
  xtal:      0.50,  // restrained
  syro:      0.85,  // high
  ambient:   0.40,  // low energy
};

/**
 * Section energy mapping (base energy per section).
 */
const SECTION_ENERGY: Record<Section, number> = {
  intro:     0.20,
  build:     0.55,
  peak:      0.95,
  breakdown: 0.30,
  groove:    0.70,
};

/**
 * Calculate current energy level.
 *
 * @param section Current section
 * @param sectionProgress Progress through section (0-1)
 * @param mood Current mood
 * @returns Energy level 0-1
 */
export function energyLevel(
  section: Section,
  sectionProgress: number,
  mood: Mood
): number {
  const base = SECTION_ENERGY[section];
  const ceiling = ENERGY_CEILING[mood];

  // Energy ramps within section
  let ramp: number;
  switch (section) {
    case 'intro':
      ramp = base + sectionProgress * 0.1; // slowly rising
      break;
    case 'build':
      ramp = base + sectionProgress * 0.35; // clearly rising
      break;
    case 'peak':
      ramp = base; // sustained high
      break;
    case 'breakdown':
      ramp = base - sectionProgress * 0.15; // gently falling
      break;
    case 'groove':
      ramp = base + Math.sin(sectionProgress * Math.PI) * 0.1; // gentle wave
      break;
    default:
      ramp = base;
  }

  return Math.max(0, Math.min(ceiling, ramp));
}

/**
 * Classify the current energy phase.
 *
 * @param currentEnergy Current energy level
 * @param prevEnergy Previous energy level
 * @returns Energy phase
 */
export function energyPhase(currentEnergy: number, prevEnergy: number): EnergyPhase {
  const delta = currentEnergy - prevEnergy;
  if (currentEnergy < 0.25) return 'rest';
  if (delta > 0.03) return 'rising';
  if (delta < -0.03) return 'falling';
  return 'sustain';
}

/**
 * Energy-based gain multiplier.
 * Low energy = quieter, high energy = louder.
 *
 * @param energy Current energy level
 * @param mood Current mood
 * @returns Gain multiplier (0.6-1.2)
 */
export function energyGainMultiplier(energy: number, mood: Mood): number {
  const range = ENERGY_CEILING[mood] * 0.4; // dynamic range
  return 0.8 + energy * range;
}

/**
 * Should energy envelope be applied?
 *
 * @param mood Current mood
 * @returns Whether to apply
 */
export function shouldApplyEnergyEnvelope(mood: Mood): boolean {
  return ENERGY_CEILING[mood] > 0.3;
}

/**
 * Get energy ceiling for a mood (for testing).
 */
export function moodEnergyCeiling(mood: Mood): number {
  return ENERGY_CEILING[mood];
}
