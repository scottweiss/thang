/**
 * Momentum transfer — energy handoff between layers.
 *
 * When a layer fades out and another fades in during section
 * transitions, the dying layer's energy should transfer to the
 * entering layer. This creates smooth musical handoffs rather
 * than awkward gaps where both are quiet simultaneously.
 *
 * Applied to layerGainMultipliers: boost entering layers
 * proportionally to what's leaving.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood strength of momentum transfer.
 * Higher = more energy conservation between layers.
 */
const TRANSFER_STRENGTH: Record<Mood, number> = {
  trance:    0.50,  // strong energy flow
  avril:     0.40,  // moderate
  disco:     0.45,  // keep the groove going
  downtempo: 0.30,  // gentle handoffs
  blockhead: 0.35,  // moderate
  lofi:      0.25,  // jazz — more abrupt changes OK
  flim:      0.30,  // organic
  xtal:      0.20,  // floating, no rush
  syro:      0.15,  // intentional gaps OK
  ambient:   0.10,  // slow, gaps are fine,
  plantasia: 0.10,
};

/**
 * Calculate how much energy is being "released" by fading layers.
 *
 * @param multipliers Current gain multipliers per layer
 * @param targets Target multipliers (1.0 for entering, 0.0 for leaving)
 * @returns Released energy amount (0-1)
 */
export function releasedEnergy(
  multipliers: Record<string, number>,
  targets: Record<string, number>
): number {
  let released = 0;
  for (const [layer, current] of Object.entries(multipliers)) {
    const target = targets[layer] ?? 0;
    if (target < current) {
      // This layer is fading out — releasing energy
      released += (current - target);
    }
  }
  return Math.min(1, released);
}

/**
 * Calculate boost for entering layers based on released energy.
 *
 * @param layerName Name of the layer
 * @param currentMult Current gain multiplier for this layer
 * @param targetMult Target gain multiplier
 * @param released Total released energy from fading layers
 * @param mood Current mood
 * @returns Gain boost multiplier (>= 1.0 for entering layers)
 */
export function transferBoost(
  layerName: string,
  currentMult: number,
  targetMult: number,
  released: number,
  mood: Mood
): number {
  // Only boost layers that are entering (target > current)
  if (targetMult <= currentMult || released <= 0) return 1.0;

  const strength = TRANSFER_STRENGTH[mood];
  const entering = targetMult - currentMult;
  const boost = 1.0 + released * strength * entering;
  return Math.min(1.5, boost);
}

/**
 * Should momentum transfer be applied?
 *
 * @param multipliers Current multipliers
 * @param targets Target multipliers
 * @param mood Current mood
 * @returns Whether to apply
 */
export function shouldTransferMomentum(
  multipliers: Record<string, number>,
  targets: Record<string, number>,
  mood: Mood
): boolean {
  const released = releasedEnergy(multipliers, targets);
  return released > 0.1 && TRANSFER_STRENGTH[mood] > 0.08;
}

/**
 * Get transfer strength for a mood (for testing).
 */
export function transferStrength(mood: Mood): number {
  return TRANSFER_STRENGTH[mood];
}
