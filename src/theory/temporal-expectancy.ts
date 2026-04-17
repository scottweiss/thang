/**
 * Temporal expectancy — predict when the listener expects events.
 *
 * Listeners build temporal models: if notes arrive every 2 beats,
 * they expect the next at beat 3. Fulfilling expectation creates
 * groove; violating it creates surprise. This module tracks event
 * timing patterns and signals when to delay (anticipation) or
 * rush (urgency) relative to the expected moment.
 *
 * Applied to melody/arp timing: adds micro-timing variation that
 * responds to the listener's internal clock, not just the beat grid.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood tendency to violate temporal expectancy.
 * Higher = more deviation from expected timing.
 */
const VIOLATION_TENDENCY: Record<Mood, number> = {
  trance:    0.05,  // highly predictable, metronomic
  avril:     0.15,  // gentle rubato
  disco:     0.08,  // groove-locked
  downtempo: 0.25,  // laid back
  blockhead: 0.30,  // hip-hop timing
  lofi:      0.35,  // jazz-lazy
  flim:      0.30,  // organic timing
  xtal:      0.40,  // floating, ambiguous
  syro:      0.45,  // intentionally jarring
  ambient:   0.20,  // slow but surprising,
  plantasia: 0.20,
};

/**
 * Section multiplier for violation tendency.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,   // establish regularity first
  build:     1.0,   // growing
  peak:      0.8,   // lock in for energy
  breakdown: 1.3,   // more freedom
  groove:    1.0,   // cruising
};

/**
 * Calculate expected inter-onset interval from recent event times.
 * Uses the mode (most common interval) for robustness.
 *
 * @param recentOnsets Array of recent event tick positions
 * @returns Expected interval between events (in ticks/positions)
 */
export function expectedInterval(recentOnsets: number[]): number {
  if (recentOnsets.length < 3) return 4; // default to quarter-note spacing

  const intervals: number[] = [];
  for (let i = 1; i < recentOnsets.length; i++) {
    intervals.push(recentOnsets[i] - recentOnsets[i - 1]);
  }

  // Find mode
  const counts = new Map<number, number>();
  for (const iv of intervals) {
    counts.set(iv, (counts.get(iv) ?? 0) + 1);
  }

  let mode = intervals[0];
  let maxCount = 0;
  for (const [iv, c] of counts) {
    if (c > maxCount) { maxCount = c; mode = iv; }
  }

  return mode;
}

/**
 * How surprising is a given onset position relative to expectation?
 * Returns 0-1 where 0 = perfectly expected, 1 = maximally surprising.
 *
 * @param position Current note position
 * @param recentOnsets Recent event positions
 * @returns Surprise score 0-1
 */
export function onsetSurprise(
  position: number,
  recentOnsets: number[]
): number {
  if (recentOnsets.length < 2) return 0;

  const expected = expectedInterval(recentOnsets);
  const lastOnset = recentOnsets[recentOnsets.length - 1];
  const expectedPos = lastOnset + expected;
  const deviation = Math.abs(position - expectedPos);

  // Normalize by expected interval
  return Math.min(1, deviation / Math.max(1, expected));
}

/**
 * Should we delay the next event for anticipation buildup?
 * Returns a delay amount (0 = no delay, positive = late).
 *
 * @param recentOnsets Recent event positions
 * @param mood Current mood
 * @param section Current section
 * @param tick Current tick for determinism
 * @returns Delay amount (0-2 position units)
 */
export function anticipationDelay(
  recentOnsets: number[],
  mood: Mood,
  section: Section,
  tick: number
): number {
  const tendency = VIOLATION_TENDENCY[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 48611) >>> 0) / 4294967296;

  // Only delay sometimes, based on tendency
  if (hash > tendency) return 0;

  // Delay amount scales with tendency
  return tendency * 2; // max delay = 2 * 0.45 = 0.9 positions
}

/**
 * Should we rush the next event for urgency?
 * Returns a rush amount (0 = no rush, positive = early).
 *
 * @param tension Current tension level
 * @param mood Current mood
 * @param section Current section
 * @param tick Current tick
 * @returns Rush amount (0-1 position units)
 */
export function urgencyRush(
  tension: number,
  mood: Mood,
  section: Section,
  tick: number
): number {
  // Rush happens at high tension in build sections
  if (tension < 0.6) return 0;
  if (section !== 'build' && section !== 'peak') return 0;

  const tendency = VIOLATION_TENDENCY[mood] * SECTION_MULT[section];
  const hash = ((tick * 2654435761 + 104729) >>> 0) / 4294967296;

  if (hash > tendency * 0.5) return 0;

  return (tension - 0.6) * tendency * 2;
}

/**
 * Get violation tendency for a mood (for testing).
 */
export function violationTendency(mood: Mood): number {
  return VIOLATION_TENDENCY[mood];
}
