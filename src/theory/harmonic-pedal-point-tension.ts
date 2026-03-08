import type { Mood, Section } from '../types';

/**
 * Harmonic pedal point tension — when the bass holds a sustained
 * note while chords move above it, tension accumulates as the
 * harmony moves away from the pedal. Apply FM enrichment
 * proportional to the harmonic distance from the pedal tone.
 */

const pedalTensionDepth: Record<Mood, number> = {
  ambient: 0.50,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.45,
  avril: 0.40,
  xtal: 0.45,
  syro: 0.20,
  blockhead: 0.15,
  flim: 0.35,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 1.2,
  build: 1.0,
  peak: 0.8,
  breakdown: 1.3,
  groove: 0.6,
};

// Semitone distances that create more tension against a pedal
const TENSION_MAP: Record<number, number> = {
  0: 0.0,   // unison — no tension
  1: 0.9,   // minor 2nd — high
  2: 0.5,   // major 2nd — moderate
  3: 0.3,   // minor 3rd — mild
  4: 0.2,   // major 3rd — consonant
  5: 0.15,  // perfect 4th — mild
  6: 1.0,   // tritone — maximum
  7: 0.1,   // perfect 5th — very consonant
  8: 0.25,  // minor 6th — moderate
  9: 0.3,   // major 6th — mild
  10: 0.7,  // minor 7th — high
  11: 0.85, // major 7th — very high
};

/**
 * Returns an FM multiplier based on pedal point tension.
 *
 * @param pedalPc - pedal tone pitch class (0-11)
 * @param chordRootPc - current chord root pitch class (0-11)
 * @param mood - current mood
 * @param section - current section
 * @returns FM multiplier in [1.0, 1.05]
 */
export function pedalPointTensionFm(
  pedalPc: number,
  chordRootPc: number,
  mood: Mood,
  section: Section
): number {
  const interval = ((chordRootPc - pedalPc) % 12 + 12) % 12;
  const tensionLevel = TENSION_MAP[interval] ?? 0.5;
  const depth = pedalTensionDepth[mood] * sectionMultiplier[section];
  return 1.0 + tensionLevel * 0.05 * depth;
}

export function pedalTensionDepthValue(mood: Mood): number {
  return pedalTensionDepth[mood];
}
