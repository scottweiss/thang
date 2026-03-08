/**
 * Dynamic chorus depth — detuning that evolves with section progress.
 *
 * Subtle pitch detuning creates warmth and width (chorus effect) in
 * synthesized sounds. During peaks, more detuning = richer, fatter
 * sound. During intros/breakdowns, less detuning = cleaner, more
 * intimate. This mirrors how real producers automate chorus/ensemble
 * effects across a track.
 *
 * Applied via Strudel's .detune() parameter (cents offset).
 * Typical musical range: ±2-12 cents. Above ±20 sounds out of tune.
 *
 * Different layers get different amounts:
 * - Harmony/arp: most detuning (pads and arps benefit from width)
 * - Melody: minimal (lead needs to stay in tune and present)
 * - Drone/texture/atmosphere: none (bass should be clean, drums/atmos are noise-based)
 */

import type { Section } from '../types';

interface ChorusShape {
  startCents: number;  // detune amount at section start
  endCents: number;    // detune amount at section end
}

/**
 * Per-layer chorus depth curves for each section.
 * Values are max detune in cents (applied as ±range).
 */
const LAYER_CHORUS: Record<string, Record<Section, ChorusShape>> = {
  harmony: {
    intro:     { startCents: 1,  endCents: 2 },
    build:     { startCents: 2,  endCents: 6 },   // builds add warmth
    peak:      { startCents: 6,  endCents: 8 },    // richest at peak
    breakdown: { startCents: 5,  endCents: 2 },    // gradually cleans up
    groove:    { startCents: 3,  endCents: 4 },    // moderate warmth
  },
  arp: {
    intro:     { startCents: 0,  endCents: 1 },
    build:     { startCents: 1,  endCents: 4 },
    peak:      { startCents: 4,  endCents: 5 },
    breakdown: { startCents: 3,  endCents: 1 },
    groove:    { startCents: 2,  endCents: 2 },
  },
  melody: {
    intro:     { startCents: 0,  endCents: 0 },
    build:     { startCents: 0,  endCents: 2 },
    peak:      { startCents: 2,  endCents: 3 },    // slight richness
    breakdown: { startCents: 1,  endCents: 0 },
    groove:    { startCents: 1,  endCents: 1 },
  },
};

// Drone, texture, atmosphere don't get chorus
const NO_CHORUS: Record<Section, ChorusShape> = {
  intro:     { startCents: 0, endCents: 0 },
  build:     { startCents: 0, endCents: 0 },
  peak:      { startCents: 0, endCents: 0 },
  breakdown: { startCents: 0, endCents: 0 },
  groove:    { startCents: 0, endCents: 0 },
};

/**
 * Compute the chorus depth (detune amount in cents) for a layer.
 *
 * @param layerName  Name of the layer
 * @param section    Current section
 * @param progress   0-1 section progress
 * @returns Detune amount in cents (0-8)
 */
export function chorusDepth(
  layerName: string,
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shapes = LAYER_CHORUS[layerName] ?? NO_CHORUS;
  const shape = shapes[section] ?? { startCents: 0, endCents: 0 };

  return shape.startCents + (shape.endCents - shape.startCents) * p;
}

/**
 * Whether chorus should be applied for this layer/section.
 */
export function shouldApplyChorus(
  layerName: string,
  section: Section
): boolean {
  const shapes = LAYER_CHORUS[layerName] ?? NO_CHORUS;
  const shape = shapes[section] ?? { startCents: 0, endCents: 0 };
  return Math.max(shape.startCents, shape.endCents) >= 1;
}
