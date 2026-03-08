import type { Mood, Section } from '../types';

/**
 * Rhythmic metric modulation feel — creates the sensation of
 * tempo change by reinterpreting beat subdivisions. For example,
 * treating triplet 8ths as the new pulse creates a 3:2 ratio
 * tempo illusion. Applied via gain accents on the new "pulse".
 */

const modulationStrength: Record<Mood, number> = {
  ambient: 0.05,
  downtempo: 0.15,
  lofi: 0.20,
  trance: 0.30,
  avril: 0.35,
  xtal: 0.25,
  syro: 0.55,
  blockhead: 0.40,
  flim: 0.30,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.3,
  build: 1.0,
  peak: 0.8,
  breakdown: 0.4,
  groove: 1.2,
};

/**
 * Returns a gain multiplier that creates metric modulation feel.
 * During build sections, accents shift to create the illusion
 * of tempo change. The ratio evolves with tick.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param tick - current tick for modulation evolution
 * @param sectionProgress - progress through section (0-1)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function metricModulationFeelGain(
  beatPosition: number,
  tick: number,
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const depth = modulationStrength[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  // Only active during transitional moments (40-70% of section)
  if (sectionProgress < 0.4 || sectionProgress > 0.7) return 1.0;

  const pos = beatPosition % 16;
  // Alternate between 3:2 and 4:3 modulation ratios
  const useTriple = (Math.floor(tick / 4) % 2) === 0;
  const modulationStep = useTriple ? 3 : 4;

  if (pos % modulationStep === 0) {
    return 1.0 + 0.03 * depth;
  }
  return 1.0;
}

export function modulationStrengthValue(mood: Mood): number {
  return modulationStrength[mood];
}
