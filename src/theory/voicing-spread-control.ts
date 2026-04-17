import type { Mood, Section } from '../types';

/**
 * Voicing spread control — chord voicings should be wider (open) in
 * calm sections and tighter (close) in tense sections. Controls
 * gain balance to favor wide/narrow voicing character.
 */

const moodSpreadSensitivity: Record<Mood, number> = {
  ambient: 0.55,
  plantasia: 0.55,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.30,
  avril: 0.50,
  xtal: 0.45,
  syro: 0.20,
  blockhead: 0.30,
  flim: 0.40,
  disco: 0.25,
};

/** Target spread direction: positive = open, negative = close */
const sectionSpreadTarget: Record<Section, number> = {
  intro: 0.6,
  build: -0.2,
  peak: -0.5,
  breakdown: 0.8,
  groove: 0.1,
};

/**
 * Gain multiplier for harmony based on voicing spread alignment.
 * tension: 0-1 overall tension
 * High tension + close spread target → boost; low tension + open → boost.
 */
export function spreadControlGain(
  tension: number,
  mood: Mood,
  section: Section,
): number {
  const sensitivity = moodSpreadSensitivity[mood];
  const target = sectionSpreadTarget[section];
  // Alignment: tension matches spread direction
  const alignment = target > 0 ? (1.0 - tension) : tension;
  const adjustment = (alignment - 0.5) * sensitivity * 0.06;
  return Math.max(0.97, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood spread sensitivity for testing */
export function spreadSensitivity(mood: Mood): number {
  return moodSpreadSensitivity[mood];
}
