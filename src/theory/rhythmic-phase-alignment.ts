/**
 * Rhythmic phase alignment — detect and emphasize moments when layers align.
 *
 * When multiple layers' rhythmic patterns converge on the same beat,
 * it creates a powerful accent — like an ensemble hitting together.
 * This module detects phase alignment moments and provides gain boost.
 *
 * Applied as gain emphasis at phase-aligned positions.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood alignment emphasis (higher = more boost at convergence).
 */
const ALIGNMENT_EMPHASIS: Record<Mood, number> = {
  trance:    0.55,  // strong — ensemble hits
  avril:     0.50,  // strong — orchestral tutti
  disco:     0.45,  // moderate — groove hits
  downtempo: 0.35,  // moderate
  blockhead: 0.60,  // strongest — punchy hits
  lofi:      0.30,  // low — laid back
  flim:      0.25,  // low — delicate
  xtal:      0.30,  // low — ethereal
  syro:      0.20,  // weakest — avoid alignment
  ambient:   0.15,  // weakest — flowing,
  plantasia: 0.15,
};

/**
 * Detect phase alignment from layer beat positions.
 *
 * @param layerPositions Array of beat positions (0-15) for each active layer
 * @returns Alignment score (0.0 = no alignment, 1.0 = all aligned)
 */
export function phaseAlignmentScore(layerPositions: number[]): number {
  if (layerPositions.length <= 1) return 0;

  // Count how many layers share the same position
  const posMap = new Map<number, number>();
  for (const pos of layerPositions) {
    posMap.set(pos, (posMap.get(pos) ?? 0) + 1);
  }

  const maxOverlap = Math.max(...posMap.values());
  return (maxOverlap - 1) / (layerPositions.length - 1);
}

/**
 * Gain boost for phase-aligned moments.
 *
 * @param activeLayerCount Number of active layers
 * @param alignedCount Number of layers on the same beat
 * @param mood Current mood
 * @returns Gain multiplier (1.0 - 1.15)
 */
export function alignmentGainBoost(
  activeLayerCount: number,
  alignedCount: number,
  mood: Mood
): number {
  if (alignedCount <= 1 || activeLayerCount <= 1) return 1.0;

  const emphasis = ALIGNMENT_EMPHASIS[mood];
  const ratio = (alignedCount - 1) / (activeLayerCount - 1);
  const boost = ratio * emphasis * 0.3;

  return Math.max(1.0, Math.min(1.15, 1.0 + boost));
}

/**
 * Get alignment emphasis for a mood (for testing).
 */
export function alignmentEmphasis(mood: Mood): number {
  return ALIGNMENT_EMPHASIS[mood];
}
