/**
 * Consonance fatigue — perceptual consonance/dissonance tracking.
 *
 * Prolonged consonance desensitizes the listener; returning to
 * diatonic after dissonance feels extra resolved. This module
 * tracks cumulative consonance over time and signals when the
 * ear needs variety (too consonant → inject color, too dissonant
 * → resolve sooner).
 *
 * Based on psychoacoustic research: expectancy violation creates
 * stronger emotional responses than the harmony itself.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood sensitivity to consonance fatigue.
 * Higher = quicker fatigue from sustained consonance.
 */
const FATIGUE_RATE: Record<Mood, number> = {
  trance:    0.08,  // tolerates repetition
  avril:     0.12,  // moderate sensitivity
  disco:     0.10,  // groove-tolerant
  downtempo: 0.18,  // needs variety
  blockhead: 0.22,  // easily bored
  lofi:      0.20,  // jazz ear wants color
  flim:      0.25,  // organic movement
  xtal:      0.30,  // floating, needs drift
  syro:      0.35,  // hungers for change
  ambient:   0.15,  // slow but steady fatigue
};

/**
 * Section recovery rates — how fast fatigue dissipates.
 */
const RECOVERY_RATE: Record<Section, number> = {
  intro:     0.3,   // fresh ears
  build:     0.15,  // accumulating
  peak:      0.1,   // sustained intensity
  breakdown: 0.4,   // reset / breathing room
  groove:    0.2,   // moderate recovery
};

/**
 * Consonance score for common interval classes (0-11 semitones).
 * Based on Helmholtz/Plomp-Levelt roughness curves.
 */
const INTERVAL_CONSONANCE: number[] = [
  1.0,   // 0: unison
  0.15,  // 1: minor 2nd
  0.30,  // 2: major 2nd
  0.65,  // 3: minor 3rd
  0.75,  // 4: major 3rd
  0.80,  // 5: perfect 4th
  0.20,  // 6: tritone
  0.90,  // 7: perfect 5th
  0.70,  // 8: minor 6th
  0.60,  // 9: major 6th
  0.35,  // 10: minor 7th
  0.40,  // 11: major 7th
];

/**
 * Calculate the average consonance of a set of pitch classes.
 * Considers all pairwise intervals.
 *
 * @param pitchClasses Array of pitch classes (0-11)
 * @returns Consonance score 0-1 (1 = maximally consonant)
 */
export function chordConsonance(pitchClasses: number[]): number {
  if (pitchClasses.length < 2) return 1.0;

  let sum = 0;
  let count = 0;
  for (let i = 0; i < pitchClasses.length; i++) {
    for (let j = i + 1; j < pitchClasses.length; j++) {
      const interval = Math.abs(pitchClasses[i] - pitchClasses[j]) % 12;
      const normalised = Math.min(interval, 12 - interval);
      sum += INTERVAL_CONSONANCE[normalised];
      count++;
    }
  }
  return count > 0 ? sum / count : 1.0;
}

/**
 * Update fatigue level based on current consonance.
 * Fatigue accumulates when consonance is high; dissipates when low.
 *
 * @param currentFatigue Current fatigue level (0-1)
 * @param consonance Current chord consonance (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Updated fatigue level (0-1)
 */
export function updateFatigue(
  currentFatigue: number,
  consonance: number,
  mood: Mood,
  section: Section
): number {
  const rate = FATIGUE_RATE[mood];
  const recovery = RECOVERY_RATE[section];

  // High consonance increases fatigue; low consonance lets it recover
  const delta = consonance > 0.6
    ? rate * (consonance - 0.6) * 2.5   // accumulate
    : -recovery * (0.6 - consonance);    // recover

  return Math.max(0, Math.min(1, currentFatigue + delta));
}

/**
 * Should we inject harmonic color to combat fatigue?
 * Returns true when listener has been in consonant territory too long.
 *
 * @param fatigue Current fatigue level (0-1)
 * @param mood Current mood
 * @returns Whether to inject dissonance/color
 */
export function shouldInjectColor(fatigue: number, mood: Mood): boolean {
  // Threshold varies by mood — syro injects color early, trance waits longer
  const threshold = 1.0 - FATIGUE_RATE[mood] * 2;
  return fatigue > threshold;
}

/**
 * Consonance fatigue multiplier for harmonic extensions.
 * When fatigued, bias toward richer chords (7ths, 9ths, altered).
 *
 * @param fatigue Current fatigue level (0-1)
 * @returns Multiplier 0-1 (higher = more extensions wanted)
 */
export function extensionBias(fatigue: number): number {
  // Sigmoid-like curve: low fatigue → 0, high → approaches 1
  return Math.max(0, Math.min(1, (fatigue - 0.3) * 1.43));
}

/**
 * Resolution strength bonus after sustained dissonance.
 * Returning to consonance after dissonance feels extra satisfying.
 *
 * @param fatigue Current fatigue level (0-1)
 * @param consonance Current chord consonance (0-1)
 * @returns Bonus resolution strength (0-0.5)
 */
export function resolutionBonus(fatigue: number, consonance: number): number {
  // Low fatigue + high consonance = no bonus (we're already consonant)
  // High fatigue + high consonance = big bonus (relief after tension)
  if (consonance < 0.7) return 0;
  return Math.min(0.5, fatigue * consonance * 0.6);
}

/**
 * Get fatigue rate for a mood (for testing).
 */
export function fatigueRate(mood: Mood): number {
  return FATIGUE_RATE[mood];
}
