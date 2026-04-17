/**
 * Harmonic tension decay — tension decays after dissonant chords.
 *
 * After a tense chord (diminished, augmented, dominant 7th),
 * the perceived tension should gradually decrease if the next
 * chords are consonant. This creates a natural "release" effect
 * that complements the tension arc system.
 */

import type { Mood, ChordQuality } from '../types';

/**
 * Per-mood decay rate (higher = faster tension release).
 */
const DECAY_RATE: Record<Mood, number> = {
  trance:    0.50,  // moderate — holds tension
  avril:     0.60,  // high — dramatic release
  disco:     0.40,  // moderate — steady
  downtempo: 0.55,  // moderate-high
  blockhead: 0.35,  // low — grinding tension
  lofi:      0.65,  // highest — quick release
  flim:      0.50,  // moderate
  xtal:      0.55,  // moderate
  syro:      0.30,  // low — holds dissonance
  ambient:   0.70,  // highest — peaceful release,
  plantasia: 0.70,
};

/**
 * Tension level by chord quality.
 */
const QUALITY_TENSION: Record<ChordQuality, number> = {
  maj:  0.1,
  min:  0.2,
  maj7: 0.25,
  min7: 0.3,
  sus2: 0.15,
  sus4: 0.2,
  add9: 0.2,
  min9: 0.35,
  dom7: 0.6,
  dim:  0.8,
  aug:  0.7,
};

/**
 * Calculate tension decay FM multiplier.
 * Higher tension = more FM depth, decaying over ticks.
 *
 * @param quality Current chord quality
 * @param ticksSinceChange Ticks since chord changed
 * @param mood Current mood
 * @returns FM multiplier (0.90 - 1.15)
 */
export function tensionDecayFm(
  quality: ChordQuality,
  ticksSinceChange: number,
  mood: Mood
): number {
  const rate = DECAY_RATE[mood];
  const tension = QUALITY_TENSION[quality] ?? 0.3;
  const ticks = Math.max(0, ticksSinceChange);

  // Exponential decay of tension
  const decayedTension = tension * Math.exp(-ticks * rate * 0.3);

  // Map tension to FM boost
  const fmBoost = decayedTension * 0.20;
  return Math.max(0.90, Math.min(1.15, 1.0 + fmBoost));
}

/**
 * Get decay rate for a mood (for testing).
 */
export function decayRate(mood: Mood): number {
  return DECAY_RATE[mood];
}
