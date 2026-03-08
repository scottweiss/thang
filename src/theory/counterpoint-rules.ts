/**
 * Counterpoint rules — species counterpoint for voice independence.
 *
 * Classical counterpoint rules ensure melodic lines remain independent
 * while sounding harmonious together. This module scores voice pairs
 * for parallel fifths/octaves, voice crossing, and contrary motion
 * preference.
 *
 * Applied as note selection penalty/bonus for arp relative to melody.
 */

import type { Mood } from '../types';

/**
 * Per-mood counterpoint strictness (higher = stricter rules).
 */
const STRICTNESS: Record<Mood, number> = {
  trance:    0.20,  // weak — parallel motion OK
  avril:     0.65,  // strongest — classical rules
  disco:     0.15,  // very weak — parallel OK
  downtempo: 0.40,  // moderate
  blockhead: 0.25,  // weak
  lofi:      0.55,  // strong — jazz independence
  flim:      0.50,  // strong
  xtal:      0.45,  // moderate
  syro:      0.30,  // moderate — some independence
  ambient:   0.35,  // moderate
};

/**
 * Check for parallel perfect intervals (fifths/octaves).
 *
 * @param prevInterval Previous interval between voices (semitones)
 * @param currInterval Current interval between voices (semitones)
 * @returns true if parallel perfect interval detected
 */
export function hasParallelPerfect(
  prevInterval: number,
  currInterval: number
): boolean {
  const isPerfect = (i: number) => {
    const normalized = ((i % 12) + 12) % 12;
    return normalized === 0 || normalized === 7 || normalized === 5;
  };
  return isPerfect(prevInterval) && isPerfect(currInterval) && prevInterval === currInterval;
}

/**
 * Score a voice pair for counterpoint quality.
 *
 * @param prevMelody Previous melody pitch class
 * @param currMelody Current melody pitch class
 * @param prevArp Previous arp pitch class
 * @param currArp Current/candidate arp pitch class
 * @param mood Current mood
 * @returns Quality score (0.0 = worst, 1.0 = best)
 */
export function counterpointScore(
  prevMelody: number,
  currMelody: number,
  prevArp: number,
  currArp: number,
  mood: Mood
): number {
  const strictness = STRICTNESS[mood];
  let score = 0.7; // baseline

  // Penalty for parallel perfect intervals
  const prevInterval = prevMelody - prevArp;
  const currInterval = currMelody - currArp;
  if (hasParallelPerfect(prevInterval, currInterval)) {
    score -= 0.3 * strictness;
  }

  // Bonus for contrary motion
  const melodyDir = Math.sign(currMelody - prevMelody);
  const arpDir = Math.sign(currArp - prevArp);
  if (melodyDir !== 0 && arpDir !== 0 && melodyDir !== arpDir) {
    score += 0.2 * strictness; // contrary motion bonus
  }

  // Bonus for oblique motion (one voice holds)
  if (melodyDir === 0 || arpDir === 0) {
    score += 0.1 * strictness;
  }

  // Penalty for voice crossing
  if ((prevMelody > prevArp && currMelody < currArp) ||
      (prevMelody < prevArp && currMelody > currArp)) {
    score -= 0.15 * strictness;
  }

  return Math.max(0.0, Math.min(1.0, score));
}

/**
 * Get strictness for a mood (for testing).
 */
export function counterpointStrictness(mood: Mood): number {
  return STRICTNESS[mood];
}
