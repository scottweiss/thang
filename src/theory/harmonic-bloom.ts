/**
 * Harmonic bloom — chords open up over time within a hold.
 *
 * When a chord sustains for several ticks, it should gradually
 * "bloom" — becoming richer, warmer, more resonant. This mimics
 * how acoustic instruments and rooms respond to sustained tones:
 * harmonics build up, resonances engage, the sound opens.
 *
 * Applied as progressive FM depth increase, LPF opening, and
 * reverb wetness increase over chord hold duration.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood bloom rate (how fast the chord opens up).
 */
const BLOOM_RATE: Record<Mood, number> = {
  trance:    0.10,  // minimal bloom
  avril:     0.35,  // classical resonance
  disco:     0.15,  // groove consistency
  downtempo: 0.40,  // warm opening
  blockhead: 0.15,  // choppy, less bloom
  lofi:      0.45,  // jazz warmth
  flim:      0.40,  // organic bloom
  xtal:      0.50,  // maximum ethereal bloom
  syro:      0.12,  // controlled
  ambient:   0.55,  // spacious bloom,
  plantasia: 0.55,
};

/**
 * Calculate bloom multiplier based on how long a chord has been held.
 *
 * @param ticksSinceChange Ticks since last chord change
 * @param mood Current mood
 * @param section Current section
 * @returns Bloom multiplier (1.0-1.5, grows with time)
 */
export function bloomMultiplier(
  ticksSinceChange: number,
  mood: Mood,
  section: Section
): number {
  const rate = BLOOM_RATE[mood];
  const sectionMult: Record<Section, number> = {
    intro:     1.3,   // bloom for atmosphere
    build:     0.6,   // less bloom during momentum
    peak:      0.5,   // sustained power, less change
    breakdown: 1.4,   // maximum bloom
    groove:    1.0,
  };

  // Logarithmic growth — fast initial bloom, then plateau
  const growth = Math.log1p(ticksSinceChange) * rate * (sectionMult[section] ?? 1.0);
  return Math.min(1.5, 1.0 + growth * 0.15);
}

/**
 * LPF bloom — filter opens as chord sustains.
 *
 * @param ticksSinceChange Ticks since last chord change
 * @param mood Current mood
 * @returns LPF multiplier (1.0-1.3)
 */
export function bloomLpfMultiplier(
  ticksSinceChange: number,
  mood: Mood
): number {
  const rate = BLOOM_RATE[mood];
  const growth = Math.log1p(ticksSinceChange) * rate;
  return Math.min(1.3, 1.0 + growth * 0.1);
}

/**
 * Room bloom — reverb wetness increases as chord sustains.
 *
 * @param ticksSinceChange Ticks since last chord change
 * @param mood Current mood
 * @returns Room multiplier (1.0-1.4)
 */
export function bloomRoomMultiplier(
  ticksSinceChange: number,
  mood: Mood
): number {
  const rate = BLOOM_RATE[mood];
  const growth = Math.log1p(ticksSinceChange) * rate;
  return Math.min(1.4, 1.0 + growth * 0.12);
}

/**
 * Should harmonic bloom be applied?
 */
export function shouldApplyBloom(mood: Mood): boolean {
  return BLOOM_RATE[mood] > 0.12;
}

/**
 * Get bloom rate for a mood (for testing).
 */
export function bloomRate(mood: Mood): number {
  return BLOOM_RATE[mood];
}
