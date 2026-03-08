/**
 * Suspension chains — cascading suspensions where one resolution
 * becomes the preparation for the next suspension.
 *
 * In classical counterpoint, a suspension is a held note that creates
 * dissonance against the new chord, then resolves down by step.
 * A suspension CHAIN continues this: the resolution note becomes
 * a new suspension over the next chord.
 *
 * Example: 4-3 suspension → resolution 3rd becomes 7-6 over next chord
 * → resolution 6th becomes 4-3 again. This creates a continuous
 * descending line that sounds like a sigh or a gradual release.
 *
 * Chain types:
 * - 7-6 chain: alternating 7th suspensions resolving to 6th
 * - 4-3 chain: alternating 4th suspensions resolving to 3rd
 * - Mixed: 7-6 → 4-3 → 7-6 (most sophisticated)
 *
 * Mood influence:
 * - Jazz (lofi): loves chains (sophisticated voice leading)
 * - Ambient: occasional chains (gentle tension)
 * - Trance: rarely (too subtle)
 */

import type { Mood, Section } from '../types';

export type ChainType = '7-6' | '4-3' | 'mixed';

/** Probability of starting a suspension chain per mood */
const CHAIN_PROBABILITY: Record<Mood, number> = {
  lofi:      0.30,   // jazz loves voice-leading chains
  avril:     0.25,   // singer-songwriter expressiveness
  flim:      0.25,   // delicate tension
  downtempo: 0.20,   // smooth sophistication
  xtal:      0.15,   // dreamy tension
  blockhead: 0.15,   // hip-hop soul
  disco:     0.10,   // funky but less contrapuntal
  syro:      0.10,   // IDM — different approach to tension
  ambient:   0.08,   // occasional gentle chains
  trance:    0.05,   // too subtle for trance
};

/** Preferred chain types per mood */
const PREFERRED_CHAINS: Record<Mood, ChainType[]> = {
  lofi:      ['mixed', '7-6', '4-3'],
  avril:     ['4-3', '7-6'],
  flim:      ['7-6', '4-3'],
  downtempo: ['7-6', '4-3'],
  xtal:      ['7-6'],
  blockhead: ['4-3', '7-6'],
  disco:     ['4-3'],
  syro:      ['mixed'],
  ambient:   ['7-6'],
  trance:    ['4-3'],
};

/** Section modifies chain probability */
const SECTION_CHAIN_MULT: Record<Section, number> = {
  intro:     0.5,    // less chains in intro
  build:     1.2,    // chains create forward motion
  peak:      0.8,    // at peak, let harmony breathe
  breakdown: 1.5,    // chains are beautiful in breakdowns
  groove:    1.0,    // neutral
};

export interface SuspensionChainPlan {
  /** Number of links in the chain (2-4) */
  length: number;
  /** Chain type */
  type: ChainType;
  /** Current position in the chain (0 = not started) */
  position: number;
  /** The suspended note (interval above bass in semitones) */
  suspendedInterval: number;
  /** The resolution note interval */
  resolutionInterval: number;
}

/**
 * Determine if a suspension chain should start at this chord change.
 *
 * @param mood     Current mood
 * @param section  Current section
 * @param currentPlan  Existing chain plan (null if none)
 * @returns true if a new chain should begin
 */
export function shouldStartChain(
  mood: Mood,
  section: Section,
  currentPlan: SuspensionChainPlan | null
): boolean {
  // Don't start if a chain is already active
  if (currentPlan && currentPlan.position < currentPlan.length) {
    return false;
  }

  const prob = CHAIN_PROBABILITY[mood] * (SECTION_CHAIN_MULT[section] ?? 1.0);
  return Math.random() < prob;
}

/**
 * Create a suspension chain plan.
 *
 * @param mood  Current mood
 * @returns Chain plan
 */
export function createChainPlan(mood: Mood): SuspensionChainPlan {
  const types = PREFERRED_CHAINS[mood];
  const type = types[Math.floor(Math.random() * types.length)];

  // Chain length: 2-4 links
  const length = 2 + Math.floor(Math.random() * 2); // 2 or 3

  // Initial suspension intervals (in semitones above root)
  let suspendedInterval: number;
  let resolutionInterval: number;

  if (type === '7-6' || (type === 'mixed' && Math.random() < 0.5)) {
    suspendedInterval = 11; // major 7th
    resolutionInterval = 9; // major 6th
  } else {
    suspendedInterval = 5; // perfect 4th
    resolutionInterval = 4; // major 3rd
  }

  return {
    length,
    type,
    position: 0,
    suspendedInterval,
    resolutionInterval,
  };
}

/**
 * Get the suspension note offset for the current chain position.
 * Returns the semitone offset to add to the chord root for the
 * suspended voice.
 *
 * @param plan  Active chain plan
 * @returns Semitone offset, or null if chain is complete
 */
export function chainSuspensionOffset(
  plan: SuspensionChainPlan
): { suspended: number; resolution: number } | null {
  if (plan.position >= plan.length) return null;

  let sus = plan.suspendedInterval;
  let res = plan.resolutionInterval;

  // For mixed chains, alternate between 7-6 and 4-3
  if (plan.type === 'mixed' && plan.position % 2 === 1) {
    if (sus === 11) {
      sus = 5;
      res = 4;
    } else {
      sus = 11;
      res = 9;
    }
  }

  return { suspended: sus, resolution: res };
}

/**
 * Advance the chain by one step.
 */
export function advanceChain(plan: SuspensionChainPlan): void {
  plan.position++;
}

/**
 * Whether a chain plan is still active.
 */
export function isChainActive(plan: SuspensionChainPlan | null): boolean {
  if (!plan) return false;
  return plan.position < plan.length;
}

/**
 * Get chain probability for a mood (for testing).
 */
export function chainProbability(mood: Mood): number {
  return CHAIN_PROBABILITY[mood];
}
