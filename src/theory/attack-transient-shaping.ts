/**
 * Attack transient shaping — vary note attack sharpness by position and mood.
 *
 * Downbeats deserve crisp attacks for clarity. Off-beats can be softer
 * for a relaxed feel. Different moods have different attack character:
 * blockhead wants punchy, ambient wants smooth.
 *
 * Applied as attack time multiplier on layer envelopes.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood attack sharpness (higher = sharper default attacks).
 */
const ATTACK_SHARPNESS: Record<Mood, number> = {
  trance:    0.50,  // moderate — clean
  avril:     0.45,  // moderate — refined
  disco:     0.55,  // sharp — punchy groove
  downtempo: 0.35,  // soft — relaxed
  blockhead: 0.65,  // sharpest — aggressive
  lofi:      0.30,  // soft — vintage
  flim:      0.40,  // moderate — delicate
  xtal:      0.35,  // soft — crystalline
  syro:      0.45,  // moderate
  ambient:   0.20,  // softest — smooth
};

/**
 * Calculate attack multiplier based on beat position.
 * Lower multiplier = faster attack (sharper).
 *
 * @param beatPosition Position in 16-step grid (0-15)
 * @param mood Current mood
 * @returns Attack multiplier (0.5 - 2.0, where 1.0 = normal)
 */
export function attackMultiplier(
  beatPosition: number,
  mood: Mood
): number {
  const sharpness = ATTACK_SHARPNESS[mood];
  const pos = beatPosition % 16;

  // Downbeats get sharper attacks
  let positionFactor: number;
  if (pos === 0 || pos === 8) {
    positionFactor = 0.7; // sharp
  } else if (pos === 4 || pos === 12) {
    positionFactor = 0.85; // medium-sharp
  } else if (pos % 2 === 0) {
    positionFactor = 1.0; // normal
  } else {
    positionFactor = 1.2; // soft
  }

  // Combine with mood sharpness
  const base = positionFactor * (1.5 - sharpness);
  return Math.max(0.5, Math.min(2.0, base));
}

/**
 * Get attack sharpness for a mood (for testing).
 */
export function attackSharpness(mood: Mood): number {
  return ATTACK_SHARPNESS[mood];
}
