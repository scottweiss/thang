/**
 * Harmonic stasis detection — detect and respond to static harmony.
 *
 * When a chord stays the same for too long, the music loses forward
 * motion. This module detects stasis (long chord holds) and suggests
 * timbral movement to compensate — increasing FM depth or filter
 * modulation to keep the sound evolving.
 *
 * Applied as FM/LPF multiplier that increases during stasis.
 */

import type { Mood } from '../types';

/**
 * Per-mood stasis tolerance (higher = more tolerance for static harmony).
 */
const STASIS_TOLERANCE: Record<Mood, number> = {
  trance:    0.40,  // moderate — needs movement
  avril:     0.30,  // low — classical needs harmonic motion
  disco:     0.35,  // moderate
  downtempo: 0.55,  // high — can sit on chords
  blockhead: 0.45,  // moderate
  lofi:      0.50,  // high — jazz can vamp
  flim:      0.60,  // high — ambient-leaning
  xtal:      0.65,  // high — crystalline stasis OK
  syro:      0.25,  // low — needs constant change
  ambient:   0.75,  // highest — stasis is the point
};

/**
 * Calculate stasis level from ticks since last chord change.
 *
 * @param ticksSinceChange Ticks since last chord change
 * @param mood Current mood
 * @returns Stasis level (0.0 = fresh, 1.0 = deep stasis)
 */
export function stasisLevel(
  ticksSinceChange: number,
  mood: Mood
): number {
  const tolerance = STASIS_TOLERANCE[mood];
  const threshold = tolerance * 8; // ticks before stasis kicks in
  if (ticksSinceChange <= threshold) return 0;
  const excess = ticksSinceChange - threshold;
  return Math.min(1, excess / (threshold * 2));
}

/**
 * FM depth multiplier to compensate for harmonic stasis.
 *
 * @param ticksSinceChange Ticks since last chord change
 * @param mood Current mood
 * @returns FM multiplier (1.0 - 1.25)
 */
export function stasisFmCompensation(
  ticksSinceChange: number,
  mood: Mood
): number {
  const level = stasisLevel(ticksSinceChange, mood);
  const compensation = level * (1 - STASIS_TOLERANCE[mood]) * 0.5;
  return Math.max(1.0, Math.min(1.25, 1.0 + compensation));
}

/**
 * LPF modulation during stasis (slowly open filter for movement).
 *
 * @param ticksSinceChange Ticks since last chord change
 * @param mood Current mood
 * @returns LPF multiplier (1.0 - 1.2)
 */
export function stasisLpfModulation(
  ticksSinceChange: number,
  mood: Mood
): number {
  const level = stasisLevel(ticksSinceChange, mood);
  const modulation = level * (1 - STASIS_TOLERANCE[mood]) * 0.3;
  return Math.max(1.0, Math.min(1.2, 1.0 + modulation));
}

/**
 * Get stasis tolerance for a mood (for testing).
 */
export function stasisTolerance(mood: Mood): number {
  return STASIS_TOLERANCE[mood];
}
