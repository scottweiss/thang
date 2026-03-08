import type { Mood, Section } from '../types';

/**
 * Melodic intervallic tension curve — maps each melodic interval
 * to a tension value and applies FM coloring proportional to
 * that tension. Dissonant intervals (m2, tritone, M7) get
 * richer FM; consonant intervals (P5, P8, M3) stay cleaner.
 */

const tensionCurveDepth: Record<Mood, number> = {
  ambient: 0.35,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.35,
  avril: 0.50,
  xtal: 0.40,
  syro: 0.55,
  blockhead: 0.30,
  flim: 0.45,
  disco: 0.20,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.8,
  groove: 0.9,
};

// Interval tension values (0=consonant, 1=most dissonant)
const INTERVAL_TENSION: Record<number, number> = {
  0: 0.0,   // unison
  1: 0.9,   // minor 2nd
  2: 0.4,   // major 2nd
  3: 0.2,   // minor 3rd
  4: 0.15,  // major 3rd
  5: 0.1,   // perfect 4th
  6: 1.0,   // tritone
  7: 0.05,  // perfect 5th
  8: 0.2,   // minor 6th
  9: 0.15,  // major 6th
  10: 0.6,  // minor 7th
  11: 0.85, // major 7th
  12: 0.0,  // octave
};

/**
 * Returns an FM multiplier based on melodic interval tension.
 *
 * @param intervalSemitones - absolute interval in semitones (0-12)
 * @param mood - current mood
 * @param section - current section
 * @returns FM multiplier in [1.0, 1.05]
 */
export function intervallicTensionCurveFm(
  intervalSemitones: number,
  mood: Mood,
  section: Section
): number {
  const clamped = Math.min(Math.abs(intervalSemitones), 12);
  const tension = INTERVAL_TENSION[clamped] ?? 0.3;
  const depth = tensionCurveDepth[mood] * sectionMultiplier[section];
  return 1.0 + tension * 0.05 * depth;
}

export function tensionCurveDepthValue(mood: Mood): number {
  return tensionCurveDepth[mood];
}
