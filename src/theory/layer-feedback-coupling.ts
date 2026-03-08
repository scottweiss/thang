/**
 * Layer feedback coupling — bidirectional energy exchange between layers.
 *
 * Drum intensity should tighten harmony (higher resonance, shorter decay).
 * Harmony richness should inspire drum complexity. This creates emergent
 * groove coherence where layers respond to each other organically.
 *
 * Applied as resonance/decay multipliers based on cross-layer activity.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood coupling strength.
 */
const COUPLING_STRENGTH: Record<Mood, number> = {
  trance:    0.50,  // strong — locked groove
  avril:     0.25,  // gentle
  disco:     0.55,  // strongest — tight funk
  downtempo: 0.40,  // moderate
  blockhead: 0.50,  // hip-hop lock
  lofi:      0.35,  // jazzy interplay
  flim:      0.30,  // organic
  xtal:      0.20,  // subtle
  syro:      0.40,  // IDM coupling
  ambient:   0.10,  // minimal
};

/**
 * Calculate resonance multiplier for harmony based on drum activity.
 * Higher drum density = tighter harmony resonance.
 *
 * @param drumDensity Drum pattern density (0-1)
 * @param mood Current mood
 * @returns Resonance multiplier (0.8 - 1.3)
 */
export function drumToHarmonyResonance(
  drumDensity: number,
  mood: Mood
): number {
  const strength = COUPLING_STRENGTH[mood];
  // High drum density = more resonance (tighter, more focused)
  const boost = (drumDensity - 0.5) * strength * 0.6;
  return Math.max(0.8, Math.min(1.3, 1.0 + boost));
}

/**
 * Calculate decay multiplier for harmony based on drum activity.
 * Busier drums = shorter harmony decay (tighter feel).
 *
 * @param drumDensity Drum pattern density (0-1)
 * @param mood Current mood
 * @returns Decay multiplier (0.7 - 1.2)
 */
export function drumToHarmonyDecay(
  drumDensity: number,
  mood: Mood
): number {
  const strength = COUPLING_STRENGTH[mood];
  // High drum density = shorter decay (punchier)
  const reduction = (drumDensity - 0.5) * strength * 0.4;
  return Math.max(0.7, Math.min(1.2, 1.0 - reduction));
}

/**
 * Calculate gain boost for drums based on harmony complexity.
 * Richer harmony = slightly louder drums (confidence).
 *
 * @param harmonyNoteCount Number of notes in current harmony voicing
 * @param mood Current mood
 * @returns Gain multiplier (0.95 - 1.1)
 */
export function harmonyToDrumGain(
  harmonyNoteCount: number,
  mood: Mood
): number {
  const strength = COUPLING_STRENGTH[mood];
  // More harmony notes = slight drum boost
  const boost = Math.max(0, (harmonyNoteCount - 3) * 0.03) * strength;
  return Math.min(1.1, 1.0 + boost);
}

/**
 * Should feedback coupling be applied?
 */
export function shouldApplyCoupling(mood: Mood): boolean {
  return COUPLING_STRENGTH[mood] > 0.08;
}

/**
 * Get coupling strength for a mood (for testing).
 */
export function couplingStrength(mood: Mood): number {
  return COUPLING_STRENGTH[mood];
}
