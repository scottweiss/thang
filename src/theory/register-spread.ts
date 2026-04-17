/**
 * Register spread dynamics — octave range expands/contracts with tension.
 *
 * In orchestral and electronic arrangement, the overall pitch spread
 * communicates intensity:
 * - Low tension: notes cluster in a narrow range (intimate, focused)
 * - High tension: notes spread across wide range (powerful, epic)
 * - Breakdowns: range narrows (introspective)
 * - Peaks: range maximizes (full energy)
 *
 * This adjusts each layer's octave range boundaries based on tension
 * and section, creating a breathing sense of space in the vertical
 * (pitch) dimension.
 */

import type { Mood, Section } from '../types';

/**
 * Compute octave range adjustment for a layer based on tension and section.
 * Returns [lowDelta, highDelta] — how many octaves to shift the low/high bounds.
 * Negative lowDelta = expand down, positive highDelta = expand up.
 *
 * @param layer    Layer name
 * @param tension  Overall tension 0-1
 * @param section  Current section
 * @param mood     Current mood
 * @returns [lowOctaveDelta, highOctaveDelta]
 */
export function registerSpreadDelta(
  layer: string,
  tension: number,
  section: Section,
  mood: Mood
): [number, number] {
  const depth = MOOD_SPREAD_DEPTH[mood];
  const sectionBias = SECTION_SPREAD_BIAS[section];

  // Combined spread factor: -1 (narrow) to +1 (wide)
  const factor = ((tension - 0.5) * 2 + sectionBias) * depth;

  // Different layers spread differently
  const layerScale = LAYER_SPREAD_SCALE[layer] ?? 0.3;

  // Low bound: negative factor pushes it down (expand range)
  const lowDelta = factor > 0 ? -Math.round(factor * layerScale) : 0;
  // High bound: positive factor pushes it up
  const highDelta = factor > 0 ? Math.round(factor * layerScale) : 0;

  return [lowDelta, highDelta];
}

/**
 * Apply register spread to an octave range, clamping to safe bounds.
 */
export function applyRegisterSpread(
  baseLow: number,
  baseHigh: number,
  layer: string,
  tension: number,
  section: Section,
  mood: Mood
): [number, number] {
  const [lowD, highD] = registerSpreadDelta(layer, tension, section, mood);
  const newLow = Math.max(1, baseLow + lowD);
  const newHigh = Math.min(7, baseHigh + highD);
  // Ensure at least 1 octave range
  if (newHigh <= newLow) return [newLow, newLow + 1];
  return [newLow, newHigh];
}

/**
 * Whether register spread adjustment should be applied.
 */
export function shouldApplyRegisterSpread(mood: Mood): boolean {
  return MOOD_SPREAD_DEPTH[mood] > 0.1;
}

/** How strongly each mood responds to spread dynamics */
const MOOD_SPREAD_DEPTH: Record<Mood, number> = {
  ambient:   0.4,   // moderate — keep things ethereal,
  plantasia: 0.4,
  downtempo: 0.5,   // moderate
  lofi:      0.3,   // subtle — intimate genre
  trance:    0.7,   // strong — builds need wide spreads
  avril:     0.2,   // minimal — intimate, small range
  xtal:      0.4,   // moderate — dreamy expansion
  syro:      0.6,   // strong — maximalist IDM
  blockhead: 0.5,   // moderate
  flim:      0.3,   // subtle
  disco:     0.5,   // moderate
};

/** Section bias: positive = expand, negative = contract */
const SECTION_SPREAD_BIAS: Record<Section, number> = {
  intro:     -0.3,  // narrow — establishing
  build:      0.2,  // expanding
  peak:       0.5,  // widest
  breakdown: -0.4,  // contracting — introspective
  groove:     0.1,  // slightly expanded
};

/** Per-layer spread sensitivity */
const LAYER_SPREAD_SCALE: Record<string, number> = {
  melody:  0.4,  // melody can expand/contract moderately
  arp:     0.5,  // arp has most spread variation
  harmony: 0.3,  // harmony shifts less (anchor)
  drone:   0.1,  // drone barely moves (foundation)
};
