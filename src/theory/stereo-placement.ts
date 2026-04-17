/**
 * Stereo placement — distinct pan positions per layer for spatial clarity.
 *
 * When all layers have their pan centered at 0.5 and just wobble,
 * the stereo image collapses into a blob. Real mixes place instruments
 * at distinct pan positions:
 *
 * - Drone/bass: center (low frequencies should be mono)
 * - Harmony: slightly left or right (creates width)
 * - Melody: near center but slightly offset (main voice, prominent)
 * - Arp: opposite side from harmony (creates stereo dialogue)
 * - Texture/drums: center (rhythmic anchor)
 * - Atmosphere: wide (fills the edges)
 *
 * This module provides a pan center offset for each layer,
 * which shifts the existing pan range left or right to create
 * spatial separation between layers.
 */

import type { Mood } from '../types';

/**
 * Get the pan center for a layer (0 = full left, 0.5 = center, 1 = full right).
 *
 * @param layerName  Layer name
 * @param mood       Current mood (affects how wide the placement is)
 * @returns Pan center value (0-1)
 */
export function layerPanCenter(layerName: string, mood: Mood): number {
  const spread = PAN_SPREAD[mood];
  const baseOffset = LAYER_PAN_OFFSET[layerName] ?? 0;
  // Scale the offset by mood spread, keeping center at 0.5
  return 0.5 + baseOffset * spread;
}

/**
 * Adjust a pan range (min, max) to be centered on the layer's position.
 *
 * @param currentMin  Current pan minimum (e.g. 0.3)
 * @param currentMax  Current pan maximum (e.g. 0.7)
 * @param layerName   Layer name
 * @param mood        Current mood
 * @returns [newMin, newMax] adjusted pan range
 */
export function adjustPanRange(
  currentMin: number,
  currentMax: number,
  layerName: string,
  mood: Mood
): [number, number] {
  const center = layerPanCenter(layerName, mood);
  const halfRange = (currentMax - currentMin) / 2;
  const newMin = Math.max(0.05, center - halfRange);
  const newMax = Math.min(0.95, center + halfRange);
  return [newMin, newMax];
}

/**
 * Whether stereo placement should be applied.
 */
export function shouldApplyStereoPlacement(mood: Mood): boolean {
  return PAN_SPREAD[mood] >= 0.05;
}

/**
 * Per-layer pan offset from center (-0.5 to 0.5, where negative = left, positive = right).
 * Drone and texture stay centered. Harmony and arp are placed opposite.
 */
const LAYER_PAN_OFFSET: Record<string, number> = {
  drone:      0.00,    // center — bass frequencies
  harmony:   -0.12,    // slightly left
  melody:     0.08,    // right of center (main voice, separated from drone/texture)
  texture:    0.00,    // center — rhythmic anchor
  arp:        0.15,    // right — opposite harmony
  atmosphere: -0.06,   // slight left — balances melody's right offset
};

/** How much the per-layer offsets are applied per mood (0 = mono, 1 = full spread) */
const PAN_SPREAD: Record<Mood, number> = {
  ambient:   0.80,   // wide — space is the point,
  plantasia: 0.80,
  xtal:      0.75,   // dreamy width
  flim:      0.65,   // delicate spatial detail
  downtempo: 0.60,   // smooth, wide
  lofi:      0.55,   // jazz — moderate width
  avril:     0.50,   // intimate — subtle placement
  blockhead: 0.45,   // hip-hop — some width
  disco:     0.40,   // funky but focused
  syro:      0.35,   // IDM — some spatial games
  trance:    0.25,   // driving — mostly center
};
