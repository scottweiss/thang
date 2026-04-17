/**
 * Micro-pause anticipation — tiny gaps before strong beats for anticipation.
 *
 * In expressive music, there's often a tiny silence (breath) before
 * important beats. This creates anticipation and makes the downbeat
 * feel more impactful. Like a drummer pulling back slightly before
 * a fill, or a singer breathing before a phrase.
 *
 * Applied as gain dip immediately before strong beats.
 */

import type { Mood } from '../types';

/**
 * Per-mood pause depth (higher = more pronounced pauses).
 */
const PAUSE_DEPTH: Record<Mood, number> = {
  trance:    0.15,  // low — machine-like
  avril:     0.50,  // high — classical breathing
  disco:     0.20,  // low — locked groove
  downtempo: 0.45,  // moderate — relaxed breathing
  blockhead: 0.35,  // moderate — hip-hop breath
  lofi:      0.55,  // highest — lazy breath
  flim:      0.40,  // moderate
  xtal:      0.45,  // moderate
  syro:      0.25,  // low
  ambient:   0.60,  // highest — spacious pauses,
  plantasia: 0.60,
};

/**
 * Calculate micro-pause gain reduction.
 * Positions just before strong beats get gain dips.
 *
 * @param position Beat position (0-15)
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.0)
 */
export function microPauseGain(
  position: number,
  mood: Mood
): number {
  const depth = PAUSE_DEPTH[mood];
  const pos = ((position % 16) + 16) % 16;

  // Position 15 = just before downbeat
  // Position 7 = just before backbeat
  // Position 3, 11 = just before quarter beats
  let pauseStrength = 0;
  if (pos === 15) pauseStrength = 1.0;      // before downbeat
  else if (pos === 7) pauseStrength = 0.6;   // before backbeat
  else if (pos === 3 || pos === 11) pauseStrength = 0.3; // before quarters

  const reduction = pauseStrength * depth * 0.25;
  return Math.max(0.85, 1.0 - reduction);
}

/**
 * Get pause depth for a mood (for testing).
 */
export function pauseDepth(mood: Mood): number {
  return PAUSE_DEPTH[mood];
}
