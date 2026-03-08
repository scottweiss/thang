/**
 * Overtone beating — manage beating between close harmonics.
 *
 * When two notes produce harmonics that are close but not identical,
 * they create audible beating (wavering). This can be warm (slow beating)
 * or harsh (fast beating). This module detects potential beating
 * and adjusts FM/filter to control it.
 *
 * Applied as FM depth adjustment and resonance shift.
 */

import type { Mood } from '../types';

/**
 * Per-mood beating tolerance (higher = more beating accepted).
 */
const BEATING_TOLERANCE: Record<Mood, number> = {
  trance:    0.30,  // moderate — some warmth
  avril:     0.25,  // low — clean orchestral
  disco:     0.35,  // moderate — bright energy
  downtempo: 0.40,  // moderate — warmth welcome
  blockhead: 0.35,  // moderate
  lofi:      0.55,  // high — warmth is character
  flim:      0.45,  // moderate — delicate beating
  xtal:      0.20,  // low — crystalline clarity
  syro:      0.50,  // high — beating is texture
  ambient:   0.60,  // highest — beating = warmth
};

/**
 * Calculate beating frequency between two notes.
 *
 * @param freq1 First frequency in Hz
 * @param freq2 Second frequency in Hz
 * @returns Beating frequency in Hz
 */
export function beatingFrequency(freq1: number, freq2: number): number {
  return Math.abs(freq1 - freq2);
}

/**
 * Classify beating character.
 *
 * @param beatFreq Beating frequency in Hz
 * @returns 'warm' (< 6Hz), 'vibrato' (6-12Hz), 'rough' (12-30Hz), 'smooth' (> 30Hz or 0)
 */
export function beatingCharacter(beatFreq: number): 'warm' | 'vibrato' | 'rough' | 'smooth' {
  if (beatFreq < 0.5) return 'smooth';
  if (beatFreq < 6) return 'warm';
  if (beatFreq < 12) return 'vibrato';
  if (beatFreq < 30) return 'rough';
  return 'smooth';
}

/**
 * Calculate FM depth correction to manage beating.
 * Rough beating → reduce FM to clean up. Warm beating → slight FM boost.
 *
 * @param beatFreq Beating frequency in Hz
 * @param mood Current mood
 * @returns FM depth multiplier (0.7 - 1.15)
 */
export function beatingFmCorrection(
  beatFreq: number,
  mood: Mood
): number {
  const tolerance = BEATING_TOLERANCE[mood];
  const character = beatingCharacter(beatFreq);

  switch (character) {
    case 'warm':
      return 1.0 + tolerance * 0.15; // slight boost for warmth
    case 'vibrato':
      return 1.0; // neutral
    case 'rough':
      return 1.0 - (1 - tolerance) * 0.3; // reduce for clarity
    case 'smooth':
      return 1.0;
  }
}

/**
 * Get beating tolerance for a mood (for testing).
 */
export function beatingTolerance(mood: Mood): number {
  return BEATING_TOLERANCE[mood];
}
