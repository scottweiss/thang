/**
 * Chord anticipation delay — layers arrive at chord changes at
 * different times for a "wave" effect.
 *
 * Instead of all layers snapping to a new chord simultaneously,
 * some layers arrive slightly early (anticipation) and others
 * slightly late (delay), creating a natural "wave" of harmonic
 * change that feels alive and organic.
 *
 * Different from staggered-changes (which is about whether a layer
 * sees the new chord at all) — this is about *timing offset* of
 * the chord change within layers that do accept it.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood spread (max timing offset in seconds).
 */
const SPREAD: Record<Mood, number> = {
  trance:    0.02,  // very tight
  avril:     0.06,  // classical rubato spread
  disco:     0.03,  // tight groove
  downtempo: 0.08,  // loose feel
  blockhead: 0.05,  // moderate chop
  lofi:      0.10,  // wide jazz spread
  flim:      0.09,  // organic looseness
  xtal:      0.07,  // floating
  syro:      0.04,  // controlled
  ambient:   0.12,  // maximum spread,
  plantasia: 0.12,
};

/**
 * Layer timing role (early/late tendency).
 */
const LAYER_OFFSET: Record<string, number> = {
  drone:      -0.3,   // anticipates changes
  harmony:     0.0,   // on time (reference)
  melody:      0.2,   // slightly late (singing behind)
  texture:    -0.5,   // early anticipation
  arp:         0.4,   // latest (arpeggiated after change)
  atmosphere: -0.2,   // slightly early (wash)
};

/**
 * Calculate chord change timing offset for a layer.
 *
 * @param layerName Name of the layer
 * @param mood Current mood
 * @param section Current section
 * @returns Timing offset in seconds (positive = late, negative = early)
 */
export function chordTimingOffset(
  layerName: string,
  mood: Mood,
  section: Section
): number {
  const spread = SPREAD[mood];
  const layerTendency = LAYER_OFFSET[layerName] ?? 0;

  const sectionMult: Record<Section, number> = {
    intro:     0.5,   // tighter at intro
    build:     0.7,   // moderate
    peak:      0.4,   // tightest for impact
    breakdown: 1.3,   // loosest
    groove:    1.0,
  };

  return spread * layerTendency * (sectionMult[section] ?? 1.0);
}

/**
 * Should chord timing spread be applied?
 */
export function shouldApplyChordTiming(mood: Mood, section: Section): boolean {
  return SPREAD[mood] > 0.025;
}

/**
 * Get spread for a mood (for testing).
 */
export function chordSpread(mood: Mood): number {
  return SPREAD[mood];
}
