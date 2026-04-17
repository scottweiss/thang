/**
 * Pitch gravity well — certain pitches act as attractors.
 *
 * In tonal music, some pitches exert gravitational pull on
 * nearby notes. The tonic pulls the leading tone up. The
 * dominant pulls the subdominant down. Chromatic notes are
 * pulled toward the nearest diatonic pitch.
 *
 * This module defines "gravity wells" — pitch centers that
 * attract nearby notes, creating more coherent melodic flow.
 * The wells shift based on the current chord (chord tones are
 * stronger attractors) and section (peaks have stronger pull
 * toward the tonic).
 *
 * Applied to note selection: when choosing between equally
 * viable notes, prefer the one closer to a gravity well.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood strength of pitch gravity wells.
 * Higher = stronger pull toward attractors.
 */
const GRAVITY_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // strong tonal gravity
  avril:     0.50,  // clear tonal center
  disco:     0.45,  // groove around tonic
  downtempo: 0.35,  // moderate pull
  blockhead: 0.30,  // some pull
  lofi:      0.25,  // jazz — weaker gravity
  flim:      0.20,  // organic movement
  xtal:      0.12,  // floating
  syro:      0.08,  // intentionally ambiguous
  ambient:   0.05,  // almost no gravity,
  plantasia: 0.05,
};

/**
 * Section multipliers for gravity strength.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // establish tonal center
  build:     0.9,
  peak:      1.3,   // strong arrival at tonic
  breakdown: 0.7,   // relaxed gravity
  groove:    1.0,
};

/**
 * Calculate the gravitational pull of a target pitch on a source pitch.
 * Returns a value 0-1 where 1 = maximum pull.
 *
 * @param sourcePc   Source pitch class (0-11)
 * @param targetPc   Target pitch class (0-11, the gravity well)
 * @param weight     Importance of the target (0-1)
 * @returns Pull strength (0-1)
 */
export function gravitationalPull(
  sourcePc: number,
  targetPc: number,
  weight: number
): number {
  const dist = Math.min(
    Math.abs(sourcePc - targetPc),
    12 - Math.abs(sourcePc - targetPc)
  );

  // Gravity falls off with distance (inverse square-ish)
  if (dist === 0) return weight;
  return weight / (1 + dist * dist * 0.5);
}

/**
 * Build a gravity map for all 12 pitch classes.
 * Each entry is the total gravitational pull toward that pitch.
 *
 * @param chordPcs     Pitch classes in the current chord
 * @param rootPc       Root note pitch class
 * @param mood         Current mood
 * @param section      Current section
 * @returns Array of 12 gravity values (one per pitch class)
 */
export function buildGravityMap(
  chordPcs: number[],
  rootPc: number,
  mood: Mood,
  section: Section
): number[] {
  const strength = GRAVITY_STRENGTH[mood] * SECTION_MULT[section];
  const map = new Array(12).fill(0);

  // Root has strongest gravity
  for (let pc = 0; pc < 12; pc++) {
    map[pc] += gravitationalPull(pc, rootPc, strength * 1.0);
  }

  // Chord tones have moderate gravity
  for (const chordPc of chordPcs) {
    for (let pc = 0; pc < 12; pc++) {
      map[pc] += gravitationalPull(pc, chordPc, strength * 0.6);
    }
  }

  // Fifth above root has some gravity
  const fifthPc = (rootPc + 7) % 12;
  for (let pc = 0; pc < 12; pc++) {
    map[pc] += gravitationalPull(pc, fifthPc, strength * 0.4);
  }

  return map;
}

/**
 * Score a note based on how well it sits in a gravity well.
 * Higher score = note is near a strong attractor.
 *
 * @param notePc      Pitch class of the note to score
 * @param gravityMap  Pre-computed gravity map
 * @returns Gravity score (higher = better placement)
 */
export function gravityScore(notePc: number, gravityMap: number[]): number {
  return gravityMap[((notePc % 12) + 12) % 12];
}

/**
 * Select the note with the strongest gravity pull from candidates.
 *
 * @param candidates  Array of note strings (e.g., ['C4', 'D4', 'E4'])
 * @param gravityMap  Pre-computed gravity map
 * @returns Best candidate note
 */
export function selectByGravity(
  candidates: string[],
  gravityMap: number[]
): string {
  if (candidates.length === 0) return '~';
  if (candidates.length === 1) return candidates[0];

  const NOTE_PC: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };

  let best = candidates[0];
  let bestScore = -1;

  for (const note of candidates) {
    if (note === '~') continue;
    const name = note.replace(/\d+$/, '');
    const pc = NOTE_PC[name];
    if (pc === undefined) continue;
    const score = gravityScore(pc, gravityMap);
    if (score > bestScore) {
      bestScore = score;
      best = note;
    }
  }

  return best;
}

/**
 * Get gravity strength for a mood (for testing).
 */
export function pitchGravityStrength(mood: Mood): number {
  return GRAVITY_STRENGTH[mood];
}
