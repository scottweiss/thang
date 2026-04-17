import type { Mood, Section } from '../types';

/**
 * Melodic breath spacing — controls the gain reduction at phrase boundaries
 * to create audible "breathing" space between melodic phrases.
 * Moods that favor legato get shorter breaths; rhythmic moods get longer pauses.
 */

const moodBreathDepth: Record<Mood, number> = {
  ambient: 0.60,
  plantasia: 0.60,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.20,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.30,
  blockhead: 0.50,
  flim: 0.45,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 1.3,
  build: 0.8,
  peak: 0.6,
  breakdown: 1.4,
  groove: 1.0,
};

/**
 * Returns a gain multiplier (< 1.0) for phrase boundary positions.
 * phraseProgress: 0-1 position within current phrase
 * At phrase end (progress > 0.9), gain dips to create breath space.
 */
export function breathSpacingGain(
  phraseProgress: number,
  mood: Mood,
  section: Section,
): number {
  const depth = moodBreathDepth[mood] * sectionMultiplier[section];
  // Only apply near phrase end
  if (phraseProgress < 0.85) return 1.0;
  // Smooth ramp-down from 0.85 to 1.0
  const t = (phraseProgress - 0.85) / 0.15; // 0→1
  const reduction = t * t * depth * 0.08;
  return Math.max(0.92, 1.0 - reduction);
}

/** Per-mood breath depth for testing */
export function breathDepth(mood: Mood): number {
  return moodBreathDepth[mood];
}
