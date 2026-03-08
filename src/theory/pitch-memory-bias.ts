/**
 * Pitch memory bias — recently heard pitches attract future selections.
 *
 * Listeners develop short-term memory for pitch. Notes heard recently
 * feel "warmer" and more familiar when repeated, while completely new
 * pitches sound surprising. This module biases note selection toward
 * recently used pitch classes for coherent, memorable melodies.
 *
 * Applied as a note selection weight multiplier.
 */

import type { Mood } from '../types';

/**
 * Per-mood memory strength (higher = more repetition bias).
 */
const MEMORY_STRENGTH: Record<Mood, number> = {
  trance:    0.60,  // strong — repetitive hooks
  avril:     0.45,  // moderate — classical development
  disco:     0.55,  // strong — catchy repetition
  downtempo: 0.40,  // moderate
  blockhead: 0.50,  // strong — hip-hop loops
  lofi:      0.35,  // moderate — jazz explores
  flim:      0.30,  // moderate — Aphex varies
  xtal:      0.25,  // weak — ambient explores
  syro:      0.20,  // weakest — IDM avoids repetition
  ambient:   0.30,  // moderate — meditative repetition
};

/**
 * Calculate selection weight for a pitch class based on recency.
 *
 * @param pitchClass Target pitch class (0-11)
 * @param recentPitches Array of recently used pitch classes (most recent first)
 * @param mood Current mood
 * @returns Weight multiplier (0.8 - 2.0)
 */
export function pitchMemoryWeight(
  pitchClass: number,
  recentPitches: number[],
  mood: Mood
): number {
  const strength = MEMORY_STRENGTH[mood];
  let boost = 0;
  for (let i = 0; i < Math.min(recentPitches.length, 8); i++) {
    if (recentPitches[i] === pitchClass) {
      // More recent = stronger boost, decays exponentially
      boost += Math.pow(0.7, i);
    }
  }
  // Normalize and scale by mood strength
  const normalized = Math.min(2.0, boost);
  return 1.0 + normalized * strength * 0.5;
}

/**
 * Calculate novelty weight — inverse of memory (boosts unheard pitches).
 *
 * @param pitchClass Target pitch class (0-11)
 * @param recentPitches Recently used pitch classes
 * @param mood Current mood
 * @returns Weight multiplier (0.8 - 1.5)
 */
export function noveltyWeight(
  pitchClass: number,
  recentPitches: number[],
  mood: Mood
): number {
  const seen = recentPitches.slice(0, 8).includes(pitchClass);
  if (seen) return 1.0;
  // Unheard pitches get a novelty bonus (inversely scaled by memory strength)
  const noveltyStrength = 1.0 - MEMORY_STRENGTH[mood];
  return 1.0 + noveltyStrength * 0.5;
}

/**
 * Get memory strength for a mood (for testing).
 */
export function memoryStrength(mood: Mood): number {
  return MEMORY_STRENGTH[mood];
}
