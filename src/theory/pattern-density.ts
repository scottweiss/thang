/**
 * Pattern density control via degradation — thinning and filling note patterns.
 *
 * Strudel's `degradeBy(amount)` randomly removes events from a pattern,
 * where 0 = keep everything, 1 = remove everything. By varying this amount
 * based on section and progress, we create natural rhythmic breathing:
 *
 * - Intros are sparse — many notes dropped
 * - Builds gradually fill in as density increases
 * - Peaks play at full density
 * - Breakdowns thin out again
 *
 * Different layers get different degradation — drone and atmosphere are
 * never degraded (they're pads/textures, not rhythmic patterns).
 * Arp and melody benefit most from this technique.
 */

import type { Section } from '../types';

interface DegradeShape {
  /** Degradation amount at section start (0 = full, 1 = silent) */
  startDegrade: number;
  /** Degradation amount at section end */
  endDegrade: number;
}

const NO_DEGRADE: DegradeShape = { startDegrade: 0, endDegrade: 0 };

/**
 * Per-layer degradation curves for each section.
 * Higher values = more notes removed.
 */
const LAYER_DEGRADE: Record<string, Record<Section, DegradeShape>> = {
  melody: {
    intro: { startDegrade: 0.25, endDegrade: 0.15 },
    build: { startDegrade: 0.1, endDegrade: 0.0 },
    peak: NO_DEGRADE,
    breakdown: { startDegrade: 0.0, endDegrade: 0.15 },
    groove: NO_DEGRADE,
  },
  arp: {
    intro: { startDegrade: 0.3, endDegrade: 0.2 },
    build: { startDegrade: 0.15, endDegrade: 0.0 },
    peak: NO_DEGRADE,
    breakdown: { startDegrade: 0.05, endDegrade: 0.2 },
    groove: NO_DEGRADE,
  },
  harmony: {
    intro: { startDegrade: 0.1, endDegrade: 0.05 },
    build: { startDegrade: 0.05, endDegrade: 0.0 },
    peak: NO_DEGRADE,
    breakdown: { startDegrade: 0.0, endDegrade: 0.1 },
    groove: NO_DEGRADE,
  },
  texture: {
    intro: { startDegrade: 0.15, endDegrade: 0.1 },
    build: { startDegrade: 0.1, endDegrade: 0.0 },
    peak: NO_DEGRADE,
    breakdown: { startDegrade: 0.0, endDegrade: 0.15 },
    groove: NO_DEGRADE,
  },
};

/**
 * Compute degradation amount for a layer at a given section/progress.
 *
 * @param layerName  Layer name (drone, atmosphere, etc.)
 * @param section    Current section
 * @param progress   Section progress (0-1)
 * @returns Degradation amount 0-1 (0 = full density, 1 = silence)
 */
export function patternDegrade(
  layerName: string,
  section: Section,
  progress: number
): number {
  const shapes = LAYER_DEGRADE[layerName];
  if (!shapes) return 0;

  const shape = shapes[section] ?? NO_DEGRADE;
  const p = Math.max(0, Math.min(1, progress));

  return shape.startDegrade + (shape.endDegrade - shape.startDegrade) * p;
}

/**
 * Whether degradation should be applied for this layer/section.
 */
export function shouldApplyDegrade(
  layerName: string,
  section: Section
): boolean {
  const shapes = LAYER_DEGRADE[layerName];
  if (!shapes) return false;

  const shape = shapes[section] ?? NO_DEGRADE;
  return shape.startDegrade > 0.03 || shape.endDegrade > 0.03;
}
