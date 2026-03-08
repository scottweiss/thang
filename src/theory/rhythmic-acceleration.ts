/**
 * Rhythmic acceleration — pattern speed evolves with section progress.
 *
 * One of the most powerful compositional devices in music: gradually
 * increasing rhythmic density during builds (speeding up subdivisions)
 * and relaxing during breakdowns (stretching out). This creates physical
 * excitement without changing tempo — the pulse stays constant but the
 * "busyness" of patterns evolves.
 *
 * Applied as a multiplier to .slow() values in post-processing.
 * Values < 1.0 = pattern speeds up, > 1.0 = pattern slows down.
 *
 * Different layers accelerate at different rates:
 * - Arp/texture: strong effect (most noticeable, like hi-hats speeding up)
 * - Melody: moderate effect (phrases get more urgent)
 * - Harmony/drone/atmosphere: minimal effect (anchors stay stable)
 */

import type { Section } from '../types';

interface AccelerationShape {
  startMult: number;  // .slow() multiplier at section start
  endMult: number;    // .slow() multiplier at section end
}

/**
 * Per-layer acceleration curves for each section.
 * Values < 1.0 mean pattern plays faster, > 1.0 means slower.
 */
const LAYER_ACCELERATION: Record<string, Record<Section, AccelerationShape>> = {
  arp: {
    intro:     { startMult: 1.0,  endMult: 1.0 },
    build:     { startMult: 1.0,  endMult: 0.65 },   // speeds up 35% by end of build
    peak:      { startMult: 0.75, endMult: 0.7 },     // stays fast
    breakdown: { startMult: 0.8,  endMult: 1.3 },     // gradually slows back down
    groove:    { startMult: 1.0,  endMult: 1.0 },     // stable
  },
  texture: {
    intro:     { startMult: 1.0,  endMult: 1.0 },
    build:     { startMult: 1.0,  endMult: 0.7 },     // hi-hats speed up in builds
    peak:      { startMult: 0.8,  endMult: 0.75 },    // stays driving
    breakdown: { startMult: 0.85, endMult: 1.2 },     // relaxes
    groove:    { startMult: 1.0,  endMult: 1.0 },
  },
  melody: {
    intro:     { startMult: 1.0,  endMult: 1.0 },
    build:     { startMult: 1.0,  endMult: 0.85 },    // phrases get slightly more urgent
    peak:      { startMult: 0.9,  endMult: 0.9 },     // stays energetic
    breakdown: { startMult: 0.95, endMult: 1.15 },    // stretches out
    groove:    { startMult: 1.0,  endMult: 1.0 },
  },
  harmony: {
    intro:     { startMult: 1.0,  endMult: 1.0 },
    build:     { startMult: 1.0,  endMult: 0.95 },    // barely noticeable
    peak:      { startMult: 0.95, endMult: 0.95 },
    breakdown: { startMult: 1.0,  endMult: 1.05 },
    groove:    { startMult: 1.0,  endMult: 1.0 },
  },
};

// Drone and atmosphere don't accelerate — they're anchors
const STABLE: Record<Section, AccelerationShape> = {
  intro:     { startMult: 1.0, endMult: 1.0 },
  build:     { startMult: 1.0, endMult: 1.0 },
  peak:      { startMult: 1.0, endMult: 1.0 },
  breakdown: { startMult: 1.0, endMult: 1.0 },
  groove:    { startMult: 1.0, endMult: 1.0 },
};

/**
 * Compute the .slow() multiplier for a layer at a given section progress.
 *
 * @param layerName  Name of the layer
 * @param section    Current section
 * @param progress   0-1 section progress
 * @returns Multiplier for .slow() values (0.65-1.3)
 */
export function slowMultiplier(
  layerName: string,
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shapes = LAYER_ACCELERATION[layerName] ?? STABLE;
  const shape = shapes[section] ?? { startMult: 1.0, endMult: 1.0 };

  // Ease-in-out for smooth transitions (cubic)
  const t = p < 0.5
    ? 4 * p * p * p
    : 1 - Math.pow(-2 * p + 2, 3) / 2;

  return shape.startMult + (shape.endMult - shape.startMult) * t;
}

/**
 * Whether rhythmic acceleration is meaningful for this section.
 * Only sections with significant rhythmic change benefit.
 */
export function shouldApplyRhythmicAcceleration(
  layerName: string,
  section: Section
): boolean {
  const shapes = LAYER_ACCELERATION[layerName] ?? STABLE;
  const shape = shapes[section] ?? { startMult: 1.0, endMult: 1.0 };
  return Math.abs(shape.endMult - shape.startMult) > 0.06;
}
