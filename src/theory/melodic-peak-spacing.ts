import type { Mood, Section } from '../types';

/**
 * Melodic peak spacing — well-placed melodic peaks (the
 * highest notes in a phrase) should be spaced apart for
 * maximum impact. When peaks cluster together, the effect
 * diminishes. Reduce boost when peaks are too close.
 */

const spacingStrength: Record<Mood, number> = {
  ambient: 0.40,
  plantasia: 0.40,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.45,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.25,
  blockhead: 0.20,
  flim: 0.50,
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
 * Calculates spacing quality based on distance from last peak.
 * Well-spaced peaks (4+ ticks apart) get full boost.
 * Clustered peaks (1-2 ticks) get reduced or no boost.
 *
 * @param ticksSinceLastPeak - how many ticks since the previous peak note
 * @param minSpacing - minimum spacing for any boost (default 2)
 * @param idealSpacing - spacing for full boost (default 6)
 * @returns 0-1 spacing quality
 */
export function peakSpacingQuality(
  ticksSinceLastPeak: number,
  minSpacing: number = 2,
  idealSpacing: number = 6
): number {
  if (ticksSinceLastPeak < minSpacing) return 0;
  if (ticksSinceLastPeak >= idealSpacing) return 1.0;
  return (ticksSinceLastPeak - minSpacing) / (idealSpacing - minSpacing);
}

/**
 * Returns a gain multiplier for a peak note based on spacing.
 * Only applies when the current note IS a peak (caller determines this).
 *
 * @param ticksSinceLastPeak - ticks since previous peak
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function peakSpacingGain(
  ticksSinceLastPeak: number,
  mood: Mood,
  section: Section
): number {
  const quality = peakSpacingQuality(ticksSinceLastPeak);
  if (quality < 0.01) return 1.0;

  const depth = spacingStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * quality * depth;
}

export function spacingStrengthValue(mood: Mood): number {
  return spacingStrength[mood];
}
