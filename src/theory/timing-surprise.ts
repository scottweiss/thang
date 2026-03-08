/**
 * Timing surprise — micro-rhythmic expectancy violations.
 *
 * Occasional notes arrive slightly early or late, breaking rhythmic
 * expectations in a delightful way. Unlike consistent micro-timing
 * humanization, these are rare "hiccups" that create playful
 * looseness — a note pops slightly ahead of the beat or drags
 * just behind it.
 *
 * Applied as an additional .late() offset on specific ticks,
 * determined by a low probability per mood.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood surprise probability (chance per note of timing deviation).
 */
const SURPRISE_PROBABILITY: Record<Mood, number> = {
  trance:    0.02,  // very rare — tight grid
  avril:     0.06,  // occasional rubato surprise
  disco:     0.08,  // playful groove hiccups
  downtempo: 0.10,  // lazy surprises
  blockhead: 0.12,  // choppy timing play
  lofi:      0.15,  // jazz-like timing freedom
  flim:      0.18,  // organic timing play
  xtal:      0.08,  // floating surprises
  syro:      0.05,  // controlled complexity
  ambient:   0.04,  // very rare
};

/**
 * Per-mood maximum timing offset (in seconds).
 */
const MAX_OFFSET: Record<Mood, number> = {
  trance:    0.015,  // tiny
  avril:     0.035,  // moderate rubato
  disco:     0.030,  // groove pocket
  downtempo: 0.045,  // lazy pocket
  blockhead: 0.040,  // choppy
  lofi:      0.050,  // wide pocket
  flim:      0.055,  // maximum looseness
  xtal:      0.030,  // floating
  syro:      0.020,  // controlled
  ambient:   0.025,  // gentle
};

/**
 * Section multiplier for timing surprise.
 */
const SECTION_SURPRISE: Record<Section, number> = {
  intro:     0.5,   // gentle start
  build:     0.7,   // some play
  peak:      0.6,   // tight but alive
  breakdown: 1.3,   // maximum looseness
  groove:    1.0,   // normal
};

/**
 * Determine if a timing surprise should occur on this tick/note.
 *
 * @param tick Current tick
 * @param noteIndex Index within current phrase
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to apply a timing surprise
 */
export function shouldSurpriseTiming(
  tick: number,
  noteIndex: number,
  mood: Mood,
  section: Section
): boolean {
  const prob = SURPRISE_PROBABILITY[mood] * SECTION_SURPRISE[section];
  // Deterministic hash
  const hash = ((tick * 2654435761 + noteIndex * 48271) >>> 0) / 4294967296;
  return hash < prob;
}

/**
 * Calculate the timing offset for a surprise.
 * Can be positive (late/drag) or negative (early/push).
 *
 * @param tick Current tick
 * @param noteIndex Index within phrase
 * @param mood Current mood
 * @returns Timing offset in seconds
 */
export function surpriseOffset(
  tick: number,
  noteIndex: number,
  mood: Mood
): number {
  const maxOff = MAX_OFFSET[mood];
  // Hash for magnitude
  const magHash = ((tick * 1664525 + noteIndex * 1013904223) >>> 0) / 4294967296;
  // Hash for direction (early vs late)
  const dirHash = (((tick + 17) * 2246822507 ^ (noteIndex + 3) * 3266489917) >>> 0) / 4294967296;

  const magnitude = maxOff * (0.4 + magHash * 0.6); // 40-100% of max
  const direction = dirHash > 0.55 ? 1 : -1; // slight bias toward late (drag)

  return magnitude * direction;
}

/**
 * Should timing surprise system be active?
 */
export function shouldApplyTimingSurprise(mood: Mood, section: Section): boolean {
  return SURPRISE_PROBABILITY[mood] * SECTION_SURPRISE[section] > 0.03;
}

/**
 * Get surprise probability for a mood (for testing).
 */
export function surpriseProbability(mood: Mood): number {
  return SURPRISE_PROBABILITY[mood];
}
