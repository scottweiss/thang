import type { Mood, Section } from '../types';

/**
 * Section energy curve — overall energy follows a sigmoid shape within
 * each section. Builds ramp up, breakdowns ramp down, peaks plateau high.
 * Creates natural-feeling energy flow rather than flat levels.
 */

const moodCurveDepth: Record<Mood, number> = {
  ambient: 0.30,
  downtempo: 0.40,
  lofi: 0.35,
  trance: 0.55,
  avril: 0.50,
  xtal: 0.35,
  syro: 0.25,
  blockhead: 0.45,
  flim: 0.35,
  disco: 0.50,
};

/** Direction of energy curve per section */
const sectionDirection: Record<Section, number> = {
  intro: 0.5,     // gentle rise
  build: 1.0,     // strong rise
  peak: 0.0,      // plateau (no change)
  breakdown: -0.8, // decline
  groove: 0.3,     // slight rise
};

/**
 * Gain multiplier from section energy curve.
 * sectionProgress: 0-1 progress through current section
 * Returns 0.96-1.05 range.
 */
export function sectionEnergyCurveGain(
  sectionProgress: number,
  mood: Mood,
  section: Section,
): number {
  const depth = moodCurveDepth[mood];
  const dir = sectionDirection[section];
  if (Math.abs(dir) < 0.01) return 1.0; // plateau sections
  // Sigmoid curve: smooth S-shape from 0→1 over section
  const sigmoid = 1.0 / (1.0 + Math.exp(-8 * (sectionProgress - 0.5)));
  // Map sigmoid to energy adjustment
  const energy = (sigmoid - 0.5) * dir; // -0.5 to 0.5 scaled by direction
  return Math.max(0.96, Math.min(1.05, 1.0 + energy * depth * 0.08));
}

/** Per-mood curve depth for testing */
export function energyCurveDepth(mood: Mood): number {
  return moodCurveDepth[mood];
}
