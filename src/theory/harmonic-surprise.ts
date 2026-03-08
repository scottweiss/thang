/**
 * Harmonic surprise — measure how unexpected each chord change is.
 *
 * In music perception, a deceptive cadence (V→vi instead of V→I)
 * creates a flash of surprise. A plagal cadence (IV→I) feels warm
 * and expected. The degree of surprise affects how we experience
 * the moment — surprising chords demand attention, expected chords
 * provide comfort.
 *
 * This module scores each chord transition's "surprise factor" and
 * modulates timbral/dynamic parameters:
 * - High surprise: brightness flash, slight gain boost, wider stereo
 * - Low surprise: warmth, steady dynamics, centered stereo
 *
 * Based on common-practice transition probabilities.
 */

import type { Mood } from '../types';
import type { ChordQuality } from '../types';

/**
 * Common chord transition expectedness (0 = very surprising, 1 = very expected).
 * Based on first-order Markov probabilities in common practice.
 * Key: `fromDegree-toDegree`
 */
const TRANSITION_EXPECTEDNESS: Record<string, number> = {
  // From I
  '1-4': 0.8, '1-5': 0.85, '1-6': 0.5, '1-2': 0.6, '1-3': 0.4,
  // From ii
  '2-5': 0.9, '2-1': 0.4, '2-4': 0.5, '2-7': 0.3,
  // From iii
  '3-6': 0.7, '3-4': 0.6, '3-2': 0.4,
  // From IV
  '4-5': 0.85, '4-1': 0.75, '4-2': 0.5, '4-6': 0.4,
  // From V
  '5-1': 0.95, '5-6': 0.25, '5-4': 0.35, '5-3': 0.2,
  // From vi
  '6-2': 0.7, '6-4': 0.65, '6-5': 0.6, '6-3': 0.4,
  // From vii
  '7-1': 0.85, '7-3': 0.5, '7-6': 0.3,
};

/**
 * Calculate the surprise factor of a chord transition.
 *
 * @param fromDegree  Previous chord degree (1-7)
 * @param toDegree    Current chord degree (1-7)
 * @returns Surprise factor (0 = expected, 1 = very surprising)
 */
export function chordSurprise(fromDegree: number, toDegree: number): number {
  if (fromDegree === toDegree) return 0.0; // repetition is never surprising

  const key = `${fromDegree}-${toDegree}`;
  const expectedness = TRANSITION_EXPECTEDNESS[key] ?? 0.35; // unknown = moderately surprising

  return 1.0 - expectedness;
}

/**
 * Quality surprise: unusual chord quality adds surprise.
 * dim, aug, sus chords are less expected than major/minor.
 */
export function qualitySurprise(quality: ChordQuality): number {
  switch (quality) {
    case 'maj':   return 0.0;
    case 'min':   return 0.0;
    case 'maj7':  return 0.1;
    case 'min7':  return 0.1;
    case 'dom7':  return 0.15;
    case 'sus2':  return 0.25;
    case 'sus4':  return 0.25;
    case 'add9':  return 0.2;
    case 'min9':  return 0.2;
    case 'dim':   return 0.4;
    case 'aug':   return 0.45;
    default:      return 0.15;
  }
}

/**
 * Combined surprise score from degree transition and quality.
 */
export function totalSurprise(
  fromDegree: number,
  toDegree: number,
  quality: ChordQuality
): number {
  const degSurprise = chordSurprise(fromDegree, toDegree);
  const qualSurprise = qualitySurprise(quality);
  return Math.min(1.0, degSurprise * 0.7 + qualSurprise * 0.3);
}

/**
 * Brightness multiplier based on surprise.
 * Surprising chords get a brief brightness flash.
 *
 * @param surprise   Surprise factor (0-1)
 * @param mood       Current mood
 * @returns LPF multiplier (1.0 = normal, > 1.0 = brighter)
 */
export function surpriseBrightness(surprise: number, mood: Mood): number {
  const sensitivity: Record<Mood, number> = {
    trance: 0.45, avril: 0.40, disco: 0.35, blockhead: 0.30,
    downtempo: 0.25, lofi: 0.20, flim: 0.15, xtal: 0.10,
    syro: 0.08, ambient: 0.05,
  };
  return 1.0 + surprise * sensitivity[mood] * 0.3;
}

/**
 * Gain multiplier based on surprise.
 * Surprising chords get a slight gain nudge.
 */
export function surpriseGain(surprise: number, mood: Mood): number {
  const sensitivity: Record<Mood, number> = {
    trance: 0.40, avril: 0.35, disco: 0.30, blockhead: 0.25,
    downtempo: 0.20, lofi: 0.15, flim: 0.12, xtal: 0.08,
    syro: 0.06, ambient: 0.03,
  };
  return 1.0 + surprise * sensitivity[mood] * 0.15;
}

/**
 * Get the surprise sensitivity for a mood (for testing).
 */
export function surpriseSensitivity(mood: Mood): number {
  const sensitivity: Record<Mood, number> = {
    trance: 0.45, avril: 0.40, disco: 0.35, blockhead: 0.30,
    downtempo: 0.25, lofi: 0.20, flim: 0.15, xtal: 0.10,
    syro: 0.08, ambient: 0.05,
  };
  return sensitivity[mood];
}
