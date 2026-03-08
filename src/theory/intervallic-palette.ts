/**
 * Intervallic palette — each mood favors specific melodic interval sets.
 *
 * Jazz melodies use 3rds, 6ths, and chromatic passing tones.
 * Trance melodies favor 4ths, 5ths, and octaves.
 * Ambient melodies use 2nds and 7ths for floating quality.
 * This constrains the interval vocabulary to create mood-appropriate character.
 *
 * Applied as interval selection weights for melody generation.
 */

import type { Mood } from '../types';

/**
 * Interval weight profiles per mood.
 * Keys are interval sizes in semitones (1-12), values are weights.
 */
const INTERVAL_WEIGHTS: Record<Mood, Record<number, number>> = {
  trance: {
    1: 0.3, 2: 0.6, 3: 0.8, 4: 0.5, 5: 1.0, 6: 0.2, 7: 1.0, 8: 0.3, 9: 0.4, 10: 0.2, 11: 0.1, 12: 0.8,
  },
  avril: {
    1: 0.7, 2: 1.0, 3: 0.9, 4: 0.8, 5: 0.7, 6: 0.3, 7: 0.6, 8: 0.4, 9: 0.5, 10: 0.3, 11: 0.2, 12: 0.5,
  },
  disco: {
    1: 0.4, 2: 0.7, 3: 0.9, 4: 0.6, 5: 1.0, 6: 0.2, 7: 0.9, 8: 0.3, 9: 0.4, 10: 0.2, 11: 0.1, 12: 0.7,
  },
  downtempo: {
    1: 0.5, 2: 0.8, 3: 1.0, 4: 0.7, 5: 0.8, 6: 0.4, 7: 0.7, 8: 0.5, 9: 0.6, 10: 0.4, 11: 0.3, 12: 0.4,
  },
  blockhead: {
    1: 0.6, 2: 0.7, 3: 1.0, 4: 0.5, 5: 0.8, 6: 0.6, 7: 0.7, 8: 0.3, 9: 0.4, 10: 0.8, 11: 0.2, 12: 0.5,
  },
  lofi: {
    1: 0.8, 2: 0.9, 3: 1.0, 4: 0.9, 5: 0.6, 6: 0.5, 7: 0.5, 8: 0.7, 9: 0.8, 10: 0.6, 11: 0.3, 12: 0.3,
  },
  flim: {
    1: 0.7, 2: 0.8, 3: 0.8, 4: 0.9, 5: 0.7, 6: 0.5, 7: 0.8, 8: 0.4, 9: 0.6, 10: 0.3, 11: 0.4, 12: 0.6,
  },
  xtal: {
    1: 0.5, 2: 1.0, 3: 0.6, 4: 0.7, 5: 0.9, 6: 0.3, 7: 1.0, 8: 0.4, 9: 0.5, 10: 0.3, 11: 0.6, 12: 0.7,
  },
  syro: {
    1: 0.9, 2: 0.7, 3: 0.6, 4: 0.8, 5: 0.5, 6: 1.0, 7: 0.4, 8: 0.7, 9: 0.5, 10: 0.8, 11: 0.9, 12: 0.3,
  },
  ambient: {
    1: 0.3, 2: 1.0, 3: 0.5, 4: 0.6, 5: 0.9, 6: 0.2, 7: 1.0, 8: 0.3, 9: 0.4, 10: 0.2, 11: 0.5, 12: 0.8,
  },
};

/**
 * Get interval weight for a given mood and interval size.
 *
 * @param interval Interval size in semitones (1-12)
 * @param mood Current mood
 * @returns Weight (0.1 - 1.0)
 */
export function intervalWeight(interval: number, mood: Mood): number {
  const absInterval = Math.min(12, Math.max(1, Math.abs(interval)));
  return INTERVAL_WEIGHTS[mood][absInterval] ?? 0.5;
}

/**
 * Get the top 3 preferred intervals for a mood.
 */
export function preferredIntervals(mood: Mood): number[] {
  const weights = INTERVAL_WEIGHTS[mood];
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => parseInt(k));
}
