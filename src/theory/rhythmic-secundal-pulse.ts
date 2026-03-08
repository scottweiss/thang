import type { Mood, Section } from '../types';

/**
 * Rhythmic secundal pulse — creates a secondary pulse layer
 * by accenting positions that form a slower tempo relationship.
 * Every Nth position gets accented, where N varies to create
 * different pulse ratios against the main tempo.
 */

const pulseStrength: Record<Mood, number> = {
  ambient: 0.20,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.40,
  avril: 0.20,
  xtal: 0.30,
  syro: 0.50,
  blockhead: 0.35,
  flim: 0.25,
  disco: 0.55,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 0.9,
  peak: 1.0,
  breakdown: 0.4,
  groove: 1.2,
};

/**
 * Returns a gain multiplier for the secondary pulse.
 * The pulse period rotates between 5, 6, and 7 steps
 * to create evolving polyrhythmic relationships.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param tick - current tick for pulse evolution
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function secundalPulseGain(
  beatPosition: number,
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = pulseStrength[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  const periods = [5, 6, 7];
  const periodIdx = Math.floor(tick / 5) % periods.length;
  const period = periods[periodIdx];

  const pos = beatPosition % 16;
  if (pos % period === 0) {
    return 1.0 + 0.03 * depth;
  }
  return 1.0;
}

export function pulseStrengthValue(mood: Mood): number {
  return pulseStrength[mood];
}
