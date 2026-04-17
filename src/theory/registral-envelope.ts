/**
 * Registral envelope — melody pitch range expands with phrase arc.
 *
 * At phrase beginnings, melodies stay in a narrow range. As the phrase
 * develops, the range expands. At climax, the full range is available.
 * At phrase end, range contracts back.
 *
 * Applied as pitch range limits for melody note selection.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood range expansion factor (higher = wider expansion).
 */
const EXPANSION_FACTOR: Record<Mood, number> = {
  trance:    0.40,  // moderate — controlled range
  avril:     0.60,  // strongest — dramatic range
  disco:     0.30,  // moderate
  downtempo: 0.35,  // moderate
  blockhead: 0.25,  // weak — compact melodies
  lofi:      0.45,  // moderate — jazz range
  flim:      0.50,  // strong — wide exploration
  xtal:      0.55,  // strong — crystalline range
  syro:      0.65,  // strongest — wide leaps
  ambient:   0.40,  // moderate — gentle expansion,
  plantasia: 0.40,
};

/**
 * Calculate available range fraction at a phrase position.
 * Returns 0.0-1.0 where 1.0 = full range available.
 *
 * @param phrasePosition 0.0-1.0 position within phrase
 * @param mood Current mood
 * @returns Available range fraction (0.3 - 1.0)
 */
export function availableRange(
  phrasePosition: number,
  mood: Mood
): number {
  const expansion = EXPANSION_FACTOR[mood];
  const pos = Math.max(0, Math.min(1, phrasePosition));
  // Bell curve centered at 0.6 (golden section)
  const openness = Math.exp(-Math.pow((pos - 0.6) / 0.35, 2));
  const baseRange = 0.4; // minimum range fraction
  return Math.min(1.0, baseRange + openness * expansion * 0.6);
}

/**
 * Calculate semitone range at a phrase position.
 *
 * @param phrasePosition 0.0-1.0 position within phrase
 * @param mood Current mood
 * @param maxRange Maximum range in semitones (typically 12-24)
 * @returns Available range in semitones
 */
export function semitoneRange(
  phrasePosition: number,
  mood: Mood,
  maxRange: number
): number {
  return Math.round(availableRange(phrasePosition, mood) * maxRange);
}

/**
 * Get expansion factor for a mood (for testing).
 */
export function registralExpansion(mood: Mood): number {
  return EXPANSION_FACTOR[mood];
}
