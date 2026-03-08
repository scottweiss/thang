/**
 * Micro-dynamics — note-level velocity variation for expression.
 *
 * Real performers don't play every note at the same velocity.
 * This module creates subtle per-note gain variations that
 * give the music human-like expression and breathing.
 *
 * Applied as per-note gain multiplier.
 */

import type { Mood } from '../types';

/**
 * Per-mood micro-dynamic range (higher = more velocity variation).
 */
const DYNAMIC_RANGE: Record<Mood, number> = {
  trance:    0.10,  // minimal — machine-like
  avril:     0.30,  // strong — expressive
  disco:     0.08,  // minimal — even groove
  downtempo: 0.20,  // moderate
  blockhead: 0.15,  // moderate
  lofi:      0.35,  // strongest — human feel
  flim:      0.30,  // strong — delicate
  xtal:      0.25,  // moderate
  syro:      0.12,  // weak — electronic precision
  ambient:   0.20,  // moderate — gentle breathing
};

/**
 * Calculate per-note velocity variation.
 * Uses deterministic hash for repeatable patterns.
 *
 * @param noteIndex Note position within pattern (0-based)
 * @param tick Current tick for variation
 * @param mood Current mood
 * @returns Gain multiplier (0.7 - 1.3)
 */
export function microDynamicGain(
  noteIndex: number,
  tick: number,
  mood: Mood
): number {
  const range = DYNAMIC_RANGE[mood];
  // Deterministic "random" variation
  const hash = ((noteIndex * 2654435761 + tick * 596572387) >>> 0) / 4294967296;
  const variation = (hash - 0.5) * 2 * range;
  return Math.max(0.7, Math.min(1.3, 1.0 + variation));
}

/**
 * Calculate accent pattern (first and last notes emphasized).
 *
 * @param noteIndex Note position
 * @param patternLength Total notes in pattern
 * @param mood Current mood
 * @returns Accent multiplier (0.9 - 1.15)
 */
export function accentPattern(
  noteIndex: number,
  patternLength: number,
  mood: Mood
): number {
  const range = DYNAMIC_RANGE[mood];
  if (patternLength <= 1) return 1.0;
  // First note gets accent
  if (noteIndex === 0) return 1.0 + range * 0.5;
  // Last note gets slight accent
  if (noteIndex === patternLength - 1) return 1.0 + range * 0.3;
  // Middle notes slightly quieter
  return 1.0 - range * 0.1;
}

/**
 * Get dynamic range for a mood (for testing).
 */
export function microDynamicRange(mood: Mood): number {
  return DYNAMIC_RANGE[mood];
}
