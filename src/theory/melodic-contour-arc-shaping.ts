import type { Mood, Section } from '../types';

/**
 * Melodic contour arc shaping — applies gain shaping based on
 * the ideal arch contour of a phrase. Melodies that follow an
 * arch shape (rise to climax, then descend) sound more natural.
 * Gain adjusts to encourage this contour.
 */

const arcStrength: Record<Mood, number> = {
  ambient: 0.20,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.35,
  avril: 0.55,
  xtal: 0.30,
  syro: 0.20,
  blockhead: 0.15,
  flim: 0.40,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.7,
  groove: 0.9,
};

/**
 * Returns a gain multiplier based on how well the current position
 * in the phrase matches the ideal arch contour.
 * The arch peaks at ~60% of the phrase (golden ratio approximation).
 *
 * @param phraseProgress - progress through phrase (0.0-1.0)
 * @param pitchDirection - 1 for ascending, -1 for descending, 0 for static
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [0.98, 1.03]
 */
export function contourArcShapingGain(
  phraseProgress: number,
  pitchDirection: number,
  mood: Mood,
  section: Section
): number {
  const depth = arcStrength[mood] * sectionMultiplier[section];
  const clamped = Math.max(0, Math.min(1, phraseProgress));

  // Ideal arch: ascending before peak (~0.6), descending after
  const peakPoint = 0.6;
  const idealDirection = clamped < peakPoint ? 1 : -1;

  // Reward matching the ideal direction
  if (pitchDirection === idealDirection) {
    return 1.0 + 0.03 * depth;
  }
  // Slight penalty for going against the arch
  if (pitchDirection === -idealDirection) {
    return 1.0 - 0.02 * depth;
  }
  // Static is neutral
  return 1.0;
}

export function arcStrengthValue(mood: Mood): number {
  return arcStrength[mood];
}
