/**
 * Tension-responsive articulation — note length tracks tension arc.
 *
 * At high tension, notes become shorter and punchier (staccato-like):
 * faster attacks, shorter decays, lower sustain. This creates urgency
 * and drive in builds and peaks.
 *
 * At low tension, notes become longer and more legato: gentle attacks,
 * longer decays, higher sustain. This creates warmth and spaciousness
 * in breakdowns and intros.
 *
 * The effect modulates the ADSR envelope multipliers that are applied
 * by the existing envelope-evolution system. This stacks on top of
 * section-based envelope changes to add real-time tension response.
 *
 * Different moods have different sensitivity:
 * - Trance: high sensitivity (dramatic staccato→legato contrast)
 * - Ambient: low sensitivity (always legato regardless of tension)
 * - Lofi: moderate (jazz phrasing — some variation but always warm)
 */

import type { Mood } from '../types';

/** Per-mood sensitivity to tension-driven articulation */
const TENSION_SENSITIVITY: Record<Mood, number> = {
  trance:    0.50,   // dramatic contrast
  disco:     0.40,   // funky — punchy at peaks
  syro:      0.35,   // IDM — expressive
  blockhead: 0.30,   // hip-hop — some punch
  downtempo: 0.25,   // smooth — gentle variation
  lofi:      0.20,   // jazz — subtle
  flim:      0.20,   // delicate — subtle
  xtal:      0.15,   // dreamy — gentle
  avril:     0.15,   // intimate — gentle
  ambient:   0.05,   // always legato,
  plantasia: 0.05,
};

/**
 * Compute a decay multiplier based on tension.
 * Higher tension → shorter decay (more staccato).
 *
 * @param tension  Current overall tension (0-1)
 * @param mood     Current mood
 * @returns Multiplier for decay time (0.5-1.2)
 */
export function tensionDecayMultiplier(
  tension: number,
  mood: Mood
): number {
  const sensitivity = TENSION_SENSITIVITY[mood];
  // At tension 0: decay is longer (1.0 + slight boost)
  // At tension 1: decay is shorter (1.0 - sensitivity reduction)
  const t = Math.max(0, Math.min(1, tension));
  return 1.0 + sensitivity * 0.3 * (1 - 2 * t);
  // t=0 → 1.0 + 0.3*sensitivity (longer)
  // t=0.5 → 1.0 (neutral)
  // t=1 → 1.0 - 0.3*sensitivity (shorter)
}

/**
 * Compute a sustain multiplier based on tension.
 * Higher tension → lower sustain (notes die faster).
 *
 * @param tension  Current overall tension (0-1)
 * @param mood     Current mood
 * @returns Multiplier for sustain level (0.4-1.3)
 */
export function tensionSustainMultiplier(
  tension: number,
  mood: Mood
): number {
  const sensitivity = TENSION_SENSITIVITY[mood];
  const t = Math.max(0, Math.min(1, tension));
  return 1.0 + sensitivity * 0.4 * (1 - 2 * t);
}

/**
 * Compute an attack multiplier based on tension.
 * Higher tension → faster attack (more percussive).
 *
 * @param tension  Current overall tension (0-1)
 * @param mood     Current mood
 * @returns Multiplier for attack time (0.6-1.1)
 */
export function tensionAttackMultiplier(
  tension: number,
  mood: Mood
): number {
  const sensitivity = TENSION_SENSITIVITY[mood];
  const t = Math.max(0, Math.min(1, tension));
  // At high tension, attack is faster (multiplier < 1.0)
  return 1.0 + sensitivity * 0.2 * (1 - 2 * t);
}

/**
 * Whether tension articulation should be applied.
 */
export function shouldApplyTensionArticulation(mood: Mood): boolean {
  return TENSION_SENSITIVITY[mood] >= 0.1;
}

/**
 * Get the sensitivity for a mood (for testing).
 */
export function tensionArticulationSensitivity(mood: Mood): number {
  return TENSION_SENSITIVITY[mood];
}
