import type { Mood, Section } from '../types';

/**
 * Rhythmic subdivision variety — varies the subdivision density within
 * phrases to create rhythmic interest. Phrase starts can be sparse,
 * middles denser, endings resolving. Prevents metronomic uniformity.
 */

const moodVariety: Record<Mood, number> = {
  ambient: 0.40,
  downtempo: 0.35,
  lofi: 0.45,
  trance: 0.20,
  avril: 0.50,
  xtal: 0.55,
  syro: 0.60,
  blockhead: 0.40,
  flim: 0.50,
  disco: 0.25,
};

/**
 * Gain multiplier that shapes rhythmic density within phrases.
 * phraseProgress: 0-1 position within phrase
 * Creates a density curve: sparse start, dense middle, resolving end.
 */
export function subdivisionVarietyGain(
  phraseProgress: number,
  mood: Mood,
): number {
  const variety = moodVariety[mood];
  // Bell curve centered at 0.55 (slightly past middle)
  const peak = 0.55;
  const spread = 0.35;
  const dist = (phraseProgress - peak) / spread;
  const curve = Math.exp(-dist * dist);
  // Map to gain: denser sections slightly louder
  const adjustment = (curve - 0.5) * variety * 0.05;
  return Math.max(0.97, Math.min(1.03, 1.0 + adjustment));
}

/** Per-mood variety depth for testing */
export function subdivisionVarietyDepth(mood: Mood): number {
  return moodVariety[mood];
}
