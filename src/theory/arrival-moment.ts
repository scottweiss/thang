/**
 * Structural arrival moments — coordinated convergence at section landmarks.
 *
 * When a build resolves into a peak, or a breakdown opens into a groove,
 * something magical should happen: all layers briefly converge on the
 * same pitch, the dynamic surges, and the texture aligns. This is the
 * musical equivalent of a camera zoom — "we're HERE."
 *
 * After the moment passes (1 tick), layers diverge back into independent
 * motion. The contrast between convergence and divergence is what creates
 * the emotional impact.
 *
 * Arrival moments are NOT the same as:
 * - Strategic silence (which REMOVES sound before a transition)
 * - Surprise events (which are random and rare)
 * - Section transitions (which manage gain fading)
 *
 * They are planned structural landmarks where the composition "arrives."
 */

import type { Mood, Section } from '../types';

/**
 * Whether an arrival moment should fire for this section transition.
 *
 * Only specific transitions warrant a full arrival:
 * - build → peak (the climax — always)
 * - breakdown → groove (the return — usually)
 * - breakdown → build (re-entry — sometimes)
 */
export function shouldFireArrival(
  prevSection: Section,
  newSection: Section,
  mood: Mood
): boolean {
  const key = `${prevSection}→${newSection}`;
  const prob = ARRIVAL_PROBABILITY[key] ?? 0;
  if (prob === 0) return false;

  // Mood scaling — some moods benefit more from arrivals
  const moodMult = MOOD_ARRIVAL_SENSITIVITY[mood];
  return Math.random() < prob * moodMult;
}

/**
 * Deterministic probability for testing.
 */
export function arrivalProbability(
  prevSection: Section,
  newSection: Section,
  mood: Mood
): number {
  const key = `${prevSection}→${newSection}`;
  const prob = ARRIVAL_PROBABILITY[key] ?? 0;
  return prob * MOOD_ARRIVAL_SENSITIVITY[mood];
}

/**
 * Gain boost for each layer during an arrival moment.
 * Creates a brief dynamic surge where all layers swell together.
 */
export function arrivalGainBoost(layerName: string): number {
  switch (layerName) {
    case 'drone':      return 1.25; // foundation swells
    case 'harmony':    return 1.15; // harmonic support
    case 'melody':     return 1.20; // melodic clarity
    case 'texture':    return 1.30; // drum accent
    case 'arp':        return 1.10; // subtle support
    case 'atmosphere': return 1.20; // space expands
    default:           return 1.0;
  }
}

/**
 * Whether the melody should force its first note to the chord root
 * during an arrival moment.
 */
export function shouldForceRoot(): boolean {
  return Math.random() < 0.75; // 75% chance melody lands on root
}

/** Transition probabilities for arrival moments */
const ARRIVAL_PROBABILITY: Record<string, number> = {
  'build→peak':      0.85,   // the big moment — almost always
  'breakdown→groove': 0.65,  // the return — usually
  'breakdown→build':  0.40,  // re-entry — sometimes
  'intro→build':      0.30,  // first movement — occasionally
  'groove→peak':      0.50,  // second climax
};

/** Per-mood sensitivity to arrival moments */
const MOOD_ARRIVAL_SENSITIVITY: Record<Mood, number> = {
  trance:    1.0,    // arrivals ARE trance
  disco:     0.9,    // big moments matter
  blockhead: 0.7,    // hip-hop drops
  syro:      0.5,    // IDM subverts expectations
  lofi:      0.4,    // gentle arrivals
  downtempo: 0.5,    // moderate
  flim:      0.4,    // delicate
  xtal:      0.3,    // subtle
  avril:     0.35,   // intimate moments
  ambient:   0.15,   // very subtle — space is sacred
};
