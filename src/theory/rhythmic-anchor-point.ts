/**
 * Rhythmic anchor point — strong beats get stability emphasis.
 *
 * Every groove needs anchor points — beats where the listener
 * feels grounded. This module provides gain emphasis on
 * metrically strong positions, creating a reliable pulse
 * that the ear can lock onto.
 */

import type { Mood } from '../types';

/**
 * Per-mood anchor strength (higher = more emphasis on strong beats).
 */
const ANCHOR_STRENGTH: Record<Mood, number> = {
  trance:    0.60,  // highest — locked pulse
  avril:     0.40,  // moderate — classical flexibility
  disco:     0.55,  // high — dance groove
  downtempo: 0.35,  // moderate — relaxed
  blockhead: 0.50,  // high — hip-hop anchor
  lofi:      0.30,  // low — lazy timing
  flim:      0.25,  // low — IDM freedom
  xtal:      0.20,  // low — floating
  syro:      0.15,  // lowest — deliberately unanchored
  ambient:   0.10,  // lowest — timeless
};

/**
 * Calculate anchor point gain for a beat position.
 *
 * @param position Beat position (0-15)
 * @param mood Current mood
 * @returns Gain multiplier (0.95 - 1.08)
 */
export function anchorPointGain(
  position: number,
  mood: Mood
): number {
  const strength = ANCHOR_STRENGTH[mood];
  const pos = ((position % 16) + 16) % 16;

  // Strong beats: 0 (downbeat) and 8 (beat 3)
  let anchorWeight = 0;
  if (pos === 0) anchorWeight = 1.0;
  else if (pos === 8) anchorWeight = 0.7;
  else if (pos === 4 || pos === 12) anchorWeight = 0.4;

  const boost = anchorWeight * strength * 0.10;
  return Math.max(0.95, Math.min(1.08, 1.0 + boost));
}

/**
 * Get anchor strength for a mood (for testing).
 */
export function anchorStrength(mood: Mood): number {
  return ANCHOR_STRENGTH[mood];
}
