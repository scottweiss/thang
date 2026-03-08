import type { Mood, Section } from '../types';

/**
 * Phrase arc dynamics — gain follows a natural arc within phrases.
 * Start soft, crescendo to a peak around 60-70% through, then decrescendo.
 * Models how performers naturally shape musical phrases.
 */

const moodArcDepth: Record<Mood, number> = {
  ambient: 0.35,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.25,
  avril: 0.60,
  xtal: 0.40,
  syro: 0.20,
  blockhead: 0.35,
  flim: 0.45,
  disco: 0.30,
};

const sectionMult: Record<Section, number> = {
  intro: 0.8,
  build: 1.1,
  peak: 1.3,
  breakdown: 0.7,
  groove: 1.0,
};

/**
 * Gain multiplier based on position within a phrase arc.
 * phraseProgress: 0-1 position within current phrase
 * Peak of the arc is at ~0.65 (golden section).
 */
export function phraseArcGain(
  phraseProgress: number,
  mood: Mood,
  section: Section,
): number {
  const depth = moodArcDepth[mood] * sectionMult[section];
  // Bell curve centered at 0.65
  const peak = 0.65;
  const spread = 0.4;
  const dist = (phraseProgress - peak) / spread;
  const curve = Math.exp(-dist * dist); // 0-1 bell shape
  // Map curve to gain: bottom of arc → slight reduction, peak → slight boost
  const adjustment = (curve - 0.5) * 2 * depth * 0.05;
  return Math.max(0.96, Math.min(1.05, 1.0 + adjustment));
}

/** Per-mood arc depth for testing */
export function arcDepth(mood: Mood): number {
  return moodArcDepth[mood];
}
