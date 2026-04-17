import type { Mood, Section } from '../types';

/**
 * Harmonic voice crossing avoidance — when layer pitch centers
 * cross (e.g., melody dips below harmony), reduce gain on the
 * crossing layer to maintain clear voicing hierarchy.
 * Lower layers should stay below higher layers.
 */

const avoidanceStrength: Record<Mood, number> = {
  ambient: 0.30,
  plantasia: 0.30,
  downtempo: 0.35,
  lofi: 0.25,
  trance: 0.40,
  avril: 0.55,
  xtal: 0.30,
  syro: 0.15,
  blockhead: 0.20,
  flim: 0.35,
  disco: 0.40,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.7,
  build: 1.0,
  peak: 0.8,
  breakdown: 0.9,
  groove: 1.0,
};

/**
 * Returns a gain reduction when voice crossing is detected.
 * The further the crossing, the more reduction applied.
 *
 * @param layerPitch - this layer's center pitch (MIDI)
 * @param otherPitch - the other layer's center pitch (MIDI)
 * @param layerShouldBeHigher - true if this layer should be above
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [0.96, 1.0]
 */
export function voiceCrossingAvoidanceGain(
  layerPitch: number,
  otherPitch: number,
  layerShouldBeHigher: boolean,
  mood: Mood,
  section: Section
): number {
  const diff = layerPitch - otherPitch;
  // Check if crossing occurred
  if (layerShouldBeHigher && diff >= 0) return 1.0;
  if (!layerShouldBeHigher && diff <= 0) return 1.0;

  const crossingAmount = Math.abs(diff);
  const depth = avoidanceStrength[mood] * sectionMultiplier[section];
  const reduction = Math.min(crossingAmount / 12, 1.0) * 0.04 * depth;
  return 1.0 - reduction;
}

export function avoidanceStrengthValue(mood: Mood): number {
  return avoidanceStrength[mood];
}
