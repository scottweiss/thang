import type { Mood, Section } from '../types';

/**
 * Harmonic pedal tone release — when a sustained pedal tone
 * (held bass note) finally changes, the release creates a
 * moment of harmonic opening. Boost harmony/drone layers
 * to emphasize this pivotal moment.
 */

const releaseStrength: Record<Mood, number> = {
  ambient: 0.50,
  downtempo: 0.40,
  lofi: 0.30,
  trance: 0.45,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.20,
  blockhead: 0.25,
  flim: 0.35,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.9,
  groove: 0.8,
};

/**
 * Determines if a pedal tone is being released based on
 * how long the bass has been held and whether it just changed.
 *
 * @param ticksHeld - how many ticks the previous bass note was sustained
 * @param bassChanged - whether the bass note just changed
 * @param minHoldForPedal - minimum ticks to qualify as a pedal (default 4)
 * @returns release intensity 0-1
 */
export function pedalReleaseIntensity(
  ticksHeld: number,
  bassChanged: boolean,
  minHoldForPedal: number = 4
): number {
  if (!bassChanged || ticksHeld < minHoldForPedal) return 0;
  // Longer holds create more dramatic releases, capped at 1.0
  return Math.min((ticksHeld - minHoldForPedal) / 8, 1.0);
}

/**
 * Returns a gain multiplier for pedal tone release moments.
 *
 * @param ticksHeld - how many ticks the bass was sustained
 * @param bassChanged - whether bass just changed
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.04]
 */
export function pedalReleaseGain(
  ticksHeld: number,
  bassChanged: boolean,
  mood: Mood,
  section: Section
): number {
  const intensity = pedalReleaseIntensity(ticksHeld, bassChanged);
  if (intensity < 0.01) return 1.0;

  const depth = releaseStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.04 * intensity * depth;
}

export function releaseStrengthValue(mood: Mood): number {
  return releaseStrength[mood];
}
