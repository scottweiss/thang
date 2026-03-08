/**
 * Ghost note intelligence — rhythmically meaningful ghost placement.
 *
 * Random ghost hats sound mechanical. Real drummers place ghost notes
 * at specific rhythmic positions that create groove:
 * - "e" and "a" subdivisions (16th note offbeats)
 * - Just before strong beats (anticipation)
 * - Between kick and snare (filling dead space)
 *
 * Different moods prefer different ghost patterns:
 * - Lofi/blockhead: swing-oriented, emphasize "a" of beat 2 and 4
 * - Trance/disco: straight 16ths, fill the grid evenly
 * - IDM/syro: unpredictable, asymmetric, accent weak positions
 * - Flim/ambient: very sparse, only in specific pockets
 */

import type { Mood } from '../types';

/**
 * Ghost note weight map — probability of a ghost note at each
 * of 16 grid positions. Higher = more likely to ghost.
 * 0 = never ghost here (reserved for primary hits).
 */
type GhostMap = readonly [
  number, number, number, number,  // beat 1
  number, number, number, number,  // beat 2
  number, number, number, number,  // beat 3
  number, number, number, number   // beat 4
];

/**
 * Add ghost notes to a drum pattern at rhythmically intelligent positions.
 *
 * @param pattern   Space-separated drum pattern (bd/sd/cp/hh/~)
 * @param mood      Current mood (determines ghost map)
 * @param density   0-1 how many ghosts to add (scales the ghost map)
 * @param ghostSound The sound to use for ghosts (default 'hh')
 * @returns Modified pattern with ghost notes added
 */
export function addIntelligentGhosts(
  pattern: string,
  mood: Mood,
  density: number,
  ghostSound: string = 'hh'
): string {
  const steps = pattern.split(' ');
  if (steps.length < 4) return pattern;

  const map = MOOD_GHOST_MAP[mood];
  const result = [...steps];

  for (let i = 0; i < result.length && i < 16; i++) {
    if (result[i] !== '~') continue; // don't replace existing sounds
    const weight = map[i % 16] * density;
    if (Math.random() < weight) {
      result[i] = ghostSound;
    }
  }

  return result.join(' ');
}

/**
 * Get the ghost note density for a mood.
 * Used as the base density before section scaling.
 */
export function moodGhostDensity(mood: Mood): number {
  return MOOD_GHOST_DENSITY[mood];
}

// Ghost maps: per-position probability weights
// Positions: 0=beat1, 4=beat2, 8=beat3, 12=beat4
// Offbeats: 2=&1, 6=&2, 10=&3, 14=&4
// 16th subdivisions: 1=e1, 3=a1, 5=e2, 7=a2, etc.

const MOOD_GHOST_MAP: Record<Mood, GhostMap> = {
  // Lofi: swing feel — "a" of 2 and 4 are signature ghost positions
  lofi: [0, 0.2, 0, 0.6, 0, 0.3, 0, 0.5, 0, 0.2, 0, 0.6, 0, 0.3, 0, 0.5],

  // Blockhead: hip-hop bounce — ghost before snares, swing "a" positions
  blockhead: [0, 0.3, 0, 0.5, 0, 0.2, 0, 0.6, 0, 0.3, 0, 0.5, 0, 0.2, 0, 0.7],

  // Downtempo: sparse, only in specific pockets
  downtempo: [0, 0.1, 0, 0.3, 0, 0.1, 0, 0.2, 0, 0.1, 0, 0.3, 0, 0.1, 0, 0.2],

  // Trance: straight 16ths, fill evenly on offbeats
  trance: [0, 0.3, 0.4, 0.3, 0, 0.3, 0.4, 0.3, 0, 0.3, 0.4, 0.3, 0, 0.3, 0.4, 0.3],

  // Disco: upbeat-focused, offbeats get most ghosts
  disco: [0, 0.2, 0.5, 0.2, 0, 0.2, 0.5, 0.2, 0, 0.2, 0.5, 0.2, 0, 0.2, 0.5, 0.2],

  // Xtal: breakbeat shuffle — asymmetric, emphasize offbeats of 2 and 4
  xtal: [0, 0.2, 0.3, 0.3, 0, 0.1, 0.3, 0.4, 0, 0.2, 0.3, 0.3, 0, 0.1, 0.3, 0.4],

  // Syro: irregular — accent weak positions for off-kilter feel
  syro: [0, 0.4, 0.2, 0.4, 0, 0.5, 0.2, 0.3, 0, 0.4, 0.3, 0.4, 0, 0.5, 0.2, 0.3],

  // Avril: barely any — just a whisper
  avril: [0, 0.05, 0, 0.05, 0, 0, 0, 0.05, 0, 0.05, 0, 0.05, 0, 0, 0, 0.05],

  // Flim: delicate — specific pockets only
  flim: [0, 0.1, 0, 0.15, 0, 0.1, 0, 0.1, 0, 0.1, 0, 0.15, 0, 0.1, 0, 0.1],

  // Ambient: almost none
  ambient: [0, 0.02, 0, 0.02, 0, 0.02, 0, 0.02, 0, 0.02, 0, 0.02, 0, 0.02, 0, 0.02],
};

const MOOD_GHOST_DENSITY: Record<Mood, number> = {
  lofi:      0.5,
  blockhead: 0.6,
  downtempo: 0.3,
  trance:    0.4,
  disco:     0.5,
  xtal:      0.4,
  syro:      0.7,
  avril:     0.1,
  flim:      0.2,
  ambient:   0.05,
};
