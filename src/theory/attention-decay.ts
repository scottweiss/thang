/**
 * Attention decay — listener engagement from novelty injection rate.
 *
 * Models how listener attention rises with novelty (chord changes,
 * density shifts, new layers) and decays without it. Signals when
 * the music needs a change to maintain engagement.
 *
 * Applied as a novelty injection trigger and fatigue risk indicator.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood novelty threshold (how much change per tick to maintain attention).
 */
const NOVELTY_THRESHOLD: Record<Mood, number> = {
  trance:    0.20,  // low — hypnotic repetition
  avril:     0.45,  // moderate-high — classical development
  disco:     0.30,  // moderate
  downtempo: 0.25,  // low-moderate
  blockhead: 0.38,  // moderate
  lofi:      0.35,  // moderate
  flim:      0.42,  // moderate-high
  xtal:      0.40,  // moderate
  syro:      0.55,  // highest — IDM demands novelty
  ambient:   0.15,  // lowest — meditative stability
};

/**
 * Per-mood attention decay rate (how fast engagement drops without novelty).
 */
const DECAY_RATE: Record<Mood, number> = {
  trance:    0.05,  // slow — groove sustains
  avril:     0.12,  // moderate
  disco:     0.08,  // slow-moderate
  downtempo: 0.07,  // slow
  blockhead: 0.10,  // moderate
  lofi:      0.09,  // moderate
  flim:      0.11,  // moderate
  xtal:      0.10,  // moderate
  syro:      0.15,  // fast — attention drops quickly
  ambient:   0.03,  // slowest — peaceful sustained focus
};

/**
 * Section multiplier on decay rate.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.6,   // slow decay — establishing
  build:     0.8,
  peak:      1.0,   // fastest decay — needs constant fuel
  breakdown: 0.5,   // slow — reflective
  groove:    0.7,
};

/**
 * Calculate attention energy based on novelty and time since last change.
 *
 * @param ticksSinceChange Ticks since last significant musical change
 * @param mood Current mood
 * @param section Current section
 * @returns Attention energy 0-1 (1 = fully engaged, 0 = tuned out)
 */
export function attentionEnergy(
  ticksSinceChange: number,
  mood: Mood,
  section: Section
): number {
  const decay = DECAY_RATE[mood] * SECTION_MULT[section];
  return Math.max(0, Math.exp(-decay * ticksSinceChange));
}

/**
 * Should novelty be injected to maintain engagement?
 *
 * @param attention Current attention energy 0-1
 * @param mood Current mood
 * @returns Whether novelty injection is recommended
 */
export function needsNovelty(
  attention: number,
  mood: Mood
): boolean {
  const threshold = NOVELTY_THRESHOLD[mood];
  return attention < (1.0 - threshold);
}

/**
 * Calculate fatigue risk — probability listener tunes out.
 *
 * @param ticksAtCurrentIntensity How long at same energy level
 * @param mood Current mood
 * @returns Fatigue risk 0-1
 */
export function fatigueRisk(
  ticksAtCurrentIntensity: number,
  mood: Mood
): number {
  const decay = DECAY_RATE[mood];
  const fatigue = 1.0 - Math.exp(-decay * ticksAtCurrentIntensity * 0.5);
  return Math.min(1, fatigue);
}

/**
 * Calculate novelty gain boost — brief brightness when something changes.
 *
 * @param ticksSinceNovelty Ticks since last novel event
 * @param mood Current mood
 * @returns Gain multiplier (1.0 - 1.08)
 */
export function noveltyGainBoost(
  ticksSinceNovelty: number,
  mood: Mood
): number {
  if (ticksSinceNovelty > 2) return 1.0;
  const threshold = NOVELTY_THRESHOLD[mood];
  const boost = threshold * 0.15 * Math.exp(-ticksSinceNovelty * 0.8);
  return 1.0 + Math.min(0.08, boost);
}

/**
 * Should attention decay be applied?
 */
export function shouldTrackAttention(mood: Mood): boolean {
  return DECAY_RATE[mood] > 0.02;
}

/**
 * Get novelty threshold for a mood (for testing).
 */
export function noveltyThreshold(mood: Mood): number {
  return NOVELTY_THRESHOLD[mood];
}
