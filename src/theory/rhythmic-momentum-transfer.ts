import type { Mood, Section } from '../types';

/**
 * Rhythmic momentum transfer — energy from active beats carries into
 * subsequent positions, creating a sense of forward motion.
 * Models how listeners perceive rhythmic continuity across beat boundaries.
 */

const moodMomentum: Record<Mood, number> = {
  ambient: 0.15,
  downtempo: 0.35,
  lofi: 0.45,
  trance: 0.60,
  avril: 0.50,
  xtal: 0.30,
  syro: 0.40,
  blockhead: 0.55,
  flim: 0.35,
  disco: 0.55,
};

const sectionMult: Record<Section, number> = {
  intro: 0.7,
  build: 1.2,
  peak: 1.3,
  breakdown: 0.6,
  groove: 1.0,
};

/**
 * Gain multiplier from rhythmic momentum.
 * beatsSinceLastOnset: how many 16th-note positions since last note onset
 * Returns slight boost for positions immediately after onsets (momentum).
 */
export function momentumTransferGain(
  beatsSinceLastOnset: number,
  mood: Mood,
  section: Section,
): number {
  if (beatsSinceLastOnset <= 0) return 1.0; // on the onset itself
  const strength = moodMomentum[mood] * sectionMult[section];
  // Exponential decay of momentum
  const carry = Math.exp(-beatsSinceLastOnset * 0.5) * strength * 0.05;
  return 1.0 + carry;
}

/** Per-mood momentum strength for testing */
export function momentumStrength(mood: Mood): number {
  return moodMomentum[mood];
}
