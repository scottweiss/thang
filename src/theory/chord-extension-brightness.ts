import type { Mood, ChordQuality } from '../types';

/**
 * Chord extension brightness — extended chords (7ths, 9ths) have richer
 * harmonic content so they get slight FM boost to emphasize the color.
 * Simple triads stay pure. Models how jazz voicings need more shimmer.
 */

const moodSensitivity: Record<Mood, number> = {
  ambient: 0.40,
  plantasia: 0.40,
  downtempo: 0.45,
  lofi: 0.55,
  trance: 0.20,
  avril: 0.50,
  xtal: 0.45,
  syro: 0.35,
  blockhead: 0.30,
  flim: 0.40,
  disco: 0.25,
};

/** Extension richness score: triads=0, 7ths=0.5, 9ths=1.0 */
const qualityRichness: Record<ChordQuality, number> = {
  maj: 0.0,
  min: 0.0,
  sus2: 0.1,
  sus4: 0.1,
  dim: 0.2,
  aug: 0.3,
  dom7: 0.5,
  maj7: 0.6,
  min7: 0.5,
  add9: 0.8,
  min9: 1.0,
};

/**
 * FM multiplier based on chord extension richness.
 * Richer chords → slight FM boost for color.
 */
export function extensionBrightnessFm(
  quality: ChordQuality,
  mood: Mood,
): number {
  const richness = qualityRichness[quality] ?? 0;
  const sensitivity = moodSensitivity[mood];
  const boost = richness * sensitivity * 0.08;
  return Math.max(1.0, Math.min(1.06, 1.0 + boost));
}

/** Per-mood sensitivity for testing */
export function extensionSensitivity(mood: Mood): number {
  return moodSensitivity[mood];
}
