import type { Mood, Section } from '../types';

/**
 * Rhythmic Backbeat Emphasis — boost gain on beats 2 and 4.
 *
 * In groove-oriented moods (disco, blockhead, lofi, downtempo),
 * the backbeat drives the feel. This module provides a gain
 * multiplier that emphasizes notes falling on beats 2 and 4
 * relative to beats 1 and 3.
 */

const moodStrength: Record<Mood, number> = {
  ambient: 0.0,
  downtempo: 0.5,
  lofi: 0.4,
  trance: 0.3,
  avril: 0.2,
  xtal: 0.1,
  syro: 0.6,
  blockhead: 0.8,
  flim: 0.3,
  disco: 0.9,
};

const sectionMult: Record<Section, number> = {
  intro: 0.4,
  build: 0.7,
  peak: 1.0,
  breakdown: 0.3,
  groove: 1.0,
};

/**
 * Returns true if the given beat position (0-based, in quarter notes)
 * falls on a backbeat (beat 2 or 4 in 4/4 time).
 */
export function isBackbeat(beatPosition: number, beatsPerBar: number = 4): boolean {
  const posInBar = ((beatPosition % beatsPerBar) + beatsPerBar) % beatsPerBar;
  // Beats 1 and 3 in 1-indexed = positions 1 and 3 in 0-indexed
  return posInBar === 1 || posInBar === 3;
}

/**
 * Gain multiplier for backbeat emphasis.
 * Notes on beats 2/4 get boosted, others are slightly reduced.
 */
export function backbeatGain(
  beatPosition: number,
  mood: Mood,
  section: Section,
): number {
  const strength = (moodStrength[mood] ?? 0.3) * (sectionMult[section] ?? 0.7);
  if (strength < 0.01) return 1.0;
  if (isBackbeat(beatPosition)) {
    return 1 + 0.06 * strength;
  }
  return 1 - 0.02 * strength;
}
