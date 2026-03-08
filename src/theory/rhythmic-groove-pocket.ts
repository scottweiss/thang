import type { Mood, Section } from '../types';

/**
 * Rhythmic groove pocket — identifies strong/weak beat positions
 * and applies gain shaping to create a "pocket" feel where
 * backbeats get subtle emphasis relative to on-beats.
 */

const pocketDepth: Record<Mood, number> = {
  ambient: 0.05,
  downtempo: 0.35,
  lofi: 0.40,
  trance: 0.30,
  avril: 0.15,
  xtal: 0.10,
  syro: 0.25,
  blockhead: 0.50,
  flim: 0.20,
  disco: 0.55,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 0.8,
  peak: 1.0,
  breakdown: 0.6,
  groove: 1.3,
};

/**
 * Returns a gain multiplier that creates a groove pocket.
 * Backbeats (positions 4, 12) get emphasis, ghost note positions
 * (2, 6, 10, 14) get subtle emphasis, and downbeats stay neutral.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [0.98, 1.03]
 */
export function groovePocketGain(
  beatPosition: number,
  mood: Mood,
  section: Section
): number {
  const depth = pocketDepth[mood] * sectionMultiplier[section];
  const pos = beatPosition % 16;

  // Backbeats (beats 2 and 4 in 4/4, positions 4 and 12)
  if (pos === 4 || pos === 12) {
    return 1.0 + 0.03 * depth;
  }
  // Ghost note positions
  if (pos === 2 || pos === 6 || pos === 10 || pos === 14) {
    return 1.0 + 0.015 * depth;
  }
  // Strong downbeat — very slightly reduced to create pocket
  if (pos === 0 || pos === 8) {
    return 1.0 - 0.02 * depth;
  }
  // All other positions neutral
  return 1.0;
}

export function pocketDepthValue(mood: Mood): number {
  return pocketDepth[mood];
}
