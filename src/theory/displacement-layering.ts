/**
 * Displacement layering — offset layers by different amounts for polyrhythmic texture.
 *
 * When multiple layers play similar patterns but at slightly different
 * phase offsets, it creates rich polyrhythmic texture. This module
 * calculates per-layer displacement amounts that create interesting
 * phase relationships without destroying coherence.
 *
 * Applied as .late() offset for polyrhythmic layering.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood displacement depth (higher = more displacement allowed).
 */
const DISPLACEMENT_DEPTH: Record<Mood, number> = {
  trance:    0.10,  // low — tight grid
  avril:     0.25,  // moderate — rubato
  disco:     0.08,  // low — locked groove
  downtempo: 0.35,  // moderate — relaxed feel
  blockhead: 0.20,  // moderate — shuffle
  lofi:      0.40,  // high — lazy feel
  flim:      0.45,  // high — glitchy phasing
  xtal:      0.50,  // highest — crystalline phasing
  syro:      0.55,  // highest — phase chaos
  ambient:   0.30,  // moderate — gentle phasing
};

/**
 * Layer-specific displacement ratios.
 * Different ratios create non-coinciding phase patterns.
 */
const LAYER_RATIOS: Record<string, number> = {
  drone: 0,        // anchor — no displacement
  harmony: 0.15,   // slight lead
  melody: 0.30,    // moderate offset
  texture: 0.50,   // half-beat offset
  arp: 0.67,       // 2/3 offset (creates triplet feel)
  atmosphere: 0.10, // slight offset
};

/**
 * Calculate displacement offset for a layer.
 *
 * @param layerName Layer identifier
 * @param mood Current mood
 * @param section Current section
 * @returns Displacement in seconds (0.0 - 0.08)
 */
export function layerDisplacement(
  layerName: string,
  mood: Mood,
  section: Section
): number {
  const depth = DISPLACEMENT_DEPTH[mood];
  const ratio = LAYER_RATIOS[layerName] ?? 0;

  // Reduce displacement during peaks for tighter ensemble
  const sectionScale = section === 'peak' ? 0.5 : section === 'intro' ? 0.6 : 1.0;

  return ratio * depth * sectionScale * 0.08; // max ~80ms
}

/**
 * Get displacement depth for a mood (for testing).
 */
export function displacementDepth(mood: Mood): number {
  return DISPLACEMENT_DEPTH[mood];
}
