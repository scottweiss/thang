/**
 * Voice density balance — ensure melody prominence by managing polyphonic density.
 *
 * When harmony uses thick voicings (4+ notes) AND melody is active,
 * reduce harmony note count to prevent the melody from being buried.
 * The thinner the melody, the thinner accompaniment should be.
 *
 * Applied as a voicing thinning signal for the harmony layer.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood maximum harmony voice count when melody is active.
 */
const MAX_VOICES_WITH_MELODY: Record<Mood, number> = {
  trance:    4,     // dense OK — melody is synth lead
  avril:     3,     // thin — piano accompaniment
  disco:     4,     // moderate
  downtempo: 3,     // clean
  blockhead: 3,     // simple
  lofi:      3,     // jazz clarity — trio feel
  flim:      3,     // organic
  xtal:      2,     // minimal — sparse ambient
  syro:      4,     // dense OK — IDM layers
  ambient:   2,     // minimal — space
};

/**
 * Per-mood maximum harmony voice count without melody.
 */
const MAX_VOICES_WITHOUT_MELODY: Record<Mood, number> = {
  trance:    5,
  avril:     5,
  disco:     5,
  downtempo: 4,
  blockhead: 4,
  lofi:      5,
  flim:      4,
  xtal:      3,
  syro:      5,
  ambient:   3,
};

/**
 * Get maximum recommended voice count for harmony.
 *
 * @param mood Current mood
 * @param melodyActive Whether melody layer is currently sounding
 * @returns Maximum voice count (2-5)
 */
export function maxHarmonyVoices(
  mood: Mood,
  melodyActive: boolean
): number {
  return melodyActive
    ? MAX_VOICES_WITH_MELODY[mood]
    : MAX_VOICES_WITHOUT_MELODY[mood];
}

/**
 * Calculate gain reduction for harmony when it exceeds voice count limit.
 *
 * @param actualVoices Current number of harmony voices
 * @param maxVoices Maximum recommended from maxHarmonyVoices()
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.0)
 */
export function densityGainPenalty(
  actualVoices: number,
  maxVoices: number,
  mood: Mood
): number {
  if (actualVoices <= maxVoices) return 1.0;
  const excess = actualVoices - maxVoices;
  const penalty = excess * 0.05;
  return Math.max(0.85, 1.0 - penalty);
}

/**
 * Should voice density balancing be applied?
 */
export function shouldBalanceVoiceDensity(
  mood: Mood,
  melodyActive: boolean,
  harmonyVoices: number
): boolean {
  const max = maxHarmonyVoices(mood, melodyActive);
  return harmonyVoices > max;
}
