/**
 * Strategic silence — the drop technique.
 *
 * In music production, the most powerful moment is often the silence
 * right before a climax. A brief gap where everything drops out creates
 * anticipation that makes the return explosive. This is "the drop."
 *
 * The module handles:
 * - Deciding WHEN to insert silence (specific section transitions)
 * - Computing the gain curve during silence (near-mute → ramp → full)
 * - Ordering which layers cut first for a cascading dropout effect
 */

import type { Section } from '../types';

/**
 * Determine whether a moment of near-silence should be inserted.
 *
 * Returns true only on specific section transitions that benefit
 * from a dramatic pause:
 * - build → peak (the classic drop): 80% chance
 * - breakdown → build (re-entry):    40% chance
 *
 * @param section         The current (new) section
 * @param sectionChanged  Whether the section just changed this tick
 * @param prevSection     The section we're transitioning from (null if unknown)
 */
export function shouldInsertSilence(
  section: Section,
  sectionChanged: boolean,
  prevSection: Section | null
): boolean {
  if (!sectionChanged || prevSection === null) return false;

  // build → peak: the classic drop moment
  if (prevSection === 'build' && section === 'peak') {
    return Math.random() < 0.8;
  }

  // breakdown → build: re-entry after a breakdown
  if (prevSection === 'breakdown' && section === 'build') {
    return Math.random() < 0.4;
  }

  return false;
}

/**
 * Compute a gain multiplier that creates a brief silence then snap-back.
 *
 * @param ticksSinceSectionChange  How many ticks since the section changed (0 = just changed)
 * @param silenceDuration          How many ticks the silence should last (typically 1-2)
 * @returns Gain multiplier 0-1
 */
export function silenceGainMultiplier(
  ticksSinceSectionChange: number,
  silenceDuration: number
): number {
  if (ticksSinceSectionChange < silenceDuration) {
    return 0.02; // near-silence, not completely mute
  }
  if (ticksSinceSectionChange === silenceDuration) {
    return 0.5; // quick ramp up
  }
  return 1.0; // full volume
}

/**
 * Priority order for when layers go silent during a drop.
 * Lower number = goes silent first, creating a cascading effect.
 *
 * texture (drums) → harmony/melody/arp → atmosphere → drone
 *
 * @param layerName  Name of the layer
 * @returns Priority number (lower drops first)
 */
export function layerSilenceOrder(layerName: string): number {
  switch (layerName) {
    case 'texture':    return 0; // drops first — drum cut is most dramatic
    case 'harmony':    return 1;
    case 'melody':     return 1;
    case 'arp':        return 1;
    case 'atmosphere': return 2;
    case 'drone':      return 3; // last to go — holds the floor
    default:           return 1;
  }
}
