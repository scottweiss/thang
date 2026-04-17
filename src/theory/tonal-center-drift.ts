/**
 * Tonal center drift — gradual key center movement for subtle ambiguity.
 *
 * Rather than abrupt modulations, the tonal center can slowly drift
 * by biasing chord selection toward notes a fifth away from home.
 * This creates a dreamy quality where the listener isn't sure when
 * the key changed — like a slow pan across a landscape.
 *
 * Applied as a chord selection bias toward the drift target.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood drift rate (higher = faster drift away from home key).
 */
const DRIFT_RATE: Record<Mood, number> = {
  trance:    0.05,  // minimal — needs anchor
  avril:     0.20,  // moderate — Romantic wandering
  disco:     0.03,  // minimal — dance needs stability
  downtempo: 0.25,  // strong — lazy modulation
  blockhead: 0.10,  // weak
  lofi:      0.30,  // strong — jazz wandering
  flim:      0.20,  // moderate — Aphex drift
  xtal:      0.35,  // strong — ambient key dissolution
  syro:      0.15,  // moderate
  ambient:   0.40,  // strongest — tonal dissolution,
  plantasia: 0.40,
};

/**
 * Section multiplier on drift rate.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.5,   // establish key first
  build:     0.8,
  peak:      0.6,   // return to clarity
  breakdown: 1.4,   // maximum drift — dreamy
  groove:    1.0,
};

/**
 * Calculate drift bias for chord selection.
 * Returns a pitch class offset that chords should lean toward.
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns Drift amount in semitones (0-6, where 0 = home, 6 = tritone away)
 */
export function driftAmount(
  tick: number,
  mood: Mood,
  section: Section
): number {
  const rate = DRIFT_RATE[mood] * SECTION_MULT[section];
  // Slow sine wave drift over time
  const phase = tick * rate * 0.02;
  const wave = Math.sin(phase);
  // Map to 0-6 semitone range (tritone is maximum distance)
  return Math.abs(wave) * 6;
}

/**
 * Calculate drift direction (clockwise or counterclockwise on circle of fifths).
 *
 * @param tick Current tick
 * @param mood Current mood
 * @returns Direction: 1 = sharp direction, -1 = flat direction
 */
export function driftDirection(tick: number, mood: Mood): number {
  const phase = tick * DRIFT_RATE[mood] * 0.02;
  return Math.sin(phase) >= 0 ? 1 : -1;
}

/**
 * Should tonal drift be applied?
 */
export function shouldDrift(mood: Mood, section: Section): boolean {
  return DRIFT_RATE[mood] * SECTION_MULT[section] > 0.03;
}

/**
 * Get drift rate for a mood (for testing).
 */
export function driftRate(mood: Mood): number {
  return DRIFT_RATE[mood];
}
