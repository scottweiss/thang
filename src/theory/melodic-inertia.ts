/**
 * Melodic inertia — the tendency of melodies to continue their direction.
 *
 * A fundamental principle of natural-sounding melody: once a line starts
 * moving in a direction, it tends to keep going that way until a phrase
 * boundary or climax point. This is Newton's first law applied to music.
 *
 * Without inertia, generative melodies zigzag randomly. With it, they
 * flow in coherent arcs — ascending runs, descending cascades, or
 * sustained plateaus. The strength of inertia varies by mood:
 *
 * - **High inertia** (trance, avril): long sweeping lines, clear direction
 * - **Low inertia** (syro, ambient): frequent direction changes, angular
 *
 * Inertia interacts with phrase boundaries: it resets at the start of
 * each new phrase, allowing the next phrase to take a fresh direction.
 *
 * Application: when selecting the next melody note, bias toward
 * notes that continue the current directional trend. The bias
 * strength determines how strongly the melody "wants" to keep going.
 */

import type { Mood } from '../types';

/** How strongly each mood maintains melodic direction (0-1) */
const INERTIA_STRENGTH: Record<Mood, number> = {
  avril:     0.65,  // singer — long flowing phrases
  trance:    0.60,  // sweeping arcs
  disco:     0.50,  // disco runs
  downtempo: 0.45,  // moderate momentum
  lofi:      0.40,  // jazz — some angularity
  xtal:      0.35,  // gentle direction
  blockhead: 0.30,  // hip-hop — punchy, less linear
  flim:      0.25,  // organic but varied
  ambient:   0.20,  // floating, directionless,
  plantasia: 0.20,
  syro:      0.15,  // IDM — angular, unpredictable
};

export type MelodicDirection = 'ascending' | 'descending' | 'static';

/**
 * Detect the current melodic direction from recent notes.
 *
 * @param recentNotes  Last 2-4 notes played (with octave)
 * @returns Current direction
 */
export function detectInertiaDirection(recentNotes: string[]): MelodicDirection {
  if (recentNotes.length < 2) return 'static';

  const toMidi = (n: string): number | null => {
    const m = n.match(/^([A-G](?:b|#)?)(\d+)$/);
    if (!m) return null;
    const PC: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
    };
    const pc = PC[m[1]];
    if (pc === undefined) return null;
    return parseInt(m[2]) * 12 + pc;
  };

  let ascending = 0;
  let descending = 0;

  for (let i = 1; i < recentNotes.length; i++) {
    const prev = toMidi(recentNotes[i - 1]);
    const curr = toMidi(recentNotes[i]);
    if (prev === null || curr === null) continue;
    if (curr > prev) ascending++;
    else if (curr < prev) descending++;
  }

  if (ascending > descending) return 'ascending';
  if (descending > ascending) return 'descending';
  return 'static';
}

/**
 * Calculate inertia bias for note selection.
 * Returns a multiplier that favors notes in the current direction.
 *
 * @param candidateNote  Note being considered
 * @param lastNote       Most recent note played
 * @param direction      Current melodic direction
 * @param mood           Current mood (determines bias strength)
 * @returns Weight multiplier (>1 = favored, <1 = disfavored)
 */
export function inertiaBias(
  candidateNote: string,
  lastNote: string,
  direction: MelodicDirection,
  mood: Mood
): number {
  if (direction === 'static') return 1.0;

  const toMidi = (n: string): number | null => {
    const m = n.match(/^([A-G](?:b|#)?)(\d+)$/);
    if (!m) return null;
    const PC: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
    };
    const pc = PC[m[1]];
    if (pc === undefined) return null;
    return parseInt(m[2]) * 12 + pc;
  };

  const candidateMidi = toMidi(candidateNote);
  const lastMidi = toMidi(lastNote);
  if (candidateMidi === null || lastMidi === null) return 1.0;

  const strength = INERTIA_STRENGTH[mood];
  const diff = candidateMidi - lastMidi;

  if (direction === 'ascending') {
    // Favor notes above the last note
    if (diff > 0) return 1.0 + strength * 0.5;   // boost ascending
    if (diff < 0) return 1.0 - strength * 0.3;    // penalize descending
    return 1.0;
  } else {
    // Favor notes below the last note
    if (diff < 0) return 1.0 + strength * 0.5;
    if (diff > 0) return 1.0 - strength * 0.3;
    return 1.0;
  }
}

/**
 * Apply inertia bias to an array of candidate weights.
 *
 * @param candidates  Array of { note, weight } pairs
 * @param lastNote    Most recent note
 * @param direction   Current direction
 * @param mood        Current mood
 * @returns Modified weights array
 */
export function applyInertiaBias(
  candidates: { note: string; weight: number }[],
  lastNote: string,
  direction: MelodicDirection,
  mood: Mood
): { note: string; weight: number }[] {
  return candidates.map(c => ({
    note: c.note,
    weight: Math.max(0.01, c.weight * inertiaBias(c.note, lastNote, direction, mood)),
  }));
}

/**
 * Get inertia strength for a mood (for testing).
 */
export function inertiaStrength(mood: Mood): number {
  return INERTIA_STRENGTH[mood];
}
