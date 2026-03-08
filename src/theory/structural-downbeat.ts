/**
 * Structural downbeat — the first note after silence is the most important.
 *
 * In music, the note that breaks a silence carries enormous weight.
 * After a grand pause, a section change, or a phrase gap, the first
 * sounding note defines the character of what follows. It should be:
 *
 * 1. A chord tone (usually root or 5th)
 * 2. On a strong beat position
 * 3. Given extra gain/brightness emphasis
 * 4. Placed in the expected register for the section
 *
 * This module detects when a "structural downbeat" should occur and
 * provides emphasis parameters for it.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood emphasis for structural downbeats.
 * Higher = more dramatic first-note emphasis.
 */
const DOWNBEAT_EMPHASIS: Record<Mood, number> = {
  trance:    0.55,  // huge drop moments
  avril:     0.50,  // dramatic entries
  disco:     0.45,  // groove re-entry
  blockhead: 0.40,  // hip-hop drops
  downtempo: 0.30,  // moderate emphasis
  lofi:      0.25,  // subtle
  flim:      0.20,  // organic
  xtal:      0.15,  // gentle
  syro:      0.10,  // intentionally unemphasized
  ambient:   0.05,  // barely any emphasis
};

/**
 * Detect if the current moment is a structural downbeat.
 * A structural downbeat occurs when:
 * - Section just changed
 * - Coming out of a grand pause
 * - First tick after a silence period
 */
export function isStructuralDownbeat(
  sectionChanged: boolean,
  gpJustEnded: boolean,
  ticksSinceSilence: number
): boolean {
  if (sectionChanged) return true;
  if (gpJustEnded) return true;
  if (ticksSinceSilence === 1) return true; // first tick after silence
  return false;
}

/**
 * Gain boost for structural downbeat.
 * Returns a multiplier > 1.0 for the first beat of the new phrase.
 */
export function downbeatGainBoost(mood: Mood, section: Section): number {
  const emphasis = DOWNBEAT_EMPHASIS[mood];
  const sectionMult: Record<Section, number> = {
    intro:     0.5,  // gentle entry
    build:     1.0,
    peak:      1.5,  // biggest impact
    breakdown: 0.7,
    groove:    1.2,
  };
  return 1.0 + emphasis * sectionMult[section] * 0.3;
}

/**
 * LPF boost for structural downbeat (brightness flash).
 * Returns a multiplier > 1.0 to brighten the entry.
 */
export function downbeatBrightnessBoost(mood: Mood): number {
  const emphasis = DOWNBEAT_EMPHASIS[mood];
  return 1.0 + emphasis * 0.2;
}

/**
 * How many ticks the structural downbeat emphasis should decay over.
 * The emphasis starts at full and decays exponentially.
 */
export function downbeatDecayTicks(mood: Mood): number {
  if (DOWNBEAT_EMPHASIS[mood] > 0.4) return 3;  // fast decay for dramatic moods
  if (DOWNBEAT_EMPHASIS[mood] > 0.2) return 2;
  return 1;
}

/**
 * Calculate decayed emphasis at a given number of ticks after the downbeat.
 *
 * @param ticksAfter  Number of ticks since the structural downbeat
 * @param mood        Current mood
 * @returns Emphasis multiplier (1.0 = no emphasis, > 1.0 = emphasized)
 */
export function decayedEmphasis(ticksAfter: number, mood: Mood): number {
  if (ticksAfter < 0) return 1.0;

  const maxTicks = downbeatDecayTicks(mood);
  if (ticksAfter >= maxTicks) return 1.0;

  const baseBoost = DOWNBEAT_EMPHASIS[mood] * 0.3;
  const decay = Math.exp(-ticksAfter * 1.5); // exponential decay

  return 1.0 + baseBoost * decay;
}

/**
 * Get emphasis strength for a mood (for testing).
 */
export function downbeatEmphasis(mood: Mood): number {
  return DOWNBEAT_EMPHASIS[mood];
}
