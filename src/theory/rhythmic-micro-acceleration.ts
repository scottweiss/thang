import type { Mood, Section } from '../types';

/**
 * Rhythmic micro-acceleration — subtle timing push within
 * beat groups creates forward momentum. Early notes in a
 * group push slightly ahead, late notes drag slightly,
 * creating a "leaning forward" feel without changing tempo.
 */

const accelStrength: Record<Mood, number> = {
  ambient: 0.10,
  plantasia: 0.10,
  downtempo: 0.25,
  lofi: 0.30,
  trance: 0.45,
  avril: 0.35,
  xtal: 0.20,
  syro: 0.55,
  blockhead: 0.40,
  flim: 0.30,
  disco: 0.50,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.4,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.5,
  groove: 1.1,
};

/**
 * Calculates timing offset for micro-acceleration effect.
 * Returns a value in [-1, 1] where negative = push ahead,
 * positive = drag behind. Based on position within a 4-step group.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @returns timing tendency [-1, 1]
 */
export function microAccelTendency(beatPosition: number): number {
  const posInGroup = ((beatPosition % 4) + 4) % 4;
  // First note: push ahead (-), last note: drag (+)
  switch (posInGroup) {
    case 0: return -0.3;  // downbeat: slight push
    case 1: return -0.6;  // first offbeat: more push (momentum)
    case 2: return 0.0;   // mid-group: neutral
    case 3: return 0.4;   // last: slight drag (breath)
    default: return 0.0;
  }
}

/**
 * Returns a timing offset in seconds for micro-acceleration.
 * Positive = late, negative = early.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param mood - current mood
 * @param section - current section
 * @returns timing offset in seconds, range [-0.015, 0.015]
 */
export function microAccelOffset(
  beatPosition: number,
  mood: Mood,
  section: Section
): number {
  const tendency = microAccelTendency(beatPosition);
  if (Math.abs(tendency) < 0.01) return 0;

  const depth = accelStrength[mood] * sectionMultiplier[section];
  return tendency * 0.015 * depth;
}

export function accelStrengthValue(mood: Mood): number {
  return accelStrength[mood];
}
