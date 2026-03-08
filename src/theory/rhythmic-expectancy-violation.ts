/**
 * Rhythmic expectancy violation — reward small deviations from expected beats.
 *
 * Predictable rhythms create groove but too much predictability is boring.
 * Small violations of rhythmic expectancy (syncopation, ghost notes, delays)
 * create engagement. This module scores rhythmic patterns for their balance
 * of expectancy and surprise.
 *
 * Applied as gain emphasis on pleasingly unexpected rhythmic events.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood violation appetite (higher = more syncopation desired).
 */
const VIOLATION_APPETITE: Record<Mood, number> = {
  trance:    0.15,  // low — steady pulse
  avril:     0.30,  // moderate — classical rubato
  disco:     0.25,  // moderate — predictable groove
  downtempo: 0.40,  // moderate-high — laid back
  blockhead: 0.55,  // high — choppy hip-hop
  lofi:      0.50,  // high — lazy syncopation
  flim:      0.60,  // highest — glitchy timing
  xtal:      0.45,  // moderate-high
  syro:      0.65,  // highest — erratic
  ambient:   0.20,  // low — flowing
};

/**
 * Section multipliers — breakdowns allow more surprise.
 */
const SECTION_MULT: Record<Section, number> = {
  intro: 0.7,
  build: 1.0,
  peak: 0.8,
  breakdown: 1.2,
  groove: 1.1,
};

/**
 * Score a beat position for expectancy violation.
 * On-beat positions (0, 4, 8, 12) are expected; off-beat positions
 * are violations.
 *
 * @param position Beat position within a 16-step grid (0-15)
 * @param mood Current mood
 * @param section Current section
 * @returns Violation score (0.0 - 1.0)
 */
export function expectancyViolation(
  position: number,
  mood: Mood,
  section: Section
): number {
  const appetite = VIOLATION_APPETITE[mood] * SECTION_MULT[section];
  const pos = position % 16;

  // Strong beats (downbeat, backbeat) — no violation
  if (pos === 0 || pos === 8) return 0;

  // Quarter beats — mild violation
  if (pos === 4 || pos === 12) return appetite * 0.2;

  // Eighth beats — moderate violation
  if (pos % 2 === 0) return appetite * 0.5;

  // Sixteenth beats — strong violation
  return appetite * 0.8;
}

/**
 * Gain emphasis for pleasingly unexpected events.
 *
 * @param position Beat position (0-15)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.95 - 1.12)
 */
export function expectancyGainEmphasis(
  position: number,
  mood: Mood,
  section: Section
): number {
  const violation = expectancyViolation(position, mood, section);
  return Math.max(0.95, Math.min(1.12, 1.0 + violation * 0.15));
}

/**
 * Get violation appetite for a mood (for testing).
 */
export function violationAppetite(mood: Mood): number {
  return VIOLATION_APPETITE[mood];
}
