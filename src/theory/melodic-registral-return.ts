import type { Mood, Section } from '../types';

/**
 * Melodic registral return — melodic lines that return to a
 * previously established "home" register create satisfying
 * arc closure. Boost gain when current pitch is near the
 * phrase's starting pitch, especially at phrase boundaries.
 */

const returnStrength: Record<Mood, number> = {
  ambient: 0.45,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.25,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.20,
  blockhead: 0.15,
  flim: 0.50,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 0.8,
  peak: 1.0,
  breakdown: 1.2,
  groove: 0.9,
};

/**
 * Measures how close the current pitch is to the home pitch.
 * Returns 0-1 where 1 = exact return.
 *
 * @param homePitch - starting pitch of the phrase (MIDI note)
 * @param currentPitch - current pitch (MIDI note)
 * @param tolerance - max semitone distance for any boost (default 5)
 */
export function registralProximity(
  homePitch: number,
  currentPitch: number,
  tolerance: number = 5
): number {
  const dist = Math.abs(currentPitch - homePitch);
  if (dist > tolerance) return 0;
  return 1.0 - dist / tolerance;
}

/**
 * Returns a gain multiplier rewarding registral return.
 *
 * @param homePitch - starting pitch of the phrase
 * @param currentPitch - current pitch
 * @param sectionProgress - progress through section (0-1), boosts near end
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function registralReturnGain(
  homePitch: number,
  currentPitch: number,
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const proximity = registralProximity(homePitch, currentPitch);
  if (proximity < 0.01) return 1.0;

  const depth = returnStrength[mood] * sectionMultiplier[section];
  // More rewarding near end of section (arc closure)
  const progressBonus = 0.5 + 0.5 * sectionProgress;
  return 1.0 + 0.03 * proximity * depth * progressBonus;
}

export function returnStrengthValue(mood: Mood): number {
  return returnStrength[mood];
}
