import type { Mood } from '../types';

/**
 * Layer entry smoothing — when a layer first enters (gain multiplier
 * is low/rising), soften its attack to prevent harsh transients.
 * Creates smooth fade-in character rather than sudden appearance.
 */

const moodSmoothing: Record<Mood, number> = {
  ambient: 0.60,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.25,
  avril: 0.40,
  xtal: 0.50,
  syro: 0.30,
  blockhead: 0.20,
  flim: 0.45,
  disco: 0.20,
};

/**
 * Attack multiplier for entering layers.
 * gainMultiplier: current section gain multiplier (0-1, < 0.5 means entering)
 * Returns > 1.0 to lengthen attack during fade-in.
 */
export function entryAttackMultiplier(
  gainMultiplier: number,
  mood: Mood,
): number {
  if (gainMultiplier >= 0.8) return 1.0; // fully established
  const smoothing = moodSmoothing[mood];
  // Lower gain multiplier → longer attack
  const fadePhase = 1.0 - gainMultiplier / 0.8; // 1.0 at entry, 0 at established
  const extension = fadePhase * smoothing * 0.20;
  return Math.min(1.15, 1.0 + extension);
}

/** Per-mood smoothing for testing */
export function smoothingDepth(mood: Mood): number {
  return moodSmoothing[mood];
}
