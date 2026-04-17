/**
 * Call and response — conversational interplay between musical layers.
 *
 * When one layer (melody) is busy, another (arp) should thin out to
 * create space, like musicians listening to each other. This prevents
 * wall-of-sound and gives the music a natural conversational feel.
 *
 * The amount of coordination varies by mood: IDM styles (syro, flim)
 * are highly conversational, while ambient and trance let layers
 * float more independently.
 */

import type { Mood } from '../types';

/**
 * Adjust a layer's density based on how busy another layer is.
 *
 * When the other layer is busy, this layer backs off. When the other
 * layer is sparse, this layer can fill the space.
 *
 * @param otherLayerDensity 0-1, how busy the other layer is
 * @param baseDensity       0-1, what this layer would normally use
 * @param amount            0-1, how much to respond (0 = ignore, 1 = fully complementary)
 * @returns Adjusted density, clamped to [0.05, 1.0]
 */
export function complementaryDensity(
  otherLayerDensity: number,
  baseDensity: number,
  amount: number
): number {
  // When amount is 0, return baseDensity unchanged
  // When amount is 1, fully complement the other layer
  const complement = 1 - otherLayerDensity;
  const adjusted = baseDensity + amount * (complement - baseDensity) * otherLayerDensity;

  // When other is sparse (low), allow a slight boost
  const sparseLift = amount * (1 - otherLayerDensity) * 0.05;

  const result = adjusted + sparseLift;
  return Math.max(0.05, Math.min(1.0, result));
}

/**
 * Measure the density of a Strudel pattern string.
 *
 * Counts the ratio of non-rest tokens to total tokens.
 * e.g. "C3 ~ E3 ~ G3 ~ ~ ~" → 3/8 = 0.375
 *
 * @param patternString A space-separated pattern string
 * @param restToken     The token representing silence (default '~')
 * @returns 0-1, ratio of active steps to total steps
 */
export function measurePatternDensity(
  patternString: string,
  restToken: string = '~'
): number {
  const tokens = patternString.trim().split(/\s+/);
  if (tokens.length === 0) return 0;

  const activeCount = tokens.filter(t => t !== restToken).length;
  return activeCount / tokens.length;
}

/** Call-and-response amount per mood */
const moodCallResponse: Record<Mood, number> = {
  syro: 0.6,
  blockhead: 0.5,
  flim: 0.45,
  downtempo: 0.4,
  disco: 0.4,
  lofi: 0.35,
  xtal: 0.3,
  avril: 0.25,
  trance: 0.2,
  ambient: 0.15,
  plantasia: 0.15,
};

/**
 * How much call-and-response coordination to apply for a given mood.
 *
 * @param mood The current mood
 * @returns 0-1, amount of inter-layer conversation
 */
export function callResponseAmount(mood: Mood): number {
  return moodCallResponse[mood];
}
