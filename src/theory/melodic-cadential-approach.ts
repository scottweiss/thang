import type { Mood, Section } from '../types';

/**
 * Melodic Cadential Approach — gain boost for stepwise resolution to tonic.
 *
 * When melody approaches the tonic by step (scale degree 2→1 or 7→1),
 * it creates a strong sense of arrival. This module boosts gain on
 * cadential approach notes near phrase endings.
 */

const moodStrength: Record<Mood, number> = {
  ambient: 0.3,
  downtempo: 0.6,
  lofi: 0.5,
  trance: 0.7,
  avril: 0.8,
  xtal: 0.5,
  syro: 0.4,
  blockhead: 0.3,
  flim: 0.6,
  disco: 0.5,
};

const sectionMult: Record<Section, number> = {
  intro: 0.5,
  build: 0.8,
  peak: 1.0,
  breakdown: 0.6,
  groove: 0.7,
};

/**
 * Check if a note is a cadential approach tone (step away from tonic).
 * Returns the approach type or null.
 */
export function cadentialApproachType(
  noteMidi: number,
  tonicMidi: number,
): 'leading-tone' | 'supertonic' | null {
  const interval = ((noteMidi - tonicMidi) % 12 + 12) % 12;
  // Leading tone: half step below (interval 11)
  if (interval === 11) return 'leading-tone';
  // Supertonic: whole step above (interval 2)
  if (interval === 2) return 'supertonic';
  return null;
}

/**
 * Gain boost for cadential approach tones.
 * Leading tones get a stronger boost than supertonics.
 * phraseProgress 0→1 indicates position within phrase (1 = end).
 */
export function cadentialApproachGain(
  noteMidi: number,
  tonicMidi: number,
  phraseProgress: number,
  mood: Mood,
  section: Section,
): number {
  const approach = cadentialApproachType(noteMidi, tonicMidi);
  if (!approach) return 1.0;

  const strength = (moodStrength[mood] ?? 0.5) * (sectionMult[section] ?? 0.7);
  // Only boost near phrase endings (last 30%)
  const phraseFactor = phraseProgress > 0.7
    ? (phraseProgress - 0.7) / 0.3
    : 0;

  if (phraseFactor < 0.01) return 1.0;

  const baseBoost = approach === 'leading-tone' ? 0.06 : 0.04;
  return 1 + baseBoost * strength * phraseFactor;
}
