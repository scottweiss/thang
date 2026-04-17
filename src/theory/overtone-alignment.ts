/**
 * Overtone alignment — tune FM ratios to reinforce shared overtones.
 *
 * When multiple layers sound simultaneously, their FM synthesis
 * parameters can either reinforce or clash spectrally. This module
 * calculates optimal fmh ratios that create reinforcing overtone
 * relationships between active layers, producing a richer, more
 * coherent sound.
 *
 * Integer fmh ratios (1, 2, 3) create harmonic partials.
 * Non-integer ratios create inharmonic, bell-like tones.
 * This module nudges fmh toward integer relationships when
 * coherence is desired, and away when variety is needed.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood preference for overtone coherence.
 * Higher = stronger preference for aligned partials.
 */
const COHERENCE_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // strong harmonic alignment
  avril:     0.45,  // warm, coherent
  disco:     0.40,  // bright, aligned
  downtempo: 0.35,  // moderate
  blockhead: 0.25,  // some grit OK
  lofi:      0.30,  // jazz — some inharmonicity
  flim:      0.20,  // organic, imperfect
  xtal:      0.15,  // bell-like, inharmonic OK
  syro:      0.10,  // intentionally complex spectrum
  ambient:   0.40,  // pure, meditative,
  plantasia: 0.40,
};

/**
 * Section multiplier for coherence.
 */
const SECTION_COHERENCE: Record<Section, number> = {
  intro:     1.2,   // pure, establishing
  build:     0.9,   // growing complexity
  peak:      1.0,   // strong but not sparse
  breakdown: 1.3,   // return to purity
  groove:    0.8,   // some grit is groove
};

/**
 * Snap an fmh value toward the nearest integer ratio.
 *
 * @param fmh Current fmh value
 * @param strength How strongly to snap (0 = no change, 1 = full snap)
 * @returns Adjusted fmh value
 */
export function snapToHarmonic(fmh: number, strength: number): number {
  const nearest = Math.round(fmh);
  if (nearest === 0) return fmh; // don't snap to 0
  return fmh + (nearest - fmh) * strength;
}

/**
 * Calculate the optimal fmh adjustment for a layer given active layers' fmh values.
 * Nudges toward ratios that create reinforcing overtones.
 *
 * @param layerFmh This layer's current fmh
 * @param otherFmhValues Other active layers' fmh values
 * @param mood Current mood
 * @param section Current section
 * @returns Adjusted fmh value
 */
export function alignedFmh(
  layerFmh: number,
  otherFmhValues: number[],
  mood: Mood,
  section: Section
): number {
  const strength = COHERENCE_STRENGTH[mood] * SECTION_COHERENCE[section];
  if (strength < 0.05 || otherFmhValues.length === 0) return layerFmh;

  // First, snap toward nearest integer
  let adjusted = snapToHarmonic(layerFmh, strength * 0.5);

  // Then, nudge toward simple ratios with other layers
  for (const other of otherFmhValues) {
    if (other <= 0) continue;
    const ratio = adjusted / other;
    const nearestSimple = Math.round(ratio * 2) / 2; // snap to halves
    if (nearestSimple > 0) {
      const idealFmh = other * nearestSimple;
      adjusted += (idealFmh - adjusted) * strength * 0.3;
    }
  }

  return Math.max(0.5, adjusted);
}

/**
 * Should overtone alignment be applied?
 *
 * @param mood Current mood
 * @param activeLayerCount Number of active layers
 * @returns Whether to apply
 */
export function shouldAlignOvertones(mood: Mood, activeLayerCount: number): boolean {
  // Only meaningful with 2+ sounding layers
  if (activeLayerCount < 2) return false;
  return COHERENCE_STRENGTH[mood] > 0.12;
}

/**
 * Get coherence strength for a mood (for testing).
 */
export function coherenceStrength(mood: Mood): number {
  return COHERENCE_STRENGTH[mood];
}
