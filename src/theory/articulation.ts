/**
 * Dynamic articulation — how notes are attacked and released.
 *
 * Articulation is the "touch" of a performance:
 * - Staccato: short, detached (low sustain, quick decay)
 * - Legato: smooth, connected (higher sustain, slower decay)
 * - Accent: emphasized attack (lower attack time, higher gain)
 * - Ghost: barely audible (high attack, very low gain)
 *
 * Different sections and tension levels call for different articulations.
 * Peak sections want punchy staccato; breakdowns want smooth legato.
 */

import type { Section } from '../types';

export interface ArticulationParams {
  attack: number;   // seconds
  decay: number;    // seconds
  sustain: number;  // 0-1
  release: number;  // seconds
}

/**
 * Get articulation parameters based on section and tension.
 *
 * @param section   Current section
 * @param tension   Overall tension (0-1)
 * @param baseDecay Base decay time for the instrument (will be scaled)
 * @returns Articulation parameters
 */
export function sectionArticulation(
  section: Section,
  tension: number,
  baseDecay: number = 0.15
): ArticulationParams {
  // Tension shortens notes (more staccato) and quickens attacks
  const tensionScale = 1.0 - tension * 0.4; // 0.6 at max tension

  switch (section) {
    case 'intro':
      return {
        attack: 0.005 * tensionScale,
        decay: baseDecay * 1.5 * tensionScale,
        sustain: 0.04,
        release: 0.15 * tensionScale,
      };

    case 'build':
      return {
        attack: 0.002,
        decay: baseDecay * 1.2 * tensionScale,
        sustain: 0.03,
        release: 0.1 * tensionScale,
      };

    case 'peak':
      // Punchy staccato — maximum presence
      return {
        attack: 0.001,
        decay: baseDecay * 0.8,
        sustain: 0.01,
        release: 0.05,
      };

    case 'breakdown':
      // Smooth legato — relaxed, breathing
      return {
        attack: 0.008 * tensionScale,
        decay: baseDecay * 2.0,
        sustain: 0.06,
        release: 0.25,
      };

    case 'groove':
      return {
        attack: 0.002,
        decay: baseDecay * tensionScale,
        sustain: 0.02,
        release: 0.08,
      };
  }
}

/**
 * Format articulation params as Strudel method chain fragment.
 */
export function articulationToStrudel(params: ArticulationParams): string {
  return `.attack(${params.attack.toFixed(4)})
          .decay(${params.decay.toFixed(4)})
          .sustain(${params.sustain.toFixed(4)})
          .release(${params.release.toFixed(4)})`;
}
