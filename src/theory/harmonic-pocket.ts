/**
 * Harmonic pocket — brief breathing space around chord changes.
 *
 * When chords change, a brief thinning of non-essential layers creates
 * a "pocket" that lets the harmonic shift register clearly. Good
 * producers do this instinctively: pull back the arp/texture slightly
 * on the beat of a chord change, then fill back in.
 *
 * This module provides a gain multiplier that dips on the tick of
 * a chord change and recovers over the next few ticks, creating
 * a subtle breathing effect around harmonic transitions.
 *
 * Affected layers: arp, texture (drums), atmosphere
 * Unaffected: drone (foundation), harmony (needs to state the new chord),
 *             melody (needs to articulate over the change)
 */

import type { Mood, Section } from '../types';

/**
 * Gain multiplier for the harmonic pocket effect.
 *
 * @param ticksSinceChange  How many ticks since the last chord change (0 = just changed)
 * @param mood              Current mood
 * @param section           Current section
 * @returns Gain multiplier (< 1 on chord change, recovers to 1.0)
 */
export function pocketGainMultiplier(
  ticksSinceChange: number,
  mood: Mood,
  section: Section
): number {
  const depth = POCKET_DEPTH[mood] * SECTION_POCKET_MULT[section];
  if (depth < 0.02) return 1.0;

  // Exponential recovery: dip on tick 0, recover over ~3 ticks
  if (ticksSinceChange <= 0) return 1.0 - depth;
  if (ticksSinceChange === 1) return 1.0 - depth * 0.4;
  if (ticksSinceChange === 2) return 1.0 - depth * 0.1;
  return 1.0;
}

/**
 * Whether a layer should receive the pocket effect.
 */
export function isPocketLayer(layerName: string): boolean {
  return POCKET_LAYERS.has(layerName);
}

/**
 * Whether the pocket effect should be applied at all.
 */
export function shouldApplyPocket(mood: Mood, section: Section): boolean {
  return POCKET_DEPTH[mood] * SECTION_POCKET_MULT[section] >= 0.03;
}

/**
 * Pocket depth for testing.
 */
export function pocketDepth(mood: Mood, section: Section): number {
  return POCKET_DEPTH[mood] * SECTION_POCKET_MULT[section];
}

/** Layers that thin during chord changes */
const POCKET_LAYERS = new Set(['arp', 'texture', 'atmosphere']);

/** Per-mood pocket depth (how much to thin: 0 = none, 0.5 = halve gain) */
const POCKET_DEPTH: Record<Mood, number> = {
  lofi:      0.30,   // jazz — harmonic changes need space
  downtempo: 0.25,   // smooth — let changes breathe
  blockhead: 0.25,   // hip-hop — pocket around changes
  avril:     0.20,   // intimate — subtle breathing
  flim:      0.20,   // delicate — changes should be noticed
  disco:     0.15,   // groove — slight dip
  xtal:      0.15,   // dreamy — gentle pocket
  syro:      0.10,   // IDM — less conventional phrasing
  ambient:   0.10,   // slow — changes are gradual anyway,
  plantasia: 0.10,
  trance:    0.05,   // driving — minimal pocket (energy must sustain)
};

/** Section multiplier for pocket depth */
const SECTION_POCKET_MULT: Record<Section, number> = {
  groove:    1.2,    // settled — pockets in the groove feel great
  build:     1.0,    // building — normal pocketing
  peak:      0.7,    // climax — minimal thinning (full energy)
  breakdown: 1.3,    // sparse — changes are exposed, pockets matter
  intro:     0.8,    // establishing — moderate
};
