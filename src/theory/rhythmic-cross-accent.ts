import type { Mood, Section } from '../types';

/**
 * Rhythmic cross-accent — applies gain emphasis on positions
 * that cross the expected metric accent pattern, creating
 * tension between the written meter and felt pulse.
 */

const crossAccentStrength: Record<Mood, number> = {
  ambient: 0.05,
  downtempo: 0.20,
  lofi: 0.25,
  trance: 0.15,
  avril: 0.30,
  xtal: 0.20,
  syro: 0.55,
  blockhead: 0.50,
  flim: 0.35,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.4,
  build: 0.8,
  peak: 1.0,
  breakdown: 0.5,
  groove: 1.2,
};

/**
 * Returns a gain multiplier for cross-accents. Positions that
 * are metrically weak but rhythmically emphasized create
 * cross-accent tension. Uses a rotating pattern based on tick.
 *
 * @param beatPosition - position within 16-step pattern (0-15)
 * @param tick - current tick for pattern evolution
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function crossAccentGain(
  beatPosition: number,
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = crossAccentStrength[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  const pos = beatPosition % 16;
  // Cross-accent positions shift based on tick — creates evolving patterns
  const shift = tick % 3;
  // Odd positions that don't align with standard 4/4 strong beats
  const crossPositions = [
    [3, 5, 11, 13],  // pattern A
    [1, 7, 9, 15],   // pattern B
    [3, 7, 11, 15],  // pattern C — dotted rhythm feel
  ];
  const pattern = crossPositions[shift];

  if (pattern.includes(pos)) {
    return 1.0 + 0.03 * depth;
  }
  return 1.0;
}

export function crossAccentStrengthValue(mood: Mood): number {
  return crossAccentStrength[mood];
}
