/**
 * Onset density balance — balance note timing across layers.
 *
 * When too many layers have note onsets at the same beat position,
 * the result is cluttered. This module provides gain reduction for
 * positions where onset density is high, encouraging layers to
 * stagger their attacks.
 */

import type { Mood } from '../types';

/**
 * Per-mood balance sensitivity (higher = more onset separation).
 */
const BALANCE_SENSITIVITY: Record<Mood, number> = {
  trance:    0.30,  // low — unison hits are OK
  avril:     0.50,  // moderate — orchestral clarity
  disco:     0.25,  // low — downbeat hits are the groove
  downtempo: 0.55,  // high — careful onset placement
  blockhead: 0.45,  // moderate
  lofi:      0.60,  // highest — intimate clarity
  flim:      0.55,  // high — delicate separation
  xtal:      0.50,  // moderate
  syro:      0.40,  // moderate
  ambient:   0.65,  // highest — space between events,
  plantasia: 0.65,
};

/**
 * Calculate onset density balance gain.
 *
 * @param layersOnBeat Number of layers with onsets on this beat
 * @param totalLayers Total active layers
 * @param mood Current mood
 * @returns Gain multiplier (0.88 - 1.0)
 */
export function onsetBalanceGain(
  layersOnBeat: number,
  totalLayers: number,
  mood: Mood
): number {
  const sensitivity = BALANCE_SENSITIVITY[mood];
  const total = Math.max(1, totalLayers);

  // Ratio of layers hitting this beat
  const density = layersOnBeat / total;

  // High density = reduction
  if (density <= 0.5) return 1.0;

  const excess = density - 0.5;
  const reduction = excess * sensitivity * 0.25;
  return Math.max(0.88, 1.0 - reduction);
}

/**
 * Get balance sensitivity for a mood (for testing).
 */
export function balanceSensitivity(mood: Mood): number {
  return BALANCE_SENSITIVITY[mood];
}
