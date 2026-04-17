/**
 * Harmonic suspension tension — suspended chords build anticipation.
 *
 * Sus2 and sus4 chords create tension by withholding the third.
 * This unresolved quality deserves a slight gain swell that builds
 * anticipation for the resolution. When the sus resolves to major
 * or minor, the gain relaxes.
 */

import type { Mood, ChordQuality } from '../types';

/**
 * Per-mood suspension sensitivity.
 */
const SUSPENSION_SENSITIVITY: Record<Mood, number> = {
  trance:    0.50,  // high — suspensions are dramatic
  avril:     0.60,  // highest — classical suspensions
  disco:     0.35,  // moderate
  downtempo: 0.45,  // moderate
  blockhead: 0.30,  // low
  lofi:      0.55,  // high — jazz suspensions
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.25,  // low — suspensions are normal
  ambient:   0.50,  // high — suspensions float beautifully,
  plantasia: 0.50,
};

/**
 * Calculate suspension tension gain.
 *
 * @param quality Current chord quality
 * @param ticksHeld How long this chord has been held
 * @param mood Current mood
 * @returns Gain multiplier (0.97 - 1.08)
 */
export function suspensionTensionGain(
  quality: ChordQuality,
  ticksHeld: number,
  mood: Mood
): number {
  const sensitivity = SUSPENSION_SENSITIVITY[mood];
  const isSuspended = quality === 'sus2' || quality === 'sus4';

  if (!isSuspended) return 1.0;

  // Tension builds over ticks (diminishing returns)
  const ticks = Math.max(0, ticksHeld);
  const tensionBuild = 1.0 - Math.exp(-ticks * 0.4);

  const boost = tensionBuild * sensitivity * 0.12;
  return Math.max(0.97, Math.min(1.08, 1.0 + boost));
}

/**
 * Get suspension sensitivity for a mood (for testing).
 */
export function suspensionSensitivity(mood: Mood): number {
  return SUSPENSION_SENSITIVITY[mood];
}
