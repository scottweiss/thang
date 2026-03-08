import type { Mood, Section } from '../types';

/**
 * Section transition momentum — energy ramps approaching section
 * boundaries. Near end of build → accelerating energy. Near end of
 * breakdown → decelerating. Creates anticipation of what comes next.
 */

const moodMomentum: Record<Mood, number> = {
  ambient: 0.25,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.60,
  avril: 0.50,
  xtal: 0.30,
  syro: 0.20,
  blockhead: 0.40,
  flim: 0.35,
  disco: 0.55,
};

/** Energy direction approaching section end */
const sectionEndEnergy: Record<Section, number> = {
  intro: 0.5,      // building anticipation
  build: 1.0,      // maximum energy push
  peak: -0.3,      // slight wind-down
  breakdown: -0.7,  // energy draining
  groove: 0.3,      // gentle push
};

/**
 * Gain multiplier from section transition momentum.
 * sectionProgress: 0-1 progress through current section
 * Only activates in the last 20% of a section.
 */
export function transitionMomentumGain(
  sectionProgress: number,
  mood: Mood,
  section: Section,
): number {
  if (sectionProgress < 0.8) return 1.0;
  const momentum = moodMomentum[mood];
  const dir = sectionEndEnergy[section];
  const proximity = (sectionProgress - 0.8) / 0.2; // 0→1 in last 20%
  const ramp = proximity * proximity; // quadratic ramp
  const adjustment = ramp * dir * momentum * 0.06;
  return Math.max(0.96, Math.min(1.05, 1.0 + adjustment));
}

/** Per-mood momentum for testing */
export function transitionMomentumStrength(mood: Mood): number {
  return moodMomentum[mood];
}
