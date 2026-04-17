import type { Mood } from '../types';

/**
 * Harmonic voice balance — differentiates outer voices (bass + soprano)
 * from inner voices (alto + tenor). Outer voices get slightly more
 * prominence as they define the harmonic frame.
 */

const moodBalanceDepth: Record<Mood, number> = {
  ambient: 0.35,
  plantasia: 0.35,
  downtempo: 0.40,
  lofi: 0.50,
  trance: 0.30,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.20,
  blockhead: 0.35,
  flim: 0.40,
  disco: 0.30,
};

/**
 * Gain multiplier based on voice position in the chord.
 * voiceIndex: 0 = bass (outer), 1-2 = inner, 3+ = soprano (outer)
 * voiceCount: total number of voices in the chord
 * Outer voices get boost, inner voices get slight reduction.
 */
export function voiceBalanceGain(
  voiceIndex: number,
  voiceCount: number,
  mood: Mood,
): number {
  if (voiceCount <= 1) return 1.0;
  const depth = moodBalanceDepth[mood];
  const isOuter = voiceIndex === 0 || voiceIndex === voiceCount - 1;
  const adjustment = isOuter ? depth * 0.04 : -depth * 0.02;
  return Math.max(0.97, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood balance depth for testing */
export function balanceDepth(mood: Mood): number {
  return moodBalanceDepth[mood];
}
