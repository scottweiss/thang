/**
 * Quality envelope decay — chord quality determines note decay shape.
 *
 * Major chords ring out confidently (longer decay).
 * Minor chords are more intimate (moderate decay).
 * Diminished/augmented chords are unstable (shorter decay, want resolution).
 * Suspended chords hang (longer sustain, shorter decay).
 *
 * Applied as decay multiplier for harmony/drone layers.
 */

import type { Mood } from '../types';
import type { ChordQuality } from '../types';

/**
 * Per-mood quality sensitivity (higher = more decay variation by quality).
 */
const QUALITY_SENSITIVITY: Record<Mood, number> = {
  trance:    0.35,  // moderate
  avril:     0.55,  // high — expressive
  disco:     0.25,  // low — steady
  downtempo: 0.45,  // moderate
  blockhead: 0.20,  // low — punchy
  lofi:      0.50,  // high — jazz expression
  flim:      0.45,  // moderate
  xtal:      0.50,  // high
  syro:      0.30,  // moderate
  ambient:   0.60,  // highest — atmospheric,
  plantasia: 0.60,
};

/**
 * Base decay multiplier for each chord quality.
 */
const QUALITY_DECAY: Record<ChordQuality, number> = {
  maj:  1.15,   // confident ring
  min:  1.0,    // moderate
  maj7: 1.2,    // lush
  min7: 1.05,   // warm
  dom7: 0.9,    // wants resolution
  sus2: 1.1,    // suspended
  sus4: 1.1,    // suspended
  dim:  0.75,   // unstable, short
  aug:  0.8,    // unstable, short
  add9: 1.15,   // rich, confident
  min9: 1.1,    // warm, rich
};

/**
 * Calculate decay multiplier based on chord quality.
 *
 * @param quality Current chord quality
 * @param mood Current mood
 * @returns Decay multiplier (0.7 - 1.4)
 */
export function qualityDecay(
  quality: ChordQuality,
  mood: Mood
): number {
  const sensitivity = QUALITY_SENSITIVITY[mood];
  const base = QUALITY_DECAY[quality] ?? 1.0;
  const deviation = (base - 1.0) * sensitivity;
  return Math.max(0.7, Math.min(1.4, 1.0 + deviation));
}

/**
 * Get quality sensitivity for a mood (for testing).
 */
export function qualitySensitivity(mood: Mood): number {
  return QUALITY_SENSITIVITY[mood];
}
