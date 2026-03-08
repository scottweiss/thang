import type { Mood, Section } from '../types';

/**
 * Harmonic tritone pull — the tritone interval (6 semitones)
 * between the 3rd and 7th of a dominant chord creates a strong
 * pull toward resolution. When this interval is present,
 * apply gain emphasis to heighten the expectation.
 */

const pullStrength: Record<Mood, number> = {
  ambient: 0.15,
  downtempo: 0.25,
  lofi: 0.20,
  trance: 0.50,
  avril: 0.45,
  xtal: 0.30,
  syro: 0.20,
  blockhead: 0.25,
  flim: 0.30,
  disco: 0.40,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 1.2,
  peak: 1.0,
  breakdown: 0.7,
  groove: 0.8,
};

/**
 * Returns a gain multiplier based on tritone presence in chord.
 * dom7 and dim qualities contain tritones; sus/maj don't.
 *
 * @param quality - chord quality
 * @param ticksSinceChange - how long this chord has sounded
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.04]
 */
export function tritonePullGain(
  quality: string,
  ticksSinceChange: number,
  mood: Mood,
  section: Section
): number {
  // Only dom7 and dim contain tritones
  const hasTritone = quality === 'dom7' || quality === 'dim';
  if (!hasTritone) return 1.0;

  const depth = pullStrength[mood] * sectionMultiplier[section];
  // Pull intensifies over the first few ticks then plateaus
  const timeFactor = Math.min(ticksSinceChange / 3, 1.0);
  return 1.0 + 0.04 * depth * timeFactor;
}

export function pullStrengthValue(mood: Mood): number {
  return pullStrength[mood];
}
