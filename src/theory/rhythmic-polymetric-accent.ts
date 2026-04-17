import type { Mood, Section } from '../types';

/**
 * Rhythmic polymetric accent — creates accent patterns that
 * suggest a secondary meter layered over the primary 4/4.
 * For example, accenting every 3rd beat in a 16-step pattern
 * creates a 3-against-4 polymetric feel.
 */

const polymetricDepth: Record<Mood, number> = {
  ambient: 0.10,
  plantasia: 0.10,
  downtempo: 0.20,
  lofi: 0.15,
  trance: 0.25,
  avril: 0.35,
  xtal: 0.30,
  syro: 0.55,
  blockhead: 0.45,
  flim: 0.30,
  disco: 0.20,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.4,
  build: 0.8,
  peak: 1.0,
  breakdown: 0.5,
  groove: 1.2,
};

/**
 * Returns a gain multiplier based on polymetric accent patterns.
 * The secondary meter length evolves with tick to create shifting
 * polymetric relationships.
 *
 * @param beatPosition - position within 16-step pattern (0-15)
 * @param tick - current tick for evolving meter
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function polymetricAccentGain(
  beatPosition: number,
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = polymetricDepth[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  // Secondary meter cycles between 3, 5, and 7 beats
  const meters = [3, 5, 7];
  const meterIdx = Math.floor(tick / 8) % meters.length;
  const secondaryMeter = meters[meterIdx];

  const pos = beatPosition % 16;
  // Accent on positions that align with the secondary meter
  if (pos % secondaryMeter === 0) {
    return 1.0 + 0.03 * depth;
  }
  return 1.0;
}

export function polymetricDepthValue(mood: Mood): number {
  return polymetricDepth[mood];
}
